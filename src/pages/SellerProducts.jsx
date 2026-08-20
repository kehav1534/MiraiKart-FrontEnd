import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSellerProducts, getProductMetrics, updateStock, updateListingStatus } from '../api/seller';
import { primaryImageUrl } from '../api/product';

const LISTING_STATUSES = ['LIVE', 'DRAFT', 'CLOSED'];

// All statuses a product can actually be in, used for the filter tabs. LIVE/DRAFT/CLOSED
// are seller-settable (see LISTING_STATUSES below); BLOCKED/PENDING are platform-moderation
// states the seller can only view, never set - so they still need a tab to filter by, just
// not an option in the visibility dropdown.
const FILTER_TABS = ['ALL', 'LIVE', 'DRAFT', 'CLOSED', 'PENDING', 'BLOCKED'];

const LISTING_STYLES = {
  LIVE: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  CLOSED: 'bg-amber-100 text-amber-700',
  BLOCKED: 'bg-red-100 text-red-600',
  PENDING: 'bg-blue-100 text-blue-600',
};

function money(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search box (name / manufacturer / category) and the status tab, both applied client-side
  // over the seller's already-loaded product list.
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');

  // Which product's metrics panel is expanded, and the metrics data/loading/error for it.
  const [expandedId, setExpandedId] = useState(null);
  const [metricsById, setMetricsById] = useState({});
  const [metricsLoadingId, setMetricsLoadingId] = useState(null);
  const [metricsErrorId, setMetricsErrorId] = useState(null);

  // Draft stock quantity being typed per product id, before "Save" is clicked.
  const [stockDraft, setStockDraft] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);

  const [statusSavingId, setStatusSavingId] = useState(null);
  const [rowMessage, setRowMessage] = useState({ id: null, text: '', isError: false });

  function loadProducts() {
    setLoading(true);
    setError('');
    return getSellerProducts()
      .then((data) => setProducts(data || []))
      .catch(() => setError('Could not load your products right now. Please try again shortly.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const counts = useMemo(() => {
    const c = { ALL: products.length };
    for (const tab of FILTER_TABS) {
      if (tab === 'ALL') continue;
      c[tab] = products.filter((p) => p.listingStatus === tab).length;
    }
    return c;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (statusTab !== 'ALL') {
      list = list.filter((p) => p.listingStatus === statusTab);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.manufacturer, p.category].filter(Boolean).some((field) => field.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, statusTab, search]);

  function toggleMetrics(productId) {
    if (expandedId === productId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(productId);
    if (!metricsById[productId]) {
      setMetricsLoadingId(productId);
      setMetricsErrorId(null);
      getProductMetrics(productId)
        .then((data) => setMetricsById((prev) => ({ ...prev, [productId]: data })))
        .catch(() => setMetricsErrorId(productId))
        .finally(() => setMetricsLoadingId(null));
    }
  }

  async function handleSaveStock(productId) {
    const value = stockDraft[productId];
    if (value === undefined || value === '') return;
    setSavingStockId(productId);
    setRowMessage({ id: null, text: '', isError: false });
    try {
      await updateStock(productId, Number(value));
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, quantity: Number(value) } : p))
      );
      setStockDraft((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      setRowMessage({ id: productId, text: 'Stock updated.', isError: false });
    } catch {
      setRowMessage({ id: productId, text: 'Could not update stock.', isError: true });
    } finally {
      setSavingStockId(null);
    }
  }

  async function handleStatusChange(productId, status) {
    setStatusSavingId(productId);
    setRowMessage({ id: null, text: '', isError: false });
    try {
      await updateListingStatus(productId, status);
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, listingStatus: status } : p)));
      setRowMessage({ id: productId, text: `Visibility set to ${status}.`, isError: false });
    } catch {
      setRowMessage({ id: productId, text: 'Could not update visibility.', isError: true });
    } finally {
      setStatusSavingId(null);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 w-full flex-1">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-caption-bold text-slate-400 mb-2 uppercase tracking-widest">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">My Products</span>
          </nav>
          <h1 className="text-display-hero-mobile text-on-background">My Products</h1>
          <p className="text-secondary mt-2">Manage stock levels, visibility, and see per-product performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, manufacturer, category..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 text-label-sm"
            />
          </div>
          <Link
            to="/seller/add-product"
            className="h-11 px-5 rounded-lg bg-primary text-on-primary font-body-bold flex items-center gap-2 primary-glow-effect hover:opacity-90 transition-all w-fit flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Product
          </Link>
        </div>
      </div>

      {/* Status filter tabs - lets the seller view products by listing status (including
          platform-set BLOCKED/PENDING, which they can view here but not switch into). */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              statusTab === tab
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-secondary hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({counts[tab] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-secondary text-body-base">Loading your products...</p>
      ) : error ? (
        <div className="rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">{error}</div>
      ) : products.length === 0 ? (
        <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
          <p className="text-secondary text-body-base mb-4">You haven&apos;t listed any products yet.</p>
          <Link to="/seller/add-product" className="text-primary font-body-bold hover:underline">
            Add your first product
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
          <p className="text-secondary text-body-base">No products match this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const metrics = metricsById[product.id];
            const isExpanded = expandedId === product.id;
            const rowMsg = rowMessage.id === product.id ? rowMessage : null;

            return (
              <div key={product.id} className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Product info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-outline flex-shrink-0 overflow-hidden">
                      {primaryImageUrl(product) ? (
                        <img
                          src={primaryImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined">inventory_2</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-on-background truncate">{product.name}</h3>
                      <p className="text-label-sm text-secondary">
                        {product.manufacturer} · {money(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Availability badge */}
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${
                      product.availabilityStatus === 'OUT_OF_STOCK'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {product.availabilityStatus === 'OUT_OF_STOCK' ? 'Out of stock' : 'In stock'}
                  </span>

                  {/* Stock editor */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={stockDraft[product.id] ?? product.quantity}
                      onChange={(e) =>
                        setStockDraft((prev) => ({ ...prev, [product.id]: e.target.value }))
                      }
                      className="w-20 h-10 px-3 rounded-lg border border-slate-200 text-label-sm"
                    />
                    <button
                      onClick={() => handleSaveStock(product.id)}
                      disabled={savingStockId === product.id || stockDraft[product.id] === undefined}
                      className="h-10 px-3 rounded-lg border border-slate-200 text-label-sm font-semibold text-secondary hover:bg-slate-50 disabled:opacity-40 transition-all"
                    >
                      {savingStockId === product.id ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                  {/* Visibility selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={LISTING_STATUSES.includes(product.listingStatus) ? product.listingStatus : ''}
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      disabled={statusSavingId === product.id}
                      className={`h-10 px-3 rounded-lg text-xs font-semibold border-0 ${
                        LISTING_STYLES[product.listingStatus] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {!LISTING_STATUSES.includes(product.listingStatus) && (
                        <option value="" disabled>
                          {product.listingStatus}
                        </option>
                      )}
                      {LISTING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Metrics toggle */}
                  <button
                    onClick={() => toggleMetrics(product.id)}
                    className="h-10 px-4 rounded-lg border border-slate-200 text-label-sm font-semibold text-secondary hover:bg-slate-50 flex items-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">bar_chart</span>
                    {isExpanded ? 'Hide Metrics' : 'View Metrics'}
                  </button>
                </div>

                {rowMsg && (
                  <div
                    className={`px-6 pb-4 text-label-sm ${rowMsg.isError ? 'text-error' : 'text-emerald-600'}`}
                  >
                    {rowMsg.text}
                  </div>
                )}

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-surface-container-low/40 px-6 py-6">
                    {metricsLoadingId === product.id ? (
                      <p className="text-label-sm text-secondary">Loading metrics...</p>
                    ) : metricsErrorId === product.id ? (
                      <p className="text-label-sm text-error">Could not load metrics for this product.</p>
                    ) : metrics ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <MetricStat label="Orders" value={metrics.productOrders} />
                        <MetricStat label="Units Sold" value={metrics.productSales} />
                        <MetricStat label="Gross Revenue" value={money(metrics.grossRevenue)} />
                        <MetricStat label="Net Revenue" value={money(metrics.netRevenue)} />
                        <MetricStat label="Returns" value={metrics.returnCount} />
                        <MetricStat label="Return Rate" value={`${Number(metrics.returnRate ?? 0).toFixed(2)}%`} />
                        <MetricStat label="Stock Available" value={metrics.stockAvailable} />
                      </div>
                    ) : null}
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

function MetricStat({ label, value }) {
  return (
    <div>
      <p className="text-caption-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold text-on-background">{value}</p>
    </div>
  );
}
