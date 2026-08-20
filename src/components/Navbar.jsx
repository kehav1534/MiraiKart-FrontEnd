import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, role, email, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-surface-white shadow-xl sticky top-0 z-50">
      <nav className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <Link to="/products" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">shopping_bag</span>
          <span className="text-2xl font-black tracking-tighter text-slate-900">LUXE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/products"
            className="text-body-base text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            Shop
          </Link>
          {isAuthenticated && role === 'USER' && (
            <Link
              to="/orders"
              className="text-body-base text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              My Orders
            </Link>
          )}
          {isAuthenticated && role === 'SELLER' && (
            <>
              <Link
                to="/seller/dashboard"
                className="text-body-base text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                Dashboard
              </Link>
              <Link
                to="/seller/products"
                className="text-body-base text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                My Products
              </Link>
              <Link
                to="/seller/orders"
                className="text-body-base text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                Orders
              </Link>
              <Link
                to="/seller/add-product"
                className="text-body-base text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                Add Product
              </Link>
              {/* A seller's own login can shop too - kept clearly labeled "My Purchases" so it's
                  never confused with the "Orders" link above (which is their fulfilment queue). */}
              <Link
                to="/orders"
                className="text-body-base text-on-surface-variant hover:text-primary transition-colors duration-300"
              >
                My Purchases
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              to="/cart"
              aria-label="Cart"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-secondary hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="hidden sm:flex items-center gap-2 text-label-sm text-secondary">
                <span className="material-symbols-outlined text-lg">person</span>
                {email} <span className="text-outline">|</span> {role}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 text-secondary font-label-sm hover:bg-slate-50 transition-all"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-on-primary font-body-bold primary-glow-effect hover:opacity-90 transition-all"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
