import { Op } from 'sequelize'
import { Product, ProductImage, PRODUCT_CATEGORIES } from '../models/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { notFoundError, badRequestError } from '../utils/httpError.js'

const imageInclude = {
  model: ProductImage,
  as: 'images',
  attributes: ['id', 'url', 'sortOrder'],
  separate: true,
  order: [['sortOrder', 'ASC']]
}

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50)
  const { category, search } = req.query

  const where = { isPublished: true }

  if (category) {
    if (!PRODUCT_CATEGORIES.includes(category)) {
      throw badRequestError(`Unknown category: ${category}`)
    }
    where.category = category
  }

  if (search) {
    where.name = { [Op.iLike]: `%${search.trim()}%` }
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [imageInclude],
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    distinct: true
  })

  res.json({
    data: rows,
    meta: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    where: { slug: req.params.slug, isPublished: true },
    include: [imageInclude]
  })

  if (!product) {
    throw notFoundError('Product not found')
  }

  res.json({ data: product })
})

export const listCategories = asyncHandler(async (req, res) => {
  res.json({ data: PRODUCT_CATEGORIES })
})
