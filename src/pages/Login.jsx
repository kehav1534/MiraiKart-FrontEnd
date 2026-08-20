import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [role, setRole] = useState('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  const { login, isAuthenticated, role: currentRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sessionExpired')) {
      setSessionExpiredNotice(true);
    }
  }, [location.search]);

  // Already logged in? Skip the form entirely.
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      navigate(from || (currentRole === 'SELLER' ? '/seller/dashboard' : '/products'), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const authResponse = await loginApi(role, { email, password });
      login(authResponse);
      const from = location.state?.from?.pathname;
      navigate(from || (authResponse.role === 'SELLER' ? '/seller/dashboard' : '/products'), { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('Invalid email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16 relative">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary opacity-5 ambient-blur rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary opacity-5 ambient-blur rounded-full" />
      </div>

      <div className="w-full max-w-[480px] bg-surface-white rounded-xl shadow-xl p-inset-card-mobile md:p-inset-card">
        <div className="text-center mb-stack-md">
          <h1 className="text-display-hero-mobile md:text-display-hero text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-body-base text-secondary">Sign in to your LUXE account.</p>
        </div>

        {sessionExpiredNotice && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-label-sm px-4 py-3">
            Your session expired. Please sign in again.
          </div>
        )}

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 mb-stack-md bg-surface-container-low rounded-lg p-1">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`h-10 rounded-md font-label-sm transition-all ${
              role === 'USER' ? 'bg-surface-white shadow text-primary' : 'text-secondary'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('SELLER')}
            className={`h-10 rounded-md font-label-sm transition-all ${
              role === 'SELLER' ? 'bg-surface-white shadow text-primary' : 'text-secondary'
            }`}
          >
            Seller
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">
            {error}
          </div>
        )}

        <form className="space-y-stack-md" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-label-sm text-slate-700 block px-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@luxe.com"
              className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-surface-white text-body-base transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-slate-700 block px-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-surface-white text-body-base transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-primary text-on-primary font-body-bold rounded-lg primary-glow-effect hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-stack-lg text-center">
          <p className="text-body-base text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to={role === 'SELLER' ? '/signup/seller' : '/signup'}
              className="text-primary font-body-bold hover:underline ml-1"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
