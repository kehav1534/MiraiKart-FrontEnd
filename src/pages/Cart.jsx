import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeItemFromCart } from '../api/cart';
import { primaryImageUrl } from '../api/product';

function effectivePrice(product) {
  const price = Number(product.price ?? 0);
  const discount = Number(product.discount ?? 0);
  return discount > 0 ? price * (1 - discount / 100) : price;
}

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const navigate = useNavigate();

  function refreshCart() {
    setError('');
    return getCart()
      .then((data) => setItems(data || []))
      .catch(() => setError('Could not load your cart right now. Please try again shortly.'));
  }

  useEffect(() => {
    setLoading(true);
    refreshCart().finally(() => setLoading(false));
  }, []);

  async function handleQuantityChange(productId, delta) {
    setPendingId(productId);
    try {
      await updateCartItem(productId, delta);
      await refreshCart();
    } catch {
      setError('Could not update that item. Please try again.');
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(productId) {
    setPendingId(productId);
    try {
      await removeItemFromCart(productId);
      await refreshCart();
    } catch {
      setError('Could not remove that item. Please try again.');
    } finally {
      setPendingId(null);
    }
  }

  const total = items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 md:px-8 py-16 w-full flex-1">
        <p className="text-secondary text-body-base">Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
      <h1 className="text-display-hero-mobile text-slate-900 mb-8">Your Cart</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">shopping_cart</span>
          <p className="text-secondary text-body-base mb-4">Your cart is empty.</p>
          <Link to="/products" className="text-primary font-body-bold hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              const isPending = pendingId === product.id;
              return (
                <div
                  key={product.id}
                  className="bg-surface-white rounded-xl shadow-lg border border-slate-100 p-5 flex items-center gap-5"
                >
                  <div className="w-16 h-16 rounded-lg bg-surface-container-low flex items-center justify-center text-outline flex-shrink-0 overflow-hidden">
                    {primaryImageUrl(product) ? (
                      <img src={primaryImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-bold text-on-background hover:text-primary transition-colors truncate block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-label-sm text-secondary">${effectivePrice(product).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-slate-50 transition-colors disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-body-bold text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-slate-50 transition-colors disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-20 text-right font-bold text-on-background">
                    ${(effectivePrice(product) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRemove(product.id)}
                    className="text-outline hover:text-error transition-colors disabled:opacity-40"
                    aria-label="Remove item"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-6 h-fit">
            <h2 className="text-headline-md text-on-background mb-6">Order Summary</h2>
            <div className="flex items-center justify-between text-body-base text-secondary mb-2">
              <span>Items</span>
              <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>
            </div>
            <div className="flex items-center justify-between text-xl font-black text-on-background pt-4 mt-4 border-t border-slate-100">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-12 mt-6 rounded-lg bg-primary text-on-primary font-body-bold primary-glow-effect hover:opacity-90 transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
