import React from 'react';
import HeroSection from '../../components/shop/HeroSection';
import FeaturesGrid from '../../components/shop/FeaturesGrid';
import ProductCollection from '../../components/shop/ProductCollection';
export default function Home() {
  return (
    <div className="w-full animate-fade-in">
      {/* Haute Couture Core Hero Stage Module */}
      <HeroSection />
      {/* 2. DYNAMIC BRAND VALUES / FEATURES GRID */}
      <FeaturesGrid /> {/* 🔥 Step 2: Hero section ke theek niche place kar diya */}
      
     
     {/* 3. DYNAMIC PRODUCTS GALLERY & COUTURE DETAIL CANVAS TERMINAL */}
      <ProductCollection /> {/* 🔥 Step 2: Clear positioning right below trust values */}
     
     
    </div>
  );
}