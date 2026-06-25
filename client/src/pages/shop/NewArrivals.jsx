import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { RefreshCw, ArrowLeft, Plus, X, ChevronRight, ShieldCheck, Truck, Heart } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext'; 
import { CartContext } from '../../context/CartContext';
import { motion } from 'framer-motion';

export default function NewArrivals() {
  const navigate = useNavigate();
  
  // Contexts
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  // States
  const [newProducts, setNewProducts] = useState([]);
  const [cmsData, setCmsData] = useState(null); // 🔥 DYNAMIC TEXT STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Small');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 🔥 SUPER FAST PARALLEL FETCH (Products + Admin Settings)
        const [productsRes, cmsRes] = await Promise.all([
          axiosInstance.get('/products/shop-list'),
          axiosInstance.get('/cms/manifest')
        ]);

        // 1. Setup CMS Text
        if (cmsRes.data) {
          setCmsData(cmsRes.data);
        }

        // 2. Setup Products Logic
        if (productsRes.data && productsRes.data.success) {
          const allProducts = productsRes.data.products;
          
          const sortedProducts = allProducts.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          });

          const today = new Date();
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(today.getMonth() - 2);

          let recentProducts = sortedProducts.filter((product) => {
            if (!product.created_at) return false; 
            return new Date(product.created_at) >= twoMonthsAgo;
          });

          // MAGIC FALLBACK: Agar recent products 0 hain, toh top 8 latest dikhao
          if (recentProducts.length === 0 && sortedProducts.length > 0) {
            recentProducts = sortedProducts.slice(0, 8);
          }

          setNewProducts(recentProducts);
        } else {
          setNewProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError('Failed to load the latest collection. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modal Scroll Lock
  useEffect(() => {
    if (selectedProduct) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  const handleOpenDetailView = (product) => {
    setSelectedProduct(product);
    setActiveImgIndex(0);
    if (product.variants && product.variants.length > 0) {
      setSelectedSize(product.variants[0].size || 'Small');
    }
  };

  // 🔥 Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  // 🔥 DYNAMIC TEXT VARIABLES (Fallback if CMS is empty)
  const eyebrowText = cmsData?.new_arrivals_eyebrow || 'Just Dropped';
  const titleText = cmsData?.new_arrivals_title || 'New Arrivals';
  const subtitleText = cmsData?.new_arrivals_subtitle || 'Explore the freshest silhouettes straight from our design atelier. These pieces are strictly limited and will transition to the archives soon.';

  return (
    <div className="min-h-screen bg-[#f7f4ef] pt-24 pb-20 px-4 md:px-12 lg:px-20 font-['DM_Sans'] overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sheetSlideIn { from { opacity: 0; transform: translateY(35px); } to { opacity: 1; transform: translateY(0); } }
        .animate-sheet-slide { animation: sheetSlideIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
      `}} />

      <div className="max-w-[1400px] mx-auto">
        
        {/* ── HEADER & NAVIGATION (Animated + Dynamic Text) ── */}
        <div className="relative mb-10 w-full flex flex-col items-center">
          <button 
            onClick={() => navigate('/')} 
            className="absolute left-0 top-0 hidden md:flex items-center gap-2 text-neutral-500 hover:text-[#b5862a] transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Home
          </button>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center w-full max-w-2xl"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#b5862a] font-bold block mb-2">
              {eyebrowText}
            </span>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-[3.5rem] font-normal text-[#1a1a1a] capitalize tracking-wide leading-tight">
              {titleText}
            </h1>
            <p className="text-neutral-500 text-sm md:text-base mt-4 font-light italic leading-relaxed">
              {subtitleText}
            </p>
            <div className="w-12 h-[2px] bg-[#b5862a]/60 mx-auto mt-6 rounded-full"></div>
          </motion.div>
        </div>

        {/* ── SYSTEM STATES (LOADING / ERROR / EMPTY) ── */}
        {loading && (
          <div className="w-full flex flex-col items-center justify-center py-24">
            <RefreshCw size={28} className="animate-spin text-[#b5862a] mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold text-neutral-400">Curating the latest drops...</p>
          </div>
        )}

        {error && (
          <div className="w-full text-center py-20 text-red-500 font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        {!loading && !error && newProducts.length === 0 && (
          <div className="w-full text-center py-20 border border-dashed border-neutral-300 rounded-xl bg-white/40">
            <p className="text-lg text-neutral-500 font-['Playfair_Display'] italic">Our latest drop is currently being stitched to perfection in the atelier.</p>
            <button onClick={() => navigate('/collections')} className="mt-6 px-10 py-3 border-2 border-[#b5862a] text-[#b5862a] text-[0.7rem] tracking-[0.25em] font-bold uppercase hover:bg-[#b5862a] hover:text-white transition-all duration-400 rounded-sm">
              Explore Core Collections
            </button>
          </div>
        )}

        {/* ── PRODUCT GRID MATRIX (Animated) ── */}
        {!loading && newProducts.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {newProducts.map((item) => (
              <motion.div 
                key={item.id} 
                variants={cardVariants}
                className="flex flex-col gap-3 cursor-pointer group relative p-3 rounded-xl bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:border-neutral-200 transition-all duration-500 ease-out"
              >
                {/* NEW Badge Overlay */}
                <div className="absolute top-6 left-6 z-30 bg-[#1a1a1a] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-sm shadow-md">
                  New
                </div>

                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-[#e8e4dc] overflow-hidden rounded-lg shadow-sm mt-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:scale-110 transition-all duration-300 group/heart"
                  >
                    <Heart size={14} className={`transition-colors duration-300 ${isInWishlist(item.id) ? 'fill-[#b5862a] text-[#b5862a]' : 'text-[#1a1a1a] group-hover/heart:text-[#b5862a]'}`} />
                  </button>

                  <img 
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} 
                    alt={item.name} 
                    loading="lazy"
                    onClick={() => handleOpenDetailView(item)}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.98]"
                  />
                  
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
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>

      {/* ====================================================================
          MODAL: QUICK SHOP OVERLAY
         ==================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 w-full h-full z-50 overflow-y-auto bg-[#1a1a1a]/40 backdrop-blur-md px-4 md:px-16 py-12 flex items-start justify-center transition-all duration-500">
          <div className="w-full max-w-[1300px] bg-[#f7f4ef]/95 backdrop-blur-lg text-[#1a1a1a] p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-2xl border border-white/50 relative mt-4 animate-sheet-slide mb-12 select-text">
            
            <div className="w-full mb-8 flex items-center justify-between border-b border-[#e8e2d8] pb-4">
              <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-[#b5862a] uppercase font-bold">
                <span>Shop</span>
                <ChevronRight size={11} className="text-neutral-400" />
                <span className="text-[#1a1a1a] capitalize">Just In</span>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-1.5 text-[0.7rem] tracking-[0.2em] font-bold uppercase text-[#b5862a] hover:text-[#1a1a1a] transition-colors duration-300">
                <X size={15} /> Close Product
              </button>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-5 w-full">
                <div className="flex md:flex-col gap-3 flex-wrap md:w-[85px] flex-shrink-0">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    selectedProduct.images.map((imgUrl, idx) => (
                      <button key={idx} onClick={() => setActiveImgIndex(idx)} className={`aspect-[3/4] w-[65px] md:w-full bg-[#e8e4dc] overflow-hidden border-2 transition-all duration-300 rounded-md ${idx === activeImgIndex ? 'border-[#b5862a] scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={imgUrl} alt={`Thumbnail slot ${idx}`} className="w-full h-full object-cover object-top" />
                      </button>
                    ))
                  ) : (
                    <button className="aspect-[3/4] w-full bg-neutral-200 rounded-md"></button>
                  )}
                </div>
                <div className="flex-grow aspect-[4/5] bg-white relative overflow-hidden group border border-[#e8e2d8] rounded-lg shadow-sm">
                  <img src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[activeImgIndex] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'} alt={selectedProduct.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-neutral-100"><Plus size={14} className="text-[#1a1a1a]" /></div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-5 text-left w-full">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[0.65rem] tracking-[0.3em] font-semibold text-[#b5862a] uppercase">LATEST DROP / PREETI WEARS</span>
                    <h1 className="text-2xl md:text-3xl font-normal font-['Playfair_Display'] text-[#1a1a1a] uppercase leading-tight">{selectedProduct.name}</h1>
                    <p className="text-xl font-bold text-[#b5862a] mt-1">Rs. {Number(selectedProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <button onClick={() => toggleWishlist(selectedProduct)} className="p-2.5 rounded-full bg-white border border-[#e8e2d8] hover:border-[#b5862a] transition-all shadow-sm group/modal-heart">
                    <Heart size={15} className={`transition-colors ${isInWishlist(selectedProduct.id) ? 'fill-[#b5862a] text-[#b5862a]' : 'text-[#1a1a1a] group-hover/modal-heart:text-[#b5862a]'}`} />
                  </button>
                </div>

                <hr className="border-[#e8e2d8] my-1" />

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[0.75rem] font-bold tracking-wider uppercase text-neutral-600">
                    <span>Size: <strong className="text-[#b5862a] font-bold tracking-widest ms-1">{selectedSize}</strong></span>
                    <span className="text-neutral-400 underline cursor-pointer hover:text-black transition-colors font-medium">Size Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5 mt-1">
                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      Array.from(new Set(selectedProduct.variants.map(v => v.size))).map((sz) => (
                        <button key={sz} onClick={() => setSelectedSize(sz)} className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase border-2 transition-all min-w-[55px] text-center rounded-md ${sz === selectedSize ? 'border-[#b5862a] bg-[#b5862a] text-white shadow-sm' : 'border-[#e8e2d8] text-neutral-700 bg-white hover:border-[#b5862a]'}`}>{sz}</button>
                      ))
                    ) : (
                      ['XS', 'Small', 'Medium', 'Large', 'XL'].map((sz) => (
                        <button key={sz} onClick={() => setSelectedSize(sz)} className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase border-2 transition-all min-w-[55px] text-center rounded-md ${sz === selectedSize ? 'border-[#b5862a] bg-[#b5862a] text-white shadow-sm' : 'border-[#e8e2d8] text-neutral-700 bg-white hover:border-[#b5862a]'}`}>{sz}</button>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-3">
                  <button onClick={() => { addToCart(selectedProduct, selectedSize, 1); setSelectedProduct(null); }} className="w-full text-[0.75rem] tracking-[0.2em] font-bold uppercase py-3.5 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white rounded-md shadow-sm">ADD TO CART</button>
                  <button className="w-full text-[0.75rem] tracking-[0.2em] font-bold uppercase py-3.5 bg-[#b5862a] text-white transition-all hover:bg-[#9c711f] shadow-md rounded-md">BUY IT NOW</button>
                </div>

                <p className="text-[0.9rem] font-light text-neutral-600 leading-relaxed mt-2">{selectedProduct.description}</p>

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

                <div className="flex flex-col gap-3 mt-3">
                  <div className="bg-white p-4 border border-[#e8e2d8] flex gap-3 items-start rounded-md shadow-sm"><ShieldCheck size={18} className="text-[#b5862a] mt-0.5 flex-shrink-0" /><div><h5 className="text-[0.7rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">Secure Transaction Guarantee</h5><p className="text-[0.8rem] font-light text-neutral-500 leading-relaxed">Your payment information is processed securely. We do not store credit card details.</p></div></div>
                  <div className="bg-white p-4 border border-[#e8e2d8] flex gap-3 items-start rounded-md shadow-sm"><Truck size={18} className="text-[#b5862a] mt-0.5 flex-shrink-0" /><div><h5 className="text-[0.7rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">Premium Delivery Logistics</h5><p className="text-[0.8rem] font-light text-neutral-500 leading-relaxed">Rates are approximations. Exact tracking metrics will be provided cleanly at checkout.</p></div></div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}