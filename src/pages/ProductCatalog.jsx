import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { searchProducts, primaryImageUrl } from '../api/product';
import { addItemToCart } from '../api/cart';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = ['TV', 'MOBILE_PHONE', 'KITCHENWARE', 'LAPTOP', 'SHOES', 'HARDWARE', 'HOME_APPLIANCE', 'OTHER'];

const EMPTY_FILTERS = { search: '', categories: [], manufacturer: '', minPrice: '', maxPrice: '' };

function formatCategory(cat) {
  return cat.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProductCatalog() {
  // Draft values bound to the filter inputs - editing these alone doesn't
  // trigger a search.
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  // The filters actually in effect for the current results. Fetching is
  // driven off this (plus pageNo), not off `draft` directly, so a search
  // always uses exactly the values that were live when "Apply"/"Reset" was
  // clicked - never a stale closure from an earlier render.
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [pageNo, setPageNo] = useState(1);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setError('');
    searchProducts({
      search: appliedFilters.search || undefined,
      manufacturer: appliedFilters.manufacturer
        ? appliedFilters.manufacturer.split(',').map((m) => m.trim()).filter(Boolean)
        : undefined,
      category: appliedFilters.categories.length ? appliedFilters.categories : undefined,
      minPrice: appliedFilters.minPrice || undefined,
      maxPrice: appliedFilters.maxPrice || undefined,
      pageNo,
    })
      .then((data) => setProducts(data || []))
      .catch(() => setError('Could not load products right now. Please try again shortly.'))
      .finally(() => setLoading(false));
  }, [appliedFilters, pageNo]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    setPageNo(1);
    setAppliedFilters(draft);
  }

  function toggleCategory(cat) {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setPageNo(1);
    setAppliedFilters(EMPTY_FILTERS);
  }

  async function handleAddToCart(product) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setCartMessage('');
    try {
      await addItemToCart(product.id, 1);
      setCartMessage(`Added "${product.name}" to your cart.`);
      setTimeout(() => setCartMessage(''), 3000);
    } catch {
      setCartMessage('Could not add that item to your cart. Please try again.');
    }
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-md text-slate-900">Filters</h2>
          <button onClick={resetFilters} type="button" className="text-caption-bold text-primary hover:underline">
            RESET
          </button>
        </div>

        <form onSubmit={handleFilterSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-label-sm text-slate-700 uppercase tracking-widest">Search</label>
            <input
              type="text"
              value={draft.search}
              onChange={(e) => setDraft((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search products..."
              className="w-full h-11 px-3 rounded-lg border border-slate-200 text-label-sm"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-label-sm text-slate-700 uppercase tracking-widest">Category</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={draft.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 rounded-sm border-slate-200 text-primary"
                  />
                  <span className="text-body-base text-secondary group-hover:text-primary transition-colors">
                    {formatCategory(cat)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-label-sm text-slate-700 uppercase tracking-widest">Manufacturer</h3>
            <input
              type="text"
              value={draft.manufacturer}
              onChange={(e) => setDraft((prev) => ({ ...prev, manufacturer: e.target.value }))}
              placeholder="e.g. NovaCore, TechPro"
              className="w-full h-11 px-3 rounded-lg border border-slate-200 text-label-sm"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-label-sm text-slate-700 uppercase tracking-widest">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={draft.minPrice}
                onChange={(e) => setDraft((prev) => ({ ...prev, minPrice: e.target.value }))}
                placeholder="Min"
                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-label-sm"
              />
              <span className="text-outline">–</span>
              <input
                type="number"
                min="0"
                value={draft.maxPrice}
                onChange={(e) => setDraft((prev) => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="Max"
                className="w-full h-11 px-3 rounded-lg border border-slate-200 text-label-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-primary text-on-primary font-body-bold hover:opacity-90 transition-all"
          >
            Apply Filters
          </button>
        </form>
      </aside>

      {/* Product Grid */}
      <section className="flex-1 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-caption-bold text-slate-400 mb-2 uppercase">
              <span>Home</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary">Catalog</span>
            </nav>
            <h1 className="text-display-hero text-slate-900 tracking-tighter">All Products</h1>
          </div>
        </div>

        {cartMessage && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-label-sm px-4 py-3">
            {cartMessage}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">{error}</div>
        )}

        {loading ? (
          <p className="text-secondary text-body-base">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-secondary text-body-base">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const imageUrl = primaryImageUrl(product);
              return (
              <div
                key={product.id}
                className="group bg-surface-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 flex flex-col"
              >
                <Link
                  to={`/products/${product.id}`}
                  className="relative aspect-square overflow-hidden bg-surface-container-low flex items-center justify-center"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-outline-variant">
                      {product.availabilityStatus === 'OUT_OF_STOCK' ? 'inventory_2' : 'shopping_bag'}
                    </span>
                  )}
                  {product.availabilityStatus === 'OUT_OF_STOCK' && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-error text-white font-caption-bold text-caption-bold px-3 py-1 rounded-full shadow-lg">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </Link>
                <div className="p-6 flex flex-col flex-1 space-y-4">
                  <div className="space-y-1">
                    <p className="text-caption-bold text-primary uppercase tracking-widest">
                      {product.manufacturer}
                    </p>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-headline-md text-slate-900 leading-tight hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    {product.des && <p className="text-label-sm text-secondary line-clamp-2">{product.des}</p>}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-caption-bold text-slate-400 line-through">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          <span className="text-[24px] font-black text-error">
                            ${(Number(product.price) * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-[24px] font-black text-slate-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.availabilityStatus === 'OUT_OF_STOCK'}
                      className="bg-primary-container text-on-primary font-body-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">shopping_cart</span>
                      ADD
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 pt-8 pb-4">
          <button
            onClick={() => setPageNo((p) => Math.max(1, p - 1))}
            disabled={pageNo === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-secondary hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="font-body-bold text-slate-700">Page {pageNo}</span>
          <button
            onClick={() => setPageNo((p) => p + 1)}
            disabled={products.length === 0}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-secondary hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>
    </main>
  );
}
