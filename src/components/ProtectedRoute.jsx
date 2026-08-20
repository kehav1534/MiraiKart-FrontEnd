import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Gate for any page that requires a signed-in session. `role` may be a
 * single role string ('USER' or 'SELLER') or an array of allowed roles -
 * used for pages like /cart and /orders that a seller's login can also
 * reach (see AuthenticatedAccountResolver#getCurrentShoppingUserId on the
 * backend). Mirrors the backend's hasRole(...)/hasAnyRole(...) rules in
 * SecurityConfig, so a token can't land on a page the backend would 403
 * it on anyway. Anything that fails either check is bounced to /login,
 * with the originally-requested location preserved so login can send them
 * back.
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null;
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
