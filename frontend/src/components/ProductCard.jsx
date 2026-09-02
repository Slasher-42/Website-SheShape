import { Link } from 'react-router-dom'
import { formatPrice, formatCategory } from '../utils/format.js'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const cover = product.images?.[0]?.url
  const soldOut = product.stock === 0

  return (
    <Link to={`/product/${product.slug}`} className={styles.card}>
      <div className={styles.media}>
        {cover && <img src={cover} alt={product.name} width="600" height="600" loading="lazy" />}
        {soldOut && <span className={styles.badge}>Sold out</span>}
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{formatCategory(product.category)}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.price}>{formatPrice(product.price)}</span>
      </div>
    </Link>
  )
}
