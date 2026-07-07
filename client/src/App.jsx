import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CMSContext } from './context/CMSContext';

// Layout Shared Modules
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
// 🔥 Import BOTH guards: ProtectedRoute (User) & AdminRoute (Admin)
import ProtectedRoute, { AdminRoute } from './components/common/ProtectedRoute'; 

// Premium Core Pages Mapping Layer
import Home from './pages/shop/Home';
import Wishlist from './pages/shop/Wishlist';
import Cart from './pages/shop/Cart'; 
import ProductDetails from './pages/shop/ProductDetails';
import AuthPage from './pages/auth/AuthPage'; 
import Checkout from './pages/shop/Checkout';
import CollectionsPage from './pages/shop/CollectionsPage';
import CategoryPage from './pages/shop/CategoryPage';
import NewArrivals from './pages/shop/NewArrivals';
import ContactUs from './pages/shop/Contact';
import UserDashboard from './pages/user/UserDashboard';

// Admin Core Pages
import AdminCMSDashboard from './pages/admin/AdminCMSDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProductDashboard from './pages/admin/AdminProductDashboard';

export default function App() {
  const { loading: cmsLoading } = useContext(CMSContext);

  if (cmsLoading) {
    return (
      <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-16 h-[1px] bg-[#C9A84C] animate-pulse"></div>
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase mt-4">Preeti Haute Couture Engine</p>
      </div>
    );
  }

  return (
    <Router>
      {/* Dynamic branding engine background styles selector setup */}
      <div 
        style={{ backgroundColor: 'var(--bg-luxury, #EFECE3)' }}
        className="min-h-screen text-lightLuxury flex flex-col justify-between selection:bg-goldAccent selection:text-darkLuxury transition-colors duration-500"
      >
        {/* GLOBAL FIXED NAVBAR BRAND MANAGER */}
        <Navbar />
      
        {/* MAIN MASTER SCENE DESK VIEWPORT */}
        <main className="flex-grow pt-[92px]">
          <Routes>
            
            {/* ========================================== */}
            {/* 🌍 PUBLIC ROUTES (Access to everyone) */}
            {/* ========================================== */}
            <Route path="/" element={<Home />} /> 
            <Route path="/shop/product/:id" element={<ProductDetails />} />
            <Route path="/auth" element={<AuthPage />} /> 
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/contact" element={<ContactUs />} />
            
            {/* Admin Gate MUST be public so admins can log in */}
            <Route path="/designer-studio-gate" element={<AdminLogin />} />

            {/* ========================================== */}
            {/* 🔒 PRIVATE ROUTES (Only Logged-in Users) */}
            {/* ========================================== */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/user/profile" element={<UserDashboard />} />
              <Route path="/user/orders" element={<UserDashboard />} />
            </Route>

            {/* ========================================== */}
            {/* 👑 ADMIN ROUTES (Strictly Only Admins) */}
            {/* ========================================== */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/cms-control" element={<AdminCMSDashboard />} />
              <Route path="/admin/products-control" element={<AdminProductDashboard />} />
              {/* Keeping both just in case you use product-control or products-control */}
              <Route path="/admin/product-control" element={<AdminProductDashboard />} />
            </Route>

          </Routes>
        </main>
        
        {/* GLOBAL SECURITY FOOTER LAYER */}
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </Router>
  );
}