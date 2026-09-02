import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/cart-context.js'
import { useAuth } from '../context/auth-context.js'
import styles from './Navbar.module.css'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/programs', label: 'Programs' },
  { to: '/blog', label: 'Blog' }
]

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={`page ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          She Shape
        </Link>
        <nav className={styles.nav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/cart" className={styles.cart}>
            Cart
            {count > 0 && (
              <span className={styles.badge} aria-label={`${count} items in cart`}>
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className={styles.account}>
              <Link className={styles.accountName} to="/my-orders">
                {user.name.split(' ')[0]}
              </Link>
              <button className={styles.logout} type="button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <Link className={styles.login} to="/login">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
