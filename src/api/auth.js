import { api } from './axios';

/** role is 'USER' or 'SELLER' - maps to /auth/user/login and /auth/seller/login. */
export function login(role, { email, password }) {
  const path = role === 'SELLER' ? '/auth/seller/login' : '/auth/user/login';
  return api.post(path, { email, password }).then((res) => res.data);
}

export function registerUser(payload) {
  return api.post('/auth/user/register', payload).then((res) => res.data);
}

export function registerSeller(payload) {
  return api.post('/auth/seller/register', payload).then((res) => res.data);
}
