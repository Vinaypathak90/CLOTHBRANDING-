import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Search, SlidersHorizontal, Heart, ShoppingBag, ArrowUpDown, X, Plus, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { CMSContext } from '../../context/CMSContext';

export default function CollectionsPage() {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { cmsConfig } = useContext(CMSContext);

  // Core Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [priceRange, setPriceRange] = useState(100000); 
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 🔥 ORIGINAL MODAL STATES REGISTERED UNTOUCHED
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Small');

  // ====================================================================
  // 🔄 HYDRATION PIPELINE WITH ISOLATED ERROR BOUNDARIES
  // ====================================================================
  useEffect(() => {
    const hydrateCollectionsHub = async () => {
      setLoading(true);
      let fetchedProducts = [];
      let fetchedCategories = [];

      try {
        const prodRes = await axiosInstance.get('/products/shop-list');
        fetchedProducts = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []);
      } catch (err) {
        console.error("❌ [PRODUCTS FETCH FAULT]:", err);
      }

      try {
        const catRes = await axiosInstance.get('/categories/list');
        fetchedCategories = catRes.data?.categories || (Array.isArray(catRes.data) ? catRes.data : []);
      } catch (err) {
        console.warn("⚠️ [CATEGORIES FALLBACK LAYER ACTIVE]:", err);
        if (fetchedProducts.length > 0) {
          const uniqueCategoryNames = [...new Set(fetchedProducts.map(p => p.categories?.name || p.category).filter(Boolean))];
          fetchedCategories = uniqueCategoryNames.map(name => ({ id: name, name: name }));
        }
      }

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);

      if (fetchedProducts.length > 0) {
        const maxProductPrice = Math.max(...fetchedProducts.map(p => Number(p.price) || 0));
        setPriceRange(maxProductPrice);
      }
      setLoading(false);
    };

    hydrateCollectionsHub();
  }, []);

  // Prevent background parent scroll leakage when overlay sheet is active
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  const handleOpenDetailView = (product) => {
    setSelectedProduct(product);
    setActiveImgIndex(0);
    if (product.variants && product.variants.length > 0) {
      setSelectedSize(product.variants[0].size || 'Small');
    }
  };

  // ====================================================================
  // 📄 CMS METADATA STRINGS
  // ====================================================================
  const labels = {
    title: cmsConfig?.collections_hub_title || "The Atelier Catalog",
    subtitle: cmsConfig?.collections_hub_subtitle || "Browse through our bespoke couture layouts and high-fashion silhouettes.",
    searchPlaceholder: cmsConfig?.search_placeholder_text || "Search style blueprints (e.g., Kurtis, Velvet, Mini Dress)...",
    filterHeading: cmsConfig?.filter_heading_label || "Refine Silhouette Matrix",
    priceLabel: cmsConfig?.price_slider_label || "Max Price Cap:",
    sortLabel: cmsConfig?.sort_dropdown_label || "Arrange By:",
    emptyStateText: cmsConfig?.collections_empty_msg || "No couture garments match your current active filtering criteria."
  };

  const uniqueTagsList = ['all', ...new Set(products.flatMap(p => p.tags || []))];

  // ====================================================================
  // 🖨️ FILTER COMPUTATION MATRIX
  // ====================================================================
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const prodCatName = product.categories?.name || product.category || '';
    const matchesCategory = 
      selectedCategory === 'all' || 
      String(product.category_id) === String(selectedCategory) ||
      String(prodCatName).toLowerCase() === String(selectedCategory).toLowerCase();

    const matchesTag = selectedTag === 'all' || (product.tags && product.tags.includes(selectedTag));
    const matchesPrice = Number(product.price) <= priceRange;

    return matchesSearch && matchesCategory && matchesTag && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f7f4ef] flex flex-col items-center justify-center">
        <div className="w-16 h-[1px] bg-[#b5862a] animate-pulse mb-4"></div>
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-[#b5862a] font-bold">Assembling Curation Maps...</p>
      </div>
    );
  }

  return (
    // 🔥 FIX 1: Reduced pt-28 to pt-12 md:pt-16 to pull content closer to navbar
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] pt-12 md:pt-16 pb-32 px-4 sm:px-6 lg:px-8">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sheetSlideIn {
          from { opacity: 0; transform: translateY(35px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-sheet-slide {
          animation: sheetSlideIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}} />

      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER COLLECTION BANNER BLOCK */}
        {/* 🔥 FIX 2: Reduced mb-16 to mb-8 for tighter spacing */}
        <div className="text-center mb-8 select-none mt-6">
          <span className="text-[0.65rem] tracking-[0.4em] uppercase text-[#b5862a] font-bold block mb-2">Preeti Haute Couture</span>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl font-normal tracking-wide">{labels.title}</h1>
          <p className="text-neutral-500 font-light text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">{labels.subtitle}</p>
          <div className="w-12 h-[1px] bg-[#b5862a]/40 mx-auto mt-6"></div>
        </div>

        {/* 🔍 THE BACKEND CONTROLLED SEARCH BAR */}
        {/* 🔥 FIX 3: Reduced mb-16 to mb-10 for tighter spacing above filters/grid */}
        <div className="max-w-3xl mx-auto mb-10 relative shadow-sm">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full bg-white border border-[#e8e2d8] rounded-full py-4 pl-14 pr-6 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-all text-[#1a1a1a]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
              <X size={16} />
            </button>
          )}
        </div>

        {/* WORKSPACE DIVIDER HOOK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* SIDEBAR FILTER CRADLE (DESKTOP) */}
          {/* 🔥 FIX 4: Adjusted sticky top-28 to top-20 so sidebar stays at a proper height when scrolling */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 bg-white border border-[#e8e2d8] p-6 rounded-xl sticky top-20 shadow-sm text-left">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 font-bold text-xs tracking-widest uppercase text-[#b5862a]">
              <SlidersHorizontal size={14} /> {labels.filterHeading}
            </div>

            {/* Collection Nodes */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-neutral-400 mb-1">Collections Cluster</span>
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`text-left text-sm py-1.5 px-3 rounded transition-all capitalize ${selectedCategory === 'all' ? 'bg-[#1a1a1a] text-white font-bold' : 'text-neutral-600 hover:bg-neutral-50'}`}
              >
                All Garments
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id || cat.name)}
                  className={`text-left text-sm py-1.5 px-3 rounded transition-all capitalize ${String(selectedCategory) === String(cat.id || cat.name) ? 'bg-[#1a1a1a] text-white font-bold' : 'text-neutral-600 hover:bg-neutral-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Fabric Tags Array (Kurtis, Maxi types) */}
            <div className="flex flex-col gap-2.5 border-t border-neutral-100 pt-5">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-neutral-400 mb-1">Garment Type Cuttings</span>
              <div className="flex flex-wrap gap-2">
                {uniqueTagsList.map((tg) => (
                  <button
                    key={tg}
                    onClick={() => setSelectedTag(tg)}
                    className={`px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase rounded-md border transition-all ${
                      selectedTag === tg ? 'bg-[#b5862a] text-white border-[#b5862a] font-bold' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    {tg === 'all' ? 'All Types' : tg}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Metric Slider */}
            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5">
              <div className="flex justify-between items-center text-[0.7rem] font-bold uppercase tracking-wider text-neutral-400">
                <span>{labels.priceLabel}</span>
                <span className="text-[#b5862a] font-bold text-xs">Rs. {priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range"
                min="0"
                max={products.length > 0 ? Math.max(...products.map(p => p.price)) : 100000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#b5862a] cursor-pointer h-1 bg-neutral-200 rounded-lg appearance-none"
              />
            </div>

            {/* Sequence Sorting */}
            <div className="flex flex-col gap-2.5 border-t border-neutral-100 pt-5">
              <div className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                <ArrowUpDown size={12} /> {labels.sortLabel}
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-xs rounded-md text-neutral-700"
              >
                <option value="newest">New Arrivals (Fresh Release)</option>
                <option value="price-low">Value Matrix: Low to High</option>
                <option value="price-high">Value Matrix: High to Low</option>
              </select>
            </div>
          </div>

          {/* ── THE GORGEOUS FROSTED GLASS EDITORIAL PRODUCTS GRID ── */}
          <div className="w-full lg:col-span-9">
            
            {/* Mobile Filter Ribbon */}
            <div className="lg:hidden w-full flex justify-between items-center bg-white p-4 border border-[#e8e2d8] rounded-lg mb-6">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#b5862a]"
              >
                <SlidersHorizontal size={14} /> Open Filters
              </button>
              <span className="text-xs text-neutral-400 font-light">Showing {filteredProducts.length} Results</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="w-full bg-white/40 border border-dashed border-neutral-300 rounded-2xl py-28 px-4 text-center">
                <p className="text-sm text-neutral-400 font-light tracking-wide">{labels.emptyStateText}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 w-full">
                {filteredProducts.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleOpenDetailView(item)}
                    className="flex flex-col gap-4 cursor-pointer group relative p-3 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] hover:bg-white/60 hover:border-white/80 transition-all duration-500 ease-out"
                  >
                    {/* Tall Portrait Crop Image Frame Layout */}
                    <div className="relative aspect-[3/4] bg-[#e8e4dc] overflow-hidden rounded-lg shadow-sm">
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(item);
                        }}
                        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:scale-110 transition-all duration-300"
                      >
                        <Heart size={14} className={isInWishlist(item.id) ? 'fill-[#b5862a] text-[#b5862a]' : 'text-[#1a1a1a]'} />
                      </button>

                      <img 
                        src={item.images && item.images.length > 0 ? item.images[0] : 'placeholder'} 
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.99]"
                      />

                      <div 
                        className="absolute bottom-0 left-0 w-full bg-[#b5862a]/90 backdrop-blur-xs py-3.5 text-center text-white text-[0.65rem] tracking-[0.3em] uppercase font-bold transition-all duration-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 z-10"
                      >
                        Quick Shop
                      </div>
                    </div>

                    {/* Metadata Card Footer Labels */}
                    <div className="flex flex-col gap-0.5 text-left px-1 pb-1">
                      <h4 className="text-[0.88rem] font-medium text-[#1a1a1a]/90 tracking-wide line-clamp-1 group-hover:text-[#b5862a] transition-colors duration-300 capitalize">
                        {item.name}
                      </h4>
                      <p className="text-[0.85rem] font-bold text-[#b5862a] tracking-wider mt-0.5">
                        Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          🔒 FIXED: RE-INJECTED COMPLETE GORGEOUS DETAILED QUICK VIEW popup sheet
         ==================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 w-full h-full z-50 overflow-y-auto bg-[#1a1a1a]/40 backdrop-blur-xl px-4 md:px-16 py-12 flex items-start justify-center transition-all duration-500">
          <div className="w-full max-w-[1400px] bg-[#f7f4ef]/95 backdrop-blur-lg text-[#1a1a1a] p-6 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-2xl border border-white/50 relative mt-6 animate-sheet-slide mb-12 select-text">
            
            {/* Modal Internal Controls Header */}
            <div className="w-full mb-10 flex items-center justify-between border-b border-[#e8e2d8] pb-5 font-['DM_Sans']">
              <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-[#b5862a] uppercase font-bold">
                <span>Collections</span>
                <ChevronRight size={11} className="text-neutral-400" />
                <span className="text-[#1a1a1a] capitalize">{selectedProduct.categories?.name || selectedProduct.category || 'Sunkissed Stories'}</span>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="flex items-center gap-1.5 text-[0.7rem] tracking-[0.2em] font-bold uppercase text-[#b5862a] hover:text-[#1a1a1a] transition-colors duration-300"
              >
                <X size={15} /> Close Product
              </button>
            </div>

            {/* Split Modal Screen System layout */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* IMAGE SELECTION BLOCK LOOP */}
              <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-5 w-full">
                <div className="flex md:flex-col gap-3 flex-wrap md:w-[85px] flex-shrink-0">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    selectedProduct.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`aspect-[3/4] w-[65px] md:w-full bg-[#e8e4dc] overflow-hidden border-2 transition-all duration-300 rounded-md ${
                          idx === activeImgIndex ? 'border-[#b5862a] scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Thumb" className="w-full h-full object-cover object-top" />
                      </button>
                    ))
                  ) : (
                    <button className="aspect-[3/4] w-full bg-neutral-200 rounded-md"></button>
                  )}
                </div>

                <div className="flex-grow aspect-[3/4] bg-white relative overflow-hidden group border border-[#e8e2d8] rounded-md shadow-sm">
                  <img 
                    src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[activeImgIndex] : 'placeholder'} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1) group-hover:scale-104"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs w-9 h-9 rounded-full flex items-center justify-center shadow-xs border border-neutral-100">
                    <Plus size={15} className="text-[#1a1a1a]" />
                  </div>
                </div>
              </div>

              {/* BOUTIQUE DESCRIPTIVE PANEL CHANNELS */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left w-full font-['DM_Sans']">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[0.68rem] tracking-[0.3em] font-semibold text-[#b5862a] uppercase">PREETI WEARS / EXCLUSIVE DESIGN</span>
                    <h1 className="text-2xl md:text-3xl font-normal font-['Playfair_Display'] tracking-wide text-[#1a1a1a] uppercase leading-tight">
                      {selectedProduct.name}
                    </h1>
                    <p className="text-xl font-bold text-[#b5862a] mt-1">
                      Rs. {Number(selectedProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => toggleWishlist(selectedProduct)}
                    className="p-3 rounded-full bg-white border border-[#e8e2d8] hover:border-[#b5862a] transition-all duration-300 shadow-xs group/modal-heart"
                  >
                    <Heart size={16} className={isInWishlist(selectedProduct.id) ? 'fill-[#b5862a] text-[#b5862a]' : 'text-[#1a1a1a]'} />
                  </button>
                </div>

                <hr className="border-[#e8e2d8] my-1" />

                {/* Sizing Array Matrices */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[0.75rem] font-bold tracking-wider uppercase text-neutral-600">
                    <span>Size: <strong className="text-[#b5862a] font-bold tracking-widest ms-1">{selectedSize}</strong></span>
                    <span className="text-neutral-400 underline cursor-pointer hover:text-black font-medium">Size Guide</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5 mt-1">
                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      Array.from(new Set(selectedProduct.variants.map(v => v.size))).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2.5 text-[11px] font-bold tracking-widest uppercase border-2 transition-all duration-300 min-w-[58px] text-center rounded-md ${
                            sz === selectedSize ? 'border-[#b5862a] bg-[#b5862a] text-white shadow-sm' : 'border-[#e8e2d8] text-neutral-700 bg-white hover:border-[#b5862a]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))
                    ) : (
                      ['XS', 'Small', 'Medium', 'Large', 'XL'].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2.5 text-[11px] font-bold tracking-widest uppercase border-2 transition-all duration-300 min-w-[58px] text-center rounded-md ${
                            sz === selectedSize ? 'border-[#b5862a] bg-[#b5862a] text-white shadow-sm' : 'border-[#e8e2d8] text-neutral-700 bg-white hover:border-[#b5862a]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Action CTAs Buttons */}
                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct, selectedSize, 1);
                      setSelectedProduct(null); 
                    }}
                    className="w-full text-[0.75rem] tracking-[0.25em] font-bold uppercase py-4 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] transition-all duration-400 hover:bg-[#1a1a1a] hover:text-white rounded-md shadow-xs"
                  >
                    ADD TO CART
                  </button>
                  <button className="w-full text-[0.75rem] tracking-[0.25em] font-bold uppercase py-4 bg-[#b5862a] text-white transition-all duration-400 hover:bg-[#9c711f] shadow-md rounded-md">
                    BUY IT NOW
                  </button>
                </div>

                <p className="text-[0.95rem] font-light text-neutral-600 leading-relaxed font-body">
                  {selectedProduct.description}
                </p>

                {/* Technical Bullet Specs */}
                {selectedProduct.bullet_points && selectedProduct.bullet_points.length > 0 && (
                  <div className="flex flex-col gap-2 bg-white p-5 rounded-md border border-[#e8e2d8] mt-2 shadow-xs">
                    <p className="text-[0.75rem] font-bold tracking-wider text-[#b5862a] uppercase mb-1">Garment Specifications:</p>
                    <ul className="flex flex-col gap-2 text-[0.9rem] font-light text-neutral-600">
                      {selectedProduct.bullet_points.map((pt, idx) => (
                        <li key={idx} className="list-disc list-inside ps-1 leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Model Dimensions Trackers */}
                {selectedProduct.model_info && Object.keys(selectedProduct.model_info).length > 0 && (
                  <div className="text-[0.9rem] font-light text-neutral-500 border-l-2 border-[#b5862a] ps-4 py-1 flex flex-col gap-1 italic mt-2">
                    {selectedProduct.model_info.height && <p>Model height - {selectedProduct.model_info.height}</p>}
                    {selectedProduct.model_info.bust && <p>Model bust - {selectedProduct.model_info.bust}</p>}
                    {selectedProduct.model_info.waist && <p>Model waist - {selectedProduct.model_info.waist}</p>}
                    {selectedProduct.model_info.wears && <p>Model wears - {selectedProduct.model_info.wears}</p>}
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-4">
                  <div className="bg-white p-5 border border-[#e8e2d8] flex gap-3.5 items-start rounded-md shadow-xs">
                    <ShieldCheck size={19} className="text-[#b5862a] mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-[0.75rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">Secure Transaction Guarantee</h5>
                      <p className="text-[0.85rem] font-light text-neutral-500 leading-relaxed">Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 border border-[#e8e2d8] flex gap-3.5 items-start rounded-md shadow-xs">
                    <Truck size={19} className="text-[#b5862a] mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-[0.75rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">Premium Delivery Logistics</h5>
                      <p className="text-[0.85rem] font-light text-neutral-500 leading-relaxed">Rates are approximations. Exact tracking metrics will be provided cleanly at checkout windows.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 📱 MOBILE MODAL FILTER SLIDEOVER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-[85%] max-w-sm h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-left">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-bold text-xs tracking-widest uppercase text-[#b5862a]">Active Filter Panels</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-neutral-400 hover:text-black">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral-400">Collections</span>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat.id || cat.name); setShowMobileFilters(false); }} className={`text-left text-xs py-2 px-3 rounded ${selectedCategory === (cat.id || cat.name) ? 'bg-[#1a1a1a] text-white font-bold' : 'text-neutral-600'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowMobileFilters(false)} className="w-full bg-[#1a1a1a] text-white py-3 text-xs font-bold tracking-widest uppercase mt-8 rounded">
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}