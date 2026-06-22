import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CMSContext } from '../../context/CMSContext';

const Footer = () => {
  const { cmsConfig, loading } = useContext(CMSContext);
  const [imgFailed, setImgFailed] = useState(false);

  // Hardcoded offline fallbacks (Web down hone par ye automatic backup links banenge)
  const fashionOfflineLinksFallback = [
    { label: "Home", path: "/" },
    { label: "Collections", path: "/collections" },
    { label: "New Arrivals", path: "/new-arrivals" },
    { label: "The Studio", path: "/studio" },
    { label: "Editorial", path: "/editorial" },
    { label: "Contact", path: "/contact" }
  ];

  const logoText = cmsConfig?.logo_text || "PREETI CLOTHING";
  const logoImage = cmsConfig?.logo_image_url || null;
  const copyrightText = cmsConfig?.copyright_text || "© 2026 PREETI HAUTE COUTURE. All rights reserved.";
  
  // Back-end matrix validations checker array length
  const navigationMenu = cmsConfig?.navigation_menu && cmsConfig.navigation_menu.length > 0
    ? cmsConfig.navigation_menu
    : fashionOfflineLinksFallback;

  useEffect(() => {
    setImgFailed(false);
  }, [logoImage]);

  // Secure URL pipeline sanitization layer matrix checker
  const formatSecureDynamicUrl = (url, defaultUrl) => {
    if (!url || typeof url !== 'string' || url.trim() === '' || url === '#') return defaultUrl;
    let baseCleanUrl = url.trim();
    if (!baseCleanUrl.startsWith('http://') && !baseCleanUrl.startsWith('https://')) {
      return `https://${baseCleanUrl}`;
    }
    return baseCleanUrl;
  };

  const instagramPath = formatSecureDynamicUrl(cmsConfig?.social_links?.instagram, 'https://instagram.com');
  const facebookPath = formatSecureDynamicUrl(cmsConfig?.social_links?.facebook, 'https://facebook.com');
  const xPath = formatSecureDynamicUrl(cmsConfig?.social_links?.x, 'https://x.com');

  if (loading) {
    return (
      <div className="w-full h-[160px] bg-[var(--bg-luxury,#EFECE3)] border-t border-neutral-900/5 animate-pulse px-6 py-8 flex flex-col justify-between">
        <div className="flex justify-between items-center w-full">
          <div className="w-36 h-6 bg-neutral-900/10 rounded"></div>
          <div className="w-40 h-4 bg-neutral-900/10 rounded"></div>
        </div>
        <div className="w-full h-[1px] bg-neutral-900/10"></div>
        <div className="w-48 h-3 bg-neutral-900/10 rounded"></div>
      </div>
    );
  }

  return (
    <footer 
      style={{ backgroundColor: 'var(--bg-luxury, #EFECE3)', borderColor: 'rgba(26,26,26,0.08)' }}
      className="w-full border-t pt-10 pb-8 px-6 md:px-12 transition-colors duration-500 mt-auto"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* UPPER PANEL: LOGO & SOCIALS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 w-full">
          
          <Link to="/" className="flex items-center select-none">
            {!imgFailed && logoImage ? (
              <img
                src={logoImage}
                alt={logoText}
                className="h-10 w-auto object-contain"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span 
                style={{ color: 'var(--text-luxury, #1A1A1A)' }}
                className="text-lg md:text-xl font-semibold tracking-[0.12em] font-display uppercase italic transition-all hover:opacity-75"
              >
                {logoText}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-4">
            <a
              href={instagramPath}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Platform Connection Portal"
              style={{ color: 'var(--text-luxury, #1A1A1A)' }}
              className="hover:text-[var(--primary-accent)] opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
              </svg>
            </a>

            <a
              href={xPath}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X Studio Media Feed Connection"
              style={{ color: 'var(--text-luxury, #1A1A1A)' }}
              className="hover:text-[var(--primary-accent)] opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300"
            >
              <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href={facebookPath}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Brand Page"
              style={{ color: 'var(--text-luxury, #1A1A1A)' }}
              className="hover:text-[var(--primary-accent)] opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300"
            >
              <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="w-full h-[1px] bg-neutral-900/5 my-2"></div>

        {/* LOWER PANEL: COPYRIGHT & LINKS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full text-left">
          
          <p 
            style={{ color: 'var(--text-luxury, #1A1A1A)' }}
            className="text-[11px] md:text-[12px] font-light tracking-[0.18em] font-body opacity-70 uppercase"
          >
            {copyrightText}
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {navigationMenu.map((route, idx) => (
              <li key={idx} className="relative group">
                <Link
                  to={route.path}
                  style={{ color: 'var(--text-luxury, #1A1A1A)' }}
                  className="text-sm font-medium tracking-[0.12em] uppercase font-display block py-1 opacity-80 hover:opacity-100 transition-all duration-300 relative"
                >
                  {route.label}
                  <span 
                    style={{ backgroundColor: 'var(--primary-accent, #C9A84C)' }}
                    className="absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"
                  ></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;