import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import SignupCustomer from './pages/SignupCustomer.jsx';
import SignupSeller from './pages/SignupSeller.jsx';
import ProductCatalog from './pages/ProductCatalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import SellerAddProduct from './pages/SellerAddProduct.jsx';
import SellerProducts from './pages/SellerProducts.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import SellerOrders from './pages/SellerOrders.jsx';
import SellerOrderDetail from './pages/SellerOrderDetail.jsx';

export default function App() {
  console.log("Project ID:", import.meta.env.VITE_APPWRITE_PROJECT_ID);
  console.log("Endpoint:", import.meta.env.VITE_APPWRITE_ENDPOINT);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupCustomer />} />
        <Route path="/signup/seller" element={<SignupSeller />} />

        {/* Public browsing - "Add to cart"/"Buy Now" work for any signed-in account (buyer or seller);
            redirect to /login only if not signed in at all. */}
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:productId" element={<ProductDetail />} />

        {/* Shopping - reachable by a buyer login, or a seller shopping through their own login */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute role={['USER', 'SELLER']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute role={['USER', 'SELLER']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute role={['USER', 'SELLER']}>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Seller-only, protected */}
        <Route
          path="/seller/add-product"
          element={
            <ProtectedRoute role="SELLER">
              <SellerAddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute role="SELLER">
              <SellerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute role="SELLER">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute role="SELLER">
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders/:orderItemId"
          element={
            <ProtectedRoute role="SELLER">
              <SellerOrderDetail />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
