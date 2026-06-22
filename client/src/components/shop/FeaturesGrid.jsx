import React, { useContext } from 'react';
import { CMSContext } from '../../context/CMSContext';

export default function FeaturesGrid() {
  const { cmsConfig } = useContext(CMSContext);

  // Exact fallback matrix values from your screenshot if backend goes offline
  const offlineFeaturesFallback = [
    {
      title: "High Quality Fabrics",
      description: "Our outfits are cut from premium fabrics with a fit so good, that it feels custom made, just for you."
    },
    {
      title: "Free Shipping",
      description: "Free shipping is available on all prepaid orders above 1500 within India."
    },
    {
      title: "In-House Production",
      description: "We have full control over the quality of products since we are one of the few brands that designs & produces its own garment."
    }
  ];

  // Map dynamic backend array or trigger offline defaults standard
  const activeFeatures = cmsConfig?.features_list && cmsConfig.features_list.length > 0
    ? cmsConfig.features_list
    : offlineFeaturesFallback;

  return (
    <section 
      style={{ backgroundColor: 'var(--bg-luxury, #EFECE3)' }}
      className="w-full py-20 px-6 md:px-16 transition-colors duration-500"
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 text-center">
        {activeFeatures.map((item, idx) => (
          <div 
            key={idx} 
            className="flex flex-col items-center justify-start gap-4 max-w-sm mx-auto group"
          >
            {/* Dynamic Feature Title Text Layout */}
            <h3 
              style={{ color: 'var(--text-luxury, #1A1A1A)' }}
              className="text-xl md:text-2xl font-normal tracking-wide font-display transition-colors duration-300 group-hover:text-[var(--primary-accent)]"
            >
              {item.title}
            </h3>

            {/* Dynamic Description Text Block */}
            <p 
              style={{ color: 'var(--text-luxury, #1A1A1A)' }}
              className="text-[13px] md:text-[14px] font-light tracking-wide leading-relaxed font-body opacity-75 max-w-[320px]"
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}