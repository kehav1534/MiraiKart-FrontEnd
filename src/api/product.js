import { api, API_BASE_URL } from './axios';

/**
 * Product.images[].imageUrl comes back as a relative path (e.g.
 * "/product-images/xyz.jpg") from ProductController/WebConfig's static
 * mapping - this resolves it against the API host so it can be used
 * directly as an <img src>.
 */
export function resolveProductImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

/** Convenience: the URL for a product's first (thumbnail) image, or null if it has none. */
export function primaryImageUrl(product) {
  const first = product?.images?.[0];
  return first ? resolveProductImageUrl(first.imageUrl) : null;
}

/**
 * Mirrors ProductController#searchProductWithFilter. pageNo is 1-based from
 * the caller's point of view (the backend treats page 1 as its internal
 * page 0), search/manufacturer/category/minPrice/maxPrice are all optional.
 */
export function searchProducts({ search, minPrice, maxPrice, category, manufacturer, pageNo = 1 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (minPrice !== undefined && minPrice !== '') params.minPrice = minPrice;
  if (maxPrice !== undefined && maxPrice !== '') params.maxPrice = maxPrice;
  if (category?.length) params.category = category;
  if (manufacturer?.length) params.manufacturer = manufacturer;

  return api
    .get(`/product/apis/searchProduct/${pageNo}`, { params })
    .then((res) => res.data);
}

/** SELLER only - backend attaches the listing to the authenticated seller. Returns the created Product (with its id). */
export function addProduct(productDto) {
  return api.post('/product/apis/addProduct', productDto).then((res) => res.data);
}

/**
 * SELLER only, scoped to a product the caller owns. files is an array of File
 * objects from an <input type="file" multiple>. Returns the updated Product
 * (with its full, refreshed images list).
 */
export function uploadProductImages(productId, files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  return api
    .post(`/product/apis/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

/** SELLER only, scoped to a product the caller owns. */
export function deleteProductImage(productId, imageId) {
  return api.delete(`/product/apis/${productId}/images/${imageId}`).then((res) => res.data);
}

/** Public - no auth required, matches catalog browsing. */
export function getProductById(productId) {
  return api.get(`/product/apis/${productId}`).then((res) => res.data);
}
