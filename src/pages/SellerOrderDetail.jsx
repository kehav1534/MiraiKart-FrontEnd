import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSellerOrderDetail, updateOrderStatus } from '../api/seller';

const STATUS_STYLES = {
  PROCESSING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  PACKED: 'bg-amber-100 text-amber-700',
  SHIPPED: 'bg-blue-100 text-blue-600',
  TRANSIT: 'bg-blue-100 text-blue-600',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

// The pipeline a normal (non-cancelled) order moves through, used only to
// render a visual progress trail - the actual enforcement lives entirely
// server-side in SellerService.ALLOWED_TRANSITIONS.
const PIPELINE = ['PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'TRANSIT', 'DELIVERED'];

function money(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function SellerOrderDetail() {
  const { orderItemId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  function load() {
    setLoading(true);
    setError('');
    return getSellerOrderDetail(orderItemId)
      .then((data) => setOrder(data))
      .catch((err) =>
        setError(
          err.response?.status === 404
            ? "This order item doesn't exist or doesn't belong to you."
            : 'Could not load this order right now. Please try again shortly.'
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderItemId]);

  async function handleStatusChange(newStatus) {
    setSaving(true);
    setMessage({ text: '', isError: false });
    try {
      await updateOrderStatus(order.orderItemId, newStatus);
      await load();
      setMessage({ text: `Status updated to ${newStatus}.`, isError: false });
    } catch (err) {
      const message = typeof err.response?.data === 'string' ? err.response.data : 'Could not update order status.';
      setMessage({ text: message, isError: true });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
        <p className="text-secondary text-body-base">Loading order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="max-w-4xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
        <div className="rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">
          {error || 'Order not found.'}
        </div>
        <Link to="/seller/orders" className="text-primary font-body-bold hover:underline mt-4 inline-block">
          Back to Orders
        </Link>
      </main>
    );
  }

  const allowedNext = order.allowedNextStatuses || [];
  const isCancelled = order.status === 'CANCELLED';
  const pipelineIndex = PIPELINE.indexOf(order.status);

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
      <nav className="flex items-center gap-2 text-caption-bold text-slate-400 mb-2 uppercase tracking-widest">
        <Link to="/seller/orders" className="hover:text-primary">
          Orders
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">Item #{order.orderItemId}</span>
      </nav>
      <h1 className="text-display-hero-mobile text-on-background mb-8">Order #{order.orderId}</h1>

      {/* Fulfilment progress */}
      <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-on-background">Fulfilment Status</h3>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600'
            }`}
          >
            {order.status}
          </span>
        </div>

        {isCancelled ? (
          <p className="text-label-sm text-error">This order item was cancelled and can no longer be changed.</p>
        ) : (
          <div className="flex items-center">
            {PIPELINE.map((step, idx) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx <= pipelineIndex
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-outline'
                    }`}
                  >
                    {idx <= pipelineIndex ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-secondary text-center w-16">{step}</span>
                </div>
                {idx < PIPELINE.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${idx < pipelineIndex ? 'bg-primary' : 'bg-slate-100'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Restricted status change controls - only ever offers transitions the backend will accept. */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          {allowedNext.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-label-sm text-secondary">Update status:</span>
              {allowedNext.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={saving}
                  className={`h-10 px-4 rounded-lg text-label-sm font-semibold transition-all disabled:opacity-40 ${
                    s === 'CANCELLED'
                      ? 'border border-red-200 text-red-600 hover:bg-red-50'
                      : 'bg-primary text-on-primary hover:opacity-90'
                  }`}
                >
                  {saving ? 'Updating...' : `Mark as ${s}`}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-label-sm text-outline italic">
              No further status changes are available for this order item.
            </p>
          )}
          {message.text && (
            <p className={`mt-3 text-label-sm ${message.isError ? 'text-error' : 'text-emerald-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product & pricing */}
        <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-on-background mb-4">Item</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-outline flex-shrink-0">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-on-background truncate">{order.productName}</p>
              <p className="text-label-sm text-secondary">{order.manufacturer}</p>
            </div>
          </div>
          <dl className="space-y-2 text-label-sm">
            <div className="flex justify-between">
              <dt className="text-secondary">Unit price</dt>
              <dd className="font-semibold">{money(order.purchasePrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Quantity</dt>
              <dd className="font-semibold">{order.qty}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Line total</dt>
              <dd className="font-black text-on-background">{money(order.lineTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Return status</dt>
              <dd className="font-semibold">{order.returnStatus}</dd>
            </div>
          </dl>
        </div>

        {/* Order & payment */}
        <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-on-background mb-4">Order & Payment</h3>
          <dl className="space-y-2 text-label-sm">
            <div className="flex justify-between">
              <dt className="text-secondary">Order placed</dt>
              <dd className="font-semibold">{formatDate(order.orderDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Last updated</dt>
              <dd className="font-semibold">{formatDate(order.updationDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Payment method</dt>
              <dd className="font-semibold">{order.paymentMode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Payment status</dt>
              <dd className="font-semibold">{order.paymentStatus}</dd>
            </div>
          </dl>
        </div>

        {/* Buyer / shipping */}
        <div className="md:col-span-2 bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-on-background mb-4">Ship To</h3>
          <dl className="space-y-2 text-label-sm">
            <div className="flex justify-between">
              <dt className="text-secondary">Buyer email</dt>
              <dd className="font-semibold">{order.buyerEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">Contact number</dt>
              <dd className="font-semibold">{order.buyerContactNo || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-secondary">Address</dt>
              <dd className="font-semibold text-right">{order.buyerAddress || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
