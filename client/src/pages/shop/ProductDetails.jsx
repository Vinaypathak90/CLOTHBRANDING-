import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance'; 
import { Plus, ChevronRight, ShieldCheck, Truck, Heart, ArrowLeft } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { CMSContext } from '../../context/CMSContext'; // 🔥 Step 1: Loaded central CMS matrix context

export default function ProductDetails() {
  const { id } = useParams(); 
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { cmsConfig } = useContext(CMSContext); // 🔥 Step 2: Grab the configuration states from backend

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Small');

  // ====================================================================
  // 1. DYNAMIC CONFIGURATION STRINGS MATRIX (No text is hardcoded now)
  // ====================================================================
  const editorialLabels = {
    brandSubtitle: cmsConfig?.product_detail_subtitle || "PREETI WEARS / STANDALONE VIEW",
    sizeGuideText: cmsConfig?.size_guide_label || "Size Guide",
    addToCartCta: cmsConfig?.add_to_cart_label || "ADD TO CART",
    buyNowCta: cmsConfig?.buy_now_label || "BUY IT NOW",
    specsHeading: cmsConfig?.specs_heading || "Garment Specifications:",
    secureTitle: cmsConfig?.secure_guarantee_title || "Secure Transaction Guarantee",
    secureDesc: cmsConfig?.secure_guarantee_desc || "Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.",
    deliveryTitle: cmsConfig?.delivery_logistics_title || "Premium Delivery Logistics",
    deliveryDesc: cmsConfig?.delivery_logistics_desc || "Rates are approximations. Exact premium tracking parameters will be provided cleanly at checkout windows.",
    errorTitle: cmsConfig?.product_not_found_title || "Couture silhouette file not found",
    errorCta: cmsConfig?.product_not_found_cta || "Return to Lineage Collection"
  };

  // Fetch individual product item dynamically from backend based on routing parameters
  useEffect(() => {
  const fetchSingleProduct = async () => {
    try {
      const res = await axiosInstance.get(`/products/detail/${id}`);
      setProduct(res.data);
      
      // 🔥 SAFETY GUARD: Handle sizes parsing safely if variants array is empty or undefined
      if (res.data && res.data.variants && res.data.variants.length > 0) {
        setSelectedSize(res.data.variants[0].size || 'Small');
      } else {
        setSelectedSize('Small'); // Standard fallback token configuration
      }
    } catch (err) {
      console.error("Failed to hydrate product item matrix data node:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchSingleProduct();
}, [id]);

  if (loading) {
    return (
      <div className="w-full h-screen text-center flex flex-col items-center justify-center bg-[#f7f4ef]">
        <div className="w-16 h-[2px] bg-[#b5862a] animate-pulse mb-4"></div>
        <p className="text-[0.7rem] tracking-[0.35em] uppercase text-[#b5862a] font-bold font-['DM_Sans']">
          Assembling Atelier Silhouettes...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-screen text-center flex flex-col items-center justify-center bg-[#f7f4ef] px-6">
        <h2 className="font-['Playfair_Display'] text-2xl mb-4 text-neutral-800">
          {editorialLabels.errorTitle}
        </h2>
        <Link to="/" className="text-sm tracking-widest text-[#b5862a] underline font-bold uppercase flex items-center gap-2">
          <ArrowLeft size={14} /> {editorialLabels.errorCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] pt-32 pb-24 px-6 md:px-16 animate-[fadeIn_0.4s_ease-out]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Dynamic Navigation Breadcrumbs mapping */}
        <div className="w-full mb-12 flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-[#b5862a] uppercase font-bold border-b border-[#e8e2d8] pb-4">
          <Link to="/" className="hover:text-[#1a1a1a] transition-colors">Catalog</Link>
          <ChevronRight size={10} className="text-neutral-400" />
          <span className="text-neutral-400 capitalize">{product.category || 'Luxury'}</span>
          <ChevronRight size={10} className="text-neutral-400" />
          <span className="text-[#1a1a1a] truncate font-black max-w-[200px]">{product.name}</span>
        </div>

        {/* Master Details Workstation Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── LEFT CELL: SYSTEM IMAGES SWAPPING PANEL (Dynamic DB Array Render) ── */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-5 w-full">
            <div className="flex md:flex-col gap-3 flex-wrap md:w-[85px] flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                product.images.map((imgUrl, idx) => (
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

            <div className="flex-grow aspect-[3/4] bg-white relative overflow-hidden group border border-[#e8e2d8] rounded-md shadow-sm">
              <img 
                src={product.images && product.images.length > 0 ? product.images[activeImgIndex] : 'placeholder'} 
                alt={product.name} 
                className="w-full h-full object-cover object-top transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1) group-hover:scale-104 cursor-zoom-in"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs w-9 h-9 rounded-full flex items-center justify-center shadow-xs border border-neutral-100">
                <Plus size={15} className="text-[#1a1a1a]" />
              </div>
            </div>
          </div>

          {/* ── RIGHT CELL: BOUTIQUE CONTROLS TERMINAL PANEL ── */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left w-full font-['DM_Sans']">
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[0.68rem] tracking-[0.3em] font-semibold text-[#b5862a] uppercase">
                  {editorialLabels.brandSubtitle}
                </span>
                <h1 className="text-3xl md:text-4xl font-normal font-['Playfair_Display'] tracking-wide text-[#1a1a1a] uppercase leading-tight">
                  {product.name}
                </h1>
                <p className="text-2xl font-bold text-[#b5862a] mt-1">
                  Rs. {Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <button
                onClick={() => toggleWishlist(product)}
                className="p-3.5 rounded-full bg-white border border-[#e8e2d8] hover:border-[#b5862a] transition-all duration-300 shadow-xs group/dt-heart"
              >
                <Heart 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isInWishlist(product.id) ? 'fill-[#b5862a] text-[#b5862a]' : 'text-[#1a1a1a] group-hover/dt-heart:text-[#b5862a]'
                  }`} 
                />
              </button>
            </div>

            <hr className="border-[#e8e2d8] my-1" />

            {/* Sizing Attributes Block */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[0.75rem] font-bold tracking-wider uppercase text-neutral-600">
                <span>Size: <strong className="text-[#b5862a] tracking-widest ms-1">{selectedSize}</strong></span>
                <span className="text-neutral-400 underline cursor-pointer hover:text-black transition-colors font-medium">
                  {editorialLabels.sizeGuideText}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2.5 mt-1">
                {product.variants && product.variants.length > 0 ? (
                  Array.from(new Set(product.variants.map(v => v.size))).map((sz) => (
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

            {/* Core Action Cart Checkout Buttons (Dynamic Text Enabled) */}
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => addToCart(product, selectedSize, 1)}
                className="w-full text-[0.75rem] tracking-[0.25em] font-bold uppercase py-4 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] transition-all duration-400 hover:bg-[#1a1a1a] hover:text-white rounded-md shadow-xs"
              >
                {editorialLabels.addToCartCta}
              </button>
              <button className="w-full text-[0.75rem] tracking-[0.25em] font-bold uppercase py-4 bg-[#b5862a] text-white transition-all duration-400 hover:bg-[#9c711f] shadow-md rounded-md">
                {editorialLabels.buyNowCta}
              </button>
            </div>

            {/* Description Blocks */}
            <p className="text-[0.95rem] font-light text-neutral-600 leading-relaxed font-body">
              {product.description}
            </p>

            {/* Dynamic Specifications Sheets Arrays */}
            {product.bullet_points && product.bullet_points.length > 0 && (
              <div className="flex flex-col gap-2 bg-white p-5 rounded-md border border-[#e8e2d8] mt-2 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                <p className="text-[0.75rem] font-bold tracking-wider text-[#b5862a] uppercase mb-1">
                  {editorialLabels.specsHeading}
                </p>
                <ul className="flex flex-col gap-2 text-[0.9rem] font-light text-neutral-600">
                  {product.bullet_points.map((pt, idx) => (
                    <li key={idx} className="list-disc list-inside ps-1 leading-relaxed">{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Model Dimensions Data Layout Block */}
            {product.model_info && Object.keys(product.model_info).length > 0 && (
              <div className="text-[0.9rem] font-light text-neutral-500 border-l-2 border-[#b5862a] ps-4 py-1 flex flex-col gap-1 italic mt-2">
                {product.model_info.height && <p>Model height - {product.model_info.height}</p>}
                {product.model_info.bust && <p>Model bust - {product.model_info.bust}</p>}
                {product.model_info.breast && <p>Model bust - {product.model_info.breast}</p>}
                {product.model_info.waist && <p>Model waist - {product.model_info.waist}</p>}
                {product.model_info.wears && <p>Model wears - {product.model_info.wears}</p>}
              </div>
            )}

            {/* Security Check Parameters Badges */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="bg-white p-5 border border-[#e8e2d8] flex gap-3.5 items-start rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                <ShieldCheck size={19} className="text-[#b5862a] mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-[0.75rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">
                    {editorialLabels.secureTitle}
                  </h5>
                  <p className="text-[0.85rem] font-light text-neutral-500 leading-relaxed">
                    {editorialLabels.secureDesc}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 border border-[#e8e2d8] flex gap-3.5 items-start rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                <Truck size={19} className="text-[#b5862a] mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-[0.75rem] font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">
                    {editorialLabels.deliveryTitle}
                  </h5>
                  <p className="text-[0.85rem] font-light text-neutral-500 leading-relaxed">
                    {editorialLabels.deliveryDesc}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}