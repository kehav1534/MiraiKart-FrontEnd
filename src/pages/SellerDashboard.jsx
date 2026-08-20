import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSellerMetrics, getSellerOrders } from '../api/seller';

const STATUS_STYLES = {
  DELIVERED: 'bg-emerald-100 text-emerald-600',
  CONFIRMED: 'bg-emerald-100 text-emerald-600',
  SHIPPED: 'bg-blue-100 text-blue-600',
  TRANSIT: 'bg-blue-100 text-blue-600',
  PACKED: 'bg-amber-100 text-amber-600',
  PROCESSING: 'bg-amber-100 text-amber-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

function money(value) {
  const n = Number(value ?? 0);
  return `$${n.toFixed(2)}`;
}

export default function SellerDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getSellerMetrics(), getSellerOrders({ limit: 10 })])
      .then(([metricsData, ordersData]) => {
        setMetrics(metricsData);
        setOrders(ordersData || []);
      })
      .catch(() => setError('Could not load your dashboard right now. Please try again shortly.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 w-full flex-1">
        <p className="text-secondary text-body-base">Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 w-full flex-1">
        <div className="rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">{error}</div>
      </main>
    );
  }

  const cards = [
    { label: 'Total Orders', value: metrics?.totalOrders ?? 0, icon: 'shopping_bag' },
    { label: 'Total Items Sold', value: metrics?.totalSales ?? 0, icon: 'sell' },
    { label: 'Gross Revenue', value: money(metrics?.grossRevenue), icon: 'payments' },
    { label: 'Net Revenue', value: money(metrics?.netRevenue), icon: 'account_balance_wallet' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 w-full flex-1">
      <div className="mb-10">
        <h1 className="text-display-hero-mobile text-on-background">Seller Dashboard</h1>
        <p className="text-secondary mt-2">A live snapshot of your storefront's performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-surface-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <p className="text-slate-500 text-label-sm font-medium">{card.label}</p>
            <p className="text-3xl font-bold mt-1 text-on-background">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Top Selling */}
        <div className="bg-surface-white p-6 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-on-background">Top Selling</h3>
          </div>
          <div className="space-y-5">
            {(metrics?.hotProducts ?? []).length === 0 && (
              <p className="text-label-sm text-secondary">No sales data yet.</p>
            )}
            {(metrics?.hotProducts ?? []).map((p) => (
              <div key={p.productId} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{p.productName}</h4>
                  <p className="text-xs text-slate-500">{p.unitsSold} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock */}
        <div className="xl:col-span-2 bg-surface-white p-6 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-on-background">Out of Stock</h3>
            <span className="text-caption-bold text-error uppercase tracking-widest">
              {metrics?.itemsOutOfStocks?.length ?? 0} items
            </span>
          </div>
          <div className="space-y-3">
            {(metrics?.itemsOutOfStocks ?? []).length === 0 && (
              <p className="text-label-sm text-secondary">Nothing out of stock right now.</p>
            )}
            {(metrics?.itemsOutOfStocks ?? []).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100"
              >
                <span className="text-sm font-medium">{product.name}</span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                  Out of stock
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-on-background">Recent Orders</h3>
          <Link to="/seller/orders" className="text-label-sm font-body-bold text-primary hover:underline">
            View all orders
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Purchase Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-label-sm text-secondary">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.orderItemId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{order.productName ?? '—'}</td>
                  <td className="px-6 py-4 text-sm">{order.qty}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{money(order.purchasePrice)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/seller/orders/${order.orderItemId}`}
                      className="text-label-sm font-body-bold text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
