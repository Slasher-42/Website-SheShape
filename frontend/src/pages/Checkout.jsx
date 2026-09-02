import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/cart-context.js';
import { useAuth } from '../context/auth-context.js';
import api, { readError } from '../api/client.js';
import { formatPrice } from '../utils/format.js';
import field from './Form.module.css';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const placed = useRef(false);

  const [values, setValues] = useState({
    customerName: user?.name ?? '',
    customerPhone: user?.phone ?? '',
    address: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0 && !placed.current) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/orders', {
        ...values,
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });

      const order = response.data.data;

      placed.current = true;
      clearCart();
      navigate(`/order/${order.orderNumber}`, { replace: true, state: { order } });
    } catch (requestError) {
      setError(readError(requestError));
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Delivery details</h2>

          <form className={field.form} onSubmit={handleSubmit} noValidate>
            {error && <p className={field.error}>{error}</p>}

            <div className={field.field}>
              <label className={field.label} htmlFor="customerName">
                Full name
              </label>
              <input
                className={field.input}
                id="customerName"
                name="customerName"
                type="text"
                autoComplete="name"
                value={values.customerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={field.field}>
              <label className={field.label} htmlFor="customerPhone">
                Phone
              </label>
              <input
                className={field.input}
                id="customerPhone"
                name="customerPhone"
                type="tel"
                autoComplete="tel"
                placeholder="0788 123 456"
                value={values.customerPhone}
                onChange={handleChange}
                required
              />
              <span className={field.hint}>We call this number to confirm your order.</span>
            </div>

            <div className={field.field}>
              <label className={field.label} htmlFor="address">
                Delivery address
              </label>
              <textarea
                className={field.input}
                id="address"
                name="address"
                rows={3}
                value={values.address}
                onChange={handleChange}
                required
              />
              <span className={field.hint}>Street, district, and a landmark if it helps.</span>
            </div>

            <button className={`btn ${styles.submit}`} type="submit" disabled={submitting}>
              {submitting ? 'Placing your order…' : 'Place order'}
            </button>
          </form>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Your order</h2>

          {items.map((item) => (
            <div className={styles.summaryRow} key={item.id}>
              <span className={styles.summaryName}>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <div className={styles.totalRow}>
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <p className={styles.note}>
            No payment is taken here. We confirm your order by phone and arrange payment with you.
          </p>
        </div>
      </div>
    </div>
  );
}
