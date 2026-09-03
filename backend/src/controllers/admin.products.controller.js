import { Op } from 'sequelize'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteImageByUrl } from '../utils/s3.js'
import { buildUniqueSlug } from '../utils/slug.js'
import {
  sequelize,
  Product,
  ProductImage,
  OrderItem,
  PRODUCT_CATEGORIES
} from '../models/index.js'

const MAX_LIMIT = 50
const MAX_IMAGES = 8
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const withImages = {
  model: ProductImage,
  as: 'images',
  attributes: ['id', 'url', 'sortOrder']
}

const imagesFirst = [[{ model: ProductImage, as: 'images' }, 'sortOrder', 'ASC']]

function fail(status, message, details) {
  const error = new Error(message)
  error.status = status
  if (details) error.details = details
  return error
}

function invalid(field, message) {
  return fail(400, message, [{ field, message }])
}

function readString(body, field, { max, required }) {
  const raw = body[field]
  const value = typeof raw === 'string' ? raw.trim() : ''

  if (!value) {
    if (required) throw invalid(field, `${field} is required.`)
    return ''
  }

  if (max && value.length > max) {
    throw invalid(field, `${field} must be ${max} characters or fewer.`)
  }

  return value
}

function readInteger(body, field, { required }) {
  const raw = body[field]

  if (raw === undefined || raw === null || raw === '') {
    if (required) throw invalid(field, `${field} is required.`)
    return undefined
  }

  const value = Number(raw)

  if (!Number.isInteger(value) || value < 0) {
    throw invalid(field, `${field} must be a whole number of zero or more.`)
  }

  return value
}

function readCategory(body, { required }) {
  const raw = body.category

  if (raw === undefined || raw === null || raw === '') {
    if (required) throw invalid('category', 'category is required.')
    return undefined
  }

  const value = String(raw).trim().toLowerCase()

  if (!PRODUCT_CATEGORIES.includes(value)) {
    throw invalid('category', `category must be one of: ${PRODUCT_CATEGORIES.join(', ')}.`)
  }

  return value
}

function readBoolean(body, field) {
  const raw = body[field]

  if (raw === undefined) return undefined
  if (typeof raw === 'boolean') return raw
  if (raw === 'true') return true
  if (raw === 'false') return false

  throw invalid(field, `${field} must be true or false.`)
}

function readImageUrls(body) {
  const raw = body.images

  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) throw invalid('images', 'images must be a list.')
  if (raw.length > MAX_IMAGES) {
    throw invalid('images', `A product can hold at most ${MAX_IMAGES} images.`)
  }

  return raw.map((entry, index) => {
    const url = typeof entry === 'string' ? entry.trim() : String(entry?.url ?? '').trim()
    if (!url) throw invalid('images', `Image ${index + 1} has no url.`)
    return url
  })
}

function buildPayload(body, { partial }) {
  const has = (field) => Object.prototype.hasOwnProperty.call(body, field)
  const payload = {}

  if (!partial || has('name')) {
    payload.name = readString(body, 'name', { max: 160, required: true })
  }

  if (!partial || has('description')) {
    payload.description = readString(body, 'description', { required: false })
  }

  if (!partial || has('price')) {
    payload.price = readInteger(body, 'price', { required: true })
  }

  if (!partial || has('category')) {
    payload.category = readCategory(body, { required: true })
  }

  if (!partial || has('stock')) {
    const stock = readInteger(body, 'stock', { required: false })
    payload.stock = stock === undefined ? 0 : stock
  }

  if (!partial || has('isPublished')) {
    const isPublished = readBoolean(body, 'isPublished')
    payload.isPublished = isPublished === undefined ? false : isPublished
  }

  if (has('slug')) {
    payload.slug = readString(body, 'slug', { max: 180, required: true })
  }

  return payload
}

async function findOr404(id, options = {}) {
  if (!UUID_PATTERN.test(String(id))) throw fail(404, 'Product not found.')

  const product = await Product.findByPk(id, options)
  if (!product) throw fail(404, 'Product not found.')

  return product
}

async function nextSortOrder(productId, transaction) {
  const highest = await ProductImage.max('sortOrder', {
    where: { productId },
    transaction
  })

  return Number.isFinite(highest) ? highest + 1 : 0
}

async function discardObject(url) {
  try {
    await deleteImageByUrl(url)
  } catch (error) {
    console.error('S3 delete failed for', url, error.message)
  }
}

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || 20))
  const where = {}

  if (req.query.category) {
    where.category = readCategory(req.query, { required: true })
  }

  if (req.query.published === 'true') where.isPublished = true
  if (req.query.published === 'false') where.isPublished = false

  const search = String(req.query.search || '').trim()
  if (search) {
    where.name = { [Op.iLike]: `%${search}%` }
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [withImages],
    order: [['createdAt', 'DESC'], ...imagesFirst],
    limit,
    offset: (page - 1) * limit,
    distinct: true
  })

  res.json({
    data: rows,
    meta: { page, limit, total: count, pages: Math.ceil(count / limit) || 1 }
  })
})

export const detail = asyncHandler(async (req, res) => {
  const product = await findOr404(req.params.id, {
    include: [withImages],
    order: imagesFirst
  })

  res.json({ data: product })
})

export const create = asyncHandler(async (req, res) => {
  const payload = buildPayload(req.body, { partial: false })
  const urls = readImageUrls(req.body)

  const product = await sequelize.transaction(async (transaction) => {
    payload.slug = await buildUniqueSlug(Product, payload.slug || payload.name, { transaction })

    const created = await Product.create(payload, { transaction })

    if (urls.length) {
      await ProductImage.bulkCreate(
        urls.map((url, index) => ({ productId: created.id, url, sortOrder: index })),
        { transaction, validate: true }
      )
    }

    return created
  })

  const fresh = await Product.findByPk(product.id, {
    include: [withImages],
    order: imagesFirst
  })

  res.status(201).json({ data: fresh })
})

export const update = asyncHandler(async (req, res) => {
  const product = await findOr404(req.params.id)
  const payload = buildPayload(req.body, { partial: true })

  if (payload.slug) {
    payload.slug = await buildUniqueSlug(Product, payload.slug, { excludeId: product.id })
  }

  await product.update(payload)

  const fresh = await Product.findByPk(product.id, {
    include: [withImages],
    order: imagesFirst
  })

  res.json({ data: fresh })
})

export const remove = asyncHandler(async (req, res) => {
  const product = await findOr404(req.params.id, { include: [withImages] })

  const ordered = await OrderItem.count({ where: { productId: product.id } })

  if (ordered > 0) {
    throw fail(
      409,
      'This product appears in past orders, so it cannot be deleted. Unpublish it to hide it from the shop.'
    )
  }

  const urls = product.images.map((image) => image.url)

  await product.destroy()

  await Promise.all(urls.map(discardObject))

  res.status(204).end()
})

export const attachImage = asyncHandler(async (req, res) => {
  const product = await findOr404(req.params.id)
  const url = readString(req.body, 'url', { required: true })

  const existing = await ProductImage.count({ where: { productId: product.id } })

  if (existing >= MAX_IMAGES) {
    throw fail(409, `A product can hold at most ${MAX_IMAGES} images.`)
  }

  const image = await ProductImage.create({
    productId: product.id,
    url,
    sortOrder: await nextSortOrder(product.id)
  })

  res.status(201).json({ data: image })
})

export const detachImage = asyncHandler(async (req, res) => {
  const product = await findOr404(req.params.id)

  const image = await ProductImage.findOne({
    where: { id: req.params.imageId, productId: product.id }
  })

  if (!image) throw fail(404, 'Image not found on this product.')

  const { url } = image

  await image.destroy()
  await discardObject(url)

  res.status(204).end()
})

export const reorderImages = asyncHandler(async (req, res) => {
  const product = await findOr404(req.params.id)
  const ids = Array.isArray(req.body.ids) ? req.body.ids : null

  if (!ids?.length) throw invalid('ids', 'ids must be a list of image ids.')

  const images = await ProductImage.findAll({
    where: { productId: product.id },
    attributes: ['id']
  })

  const owned = new Set(images.map((image) => image.id))

  if (ids.length !== owned.size || ids.some((id) => !owned.has(id))) {
    throw invalid('ids', 'ids must list every image on this product exactly once.')
  }

  await sequelize.transaction(async (transaction) => {
    for (const [index, id] of ids.entries()) {
      await ProductImage.update({ sortOrder: index }, { where: { id }, transaction })
    }
  })

  const fresh = await ProductImage.findAll({
    where: { productId: product.id },
    attributes: ['id', 'url', 'sortOrder'],
    order: [['sortOrder', 'ASC']]
  })

  res.json({ data: fresh })
})
