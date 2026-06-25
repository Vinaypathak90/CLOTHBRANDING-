import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CMSContext } from './context/CMSContext';

// Layout Shared Modules
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute'; // 🔥 Step 1: Guard import kiya

// Premium Core Pages Mapping Layer
import Home from './pages/shop/Home';
import Wishlist from './pages/shop/Wishlist';
import Cart from './pages/shop/Cart'; 
import ProductDetails from './pages/shop/ProductDetails';
import AuthPage from './pages/auth/AuthPage'; // 🔥 Step 2: Auth page import kiya
import Checkout from './pages/shop/Checkout';
import ProfilePage from './pages/shop/ProfilePage';
import CollectionsPage from './pages/shop/CollectionsPage';
import AdminCMSDashboard from './pages/admin/AdminCMSDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProductDashboard from './pages/admin/AdminProductDashboard';
import CategoryPage from './pages/shop/CategoryPage';
import Collections from './pages/shop/CollectionsPage';
import NewArrivals from './pages/shop/NewArrivals';

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
        {/* pt-[92px] padding alignment ensure karta hai ki dynamic content fixed navbar ke neeche push ho */}
        <main className="flex-grow pt-[92px]">
          <Routes>
            
            {/* ========================================== */}
            {/* 🌍 PUBLIC ROUTES (Access to everyone) */}
            {/* ========================================== */}
            <Route path="/" element={<Home />} /> 
            <Route path="/shop/product/:id" element={<ProductDetails />} />
            <Route path="/auth" element={<AuthPage />} /> {/* 🔥 Login/Signup entry portal */}

            {/* ========================================== */}
            {/* 🔒 PRIVATE ROUTES (Only Logged-in Users) */}
            {/* ========================================== */}
            {/* Make Wishlist and Cart public views — allow browsing without login */}
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
{/* 🔥 Step 2: Profile Page Gateway Wrapped Securely under ProtectedRoute */}
            <Route 
              path="/profile" 
              element = {
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            {/* Checkout requires authentication */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
             /* ========================================== */
            {/* 🔑 ADMIN ROUTES (Only Admin Users) */
            /* ========================================== */
            }
            <Route path="/admin/cms-control" element={<AdminCMSDashboard />} />
            <Route path="/admin/product-control" element={<AdminProductDashboard />} />
            <Route path="/designer-studio-gate" element={<AdminLogin />} />
            <Route path="/admin/products-control" element={<AdminProductDashboard />} />

            {/* Future shop views paths clusters yahan merge honge */}
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