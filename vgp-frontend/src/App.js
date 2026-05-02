import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Storefront
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AllProductsPage from './pages/AllProductsPage';
import ProductCategoriesPage from './pages/ProductCategoriesPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SalesPage from './pages/SalesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

// Admin
import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import LoginPage from './admin/pages/LoginPage';
import ProductsPage from './admin/pages/ProductsPage';
import ProductEditPage from './admin/pages/ProductEditPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import VouchersPage from './admin/pages/VouchersPage';
import CustomerNetworkPage from './admin/pages/CustomerNetworkPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AdminArea() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Routes>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products"      element={<ProductsPage />} />
          <Route path="products/:code" element={<ProductEditPage />} />
          <Route path="categories"    element={<CategoriesPage />} />
          <Route path="vouchers"      element={<VouchersPage />} />
          <Route path="customers"     element={<CustomerNetworkPage />} />
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Admin — own layout, no storefront chrome */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/*"     element={<AdminArea />} />

            {/* Storefront */}
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/"                                element={<HomePage />} />
                  <Route path="/all"                             element={<AllProductsPage />} />
                  <Route path="/category/:category/:subcategory" element={<ProductCategoriesPage />} />
                  <Route path="/sale"                            element={<SalesPage />} />
                  <Route path="/cart"                            element={<CartPage />} />
                  <Route path="/checkout"                        element={<CheckoutPage />} />
                  <Route path="/wishlist"                        element={<WishlistPage />} />
                  <Route path="/order/:orderNumber"              element={<OrderTrackingPage />} />
                  <Route path="/:productCode"                    element={<ProductDetailsPage />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
