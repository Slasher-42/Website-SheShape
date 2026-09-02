import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { useCart } from '../context/cart-context.js'
import { formatPrice, formatCategory } from '../utils/format.js'
import QuantityStepper from '../components/QuantityStepper.jsx'
import Loading from '../components/Loading.jsx'
import Empty from '../components/Empty.jsx'
import styles from './Product.module.css'

export default function Product() {
  const { slug } = useParams()
  const { data: product, loading, error } = useApi(`/products/${slug}`)
  const { addItem } = useCart()

  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setActiveImage(0)
    setQuantity(1)
    setAdded(false)
  }, [slug])

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 2500)
    return () => clearTimeout(timer)
  }, [added])

  if (loading) {
    return (
      <div className="page">
        <Loading label="Loading product" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page">
        <Empty title="Product not found" message={error}>
          <Link to="/shop" className="btn">
            Back to shop
          </Link>
        </Empty>
      </div>
    )
  }

  const images = product.images ?? []
  const cover = images[activeImage]?.url
  const soldOut = product.stock === 0

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
  }

  return (
    <div className="page">
      <Link to="/shop" className={styles.back}>
        ← Back to shop
      </Link>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {cover && <img src={cover} alt={product.name} width="900" height="900" />}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={
                    index === activeImage ? `${styles.thumb} ${styles.thumbActive}` : styles.thumb
                  }
                >
                  <img src={image.url} alt="" width="160" height="160" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.details}>
          <span className={styles.category}>{formatCategory(product.category)}</span>
          <h1 className={styles.name}>{product.name}</h1>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <p className={styles.description}>{product.description}</p>
          <span className={soldOut ? `${styles.stock} ${styles.stockOut}` : styles.stock}>
            {soldOut ? 'Out of stock' : `${product.stock} in stock`}
          </span>

          {!soldOut && (
            <div className={styles.actions}>
              <QuantityStepper value={quantity} max={product.stock} onChange={setQuantity} />
              <button type="button" className="btn" onClick={handleAdd}>
                Add to cart
              </button>
            </div>
          )}

          {added && (
            <p className={styles.added} role="status">
              Added to your cart. <Link to="/cart">View cart</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
