import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ShoppingBag } from 'lucide-react'; 
import { CMSContext } from '../../context/CMSContext';
import { WishlistContext } from '../../context/WishlistContext'; // 🔥 Step 1: Context validation loop binding

const Navbar = () => {
  const { cmsConfig, loading } = useContext(CMSContext);
  const { wishlistCount } = useContext(WishlistContext); // 🔥 Step 2: Destructured global reactive counter state
  const [imgFailed, setImgFailed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Offline luxury fashion default links matrix if database falls offline
  const fashionOfflineDefaultLinks = [
    { label: "Home", path: "/" },
    { label: "Collections", path: "/collections" },
    { label: "New Arrivals", path: "/new-arrivals" },
    { label: "The Studio", path: "/studio" },
    { label: "Editorial", path: "/editorial" },
    { label: "Contact", path: "/contact" }
  ];

  const logoText = cmsConfig?.logo_text || "PREETI CLOTHING";
  const logoImage = cmsConfig?.logo_image_url || null;
  
  const navigationMenu = cmsConfig?.navigation_menu && cmsConfig.navigation_menu.length > 0
    ? cmsConfig.navigation_menu
    : fashionOfflineDefaultLinks;

  useEffect(() => {
    // Reset image load error tracker if database updates the asset URL
    setImgFailed(false);
  }, [logoImage]);

  useEffect(() => {
    // Lockdown main background document scroll when responsive full drawer menu is active
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  // Cinematic brand skeletal shimmer loader layer while database handshake resolves
  if (loading) {
    return (
      <div className="w-full h-[76px] bg-[var(--bg-luxury,#EFECE3)] border-b border-neutral-900/5 animate-pulse flex items-center justify-between px-6 md:px-12">
        <div className="w-36 h-5 bg-neutral-900/10 rounded"></div>
        <div className="hidden md:flex gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="w-18 h-3 bg-neutral-900/10 rounded"></div>)}
        </div>
        <div className="w-20 h-5 bg-neutral-900/10 rounded"></div>
      </div>
    );
  }

  return (
    <nav 
      style={{ backgroundColor: 'var(--bg-luxury, #EFECE3)', borderColor: 'rgba(26,26,26,0.1)' }}
      className="fixed top-0 left-0 w-full z-50 border-b transition-all duration-500 shadow-sm"
    >
      {/* Primary Structural Constrained View Box Container */}
      <div className="max-w-[1600px] mx-auto h-[76px] px-6 md:px-12 flex justify-between items-center relative">
        
        {/* ==========================================
            HAUTE COUTURE BRAND IDENTITY (LOGO MODULE)
           ========================================== */}
        <Link to="/" className="flex items-center select-none z-50">
            {!imgFailed && logoImage ? (
            <img
              src={logoImage}
              alt={logoText}
              className="h-10 w-auto object-contain transition-transform duration-300"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span 
              style={{ color: 'var(--text-luxury, #1A1A1A)' }}
              className="text-xl md:text-2xl font-semibold tracking-[0.12em] font-display uppercase italic transition-all hover:opacity-80"
            >
              {logoText}
            </span>
          )}
        </Link>

        {/* ==========================================
            DESKTOP LUXURY FASHION NAVIGATION MAPPINGS
           ========================================== */}
        <ul className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {navigationMenu.map((route, idx) => (
            <li key={idx} className="relative group">
              <Link
                to={route.path}
                style={{ 
                  color: isActive(route.path) ? 'var(--primary-accent, #C9A84C)' : 'var(--text-luxury, #1A1A1A)',
                  opacity: isActive(route.path) ? 1 : 0.85
                }}
                className="text-sm md:text-base font-medium tracking-[0.12em] uppercase font-display block py-2 transition-all duration-400 ease-in-out relative"
              >
                {route.label}
                {/* Horizontal slide micro overlay underline accent animation */}
                <span 
                  style={{ backgroundColor: 'var(--primary-accent, #C9A84C)' }}
                  className={`absolute bottom-0 left-0 w-full h-[1.5px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left ${
                    isActive(route.path) ? 'scale-x-100' : ''
                  }`}
                ></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* ==========================================
            E-COMMERCE UTILITIES PANEL (WISHLIST & BAG)
           ========================================== */}
        <div className="flex items-center gap-5 md:gap-7 z-50">
          
          {/* Wishlist Link Component */}
          <Link 
            to="/wishlist" 
            style={{ color: 'var(--text-luxury, #1A1A1A)' }}
            className="hover:text-[var(--primary-accent)] transition-colors duration-300 relative group"
            aria-label="View Wishlist"
          >
            {/* 🔥 Heart icon shifts to corporate filled gold color natively if items count registry is true */}
            <Heart 
              size={18} 
              strokeWidth={1.5} 
              className={`group-hover:scale-110 transition-transform duration-300 ${
                wishlistCount > 0 ? 'fill-[var(--primary-accent,#C9A84C)] text-[var(--primary-accent,#C9A84C)]' : ''
              }`} 
            />
            
            {/* 🔥 DYNAMIC BUBBLE BADGE: Fully operational using context state properties */}
            {wishlistCount > 0 && (
              <span 
                style={{ backgroundColor: 'var(--primary-accent, #C9A84C)', color: 'var(--bg-luxury, #EFECE3)' }}
                className="absolute -top-1.5 -right-2 text-[10px] font-bold font-body w-4 h-4 rounded-full flex items-center justify-center scale-90 animate-pulse shadow-xs"
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Luxury Shopping Bag Component */}
          <Link 
            to="/cart" 
            style={{ color: 'var(--text-luxury, #1A1A1A)' }}
            className="hover:text-[var(--primary-accent)] transition-colors duration-300 relative group flex items-center"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
            <span 
              style={{ backgroundColor: 'var(--text-luxury, #1A1A1A)', color: 'var(--bg-luxury, #EFECE3)' }}
              className="absolute -top-1.5 -right-2 text-[10px] font-bold font-body w-4 h-4 rounded-full flex items-center justify-center scale-90 border border-[var(--bg-luxury)]"
            >
              0
            </span>
          </Link>

          {/* Responsive Interactive Hamburger Drawer Trigger */}
          <button
            style={{ color: 'var(--text-luxury, #1A1A1A)' }}
            className="md:hidden focus:outline-none transition-transform duration-200 active:scale-95 ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Module"
          >
            {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* ==========================================
          MOBILE VIEW SELECTIONS OVERLAY GRID PANEL
         ========================================== */}
      <div 
        style={{ backgroundColor: 'var(--bg-luxury, #EFECE3)' }}
        className={`fixed inset-0 top-0 w-full h-screen z-40 pt-[110px] px-8 transition-all duration-500 ease-in-out md:hidden ${
          isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-6 invisible'
        }`}
      >
        <ul className="flex flex-col gap-7 text-left max-w-md mx-auto">
          {navigationMenu.map((route, idx) => (
            <li key={idx} className="border-b border-neutral-900/5 pb-3">
              <Link
                to={route.path}
                style={{ 
                  color: isActive(route.path) ? 'var(--primary-accent, #C9A84C)' : 'var(--text-luxury, #1A1A1A)',
                }}
                className={`text-lg md:text-lg font-medium tracking-[0.15em] uppercase font-display block transition-all duration-250 ${
                  isActive(route.path) ? 'ps-3 border-l-2 font-semibold' : 'hover:ps-2'
                }`}
                onClick={() => setIsMenuOpen(false)}
                styles={{ borderColor: 'var(--primary-accent, #C9A84C)' }}
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;