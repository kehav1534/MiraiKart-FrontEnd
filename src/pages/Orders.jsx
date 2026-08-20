import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getMyOrders } from '../api/order';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-blue-100 text-blue-600',
  PARTIALLY_REFUNDED: 'bg-blue-100 text-blue-600',
};

const ITEM_STATUS_STYLES = {
  PROCESSING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  PACKED: 'bg-amber-100 text-amber-700',
  SHIPPED: 'bg-blue-100 text-blue-600',
  TRANSIT: 'bg-blue-100 text-blue-600',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

function money(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const justPlacedOrderId = location.state?.justPlacedOrderId;

  useEffect(() => {
    setLoading(true);
    setError('');
    getMyOrders()
      .then((data) => setOrders(data || []))
      .catch(() => setError('Could not load your orders right now. Please try again shortly.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
      <h1 className="text-display-hero-mobile text-slate-900 mb-8">Your Orders</h1>

      {justPlacedOrderId && (
        <div className="mb-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-body-bold">Order placed successfully! Thank you for shopping with LUXE.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-secondary text-body-base">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">receipt_long</span>
          <p className="text-secondary text-body-base mb-4">You haven&apos;t placed any orders yet.</p>
          <Link to="/products" className="text-primary font-body-bold hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderTotal = (order.orderItems || []).reduce(
              (sum, item) => sum + Number(item.purchasePrice ?? 0) * item.qty,
              0
            );
            const isNew = order.id === justPlacedOrderId;

            return (
              <div
                key={order.id}
                className={`bg-surface-white rounded-2xl shadow-xl border overflow-hidden ${
                  isNew ? 'border-primary' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-surface-container-low/50 border-b border-slate-100">
                  <div>
                    <p className="text-caption-bold text-slate-400 uppercase tracking-widest">Order #{order.id}</p>
                    <p className="text-label-sm text-secondary">
                      {order.orderDate ? new Date(order.orderDate).toLocaleString() : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Payment: {order.status}
                    </span>
                    <span className="font-black text-lg text-on-background">{money(orderTotal)}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {(order.orderItems || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-background truncate">{item.product?.name ?? '—'}</p>
                        <p className="text-label-sm text-secondary">
                          {money(item.purchasePrice)} × {item.qty}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          ITEM_STATUS_STYLES[item.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
