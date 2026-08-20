import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSellerOrders, updateOrderStatus } from '../api/seller';

const STATUS_TABS = ['ALL', 'PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'TRANSIT', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLES = {
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

export default function SellerOrders() {
  const [statusTab, setStatusTab] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [savingId, setSavingId] = useState(null);
  const [rowMessage, setRowMessage] = useState({ id: null, text: '', isError: false });

  function loadOrders(status) {
    setLoading(true);
    setError('');
    return getSellerOrders({ status: status === 'ALL' ? undefined : status })
      .then((data) => setOrders(data || []))
      .catch(() => setError('Could not load your orders right now. Please try again shortly.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders(statusTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.productName, o.manufacturer, o.buyerEmail, String(o.orderId), String(o.orderItemId)]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [orders, search]);

  async function handleStatusChange(orderItemId, newStatus) {
    setSavingId(orderItemId);
    setRowMessage({ id: null, text: '', isError: false });
    try {
      await updateOrderStatus(orderItemId, newStatus);
      // Re-fetch so allowedNextStatuses (and the status filter membership) stay accurate.
      await loadOrders(statusTab);
      setRowMessage({ id: orderItemId, text: `Status updated to ${newStatus}.`, isError: false });
    } catch (err) {
      const message = typeof err.response?.data === 'string' ? err.response.data : 'Could not update order status.';
      setRowMessage({ id: orderItemId, text: message, isError: true });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 w-full flex-1">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-caption-bold text-slate-400 mb-2 uppercase tracking-widest">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">Orders</span>
          </nav>
          <h1 className="text-display-hero-mobile text-on-background">Orders</h1>
          <p className="text-secondary mt-2">Track and fulfil orders placed for your products.</p>
        </div>

        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, buyer email, order #..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 text-label-sm"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusTab === tab
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-secondary hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-secondary text-body-base">Loading orders...</p>
      ) : error ? (
        <div className="rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">receipt_long</span>
          <p className="text-secondary text-body-base">
            {orders.length === 0 ? 'No orders in this status yet.' : 'No orders match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const rowMsg = rowMessage.id === order.orderItemId ? rowMessage : null;
            const allowedNext = order.allowedNextStatuses || [];

            return (
              <div
                key={order.orderItemId}
                className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-outline flex-shrink-0">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-caption-bold text-slate-400 uppercase tracking-widest">
                        Order #{order.orderId} · Item #{order.orderItemId}
                      </p>
                      <h3 className="font-bold text-on-background truncate">{order.productName}</h3>
                      <p className="text-label-sm text-secondary">
                        {order.buyerEmail} · {money(order.purchasePrice)} × {order.qty}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-lg text-on-background w-fit">{money(order.lineTotal)}</span>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${
                      STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* Restricted status changer: only shows the transitions the backend will actually allow. */}
                  <div className="flex items-center gap-2">
                    {allowedNext.length > 0 ? (
                      <select
                        value=""
                        onChange={(e) => e.target.value && handleStatusChange(order.orderItemId, e.target.value)}
                        disabled={savingId === order.orderItemId}
                        className="h-10 px-3 rounded-lg border border-slate-200 text-label-sm font-semibold text-secondary disabled:opacity-40"
                      >
                        <option value="" disabled>
                          {savingId === order.orderItemId ? 'Updating...' : 'Change status'}
                        </option>
                        {allowedNext.map((s) => (
                          <option key={s} value={s}>
                            Mark as {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-label-sm text-outline italic">No further changes</span>
                    )}
                  </div>

                  <Link
                    to={`/seller/orders/${order.orderItemId}`}
                    className="h-10 px-4 rounded-lg border border-slate-200 text-label-sm font-semibold text-secondary hover:bg-slate-50 flex items-center gap-2 transition-all w-fit"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    Details
                  </Link>
                </div>

                {rowMsg && (
                  <div
                    className={`px-6 pb-4 text-label-sm ${rowMsg.isError ? 'text-error' : 'text-emerald-600'}`}
                  >
                    {rowMsg.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
