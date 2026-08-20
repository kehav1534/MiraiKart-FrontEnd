import { api } from './axios';

/** USER only. product is a product id, per CartItemDto. */
export function addItemToCart(productId, quantity = 1) {
  return api
    .post('/cart/apis/addItem', { product: productId, quantity })
    .then((res) => res.data);
}

export function getCart() {
  return api.get('/cart/apis/getCart').then((res) => res.data);
}

/** delta is added to the current quantity (positive to increase, negative to decrease). */
export function updateCartItem(productId, delta) {
  return api
    .patch('/cart/apis/updateItem', { product: productId, quantity: delta })
    .then((res) => res.data);
}

export function removeItemFromCart(productId) {
  return api
    .delete('/cart/apis/removeItem', { params: { productId } })
    .then((res) => res.data);
}
