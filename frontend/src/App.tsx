import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MarketplacePage } from './pages/MarketplacePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CategoryPage } from './pages/CategoryPage'
import { CartPage } from './pages/CartPage'
import { BundlesPage } from './pages/BundlesPage'
import { BundleDetailPage } from './pages/BundleDetailPage'
import { WishlistPage } from './pages/WishlistPage'
import { LoginPage } from './pages/LoginPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { UploadReceiptPage } from './pages/UploadReceiptPage'
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { DownloadsPage } from './pages/DownloadsPage'
import { AdminRoute } from './components/AdminRoute'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage'
import { AdminBankPage } from './pages/admin/AdminBankPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminBundlesPage } from './pages/admin/AdminBundlesPage'
import { AdminBundleFormPage } from './pages/admin/AdminBundleFormPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<MarketplacePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/bundles" element={<BundlesPage />} />
              <Route path="/marketplace/bundles/:slug" element={<BundleDetailPage />} />
              <Route path="/marketplace/category/:slug" element={<CategoryPage />} />
              <Route path="/marketplace/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/checkout/upload-receipt/:orderId" element={<ProtectedRoute><UploadReceiptPage /></ProtectedRoute>} />
              <Route path="/checkout/success/:orderId" element={<ProtectedRoute><CheckoutSuccessPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/downloads" element={<ProtectedRoute><DownloadsPage /></ProtectedRoute>} />
              <Route path="/downloads/:orderId" element={<ProtectedRoute><DownloadsPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

              <Route path="/admin/marketplace" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              <Route path="/admin/marketplace/new" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
              <Route path="/admin/marketplace/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
              <Route path="/admin/marketplace/:id" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
              <Route path="/admin/bundles" element={<AdminRoute><AdminBundlesPage /></AdminRoute>} />
              <Route path="/admin/bundles/new" element={<AdminRoute><AdminBundleFormPage /></AdminRoute>} />
              <Route path="/admin/bundles/:id" element={<AdminRoute><AdminBundleFormPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
              <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
              <Route path="/admin/bank-account" element={<AdminRoute><AdminBankPage /></AdminRoute>} />
            </Routes>
          </Layout>
        </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
