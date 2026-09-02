import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import ProductCard from '../components/ProductCard.jsx'
import Loading from '../components/Loading.jsx'
import styles from './Home.module.css'

export default function Home() {
  const { data: products, loading } = useApi('/products', { limit: 4 })

  return (
    <div className="page">
      <section className={styles.hero}>
        <div>
          <span className={styles.tagline}>Strong is her shape</span>
          <h1 className={styles.title}>Gear that trains as hard as you do</h1>
          <p className={styles.lead}>
            Activewear, accessories and supplements chosen for women who show up. Order online and
            we will get it to you.
          </p>
          <Link to="/shop" className="btn">
            Shop now
          </Link>
        </div>
        <div className={styles.heroArt} />
      </section>

      <section>
        <div className={styles.sectionHead}>
          <h2>Latest products</h2>
          <Link to="/shop" className="btn btn-outline">
            View all
          </Link>
        </div>
        {loading ? (
          <Loading label="Loading products" />
        ) : (
          <div className={styles.grid}>
            {(products ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
