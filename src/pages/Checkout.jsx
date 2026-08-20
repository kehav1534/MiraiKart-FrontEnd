import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getCart } from '../api/cart';
import { checkout, buyNow } from '../api/order';

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: 'payments' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: 'credit_card' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: 'credit_card' },
  { value: 'NET_BANKING', label: 'Net Banking', icon: 'account_balance' },
  { value: 'UPI', label: 'UPI', icon: 'qr_code_2' },
];

function effectivePrice(product) {
  const price = Number(product.price ?? 0);
  const discount = Number(product.discount ?? 0);
  return discount > 0 ? price * (1 - discount / 100) : price;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // If we arrived via "Buy Now" on a product page, location.state.buyNow
  // carries {productId, quantity, product} and we skip the cart entirely.
  const buyNowRequest = location.state?.buyNow ?? null;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(!buyNowRequest);
  const [error, setError] = useState('');
  const [paymentMode, setPaymentMode] = useState('COD');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (buyNowRequest) return;
    setLoading(true);
    setError('');
    getCart()
      .then((data) => setCartItems(data || []))
      .catch(() => setError('Could not load your cart right now. Please try again shortly.'))
      .finally(() => setLoading(false));
  }, [buyNowRequest]);

  const lineItems = buyNowRequest
    ? [{ product: buyNowRequest.product, quantity: buyNowRequest.quantity }]
    : cartItems;

  const total = lineItems.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);

  async function handlePlaceOrder() {
    setPlacing(true);
    setError('');
    try {
      const order = buyNowRequest
        ? await buyNow(buyNowRequest.productId, buyNowRequest.quantity, paymentMode)
        : await checkout(paymentMode);
      navigate('/orders', { state: { justPlacedOrderId: order.id, orderTotal: total } });
    } catch (err) {
      const message = typeof err.response?.data === 'string' ? err.response.data : null;
      setError(message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-16 w-full flex-1">
        <p className="text-secondary text-body-base">Loading checkout...</p>
      </main>
    );
  }

  if (lineItems.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-6 md:px-8 py-16 w-full flex-1 text-center">
        <p className="text-secondary text-body-base mb-4">There's nothing to check out yet.</p>
        <Link to="/products" className="text-primary font-body-bold hover:underline">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
      <h1 className="text-display-hero-mobile text-slate-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Order items */}
      <section className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-6">
        <h2 className="text-headline-md text-on-background mb-4">
          {buyNowRequest ? 'Item' : `Items (${lineItems.length})`}
        </h2>
        <div className="divide-y divide-slate-100">
          {lineItems.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="font-semibold text-on-background truncate">{item.product.name}</p>
                <p className="text-label-sm text-secondary">
                  ${effectivePrice(item.product).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <span className="font-bold text-on-background">
                ${(effectivePrice(item.product) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xl font-black">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </section>

      {/* Payment method */}
      <section className="bg-surface-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-8">
        <h2 className="text-headline-md text-on-background mb-4">Payment Method</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMode(method.value)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                paymentMode === method.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 text-secondary hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined">{method.icon}</span>
              <span className="font-body-bold text-sm">{method.label}</span>
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full h-14 rounded-lg bg-primary text-on-primary font-body-bold primary-glow-effect hover:opacity-90 transition-all disabled:opacity-60"
      >
        {placing ? 'Placing Order...' : `Place Order · $${total.toFixed(2)}`}
      </button>
    </main>
  );
}
