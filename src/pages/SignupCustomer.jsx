import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

const GENDERS = ['FEMALE', 'MALE', 'OTHERS'];

export default function SignupCustomer() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    contactNo: '',
    address: '',
    gender: '',
    dob: '',
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
      await registerUser(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const message = typeof err.response?.data === 'string' ? err.response.data : null;
      setError(message || 'Could not create your account. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-10">
          <h1 className="text-display-hero-mobile text-slate-900 mb-2">Sign Up</h1>
          <p className="text-body-base text-secondary">Join LUXE and elevate your shopping experience.</p>
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
              <label className="block text-label-sm text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="john@example.com"
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

            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={form.contactNo}
                onChange={(e) => update('contactNo', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm text-slate-700 mb-2">Gender</label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg appearance-none transition-all"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-sm text-slate-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => update('dob', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Address</label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="123 Luxury Ave, Suite 400"
                className="w-full px-4 py-3 bg-surface-white border border-slate-200 rounded-lg transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary-container text-on-primary font-body-bold rounded-lg primary-glow-effect hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? 'Creating Account...' : 'Sign Up'}
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
          Selling on LUXE instead?{' '}
          <Link to="/signup/seller" className="text-primary font-body-bold hover:underline">
            Create a seller account
          </Link>
        </p>
      </div>
    </main>
  );
}
