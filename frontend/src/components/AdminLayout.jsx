import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'
import styles from './AdminLayout.module.css'

const LINKS = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' }
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          She Shape
        </Link>

        <nav className={styles.nav}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.account}>
          <span className={styles.email}>{user?.email}</span>
          <Link to="/" className={styles.quiet}>
            View shop
          </Link>
          <button type="button" onClick={logout} className={styles.quiet}>
            Log out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
