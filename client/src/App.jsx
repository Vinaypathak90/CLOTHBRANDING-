import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CMSContext } from './context/CMSContext';

// Layout Shared Modules
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Premium Core Pages Mapping Layer
import Home from './pages/shop/Home'; // 🔥 Step 1: Home page view ko yahan import kiya

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
            {/* REGISTERED COUTURE CORE HOME TERMINAL */}
            <Route path="/" element={<Home />} /> {/* 🔥 Step 2: Placeholder hata kar Home mount kar diya */}
            
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