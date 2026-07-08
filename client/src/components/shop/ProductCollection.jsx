import React, { useState, useEffect, useRef, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance'; 
import { Plus, X, ChevronRight, ChevronLeft, ShieldCheck, Truck, Heart } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext'; 
import { CartContext } from '../../context/CartContext';
import { CMSContext } from '../../context/CMSContext'; 
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCollection() {
  // ====================================================================
  // CONSUMING GLOBAL CORE CONTEXT PIPELINES
  // ====================================================================
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { cmsConfig } = useContext(CMSContext);
  const { currentUser } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Interactive Modal Canvas States
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Small');

  const scrollContainerRef = useRef(null);
  const sectionTopRef = useRef(null);
  const navigate = useNavigate();

  // ====================================================================
  // 1. DATA PIPELINE SOURCE HYDRATION (FETCH LIVE FROM BACKEND)
  // ====================================================================
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const res = await axiosInstance.get('/products/shop-list');
        const extractedProducts = Array.isArray(res.data) ? res.data : (res.data.products || []);
        setProducts(extractedProducts);
      } catch (err) {
        console.error("Critical tracking anomaly on product tables: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  // Prevent background parent scroll leakage when overlay glass sheet is active
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  // ====================================================================
  // 🔄 UI VIEWPORT INTERACTION CONTROLLERS
  // ====================================================================
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleOpenDetailView = (product) => {
    setSelectedProduct(product);
    setActiveImgIndex(0);
    if (product.variants && product.variants.length > 0) {
      setSelectedSize(product.variants[0].size || 'Small');
    }
  };

  const handleBuyNow = (product, sizeVariant = selectedSize) => {
    if (product) {
      addToCart(product, sizeVariant, 1);
    }

    if (!currentUser) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  // 🔥 THE FIX: Fetching both Title and Description directly from CMS Admin Config
  const collectionTitleText = cmsConfig?.collection_title || "Sunkissed Stories";
  const collectionDescText = cmsConfig?.collection_description || "Sunkissed Stories is a love letter to golden hours, carefree getaways, and sun-drenched memories. This collection is designed to make you feel like a true summer goddess — effortless, radiant, and unforgettable. This collection is your summer moodboard come to life: think juicy pops of tangerine, breezy pastels, buttery yellows, and ocean-kissed blues.";

  if (loading) {
    return (
      <div className="w-full py-20 text-center flex flex-col items-center justify-center bg-[#f7f4ef]">
        <div className="w-16 h-[2px] bg-[#b5862a] animate-pulse mb-4"></div>
        <p className="text-[0.7rem] tracking-[0.35em] uppercase text-[#b5862a] font-bold">
          Synchronizing Luxury Editorial Matrices...
        </p>
      </div>
    );
  }

  return (
    <div ref={sectionTopRef} className="w-full bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] relative pb-16 overflow-x-hidden">
      
      {/* Structural GPU Layout Keyframes & Styling Hooks */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sheetSlideIn {
          from { opacity: 0; transform: translateY(35px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-sheet-slide {
          animation: sheetSlideIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ====================================================================
          SECTION A: DYNAMIC ROW-TO-GRID TRANSITION ENGINE
         ==================================================================== */}
      <section className="w-full py-10 px-4 md:px-16 relative">
        
        {/* Editorial Section Identity Title Header */}
        <div className="max-w-4xl mx-auto text-center mb-10 flex flex-col items-center gap-2 select-none">
          <span className="block text-[0.68rem] tracking-[0.4em] uppercase text-[#b5862a] font-bold">
            Couture Lineage
          </span>
          {/* 🔥 THE FIX: Rendering Title from CMS Config instead of Product Category */}
          <h2 className="font-['Playfair_Display'] text-[clamp(2rem,3.8vw,3rem)] font-normal tracking-wide text-[#1a1a1a] mt-1 capitalize">
            {collectionTitleText}
          </h2>
          <div className="w-10 h-[1px] bg-[#b5862a]/50 my-2"></div>
          
          <p className="text-neutral-500 font-light text-xs md:text-sm max-w-2xl leading-relaxed tracking-wide font-body">
            {collectionDescText}
          </p>
        </div>

        {/* CONTROLS OVERLAYS: Show slider arrows ONLY when catalog is in row layout */}
        {products.length > 3 && (
          <div className="hidden md:flex justify-end gap-3 max-w-[1500px] mx-auto mb-4 px-4">
            <button 
              onClick={() => handleScroll('left')}
              className="p-3 border border-neutral-300 rounded-full bg-white/40 backdrop-blur-md hover:bg-[#1a1a1a] hover:text-white transition-all shadow-sm"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="p-3 border border-neutral-300 rounded-full bg-white/40 backdrop-blur-md hover:bg-[#1a1a1a] hover:text-white transition-all shadow-sm"
              aria-label="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* 🔥 THE TRANSITION LAYOUT MATRIX LAYER */}
        <div 
          ref={scrollContainerRef}
          className="max-w-[1500px] mx-auto transition-all duration-700 ease-in-out flex overflow-x-auto scroll-smooth gap-6 pb-6 px-4 scrollbar-hide snap-x snap-mandatory"
        >
          {products.slice(0, 6).map((item, index) => {
            return (
              <div 
                key={item.id} 
                className="flex flex-col gap-3 cursor-pointer group relative p-3 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] hover:bg-white/60 hover:border-white/80 transition-all duration-500 ease-out w-[240px] sm:w-[280px] flex-shrink-0 snap-start"
              >
                {/* Tall Portrait Crop Canvas Container Shell */}
                <div className="relative aspect-[4/5] bg-[#e8e4dc] overflow-hidden rounded-lg shadow-sm">
                  
                  {/* Wishlist Toggle Action Pin */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleWishlist(item); 
                    }}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:scale-110 transition-all duration-300 group/heart"
                  >
                    <Heart 
                      size={14} 
                      className={`transition-colors duration-300 ${
                        isInWishlist(item.id) 
                          ? 'fill-[#b5862a] text-[#b5862a]' 
                          : 'text-[#1a1a1a] group-hover/heart:text-[#b5862a]'
                      }`} 
                    />
                  </button>

                  <img 
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} 
                    alt={item.name} 
                    loading="lazy"
                    onClick={() => handleOpenDetailView(item)}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.98]"
                  />
                  
                  {/* Quick Shop Ribbon Bottom Slide Entry */}
                  <div 
                    onClick={() => handleOpenDetailView(item)}
                    className="absolute bottom-0 left-0 w-full bg-[#b5862a]/90 backdrop-blur-xs py-3 text-center text-white text-[0.65rem] tracking-[0.2em] uppercase font-bold transition-all duration-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 z-10"
                  >
                    Quick Shop
                  </div>
                </div>

                {/* Text Metadata Labels */}
                <div className="flex flex-col gap-0.5 text-left font-['DM_Sans'] px-1 pb-1" onClick={() => handleOpenDetailView(item)}>
                  <h4 className="text-[0.8rem] font-medium text-[#1a1a1a]/90 tracking-wide line-clamp-1 group-hover:text-[#b5862a] transition-colors duration-300 capitalize">
                    {item.name}
                  </h4>
                  <p className="text-[0.8rem] font-bold text-[#b5862a] tracking-wider mt-0.5">
                    Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🔥 ROUTE REDIRECTION BUTTON: Navigate directly to full Collections page */}
        {products.length > 6 && (
          <div className="w-full flex justify-center mt-8">
            <button 
              onClick={() => navigate('/collections')}
              className="px-10 py-3 border-2 border-[#b5862a] text-[#b5862a] font-bold text-[0.7rem] tracking-[0.25em] uppercase hover:bg-[#b5862a] hover:text-white transition-all duration-400 rounded-sm bg-transparent shadow-sm"
            >
              Explore Full Collection
            </button>
          </div>
        )}
      </section>

      {/* ====================================================================
          SECTION B: MASTER FIXED GLASS ACORDION OVERLAY MODAL SHEET VIEW
         ==================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 w-full h-full z-50 overflow-y-auto bg-[#1a1a1a]/40 backdrop-blur-md px-4 md:px-16 py-12 flex items-start justify-center transition-all duration-500">
          
          <div className="w-full max-w-[1300px] bg-[#f7f4ef]/95 backdrop-blur-lg text-[#1a1a1a] p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-2xl border border-white/50 relative mt-4 animate-sheet-slide mb-12 select-text">
            
            {/* Modal Internal Navigation Header Controls */}
            <div className="w-full mb-8 flex items-center justify-between border-b border-[#e8e2d8] pb-4 font-['DM_Sans']">
              <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-[#b5862a] uppercase font-bold">
                <span>Collections</span>
                <ChevronRight size={11} className="text-neutral-400" />
                <span className="text-[#1a1a1a] capitalize">{selectedProduct.category || 'Sunkissed Stories'}</span>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="flex items-center gap-1.5 text-[0.7rem] tracking-[0.2em] font-bold uppercase text-[#b5862a] hover:text-[#1a1a1a] transition-colors duration-300"
              >
                <X size={15} /> Close Product
              </button>
            </div>

            {/* Split Screen Execution Grid Matrix Area */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* ── LEFT CELL: VERTICAL THUMBNAIL REEL STRIP LOOP ── */}
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
                        <img src={imgUrl} alt={`Thumbnail state slot ${idx}`} className="w-full h-full object-cover object-top" />
                      </button>
                    ))
                  ) : (
                    <button className="aspect-[3/4] w-full bg-neutral-200 rounded-md"></button>
                  )}
                </div>

                {/* Main Production Frame */}
                <div className="flex-grow aspect-[4/5] bg-white relative overflow-hidden group border border-[#e8e2d8] rounded-lg shadow-sm">
                  <img 
                    src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[activeImgIndex] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-neutral-100">
                    <Plus size={14} className="text-[#1a1a1a]" />
                  </div>
                </div>
              </div>

              {/* ── RIGHT CELL: BOUTIQUE METADATA CONTROLS TERMINALS PANEL ── */}
              <div className="lg:col-span-5 flex flex-col gap-5 text-left w-full font-['DM_Sans']">
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[0.65rem] tracking-[0.3em] font-semibold text-[#b5862a] uppercase">PREETI WEARS / EXCLUSIVE DESIGN</span>
                    <h1 className="text-2xl md:text-3xl font-normal font-['Playfair_Display'] text-[#1a1a1a] uppercase leading-tight">
                      {selectedProduct.name}
                    </h1>
                    <p className="text-xl font-bold text-[#b5862a] mt-1">
                      Rs. {Number(selectedProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => toggleWishlist(selectedProduct)}
                    className="p-2.5 rounded-full bg-white border border-[#e8e2d8] hover:border-[#b5862a] transition-all shadow-sm group/modal-heart"
                  >
                    <Heart 
                      size={15} 
                      className={`transition-colors ${
                        isInWishlist(selectedProduct.id) ? 'fill-[#b5862a] text-[#b5862a]' : 'text-[#1a1a1a] group-hover/modal-heart:text-[#b5862a]'
                      }`} 
                    />
                  </button>
                </div>

                <hr className="border-[#e8e2d8] my-1" />

                {/* Variant Sizes Matrix Selector */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[0.75rem] font-bold tracking-wider uppercase text-neutral-600">
                    <span>Size: <strong className="text-[#b5862a] font-bold tracking-widest ms-1">{selectedSize}</strong></span>
                    <span className="text-neutral-400 underline cursor-pointer hover:text-black transition-colors font-medium">Size Guide</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5 mt-1">
                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      Array.from(new Set(selectedProduct.variants.map(v => v.size))).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase border-2 transition-all min-w-[55px] text-center rounded-md ${
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
                          className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase border-2 transition-all min-w-[55px] text-center rounded-md ${
                            sz === selectedSize ? 'border-[#b5862a] bg-[#b5862a] text-white shadow-sm' : 'border-[#e8e2d8] text-neutral-700 bg-white hover:border-[#b5862a]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Action CTA Pipeline Controls */}
                <div className="flex flex-col gap-2.5 mt-3">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct, selectedSize, 1);
                      setSelectedProduct(null); 
                    }}
                    className="w-full text-[0.75rem] tracking-[0.2em] font-bold uppercase py-3.5 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white rounded-md shadow-sm"
                  >
                    ADD TO CART
                  </button>
                  <button 
                    onClick={() => handleBuyNow(selectedProduct, selectedSize)}
                    className="w-full text-[0.75rem] tracking-[0.2em] font-bold uppercase py-3.5 bg-[#b5862a] text-white transition-all hover:bg-[#9c711f] shadow-md rounded-md"
                  >
                    BUY IT NOW
                  </button>
                </div>

                {/* Long Text Descriptions Block Section */}
                <p className="text-[0.9rem] font-light text-neutral-600 leading-relaxed font-body mt-2">
                  {selectedProduct.description}
                </p>

                {/* Specifications Bullets */}
                {selectedProduct.bullet_points && selectedProduct.bullet_points.length > 0 && (
                  <div className="flex flex-col gap-2 bg-white p-4 rounded-md border border-[#e8e2d8] mt-2 shadow-sm">
                    <p className="text-[0.7rem] font-bold tracking-wider text-[#b5862a] uppercase mb-1">Garment Specifications:</p>
                    <ul className="flex flex-col gap-1.5 text-[0.85rem] font-light text-neutral-600">
                      {selectedProduct.bullet_points.map((pt, idx) => (
                        <li key={idx} className="list-disc list-inside ps-1 leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Measurements Spec Blocks */}
                {selectedProduct.model_info && Object.keys(selectedProduct.model_info).length > 0 && (
                  <div className="text-[0.85rem] font-light text-neutral-500 border-l-2 border-[#b5862a] ps-3 py-1 flex flex-col gap-1 italic mt-2">
                    {selectedProduct.model_info.height && <p>Model height - {selectedProduct.model_info.height}</p>}
                    {selectedProduct.model_info.bust && <p>Model bust - {selectedProduct.model_info.bust}</p>}
                    {selectedProduct.model_info.waist && <p>Model waist - {selectedProduct.model_info.waist}</p>}
                    {selectedProduct.model_info.wears && <p>Model wears - {selectedProduct.model_info.wears}</p>}
                  </div>
                )}

                {/* Secure Guarantee Info Footer */}
                <div className="flex flex-col gap-3 mt-3">
                  <div className="bg-white p-4 border border-[#e8e2d8] flex gap-3 items-start rounded-md shadow-sm">
                    <ShieldCheck size={18} className="text-[#b5862a] mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-[0.7rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">Secure Transaction Guarantee</h5>
                      <p className="text-[0.8rem] font-light text-neutral-500 leading-relaxed">Your payment information is processed securely. We do not store credit card details.</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 border border-[#e8e2d8] flex gap-3 items-start rounded-md shadow-sm">
                    <Truck size={18} className="text-[#b5862a] mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-[0.7rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">Premium Delivery Logistics</h5>
                      <p className="text-[0.8rem] font-light text-neutral-500 leading-relaxed">Rates are approximations. Exact tracking metrics will be provided cleanly at checkout.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}