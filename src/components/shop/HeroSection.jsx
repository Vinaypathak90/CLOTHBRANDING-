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
        /* Yeh class sirf active image par chalegi jisse animation hamesha fresh start ho */
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
              className={`w-full h-full object-cover origin-center brightness-[0.95] ${
                idx === currentSlide ? 'animate-active-slide-motion' : ''
              }`}
            />
          </div>
        ))}
        
        {/* Scrim Overlay Mesh to preserve crisp typography contrast boundaries */}
        <div 
          className="absolute inset-0 w-full h-full z-20 mix-blend-multiply" 
          style={{
            background: 'linear-gradient(to bottom, rgba(239,236,227,0.4) 0%, rgba(239,236,227,0.75) 50%, rgba(239,236,227,0.4) 100%)'
          }}
        ></div>
      </div>

      {/* ====================================================================
          EDITORIAL CENTER VIEW BOX CONTENT NODES (FULLY DYNAMIC)
         ==================================================================== */}
      <div className="max-w-4xl text-center flex flex-col items-center gap-6 z-30 select-text pointer-events-auto mt-12 animate-editorial-fade">
        
        {/* Dynamic Eyebrow Node */}
        <p 
          style={{ color: 'var(--primary-accent, #C9A84C)' }}
          className="text-[12px] md:text-[14px] font-semibold tracking-[0.4em] uppercase font-body"
        >
          {eyebrow}
        </p>

        {/* Dynamic Master Large Uppercase Display Heading Case Title */}
        <h1 
          style={{ color: 'var(--text-luxury, #1A1A1A)' }}
          className="text-4xl md:text-7xl lg:text-8xl font-normal tracking-tight font-display uppercase leading-[1.1] md:leading-none"
        >
          {titleMain} <br />
          <span 
            style={{ color: 'var(--primary-accent, #C9A84C)' }}
            className="italic block font-light tracking-[0.06em] mt-4 lowercase text-3xl md:text-5xl lg:text-6xl"
          >
            {titleHighlight}
          </span>
        </h1>

        {/* Dynamic Subtitle Matrix Text Node */}
        <p 
          style={{ color: 'var(--text-luxury, #1A1A1A)' }}
          className="max-w-2xl text-[14px] md:text-[16px] font-light tracking-wide leading-relaxed font-body opacity-85 mt-2"
        >
          {subtitle}
        </p>

        {/* ====================================================================
            LUXURY FASHION CTA TERMINALS CONTROL CLUSTER
           ==================================================================== */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-6 w-full sm:w-auto">
          
          {/* Solid Primary Action Node Button */}
          <a 
            href={ctaLink1}
            style={{ 
              backgroundColor: 'var(--text-luxury, #1A1A1A)',
              color: 'var(--bg-luxury, #EFECE3)',
              borderColor: 'var(--text-luxury, #1A1A1A)'
            }}
            className="w-full sm:w-auto text-[12px] tracking-[0.25em] font-semibold uppercase font-body px-10 py-4 border-2 transition-all duration-400 hover:shadow-xl hover:shadow-neutral-900/20 hover:-translate-y-0.5 active:translate-y-0 relative group overflow-hidden text-center"
          >
            <span className="relative z-10">{ctaText1}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-accent,#C9A84C)] to-[#E5C158] opacity-0 group-hover:opacity-15 transition-opacity duration-300 z-0"></div>
          </a>

          {/* Outline Editorial Secondary Button */}
          <a 
            href={ctaLink2}
            style={{ 
              borderColor: 'var(--text-luxury, #1A1A1A)',
              color: 'var(--text-luxury, #1A1A1A)'
            }}
            className="w-full sm:w-auto text-[12px] tracking-[0.25em] font-semibold uppercase font-body px-10 py-4 border-2 bg-transparent transition-all duration-400 hover:bg-[var(--text-luxury,#1A1A1A)] hover:text-[var(--bg-luxury,#EFECE3)] hover:shadow-xl hover:shadow-neutral-900/10 hover:-translate-y-0.5 active:translate-y-0 text-center relative group"
          >
            <span className="relative z-10 transition-colors duration-300">{ctaText2}</span>
          </a>

        </div>
      </div>

      {/* Editorial Vertical Scrolling Guide Hints Overlay Indicator */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 flex-col items-center gap-3 opacity-40 z-30 pointer-events-none select-none">
        <div className="w-[1px] h-12 bg-neutral-900/60 animate-bounce"></div>
        <span style={{ color: 'var(--text-luxury,#1A1A1A)' }} className="text-[9px] font-light tracking-[0.3em] uppercase font-body">Scroll</span>
      </div>

    </section>
  );
}