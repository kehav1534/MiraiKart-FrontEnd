import { api } from './axios';

/** All of these are SELLER-only and are always scoped server-side to the authenticated seller. */
export function getSellerMetrics() {
  return api.post('/seller/apis/sellerMetrics').then((res) => res.data);
}

export function getProductMetrics(productId) {
  return api.post(`/seller/apis/productMetrics/${productId}`).then((res) => res.data);
}

export function getSellerProducts() {
  return api.get('/seller/apis/products').then((res) => res.data);
}

export function getSellerOrders({ status, limit } = {}) {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  return api.get('/seller/apis/orders', { params }).then((res) => res.data);
}

/** Full detail (buyer contact/address, payment info, per-item status) for one order line the seller owns. */
export function getSellerOrderDetail(orderItemId) {
  return api.get(`/seller/apis/orders/${orderItemId}`).then((res) => res.data);
}

/**
 * newStatus is one of the OrderStatus values. The backend enforces which
 * transitions are legal from the item's current status (see
 * SellerService.ALLOWED_TRANSITIONS) - an invalid one comes back as a 400
 * with a message naming what is still allowed, so always surface the error.
 */
export function updateOrderStatus(orderItemId, newStatus) {
  return api
    .patch('/seller/apis/updateOrderStatus', { orderItemId, status: newStatus })
    .then((res) => res.data);
}

export function updateStock(productId, quantity) {
  return api
    .put('/seller/apis/updateStock', { productId, quantity })
    .then((res) => res.data);
}

export function adjustStock(productId, quantity) {
  return api
    .patch('/seller/apis/updateStock', { productId, quantity })
    .then((res) => res.data);
}

export function updateSellerDetails(sellerDto) {
  return api.patch('/seller/apis/updateSellerDetails', sellerDto).then((res) => res.data);
}

/** status is one of 'LIVE' | 'DRAFT' | 'CLOSED' - see ProductListingStatusDto on the backend. */
export function updateListingStatus(productId, status) {
  return api
    .patch('/seller/apis/updateListingStatus', { productId, status })
    .then((res) => res.data);
}
