import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function CategoryShowcase() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // High-End Editorial Fallback Images (Curated for Luxury Aesthetic)
  const fallbackImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=90', // Golden Hour Hero
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=90', // Editorial Landscape
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=90',  // Edgy Suiting
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=90',  // Classic Elegance
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=90'   // Dark Couture
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/categories/list');
        if (res.data && res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories grid:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug}`);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-16 bg-[#F9F7F2]">
        <RefreshCw size={28} className="animate-spin text-[#b5862a]" />
      </div>
    );
  }

  if (!categories || categories.length === 0) return null; 

  // Function to assign dynamic asymmetrical grid sizes (The Premium Vogue Layout)
  const getEditorialGridClass = (index) => {
    // Top Left Hero (Massive Block - Perfect Proportion)
    if (index === 0) return "md:col-span-2 lg:col-span-2 md:row-span-2 min-h-[380px] md:min-h-[500px]"; 
    // Top Right Landscape (Wide Block)
    if (index === 1) return "md:col-span-2 lg:col-span-2 md:row-span-1 min-h-[250px] md:min-h-[240px]"; 
    // Bottom Right Squares
    if (index === 2) return "md:col-span-1 lg:col-span-1 md:row-span-1 min-h-[250px] md:min-h-[240px]"; 
    if (index === 3) return "md:col-span-1 lg:col-span-1 md:row-span-1 min-h-[250px] md:min-h-[240px]"; 
    
    // Auto-flow for any extra categories
    return "md:col-span-1 lg:col-span-1 md:row-span-1 min-h-[250px] md:min-h-[240px]";
  };

  return (
    // 🔥 SEXY BACKGROUND: Soft, expensive multi-tonal gradient shift
    <section className="w-full pt-10 pb-24 px-4 md:px-10 lg:px-16 bg-gradient-to-b from-[#F9F7F2] to-[#EAE4D8]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Minimalist High-Fashion Header */}
        <div className="text-center mb-12 select-none flex flex-col items-center">
          <span className="text-[0.65rem] tracking-[0.6em] uppercase text-[#b5862a] font-bold block mb-4 opacity-90">
            The Masterpieces
          </span>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-[4rem] font-normal text-[#161412] tracking-wide leading-tight">
            Shop By Silhouette
          </h2>
          <div className="w-12 h-[2px] bg-[#b5862a]/60 mt-6 rounded-full"></div>
        </div>

        {/* 🔥 LUXURY EDITORIAL MATRIX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-4 md:gap-5">
          {categories.map((cat, index) => {
            const gridClass = getEditorialGridClass(index);
            const imgSource = (cat.image_url && cat.image_url.trim() !== '') 
              ? cat.image_url 
              : fallbackImages[index % fallbackImages.length];

            return (
              <div 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                // Shadow upgraded for a floating, expensive look
                className={`relative group overflow-hidden rounded-xl cursor-pointer bg-[#e8e4dc] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(181,134,42,0.12)] transition-shadow duration-700 ease-out ${gridClass}`}
              >
                {/* Buttery Smooth Super-Slow Pan & Zoom Image */}
                <img 
                  src={imgSource} 
                  alt={cat.name} 
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-[2000ms] cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-[1.08] group-hover:rotate-[0.5deg]"
                />
                
                {/* 🔥 DEEP WARM OVERLAY: Uses a warmer dark tone (#0a0806) instead of pure black for a richer, sexier vibe */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806]/95 via-[#0a0806]/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-700 pointer-events-none"></div>

                {/* Sleek Cinematic Text Injection */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end items-start pointer-events-none">
                  
                  {/* Category Name */}
                  <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl lg:text-[2.2rem] text-white font-medium capitalize tracking-wider drop-shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                    {cat.name}
                  </h3>
                  
                  {/* Animated 'Explore Collection' Action Line */}
                  <div className="overflow-hidden mt-3 md:mt-4">
                    <p className="flex items-center gap-2 text-[#d4af37] text-[0.65rem] md:text-[0.7rem] tracking-[0.3em] font-bold uppercase opacity-0 transform translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100 ease-out">
                      Explore Collection <ArrowRight size={15} className="transform -translate-x-3 group-hover:translate-x-0 transition-transform duration-700 delay-200" />
                    </p>
                  </div>

                  {/* Extremely Thin Aesthetic Glow Border Line */}
                  <div className="w-0 h-[1px] bg-white/40 absolute bottom-6 md:bottom-8 left-6 md:left-8 transition-all duration-1000 ease-out group-hover:w-[calc(100%-3rem)] md:group-hover:w-[calc(100%-4rem)] opacity-0 group-hover:opacity-100"></div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}