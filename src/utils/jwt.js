/**
 * Minimal, dependency-free JWT payload decoder. We only ever need to read
 * the "exp" claim client-side to know when to proactively drop a stale
 * session - the backend (JwtAuthFilter) is what actually verifies the
 * signature on every request, so this never needs to validate anything,
 * just read.
 */
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

/** True if the token is missing, malformed, or past its "exp" claim. */
export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  const nowInSeconds = Date.now() / 1000;
  return payload.exp < nowInSeconds;
}
