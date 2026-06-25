import React, { useContext } from 'react';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext'; // 🔥 Injected to enable active checkout add operations
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext); // 🔥 Consuming dynamic cart execution node

  // 🛡️ SAFE ARRAY GUARD: Always ensure wishlist behaves cleanly as an array matrix
  const items = Array.isArray(wishlist) ? wishlist : [];

  // ====================================================================
  // 🧮 FINANCIAL MATRIX AGGREGATIONS (Safely tracks nested data models)
  // ====================================================================
  const estValue = items.reduce((sum, item) => {
    const productData = item.products || item.product || item;
    return sum + (Number(productData.price) || 0);
  }, 0);

  
  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] pt-28 pb-20 px-6 md:px-16 animate-fade-in">
      
      {/* ── EDITORIAL PAGE HEADER WITH STATS ── */}
      <div className="max-w-[1500px] mx-auto border-b border-[#e8e2d8] pb-8 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="block text-[0.68rem] tracking-[0.4em] uppercase text-[#b5862a] font-bold mb-2">
            Your Board
          </span>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl font-normal tracking-wide">
            Curation Board <span className="italic font-light text-[#b5862a] text-2xl md:text-4xl">({items.length})</span>
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <p className="text-neutral-500 text-sm font-light leading-relaxed max-w-sm text-left md:text-right">
            A personalized collection of your architectural silhouettes and modern tailoring assets saved for your next matrix transformation.
          </p>
          {items.length > 0 && (
            <div className="flex gap-6 text-[0.7rem] tracking-[0.2em] font-bold uppercase text-[#b5862a]">
              <span>Total Items: {items.length}</span>
              <span>Est. Value: Rs. {estValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── CORE CONDITIONAL ROUTING STAGE ── */}
      <div className="max-w-[1500px] mx-auto">
        {items.length === 0 ? (
          
          /* VIEW PANEL A: EMPTY WISHLIST SCREEN */
          <div className="w-full py-24 text-center flex flex-col items-center justify-center bg-white/40 rounded-xl border border-[#e8e2d8]/60 shadow-xs">
            <div className="w-12 h-[1px] bg-[#b5862a] mb-6"></div>
            <h3 className="font-['Playfair_Display'] text-2xl font-normal text-neutral-800 mb-2">Your curation board is empty</h3>
            <p className="text-neutral-400 text-sm font-light tracking-wide max-w-xs mb-8">
              Explore our collections to discover exceptional designs tailored just for you.
            </p>
            <Link 
              to="/collections" 
              className="inline-flex items-center gap-3 px-10 py-3.5 bg-[#1a1a1a] text-[#f7f4ef] font-semibold text-[0.75rem] tracking-[0.25em] uppercase hover:bg-[#b5862a] transition-all duration-400 ease-out rounded-sm shadow-sm"
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>

        ) : (

          /* VIEW PANEL B: WISHLIST PRODUCT MATRIX GRID */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10 mb-16">
              {items.map((item) => {
                // 🔥 THE STRUCTURAL EXTRACTION TRICK: Extracts true nested payload regardless of Guest/DB wrap
                const productData = item.products || item.product || item;
                
                // 🛡️ CRITICAL DEFENSIVE TOKEN: Extracts real item database product identification token
                const trueProductId = productData.id || productData._id || item.product_id;

                if (!productData || !trueProductId) return null;

                const variants = Array.isArray(productData.variants) ? productData.variants : [];
                const categoryName = productData.categories?.name || productData.category;

                return (
                  <div 
                    key={item.id} 
                    className="flex flex-col gap-4 bg-white rounded-lg border border-[#e8e2d8]/50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] group hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-400 overflow-hidden text-left"
                  >
                    {/* Product Image Frame */}
                    <div className="relative aspect-[3/4] bg-[#e8e4dc] overflow-hidden">
                      <img 
                        src={productData.images && productData.images.length > 0 ? productData.images[0] : '/placeholder.png'} 
                        alt={productData.name} 
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 brightness-[0.98]"
                      />
                      
                      {/* Remove Button (Triggers toggle using exact state parameters block) */}
                      <button 
                        onClick={() => toggleWishlist(item)}
                        className="absolute top-3 right-3 p-2 bg-[#f7f4ef]/90 hover:bg-red-500 text-[#b5862a] hover:text-white rounded-full transition-all duration-300 shadow-sm z-10"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      {/* Category Badge */}
                      {categoryName && (
                        <div className="absolute top-3 left-3 bg-[#b5862a] text-white px-2.5 py-1 text-[0.65rem] font-bold tracking-wider uppercase rounded-sm">
                          {categoryName}
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="flex flex-col gap-3 px-4 pb-4 flex-grow justify-between">
                      <div>
                        <h4 className="text-[0.88rem] font-bold text-[#1a1a1a] tracking-wide line-clamp-2 capitalize leading-relaxed">
                          {productData.name}
                        </h4>
                        <p className="text-[0.85rem] font-semibold text-[#b5862a] mt-2">
                          Rs. {Number(productData.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Size Variants Preview */}
                      {variants.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap my-1">
                          {variants.slice(0, 4).map((v, idx) => (
                            <div key={idx} className="px-2 py-1 bg-[#f7f4ef] text-[0.65rem] font-semibold text-neutral-600 rounded-sm border border-[#e8e2d8]">
                              {v.size}
                            </div>
                          ))}
                          {variants.length > 4 && (
                            <div className="px-2 py-1 bg-[#f7f4ef] text-[0.65rem] font-semibold text-neutral-600 rounded-sm border border-[#e8e2d8]">
                              +{variants.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons Terminal */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-[#e8e2d8]/30">
                        {/* ✅ FIXED LINK PIPELINE: Routes using trueProductId to ensure zero null page crashes */}
                        <Link 
                          to={`/shop/product/${trueProductId}`}
                          className="w-full py-2.5 bg-neutral-900 text-white text-[0.68rem] tracking-[0.2em] font-bold uppercase rounded-md hover:bg-[#b5862a] transition-colors duration-400 flex items-center justify-center gap-2 text-center"
                        >
                          <ShoppingBag size={12} /> View Product
                        </Link>
                        
                        <button 
                          onClick={() => addToCart(productData, variants[0]?.size || 'Small', 1)}
                          className="w-full py-2 border border-[#b5862a] text-[#b5862a] text-[0.65rem] tracking-[0.15em] font-bold uppercase rounded-md hover:bg-[#b5862a] hover:text-white transition-colors duration-300 flex items-center justify-center gap-1.5"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary & Action Footer Panel */}
            <div className="max-w-[1500px] mx-auto mt-20 pt-12 border-t-2 border-[#e8e2d8] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 text-left">
                <p className="text-sm text-neutral-600 font-light">Continue shopping or proceed to secure validation parameters desk</p>
                <div className="flex gap-6 text-sm font-bold text-[#1a1a1a]">
                  <span>Total Selected: {items.length} items</span>
                  <span className="text-[#b5862a]">Est. Value: Rs. {estValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Link 
                  to="/collections"
                  className="px-8 py-3 border-2 border-[#b5862a] text-[#b5862a] font-semibold text-[0.75rem] tracking-[0.2em] uppercase hover:bg-[#b5862a] hover:text-white transition-all duration-300 rounded-sm"
                >
                  Continue Shopping
                </Link>
                <Link to="/cart" className="px-8 py-3 bg-[#1a1a1a] text-white font-semibold text-[0.75rem] tracking-[0.2em] uppercase hover:bg-[#b5862a] transition-all duration-300 rounded-sm shadow-md">
                  Go To Shopping Bag
                </Link>
              </div>
            </div>
          </div>

        )}
      </div>

    </div>
  );
}