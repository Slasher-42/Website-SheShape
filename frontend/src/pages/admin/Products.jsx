import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminProducts } from '../../api/admin.js'
import { readError } from '../../api/client.js'
import { formatPrice, formatCategory } from '../../utils/format.js'
import { useDebounced } from '../../hooks/useDebounced.js'
import Loading from '../../components/Loading.jsx'
import Empty from '../../components/Empty.jsx'
import styles from './Products.module.css'

const CATEGORIES = ['activewear', 'accessories', 'supplements', 'journals']
const LIMIT = 20

export default function AdminProductsPage() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [published, setPublished] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search, 350)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = { page, limit: LIMIT }
      if (category) params.category = category
      if (published) params.published = published
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()

      const result = await adminProducts.list(params)
      setRows(result.data)
      setMeta(result.meta)
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(false)
    }
  }, [page, category, published, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [category, published, debouncedSearch])

  async function togglePublished(product) {
    setBusyId(product.id)
    setError('')

    try {
      const updated = await adminProducts.update(product.id, {
        isPublished: !product.isPublished
      })
      setRows((current) =>
        current.map((row) => (row.id === updated.id ? { ...row, ...updated } : row))
      )
    } catch (err) {
      setError(readError(err))
    } finally {
      setBusyId(null)
    }
  }

  async function destroy(product) {
    setBusyId(product.id)
    setError('')
    setNotice('')

    try {
      await adminProducts.remove(product.id)
      setConfirmId(null)
      setNotice(`${product.name} was deleted.`)
      load()
    } catch (err) {
      setConfirmId(null)
      setError(readError(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {meta ? `${meta.total} product${meta.total === 1 ? '' : 's'}` : 'Loading'}
          </p>
        </div>

        <Link to="/admin/products/new" className={styles.primary}>
          New product
        </Link>
      </header>

      <div className={styles.filters}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name"
          className={styles.search}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={styles.select}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {formatCategory(name)}
            </option>
          ))}
        </select>

        <select
          value={published}
          onChange={(event) => setPublished(event.target.value)}
          className={styles.select}
        >
          <option value="">Published and draft</option>
          <option value="true">Published only</option>
          <option value="false">Drafts only</option>
        </select>
      </div>

      {notice && <p className={styles.notice}>{notice}</p>}
      {error && <p className={styles.error}>{error}</p>}

      {loading && <Loading />}

      {!loading && rows.length === 0 && (
        <Empty message="No products match these filters." />
      )}

      {!loading && rows.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thumbCol} />
                <th>Name</th>
                <th>Category</th>
                <th className={styles.numCol}>Price</th>
                <th className={styles.numCol}>Stock</th>
                <th>Status</th>
                <th className={styles.actionCol} />
              </tr>
            </thead>

            <tbody>
              {rows.map((product) => {
                const cover = product.images?.[0]?.url
                const busy = busyId === product.id

                return (
                  <tr key={product.id} className={busy ? styles.busy : undefined}>
                    <td>
                      {cover ? (
                        <img src={cover} alt="" className={styles.thumb} />
                      ) : (
                        <span className={styles.thumbEmpty} />
                      )}
                    </td>

                    <td>
                      <Link to={`/admin/products/${product.id}`} className={styles.name}>
                        {product.name}
                      </Link>
                      <span className={styles.slug}>{product.slug}</span>
                    </td>

                    <td>{formatCategory(product.category)}</td>
                    <td className={styles.numCol}>{formatPrice(product.price)}</td>

                    <td className={styles.numCol}>
                      <span className={product.stock === 0 ? styles.stockOut : undefined}>
                        {product.stock}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => togglePublished(product)}
                        className={
                          product.isPublished
                            ? `${styles.badge} ${styles.badgeLive}`
                            : `${styles.badge} ${styles.badgeDraft}`
                        }
                      >
                        {product.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className={styles.actionCol}>
                      {confirmId === product.id ? (
                        <span className={styles.confirm}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => destroy(product)}
                            className={styles.danger}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className={styles.ghost}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span className={styles.confirm}>
                          <Link
                            to={`/admin/products/${product.id}`}
                            className={styles.ghost}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmId(product.id)}
                            className={styles.ghost}
                          >
                            Delete
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.pages > 1 && (
        <div className={styles.pager}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className={styles.ghost}
          >
            Previous
          </button>

          <span className={styles.pagerLabel}>
            Page {meta.page} of {meta.pages}
          </span>

          <button
            type="button"
            disabled={page >= meta.pages}
            onClick={() => setPage((current) => current + 1)}
            className={styles.ghost}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
