import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerSeller } from '../api/auth';

export default function SignupSeller() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    contactNo: '',
    entityName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerSeller(form);
      setSuccess('Seller account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const message = typeof err.response?.data === 'string' ? err.response.data : null;
      setError(message || 'Could not create your seller account. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-10">
          <h1 className="text-display-hero-mobile text-slate-900 mb-2">Become a Seller</h1>
          <p className="text-body-base text-secondary">Set up your LUXE storefront.</p>
        </div>

        <div className="bg-surface-white rounded-xl shadow-xl p-inset-card-mobile md:p-inset-card border border-slate-200/50">
          {error && (
            <div className="mb-4 rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-label-sm px-4 py-3">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all"
              />
            </div>

            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Business / Entity Name</label>
              <input
                type="text"
                required
                value={form.entityName}
                onChange={(e) => update('entityName', e.target.value)}
                placeholder="Summit Industries"
                className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all"
              />
            </div>

            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="seller@business.com"
                className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all"
              />
            </div>

            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Contact Number</label>
              <input
                type="tel"
                required
                value={form.contactNo}
                onChange={(e) => update('contactNo', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all"
              />
            </div>

            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary-container text-on-primary font-body-bold rounded-lg primary-glow-effect hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? 'Creating Account...' : 'Create Seller Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-body-base text-on-surface-variant text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-body-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-label-sm text-secondary">
          Shopping instead?{' '}
          <Link to="/signup" className="text-primary font-body-bold hover:underline">
            Create a customer account
          </Link>
        </p>
      </div>
    </main>
  );
}
