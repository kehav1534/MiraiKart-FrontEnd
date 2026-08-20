import { useEffect, useState } from 'react';
import { addProduct, uploadProductImages } from '../api/product';

const CATEGORIES = ['TV', 'MOBILE_PHONE', 'KITCHENWARE', 'LAPTOP', 'SHOES', 'HARDWARE', 'HOME_APPLIANCE', 'OTHER'];
const MAX_IMAGES = 8;
const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/gif';

function formatCategory(cat) {
  return cat.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const EMPTY_FORM = {
  name: '',
  des: '',
  price: '',
  manufacturer: '',
  category: CATEGORIES[0],
  discount: 0,
  quantity: 0,
};

export default function SellerAddProduct() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected image files, plus locally-generated object URLs for previewing them
  // before upload. Uploading itself only happens after the product is created,
  // since the backend needs a real productId to attach images to.
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Revoke every object URL when the component unmounts, so previews don't leak memory.
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImageSelect(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting the same file after removing it
    if (picked.length === 0) return;

    setImageFiles((prev) => {
      const combined = [...prev, ...picked].slice(0, MAX_IMAGES);
      return combined;
    });
    setImagePreviews((prev) => {
      const newUrls = picked.map((file) => URL.createObjectURL(file));
      return [...prev, ...newUrls].slice(0, MAX_IMAGES);
    });
  }

  function removeImage(index) {
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function resetImages() {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discount: Number(form.discount),
        quantity: Number(form.quantity),
      };
      const product = await addProduct(payload);

      if (imageFiles.length > 0) {
        try {
          await uploadProductImages(product.id, imageFiles);
          setSuccess(`"${product.name}" was published with ${imageFiles.length} image(s).`);
        } catch (imgErr) {
          // The product itself was created successfully - only the photo upload failed -
          // so say so distinctly rather than implying the whole listing didn't go through.
          const message = typeof imgErr.response?.data === 'string' ? imgErr.response.data : null;
          setError(
            `"${product.name}" was published, but the images could not be uploaded: ${
              message || 'please try adding them again from My Products.'
            }`
          );
        }
      } else {
        setSuccess(`"${product.name}" was published successfully.`);
      }

      setForm(EMPTY_FORM);
      resetImages();
    } catch (err) {
      const message = typeof err.response?.data === 'string' ? err.response.data : null;
      setError(message || 'Could not add this product. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-8 py-10 w-full flex-1">
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-outline mb-2 text-caption-bold uppercase tracking-widest">
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary">Add Product</span>
        </nav>
        <h1 className="text-display-hero-mobile text-on-background">Add New Product</h1>
        <p className="text-secondary max-w-2xl mt-2">
          Create a high-impact listing by providing precise product details.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-container text-on-error-container text-label-sm px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-label-sm px-4 py-3">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-surface-white rounded-xl shadow-xl p-inset-card-mobile md:p-inset-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">info</span>
            </div>
            <h2 className="text-headline-md text-on-background">General Information</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Product Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. LUXE Horizon Mechanical Keyboard"
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-body-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-label-sm text-slate-700 mb-2">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-body-base appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-sm text-slate-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  required
                  value={form.manufacturer}
                  onChange={(e) => update('manufacturer', e.target.value)}
                  placeholder="e.g. NovaCore"
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-body-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-label-sm text-slate-700 mb-2">Base Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-body-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-label-sm text-slate-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => update('discount', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-body-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-sm text-slate-700 mb-2">Product Description</label>
              <textarea
                required
                rows={6}
                value={form.des}
                onChange={(e) => update('des', e.target.value)}
                placeholder="Describe the craftsmanship, materials, and unique value proposition..."
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-body-base resize-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface-white rounded-xl shadow-xl p-inset-card-mobile md:p-inset-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">photo_library</span>
            </div>
            <h2 className="text-headline-md text-on-background">Photos</h2>
          </div>

          <p className="text-label-sm text-secondary mb-4">
            Add up to {MAX_IMAGES} photos (PNG, JPEG, GIF, or WEBP, 5MB max each). The first photo is used as the
            listing thumbnail.
          </p>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((url, index) => (
                <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                  <img src={url} alt={`Selected product photo ${index + 1}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary rounded-full">
                      Thumbnail
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {imageFiles.length < MAX_IMAGES && (
            <label className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary-fixed/20 transition-all">
              <span className="material-symbols-outlined text-2xl text-outline">add_photo_alternate</span>
              <span className="text-label-sm text-secondary">
                {imageFiles.length === 0 ? 'Click to add photos' : `Add more (${MAX_IMAGES - imageFiles.length} left)`}
              </span>
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </section>

        <section className="bg-surface-white rounded-xl shadow-xl p-inset-card-mobile md:p-inset-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <h2 className="text-headline-md text-on-background">Inventory</h2>
          </div>

          <div>
            <label className="block text-label-sm text-slate-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              min="0"
              required
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              className="w-full md:w-64 px-4 py-4 bg-white border border-slate-200 rounded-xl text-body-base"
            />
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY_FORM);
              resetImages();
            }}
            className="px-6 py-3 rounded-xl bg-white border border-slate-200 font-body-bold text-secondary hover:bg-slate-50 transition-all active:scale-95"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-primary-container text-white font-body-bold flex items-center gap-2 primary-glow-effect shadow-xl transition-all active:scale-95 disabled:opacity-60"
          >
            <span className="material-symbols-outlined">publish</span>
            {submitting ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </main>
  );
}
