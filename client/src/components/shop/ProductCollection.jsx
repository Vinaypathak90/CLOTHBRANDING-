import React, { useState, useEffect, useRef, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance'; // Centralized interceptor pipeline 
import { Plus, X, ChevronRight, ShieldCheck, Truck, Heart } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext'; // Context consumed flawlessly
import { CartContext } from '../../context/CartContext';
export default function ProductCollection() {
  // ====================================================================
  // CONSUMING GLOBAL WISHLIST ENGINE HOOKS
  // ====================================================================
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6); // 6 Items per batch loading setup
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Interactive Modal Canvas States
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Small');

  const catalogSectionRef = useRef(null);

  // ====================================================================
  // 1. DATA PIPELINE SOURCE HYDRATION (FETCH LIVE FROM BACKEND)
  // ====================================================================
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const res = await axiosInstance.get('/products/shop-list');
        setProducts(res.data);
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

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  const handleOpenDetailView = (product) => {
    setSelectedProduct(product);
    setActiveImgIndex(0); // Reset position index mapping
    if (product.variants && product.variants.length > 0) {
      setSelectedSize(product.variants[0].size || 'Small');
    }
  };

  if (loading) {
    return (
      <div className="w-full py-40 text-center flex flex-col items-center justify-center bg-[#f7f4ef]">
        <div className="w-16 h-[2px] bg-[#b5862a] animate-pulse mb-4"></div>
        <p className="text-[0.7rem] tracking-[0.35em] uppercase text-[#b5862a] font-bold font-['DM_Sans']">
          Synchronizing Luxury Editorial Matrices...
        </p>
      </div>
    );
  }

  const batchDisplayedProducts = products.slice(0, visibleCount);

  return (
    <div className="w-full bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] relative pb-32">
      
      {/* Structural GPU Layout Keyframes Injections */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sheetSlideIn {
          from { opacity: 0; transform: translateY(35px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-sheet-slide {
          animation: sheetSlideIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}} />

      {/* ====================================================================
          SECTION A: STAGGERED ASYMMETRICAL CATALOG GALLERY GRID (image_9d1187.png Inspired)
         ==================================================================== */}
      <section ref={catalogSectionRef} className="w-full py-16 px-6 md:px-16 bg-[#f7f4ef]">
        
        {/* Editorial Section Identity Title Header */}
        <div className="max-w-3xl mx-auto text-center mb-24 flex flex-col items-center gap-2 select-none">
          <span className="block text-[0.68rem] tracking-[0.4em] uppercase text-[#b5862a] font-bold">
            Couture Lineage
          </span>
          <h2 className="font-['Playfair_Display'] text-[clamp(2rem,3.8vw,3rem)] font-normal tracking-wide text-[#1a1a1a]">
            {products[0]?.category || 'Sunkissed Stories'}
          </h2>
          <div className="w-10 h-[1px] bg-[#b5862a]/50 mt-2"></div>
        </div>

        {/* ASYMMETRICAL EDITORIAL GRID RHYTHM FROM YOUR REFERENCE IMAGE */}
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-24 lg:gap-y-32">
          {batchDisplayedProducts.map((item, index) => {
            // Apply slight vertical offset to every second item to break grid monotony beautifully
            const isStaggeredColumn = index % 3 === 1;
            
            return (
              <div 
                key={item.id} 
                className={`flex flex-col gap-4 cursor-pointer group transition-all duration-500 ease-out relative ${
                  isStaggeredColumn ? 'lg:translate-y-14' : ''
                }`} 
              >
                {/* Tall Portrait Crop Canvas Container Shell (3:4 Ratio Format) */}
                <div className="relative aspect-[3/4] bg-[#e8e4dc] overflow-hidden rounded-xs shadow-[0_4px_25px_rgba(0,0,0,0.02)] transition-shadow duration-500 group-hover:shadow-[0_20px_50px_rgba(181,134,42,0.12)]">
                  
                  {/* 🔥 FIXED BUG 1: toggleWishlist ab product ke full object data structure 'item' ko forward karega */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleWishlist(item); 
                    }}
                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-xs shadow-md hover:scale-110 transition-transform duration-300 group/heart"
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
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-102 brightness-[0.98]"
                  />
                  
                  {/* Flat Bottom Explicit Quick Shop Strip Overlay Match from Image reference */}
                  <div 
                    onClick={() => handleOpenDetailView(item)}
                    className="absolute bottom-0 left-0 w-full bg-[#b5862a] py-3 text-center text-white text-[0.65rem] tracking-[0.3em] uppercase font-semibold transition-all duration-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 z-10"
                  >
                    Quick Shop
                  </div>
                </div>

                {/* Left Aligned Clean Minimal Text Elements Labels */}
                <div className="flex flex-col gap-0.5 text-left font-['DM_Sans'] ps-1 mt-1" onClick={() => handleOpenDetailView(item)}>
                  <h4 className="text-[0.88rem] font-light text-[#1a1a1a]/80 tracking-wide line-clamp-2 group-hover:text-[#b5862a] transition-colors duration-300 capitalize leading-relaxed">
                    {item.name}
                  </h4>
                  <p className="text-[0.85rem] font-bold text-[#b5862a] tracking-wider mt-0.5">
                    Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Batch Allocation Terminal Triggers */}
        {products.length > visibleCount && (
          <div className="w-full flex justify-center mt-32 lg:mt-40">
            <button 
              onClick={handleLoadMore}
              className="px-12 py-3.5 border-2 border-[#b5862a] text-[#b5862a] font-semibold text-[0.8rem] tracking-[0.25em] uppercase hover:bg-[#b5862a] hover:text-white transition-all duration-300 rounded-sm bg-transparent"
            >
              Load More Curations
            </button>
          </div>
        )}
      </section>

      {/* ====================================================================
          SECTION B: MASTER FIXED SHEET ACCORDION WORKSPACE OVERLAY VIEW
         ==================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 w-full h-full z-50 overflow-y-auto bg-[#1a1a1a]/50 backdrop-blur-3xl px-4 md:px-16 py-12 flex items-start justify-center transition-all duration-500">
          
          <div className="w-full max-w-[1400px] bg-[#f7f4ef] text-[#1a1a1a] p-6 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.2)] rounded-lg border border-[#e8e2d8] relative mt-6 animate-sheet-slide mb-12 select-text">
            
            {/* Modal Internal Navigation Header Controls */}
            <div className="w-full mb-10 flex items-center justify-between border-b border-[#e8e2d8] pb-5 font-['DM_Sans']">
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
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* ── LEFT CELL: VERTICAL THUMBNAIL REEL STRIP LOOP (3+ IMAGE VIEWINGS SUPPORTED) ── */}
              <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-5 w-full">
                
                {/* Dynamic Strip Map Layout Rendering precisely every array asset directly from DB */}
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

                {/* Main Production Frame Supporting deep slow scale hover transitions matrix */}
                <div className="flex-grow aspect-[3/4] bg-white relative overflow-hidden group border border-[#e8e2d8] rounded-md shadow-sm">
                  <img 
                    src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[activeImgIndex] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1) group-hover:scale-104 cursor-zoom-in"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs w-9 h-9 rounded-full flex items-center justify-center shadow-xs border border-neutral-100">
                    <Plus size={15} className="text-[#1a1a1a]" />
                  </div>
                </div>
              </div>

              {/* ── RIGHT CELL: BOUTIQUE METADATA CONTROLS TERMINALS PANEL ── */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left w-full font-['DM_Sans']">
                
                {/* Product Headers + Split Sheet Wishlist Button Sync */}
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
                  
                  {/* 🔥 FIXED BUG 2: Context core call updates using the complete current state node 'selectedProduct' */}
                  <button
                    onClick={() => toggleWishlist(selectedProduct)}
                    className="p-3 rounded-full bg-white border border-[#e8e2d8] hover:border-[#b5862a] transition-all duration-300 shadow-xs group/modal-heart"
                  >
                    <Heart 
                      size={16} 
                      className={`transition-colors duration-300 ${
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
                          className={`px-4 py-2.5 text-[11px] font-bold tracking-widest uppercase border-2 transition-all duration-300 min-w-[58px] text-center rounded-md ${
                            sz === selectedSize ? 'border-[#b5862a] bg-[#b5862a] text-white shadow-sm' : 'border-[#e8e2d8] text-neutral-700 bg-white hover:border-[#b5862a]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))
                    ) : (
                      ['XS', 'Small', 'Medium', 'Large', 'XL', '2XL', '3XL'].map((sz) => (
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

                {/* Action CTA Pipeline Controls */}
                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct, selectedSize, 1);
                      setSelectedProduct(null); // Amazon Strategy: Close modal view smoothly upon addition success
                    }}
                    className="w-full text-[0.75rem] tracking-[0.25em] font-bold uppercase py-4 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] transition-all duration-400 hover:bg-[#1a1a1a] hover:text-white rounded-md shadow-xs"
                  >
                    ADD TO CART
                  </button>
                  <button className="w-full text-[0.75rem] tracking-[0.25em] font-bold uppercase py-4 bg-[#b5862a] text-white transition-all duration-400 hover:bg-[#9c711f] shadow-md rounded-md">
                    BUY IT NOW
                  </button>
                </div>

                {/* Long Text Descriptions Block Section */}
                <p className="text-[0.95rem] font-light text-neutral-600 leading-relaxed font-body">
                  {selectedProduct.description}
                </p>

                {/* Specifications Bullets Array Injections */}
                {selectedProduct.bullet_points && selectedProduct.bullet_points.length > 0 && (
                  <div className="flex flex-col gap-2 bg-white p-5 rounded-md border border-[#e8e2d8] mt-2 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                    <p className="text-[0.75rem] font-bold tracking-wider text-[#b5862a] uppercase mb-1">Garment Specifications:</p>
                    <ul className="flex flex-col gap-2 text-[0.9rem] font-light text-neutral-600">
                      {selectedProduct.bullet_points.map((pt, idx) => (
                        <li key={idx} className="list-disc list-inside ps-1 leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Measurements Spec Blocks Grids */}
                {selectedProduct.model_info && Object.keys(selectedProduct.model_info).length > 0 && (
                  <div className="text-[0.9rem] font-light text-neutral-500 border-l-2 border-[#b5862a] ps-4 py-1 flex flex-col gap-1 italic mt-2">
                    {selectedProduct.model_info.height && <p>Model height - {selectedProduct.model_info.height}</p>}
                    {selectedProduct.model_info.bust && <p>Model bust - {selectedProduct.model_info.bust}</p>}
                    {selectedProduct.model_info.breast && <p>Model bust - {selectedProduct.model_info.breast}</p>}
                    {selectedProduct.model_info.waist && <p>Model waist - {selectedProduct.model_info.waist}</p>}
                    {selectedProduct.model_info.wears && <p>Model wears - {selectedProduct.model_info.wears}</p>}
                  </div>
                )}

                {/* Safe Option Information Panels Accoridons */}
                <div className="flex flex-col gap-3 mt-4">
                  <div className="bg-white p-5 border border-[#e8e2d8] flex gap-3.5 items-start rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                    <ShieldCheck size={19} className="text-[#b5862a] mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-[0.75rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">Secure Transaction Guarantee</h5>
                      <p className="text-[0.85rem] font-light text-neutral-500 leading-relaxed">Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 border border-[#e8e2d8] flex gap-3.5 items-start rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
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

    </div>
  );
}