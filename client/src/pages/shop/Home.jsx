import React from 'react';
import HeroSection from '../../components/shop/HeroSection';

export default function Home() {
  return (
    <div className="w-full animate-fade-in">
      {/* Haute Couture Core Hero Stage Module */}
      <HeroSection />
      
      {/* Future sections jaise Category grids, Featured products catalog list panel clusters yahan call honge */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-14 py-24 text-center">
        <p className="text-[11px] tracking-[0.3em] text-neutral-400 uppercase">Preeti Production Channel Thread</p>
      </div>
    </div>
  );
}