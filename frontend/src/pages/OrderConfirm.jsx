import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/auth-context.js';
import api, { readError } from '../api/client.js';
import { formatPrice } from '../utils/format.js';
import { ORDER_STATUS_LABELS, formatOrderDate } from '../utils/order.js';
import Loading from '../components/Loading.jsx';
import field from './Form.module.css';
import styles from './Orders.module.css';

const PAYMENT_NOTE =
  'Send your payment by MoMo to 0788 000 000, using your order number as the reference. We will call you to confirm before dispatch.';

export default function OrderConfirm() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(location.state?.order ?? null);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadOrder = useCallback(
    async (phoneValue) => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/orders/${orderNumber}`, {
          params: phoneValue ? { phone: phoneValue } : undefined,
        });
        setOrder(response.data.data);
      } catch (requestError) {
        setError(readError(requestError));
      } finally {
        setLoading(false);
      }
    },
    [orderNumber]
  );

  useEffect(() => {
    if (order || authLoading || !user) return;
    loadOrder();
  }, [order, authLoading, user, loadOrder]);

  if (authLoading || loading) return <Loading />;

  if (!order) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Find your order</h1>
        <p className={styles.subtitle}>
          Order {orderNumber}. Enter the phone number you used, so we know it&apos;s you.
        </p>

        <form
          className={`${field.form} ${styles.lookup}`}
          onSubmit={(event) => {
            event.preventDefault();
            loadOrder(phone);
          }}
          noValidate
        >
          {error && <p className={field.error}>{error}</p>}

          <div className={field.field}>
            <label className={field.label} htmlFor="phone">
              Phone
            </label>
            <input
              className={field.input}
              id="phone"
              name="phone"
              type="tel"
              placeholder="0788 123 456"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </div>

          <button className="btn" type="submit">
            Show my order
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Thank you</h1>
      <p className={styles.subtitle}>
        Your order is placed. Keep the number below — you&apos;ll need it to check on your order.
      </p>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <div className={styles.number}>{order.orderNumber}</div>
            <div className={styles.date}>{formatOrderDate(order.createdAt)}</div>
          </div>
          <span className={styles.badge}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
        </div>

        {order.items.map((item) => (
          <div className={styles.line} key={item.id}>
            <span className={styles.lineName}>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>

        <p className={styles.payment}>{PAYMENT_NOTE}</p>
      </div>

      <div className={styles.actions}>
        <Link className="btn" to="/shop">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
