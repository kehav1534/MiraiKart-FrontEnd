import { api } from './axios';

/** USER only. paymentMode is one of 'COD' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'NET_BANKING' | 'UPI'. */
export function checkout(paymentMode) {
  return api.post('/order/apis/checkout', { paymentMode }).then((res) => res.data);
}

export function buyNow(productId, quantity, paymentMode) {
  return api
    .post('/order/apis/buyNow', { productId, quantity, paymentMode })
    .then((res) => res.data);
}

export function getMyOrders(limit) {
  return api
    .get('/order/apis/myOrders', { params: limit ? { limit } : {} })
    .then((res) => res.data);
}
