import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { getProductById, resolveProductImageUrl } from '../api/product';
import { addItemToCart } from '../api/cart';
import { useAuth } from '../context/AuthContext.jsx';

function effectivePrice(product) {
  const price = Number(product.price ?? 0);
  const discount = Number(product.discount ?? 0);
  return discount > 0 ? price * (1 - discount / 100) : price;
}

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setError('');
    setProduct(null);
    setSelectedImageIndex(0);
    getProductById(productId)
      .then(setProduct)
      .catch(() => setError('This product could not be found.'))
      .finally(() => setLoading(false));
  }, [productId]);

  function requireBuyerLogin() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return true;
    }
    return false;
  }

  async function handleAddToCart() {
    if (requireBuyerLogin()) return;
    setAddingToCart(true);
    setMessage('');
    try {
      await addItemToCart(product.id, quantity);
      setMessage(`Added ${quantity} × "${product.name}" to your cart.`);
    } catch {
      setMessage('Could not add this item to your cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  }

  function handleBuyNow() {
    if (requireBuyerLogin()) return;
    navigate('/checkout', { state: { buyNow: { productId: product.id, quantity, product } } });
  }

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 md:px-8 py-16 w-full flex-1">
        <p className="text-secondary text-body-base">Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-5xl mx-auto px-6 md:px-8 py-16 w-full flex-1 text-center">
        <p className="text-error text-body-base mb-4">{error || 'Product not found.'}</p>
        <Link to="/products" className="text-primary font-body-bold hover:underline">
          Back to catalog
        </Link>
      </main>
    );
  }

  const outOfStock = product.availabilityStatus === 'OUT_OF_STOCK';
  const price = effectivePrice(product);

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-8 py-12 w-full flex-1">
      <nav className="flex items-center gap-2 text-caption-bold text-slate-400 mb-8 uppercase tracking-widest">
        <Link to="/products" className="hover:text-primary transition-colors">
          Catalog
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image gallery - falls back to the icon placeholder when the product has no photos yet */}
        <div>
          <div className="aspect-square rounded-2xl bg-surface-container-low flex items-center justify-center relative overflow-hidden">
            {product.images?.length > 0 ? (
              <img
                src={resolveProductImageUrl(product.images[selectedImageIndex]?.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-8xl text-outline-variant">
                {outOfStock ? 'inventory_2' : 'shopping_bag'}
              </span>
            )}
            {outOfStock && (
              <div className="absolute top-6 left-6">
                <span className="bg-error text-white font-caption-bold text-caption-bold px-3 py-1 rounded-full shadow-lg">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={resolveProductImageUrl(image.imageUrl)}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-caption-bold text-primary uppercase tracking-widest mb-2">{product.manufacturer}</p>
          <h1 className="text-display-hero-mobile text-slate-900 mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            {product.discount > 0 && (
              <span className="text-lg text-slate-400 line-through">${Number(product.price).toFixed(2)}</span>
            )}
            <span className="text-4xl font-black text-slate-900">${price.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-label-sm font-bold text-error">{product.discount}% OFF</span>
            )}
          </div>

          {product.des && <p className="text-body-base text-secondary leading-relaxed mb-6">{product.des}</p>}

          <dl className="grid grid-cols-2 gap-y-2 text-label-sm mb-8">
            <dt className="text-slate-400">Category</dt>
            <dd className="text-on-surface font-semibold">{product.category?.replace('_', ' ')}</dd>
            <dt className="text-slate-400">Availability</dt>
            <dd className={`font-semibold ${outOfStock ? 'text-error' : 'text-emerald-600'}`}>
              {outOfStock ? 'Out of stock' : `${product.quantity} in stock`}
            </dd>
          </dl>

          {message && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-label-sm px-4 py-3">
              {message}
            </div>
          )}

          {!outOfStock && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-label-sm text-slate-700">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-slate-50 transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-body-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-secondary hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || addingToCart}
              className="flex-1 h-14 rounded-lg border-2 border-primary text-primary font-body-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 h-14 rounded-lg bg-primary text-on-primary font-body-bold flex items-center justify-center gap-2 primary-glow-effect hover:opacity-90 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">bolt</span>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
