import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { CMSContext } from '../../context/CMSContext'; 
import { AuthContext } from '../../context/AuthContext'; // 🔥 Injected to capture user session status
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Cart() {
  const { currentUser } = useContext(AuthContext);
  const { cmsConfig } = useContext(CMSContext);
  const navigate = useNavigate();
  
  // ====================================================================
  // 🛡️ COMPATIBILITY LAYER MATRIX (Bypasses naming mismatches gracefully)
  // ====================================================================
  const context = useContext(CartContext);
  
  // Accept both layout structures dynamically to avoid any initialization crashes
  const items = Array.isArray(context.cartItems) ? context.cartItems : (Array.isArray(context.cart) ? context.cart : []);
  const updateQuantity = context.updateQuantity;
  const removeItem = context.removeFromCart || context.removeItem;
  const isCartLoading = context.isCartLoading;

  // Dynamic automatic calculation fallbacks if context states are re-hydrating
  const cartCount = context.cartCount ?? items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  
  const cartTotalPrice = context.cartTotalPrice ?? items.reduce((acc, item) => {
    const productData = item.products || item.product || {};
    const price = Number(productData.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  // ====================================================================
  // 🚀 PROGRAMMATIC CHECKOUT HANDLER WITH REDIRECTION MEMORY KEYS
  // ====================================================================
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      console.log("⚠️ [GUEST MODE DETECTED]: Redirecting to authentication, capturing checkout route target...");
      // Save checkout path in router history state parameters before shifting views
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
    } else {
      console.log("✅ [AUTHENTICATED USER SESSION]: Routing directly to payment gateway desk...");
      navigate('/checkout');
    }
  };

  // ====================================================================
  // 1. 100% BACKEND CONTROLLED LAYOUT STRINGS WITH SAFE FALLBACKS
  // ====================================================================
  const dynamicLabels = {
    eyebrow: cmsConfig?.cart_eyebrow || "Your Selection",
    title: cmsConfig?.cart_title || "Shopping Bag",
    emptyTitle: cmsConfig?.cart_empty_title || "Your shopping bag is empty",
    emptyDesc: cmsConfig?.cart_empty_desc || "Items you add to your bag will remain stored safely and securely until you decide to checkout.",
    emptyCta: cmsConfig?.cart_empty_cta || "Back to curation collections",
    itemBrandLabel: cmsConfig?.logo_text || "PREETI CLOTHING",
    summaryTitle: cmsConfig?.cart_summary_title || "Order Aggregations",
    subtotalLabel: cmsConfig?.cart_subtotal_label || "Subtotal Items Bag:",
    shippingLabel: cmsConfig?.cart_shipping_label || "Premium Delivery Logistics:",
    shippingValue: cmsConfig?.cart_shipping_value || "Complementary Shipping",
    totalLabel: cmsConfig?.cart_total_label || "Total Subtotal Price:",
    checkoutCta: cmsConfig?.cart_checkout_cta || "PROCEED TO CHECKOUT",
    securityNotice: cmsConfig?.cart_security_notice || "Amazon Level Safety Guarantee. Items in your shopping cart profiles are saved persistently in our server logs until modified manually."
  };

  if (isCartLoading) {
    return (
      <div className="w-full min-h-screen bg-[#f7f4ef] flex items-center justify-center">
        <div className="w-12 h-[1px] bg-[#b5862a] animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] pt-28 pb-24 px-6 md:px-16 animate-fade-in">
      <div className="max-w-[1500px] mx-auto">
        
        {/* EDITORIAL BAG HEADER SECTION */}
        <div className="border-b border-[#e8e2d8] pb-6 mb-12 select-none">
          <span className="block text-[0.68rem] tracking-[0.4em] uppercase text-[#b5862a] font-bold mb-1">
            {dynamicLabels.eyebrow}
          </span>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl font-normal">
            {dynamicLabels.title} <span className="italic font-light text-[#b5862a] text-2xl md:text-4xl">({cartCount} items)</span>
          </h1>
        </div>

        {items.length === 0 ? (
          
          /* ── VIEW PANEL A: DYNAMIC EMPTY STATE CONTROL ── */
          <div className="w-full py-24 text-center bg-white/50 border border-[#e8e2d8] rounded-lg flex flex-col items-center justify-center">
            <h3 className="font-['Playfair_Display'] text-2xl font-normal text-neutral-800 mb-2">
              {dynamicLabels.emptyTitle}
            </h3>
            <p className="text-neutral-400 text-sm font-light max-w-xs mb-8">
              {dynamicLabels.emptyDesc}
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-[0.75rem] tracking-[0.2em] font-bold uppercase border-b-2 border-[#1a1a1a] pb-1 hover:text-[#b5862a] hover:border-[#b5862a] transition-all">
              <ArrowLeft size={14} /> {dynamicLabels.emptyCta}
            </Link>
          </div>

        ) : (

          /* ── VIEW PANEL B: DYNAMIC SPLIT SYSTEM INTERFACE ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT CELL BLOCK: CARDS TRACKING COLUMN */}
            <div className="lg:col-span-8 flex flex-col gap-5 w-full">
              {items.map((item) => {
                // Defensive lookup parses both plural/singular data models automatically
                const productData = item.products || item.product || {};
                return (
                  <div 
                    key={item.id} 
                    className="w-full bg-white p-5 rounded-lg border border-[#e8e2d8]/60 flex gap-5 items-center justify-between shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.03)] transition-all duration-300"
                  >
                    {/* Dynamic Product Structural Thumbnail Setup */}
                    <div className="flex items-center gap-5">
                      <div className="w-[85px] aspect-[3/4] bg-[#e8e4dc] overflow-hidden rounded-md flex-shrink-0 border border-[#e8e2d8]/40">
                        <img 
                          src={productData.images && productData.images.length > 0 ? productData.images[0] : 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80'} 
                          alt={productData.name} 
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-[0.6rem] tracking-wider text-neutral-400 uppercase font-bold">
                          {dynamicLabels.itemBrandLabel} / {productData.category || 'Boutique'}
                        </span>
                        <h3 className="text-[0.95rem] font-bold text-[#1a1a1a] capitalize leading-snug line-clamp-1">
                          {productData.name}
                        </h3>
                        <p className="text-[0.7rem] text-[#b5862a] font-bold uppercase tracking-wider">
                          Size: <span className="underline font-black ms-0.5">{item.selected_size || 'Standard'}</span>
                        </p>
                        <p className="text-[0.88rem] font-medium text-neutral-500 mt-1">
                          Rs. {Number(productData.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Multipliers Segment */}
                    <div className="flex items-center gap-8">
                      <div className="flex items-center border-2 border-[#e8e2d8] rounded-md bg-[#f7f4ef]/40 overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          className="p-2.5 text-neutral-500 hover:bg-neutral-100 transition-colors"
                          aria-label="Reduce Quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-4 text-[0.85rem] font-bold text-neutral-900 select-none min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="p-2.5 text-neutral-500 hover:bg-neutral-100 transition-colors"
                          aria-label="Increase Quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Hard Delete Purge Signal Toggle */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2.5 text-neutral-400 hover:text-red-600 border border-neutral-100 hover:border-red-100 bg-neutral-50 hover:bg-red-50/50 rounded-full transition-all duration-300"
                        aria-label="Delete line item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* RIGHT CELL BLOCK: PERSISTENT CALCULATION TOTALS PANEL */}
            <div className="lg:col-span-4 w-full bg-white border border-[#e8e2d8] rounded-lg p-6 flex flex-col gap-5 shadow-sm sticky top-28 font-['DM_Sans']">
              <h2 className="text-[0.8rem] font-bold tracking-[0.25em] uppercase text-[#b5862a] border-b border-[#e8e2d8] pb-3 text-left">
                {dynamicLabels.summaryTitle}
              </h2>
              
              <div className="flex flex-col gap-3.5 text-sm font-light text-neutral-600 border-b border-dashed border-[#e8e2d8] pb-4">
                <div className="flex justify-between">
                  <span>{dynamicLabels.subtotalLabel}</span>
                  <span className="font-medium text-[#1a1a1a]">{cartCount} units</span>
                </div>
                <div className="flex justify-between">
                  <span>{dynamicLabels.shippingLabel}</span>
                  <span className="text-green-600 font-medium uppercase text-[11px] tracking-wider">
                    {dynamicLabels.shippingValue}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline py-1">
                <span className="text-[0.95rem] font-bold text-[#1a1a1a]">
                  {dynamicLabels.totalLabel}
                </span>
                <span className="text-2xl font-bold text-[#b5862a]">
                  Rs. {cartTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 🔥 FIXED: Replaced direct standard Link tag with safe button handler execution pipeline */}
              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-[#1a1a1a] text-white py-4 font-bold text-[0.75rem] tracking-[0.25em] uppercase transition-all duration-400 hover:bg-[#b5862a] shadow-md rounded-md mt-2 text-center"
              >
                {dynamicLabels.checkoutCta}
              </button>

              <div className="flex gap-2.5 items-start mt-1 text-left bg-[#f7f4ef]/40 p-3.5 rounded-md border border-[#e8e2d8]/40">
                <ShieldCheck size={16} className="text-[#b5862a] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-neutral-500 leading-normal font-light">
                  {dynamicLabels.securityNotice}
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}