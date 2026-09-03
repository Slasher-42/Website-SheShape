import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { adminProducts } from '../../api/admin.js'
import { readError } from '../../api/client.js'
import { formatCategory } from '../../utils/format.js'
import ImageUploader from '../../components/ImageUploader.jsx'
import Loading from '../../components/Loading.jsx'
import styles from './ProductForm.module.css'

const CATEGORIES = ['activewear', 'accessories', 'supplements', 'journals']

const BLANK = {
  name: '',
  description: '',
  price: '',
  category: 'activewear',
  stock: '0',
  isPublished: false
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [fields, setFields] = useState(BLANK)
  const [images, setImages] = useState([])
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (isNew) return

    let active = true

    adminProducts
      .detail(id)
      .then((product) => {
        if (!active) return
        setFields({
          name: product.name,
          description: product.description,
          price: String(product.price),
          category: product.category,
          stock: String(product.stock),
          isPublished: product.isPublished
        })
        setImages(product.images ?? [])
        setSlug(product.slug)
      })
      .catch((err) => active && setError(readError(err)))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id, isNew])

  function set(field, value) {
    setFields((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function addImage(url) {
    if (isNew) {
      setImages((current) => [...current, { id: url, url }])
      return
    }

    const image = await adminProducts.attachImage(id, url)
    setImages((current) => [...current, image])
  }

  async function removeImage(image) {
    if (isNew) {
      setImages((current) => current.filter((item) => item.id !== image.id))
      return
    }

    await adminProducts.detachImage(id, image.id)
    setImages((current) => current.filter((item) => item.id !== image.id))
  }

  function applyError(err) {
    setError(readError(err))

    const details = err?.response?.data?.details
    if (Array.isArray(details)) {
      setFieldErrors(
        Object.fromEntries(details.map((item) => [item.field, item.message]))
      )
    }
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setFieldErrors({})

    const payload = {
      name: fields.name,
      description: fields.description,
      price: fields.price,
      category: fields.category,
      stock: fields.stock,
      isPublished: fields.isPublished
    }

    try {
      if (isNew) {
        payload.images = images.map((image) => image.url)
        const created = await adminProducts.create(payload)
        navigate(`/admin/products/${created.id}`, { replace: true })
      } else {
        const updated = await adminProducts.update(id, payload)
        setSlug(updated.slug)
        setFields((current) => ({ ...current, isPublished: updated.isPublished }))
      }
    } catch (err) {
      applyError(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{isNew ? 'New product' : fields.name}</h1>
          {slug && <p className={styles.slug}>{slug}</p>}
        </div>

        <Link to="/admin/products" className={styles.back}>
          Back to products
        </Link>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={submit} className={styles.form} noValidate>
        <section className={styles.card}>
          <label className={styles.field}>
            <span className={styles.label}>Name</span>
            <input
              type="text"
              value={fields.name}
              onChange={(event) => set('name', event.target.value)}
              maxLength={160}
              className={styles.input}
            />
            {fieldErrors.name && <span className={styles.hint}>{fieldErrors.name}</span>}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Description</span>
            <textarea
              value={fields.description}
              onChange={(event) => set('description', event.target.value)}
              rows={6}
              className={styles.textarea}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Price in RWF</span>
              <input
                type="number"
                min="0"
                step="500"
                value={fields.price}
                onChange={(event) => set('price', event.target.value)}
                className={styles.input}
              />
              {fieldErrors.price && (
                <span className={styles.hint}>{fieldErrors.price}</span>
              )}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Stock</span>
              <input
                type="number"
                min="0"
                step="1"
                value={fields.stock}
                onChange={(event) => set('stock', event.target.value)}
                className={styles.input}
              />
              {fieldErrors.stock && (
                <span className={styles.hint}>{fieldErrors.stock}</span>
              )}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Category</span>
              <select
                value={fields.category}
                onChange={(event) => set('category', event.target.value)}
                className={styles.input}
              >
                {CATEGORIES.map((name) => (
                  <option key={name} value={name}>
                    {formatCategory(name)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Images</h2>

          <ImageUploader
            images={images}
            onAdd={addImage}
            onRemove={removeImage}
            disabled={saving}
          />
        </section>

        <section className={styles.card}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={fields.isPublished}
              onChange={(event) => set('isPublished', event.target.checked)}
            />
            <span>
              <strong>Published</strong>
              <span className={styles.hint}>
                Published products appear in the shop. A product needs at least one image
                before it can be published.
              </span>
            </span>
          </label>

          {fieldErrors.isPublished && (
            <p className={styles.hint}>{fieldErrors.isPublished}</p>
          )}
        </section>

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={styles.primary}>
            {saving ? 'Saving' : isNew ? 'Create product' : 'Save changes'}
          </button>

          <Link to="/admin/products" className={styles.ghost}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
