import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`page ${styles.inner}`}>
        <div>
          <div className={styles.brand}>She Shape</div>
          <p className={styles.tagline}>Strong is her shape</p>
        </div>
        <div className={styles.column}>
          <h3>Shop</h3>
          <ul>
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/shop?category=activewear">Activewear</Link>
            </li>
            <li>
              <Link to="/shop?category=supplements">Supplements</Link>
            </li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3>Explore</h3>
          <ul>
            <li>
              <Link to="/programs">Programs</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={`page ${styles.bottom}`}>
        © {new Date().getFullYear()} She Shape. All rights reserved.
      </div>
    </footer>
  )
}
