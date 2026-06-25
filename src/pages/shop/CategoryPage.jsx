import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { RefreshCw, ArrowLeft, Plus, X, ChevronRight, ShieldCheck, Truck, Heart } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext'; 
import { CartContext } from '../../context/CartContext';

export default function CategoryPage() {
  const { slug } = useParams(); // URL se category ka naam nikalna (e.g., 'sunkissed-stories')
  const navigate = useNavigate();
  
  // Contexts
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal States (Same as Home Page for consistency)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Small');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 🔥 Hitting the backend with the exact category slug filter
        const res = await axiosInstance.get('/products/shop-list', {
          params: { category: slug }
        });

        if (res.data && res.data.success) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch category products:", err);
        setError('Failed to load this collection. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryProducts();
    }
  }, [slug]);

  // Prevent background parent scroll leakage when overlay glass sheet is active
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

  // Format slug for header fallback (e.g., 'sunkissed-stories' -> 'Sunkissed Stories')
  const formattedCategoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  // Use DB Category Name if available, otherwise fallback to formatted slug
  const pageTitle = products[0]?.categories?.name || formattedCategoryName;

  return (
    <div className="min-h-screen bg-[#f7f4ef] pt-28 pb-24 px-4 md:px-12 lg:px-20 font-['DM_Sans'] overflow-x-hidden">
      
      {/* Structural GPU Layout Keyframes for Modal */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sheetSlideIn {
          from { opacity: 0; transform: translateY(35px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-sheet-slide {
          animation: sheetSlideIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}} />

      <div className="max-w-[1400px] mx-auto">
        
        {/* ── HEADER & NAVIGATION ── */}
        <div className="mb-12 flex flex-col items-center relative">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute left-0 top-0 flex items-center gap-2 text-neutral-500 hover:text-[#b5862a] transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="text-center mt-8 md:mt-0">
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#b5862a] font-bold block mb-2">
              Exclusive Collection
            </span>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-normal text-neutral-900 capitalize">
              {pageTitle}
            </h1>
            <div className="w-16 h-[1px] bg-[#b5862a]/50 mx-auto mt-6"></div>
          </div>
        </div>

        {/* ── SYSTEM STATES (LOADING / ERROR / EMPTY) ── */}
        {loading && (
          <div className="w-full flex flex-col items-center justify-center py-32">
            <RefreshCw size={32} className="animate-spin text-[#b5862a] mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold text-neutral-400">Curating Silhouette Designs...</p>
          </div>
        )}

        {error && (
          <div className="w-full text-center py-20 text-red-500 font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="w-full text-center py-24 border border-dashed border-neutral-300 rounded-xl">
            <p className="text-lg text-neutral-500 font-['Playfair_Display'] italic">No designs currently available in this collection.</p>
            <button onClick={() => navigate('/collections')} className="mt-6 px-10 py-3 border-2 border-[#b5862a] text-[#b5862a] text-[0.7rem] tracking-[0.25em] font-bold uppercase hover:bg-[#b5862a] hover:text-white transition-all duration-400 rounded-sm">
              Explore All Collections
            </button>
          </div>
        )}

        {/* ── PRODUCT GRID MATRIX ── */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col gap-3 cursor-pointer group relative p-3 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] hover:bg-white/60 hover:border-white/80 transition-all duration-500 ease-out"
              >
                {/* Image Container */}
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

                {/* Text Metadata */}
                <div className="flex flex-col gap-0.5 text-left px-1 pb-1" onClick={() => handleOpenDetailView(item)}>
                  <h4 className="text-[0.85rem] font-medium text-[#1a1a1a]/90 tracking-wide line-clamp-1 group-hover:text-[#b5862a] transition-colors duration-300 capitalize">
                    {item.name}
                  </h4>
                  <p className="text-[0.8rem] font-bold text-[#b5862a] tracking-wider mt-0.5">
                    Rs. {Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ====================================================================
          SECTION B: MASTER FIXED GLASS ACORDION OVERLAY MODAL SHEET VIEW
         ==================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 w-full h-full z-50 overflow-y-auto bg-[#1a1a1a]/40 backdrop-blur-md px-4 md:px-16 py-12 flex items-start justify-center transition-all duration-500">
          
          <div className="w-full max-w-[1300px] bg-[#f7f4ef]/95 backdrop-blur-lg text-[#1a1a1a] p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-2xl border border-white/50 relative mt-4 animate-sheet-slide mb-12 select-text">
            
            {/* Modal Internal Navigation Header Controls */}
            <div className="w-full mb-8 flex items-center justify-between border-b border-[#e8e2d8] pb-4">
              <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-[#b5862a] uppercase font-bold">
                <span>Collections</span>
                <ChevronRight size={11} className="text-neutral-400" />
                <span className="text-[#1a1a1a] capitalize">{selectedProduct.categories?.name || pageTitle}</span>
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
                        <img src={imgUrl} alt={`Thumbnail slot ${idx}`} className="w-full h-full object-cover object-top" />
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
              <div className="lg:col-span-5 flex flex-col gap-5 text-left w-full">
                
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
                  <button className="w-full text-[0.75rem] tracking-[0.2em] font-bold uppercase py-3.5 bg-[#b5862a] text-white transition-all hover:bg-[#9c711f] shadow-md rounded-md">
                    BUY IT NOW
                  </button>
                </div>

                {/* Long Text Descriptions Block Section */}
                <p className="text-[0.9rem] font-light text-neutral-600 leading-relaxed mt-2">
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