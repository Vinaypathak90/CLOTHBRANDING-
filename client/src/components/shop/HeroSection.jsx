import React, { useState, useEffect, useContext } from 'react';
import { CMSContext } from '../../context/CMSContext';

export default function HeroSection() {
  const { cmsConfig } = useContext(CMSContext);
  const [currentSlide, setCurrentSlide] = useState(0);

  // High couture minimal fallback visual banners if database is offline
  const offlineBannersFallback = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
  ];

  // Dynamic parameters parsing straight from active database context registries
  const eyebrow = cmsConfig?.hero_eyebrow || "HAUTE COUTURE · FALL WINTER 2026";
  const titleMain = cmsConfig?.hero_title_main || "ARCHITECTURAL SILHOUETTES";
  const titleHighlight = cmsConfig?.hero_title_highlight || "DEFINING MODERN LUXURY";
  const subtitle = cmsConfig?.hero_subtitle || "A curated lineage of precision tailoring, fluid contours, and premium sustainable fabrics.";
  
  const ctaText1 = cmsConfig?.hero_cta_text_1 || "EXPLORE CATALOGUE";
  const ctaLink1 = cmsConfig?.hero_cta_link_1 || "/collections";
  const ctaText2 = cmsConfig?.hero_cta_text_2 || "THE STUDIO";
  const ctaLink2 = cmsConfig?.hero_cta_link_2 || "/studio";

  const bannerImages = cmsConfig?.hero_images && cmsConfig.hero_images.length > 0
    ? cmsConfig.hero_images
    : offlineBannersFallback;

  // 🔥 SLIDESHOW TIMER: Har 7 second me image automatic change hogi
  useEffect(() => {
    if (bannerImages.length <= 1) return;
    
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 7000); // 7 Seconds per slide

    return () => clearInterval(slideInterval);
  }, [bannerImages]);

  return (
    <section 
      style={{ backgroundColor: 'var(--bg-luxury, #EFECE3)' }}
      className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-6 md:px-16 py-12 transition-all duration-500"
    >
      
      {/* 🔥 INJECTING ANIMATIONS DIRECTLY INTO DOM */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes luxuryCoutureRightToLeft {
          0% {
            transform: scale(1.15) translateX(4%) translateY(0px);
          }
          55% {
            transform: scale(1.32) translateX(-4%) translateY(-5px);
          }
          100% {
            transform: scale(1.15) translateX(4%) translateY(0px);
          }
        }
        .animate-active-slide-motion {
          animation: luxuryCoutureRightToLeft 9s ease-in-out infinite !important;
          will-change: transform;
        }
        @keyframes editorialFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-editorial-fade {
          animation: editorialFadeUp 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}} />

      {/* ====================================================================
          CINEMATIC BACKDROP MULTI-IMAGE LAYER (DYNAMIC CAROUSEL)
         ==================================================================== */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none z-0 pointer-events-none">
        {bannerImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={imgUrl} 
              alt={`Preeti Apparel Couture Slide ${idx}`}
              className={`w-full h-full object-cover origin-center ${
                idx === currentSlide ? 'animate-active-slide-motion' : ''
              }`}
            />
          </div>
        ))}
        
        {/* 🔥 FIX: Premium Cinematic Dark Overlay for 100% Text Legibility */}
        <div 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none" 
          style={{
            background: 'linear-gradient(to bottom, rgba(10,8,6,0.6) 0%, rgba(10,8,6,0.2) 40%, rgba(10,8,6,0.7) 100%)'
          }}
        ></div>
      </div>

      {/* ====================================================================
          EDITORIAL CENTER VIEW BOX CONTENT NODES (FULLY DYNAMIC & HIGH CONTRAST)
         ==================================================================== */}
      <div className="max-w-4xl text-center flex flex-col items-center gap-6 z-30 select-text pointer-events-auto mt-12 animate-editorial-fade">
        
        {/* Dynamic Eyebrow Node */}
        <p className="text-[#D4AF37] text-[12px] md:text-[14px] font-semibold tracking-[0.4em] uppercase font-body drop-shadow-md">
          {eyebrow}
        </p>

        {/* Dynamic Master Large Uppercase Display Heading Case Title */}
        <h1 className="text-white text-4xl md:text-7xl lg:text-8xl font-normal tracking-tight font-display uppercase leading-[1.1] md:leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          {titleMain} <br />
          <span className="text-[#D4AF37] italic block font-light tracking-[0.06em] mt-4 lowercase text-3xl md:text-5xl lg:text-6xl drop-shadow-lg">
            {titleHighlight}
          </span>
        </h1>

        {/* Dynamic Subtitle Matrix Text Node */}
        <p className="text-white/95 max-w-2xl text-[14px] md:text-[16px] font-light tracking-wide leading-relaxed font-body mt-2 drop-shadow-md">
          {subtitle}
        </p>

        {/* ====================================================================
            LUXURY FASHION CTA TERMINALS CONTROL CLUSTER (FIXED HOVERS)
           ==================================================================== */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-6 w-full sm:w-auto">
          
          {/* Solid Primary Action Node Button (White to Gold) */}
          <a 
            href={ctaLink1}
            className="w-full sm:w-auto text-[12px] tracking-[0.25em] font-bold uppercase font-body px-10 py-4 border-2 border-white bg-white text-black transition-all duration-400 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-center relative group"
          >
            <span className="relative z-10">{ctaText1}</span>
          </a>

          {/* Outline Editorial Secondary Button (Transparent to White) */}
          <a 
            href={ctaLink2}
            className="w-full sm:w-auto text-[12px] tracking-[0.25em] font-bold uppercase font-body px-10 py-4 border-2 border-white/80 text-white bg-transparent transition-all duration-400 hover:bg-white hover:text-black hover:border-white hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0 text-center relative group"
          >
            <span className="relative z-10 transition-colors duration-300">{ctaText2}</span>
          </a>

        </div>
      </div>

      {/* Editorial Vertical Scrolling Guide Hints Overlay Indicator */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 flex-col items-center gap-3 opacity-60 z-30 pointer-events-none select-none">
        <div className="w-[1px] h-12 bg-white/70 animate-bounce"></div>
        <span className="text-white text-[9px] font-medium tracking-[0.3em] uppercase font-body drop-shadow-md">Scroll</span>
      </div>

    </section>
  );
}