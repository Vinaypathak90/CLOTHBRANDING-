import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function HeroSectionTab({ config, setConfig, newHeroImg, setNewHeroImg, onAddHeroImage, onRemoveHeroImage }) {
  // 🛡️ SAFE ARRAY EXTRACTION: Prevents rendering breakdown if array is uninitialized
  const heroImages = Array.isArray(config?.hero_images) ? config.hero_images : [];

  return (
    <div className="w-full flex flex-col lg:flex-row lg:justify-between gap-8 items-start block min-w-0">
      
      {/* ── LEFT COLUMN: EDITORIAL TYPOGRAPHY INPUT FIELDS ── */}
      <div className="w-full lg:w-[49%] bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-5 text-left block min-w-0">
        <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3 block w-full">
          Hero Copy Typography
        </h3>
        
        <div className="w-full flex flex-col gap-1.5 block">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block">Hero Eyebrow Text</label>
          <input 
            type="text" 
            value={config?.hero_eyebrow || ''} 
            onChange={(e) => setConfig(prev => ({ ...prev, hero_eyebrow: e.target.value }))} 
            className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a] block" 
          />
        </div>

        <div className="w-full flex flex-col gap-1.5 block">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block">Main Banner Title (Header Base)</label>
          <input 
            type="text" 
            value={config?.hero_title_main || ''} 
            onChange={(e) => setConfig(prev => ({ ...prev, hero_title_main: e.target.value }))} 
            className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a] block" 
          />
        </div>

        <div className="w-full flex flex-col gap-1.5 block">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block">Italic Highlight Accent Title</label>
          <input 
            type="text" 
            value={config?.hero_title_highlight || ''} 
            onChange={(e) => setConfig(prev => ({ ...prev, hero_title_highlight: e.target.value }))} 
            className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a] block" 
          />
        </div>

        <div className="w-full flex flex-col gap-1.5 block">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block">Hero Subtitle Narrative</label>
          <textarea 
            rows={3} 
            value={config?.hero_subtitle || ''} 
            onChange={(e) => setConfig(prev => ({ ...prev, hero_subtitle: e.target.value }))} 
            className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a] font-light leading-relaxed block" 
          />
        </div>

        {/* DUAL CTA BUTTON CONFIGURATOR BLOCKS */}
        <div className="flex flex-col sm:flex-row gap-4 border-t border-neutral-100 pt-4 mt-2 w-full block">
          <div className="w-full sm:w-1/2 flex flex-col gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg block">
            <span className="text-[10px] uppercase font-bold tracking-wide text-[#b5862a] block">Primary CTA Button</span>
            <input type="text" placeholder="Label Text" value={config?.hero_cta_text_1 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_text_1: e.target.value }))} className="w-full bg-white border border-neutral-200 p-2 text-xs rounded-md focus:outline-none block" />
            <input type="text" placeholder="Route Path" value={config?.hero_cta_link_1 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_link_1: e.target.value }))} className="w-full bg-white border border-neutral-200 p-2 text-xs rounded-md font-mono focus:outline-none block" />
          </div>
          <div className="w-full sm:w-1/2 flex flex-col gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg block">
            <span className="text-[10px] uppercase font-bold tracking-wide text-neutral-400 block">Secondary CTA Button</span>
            <input type="text" placeholder="Label Text" value={config?.hero_cta_text_2 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_text_2: e.target.value }))} className="w-full bg-white border border-neutral-200 p-2 text-xs rounded-md focus:outline-none block" />
            <input type="text" placeholder="Route Path" value={config?.hero_cta_link_2 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_link_2: e.target.value }))} className="w-full bg-white border border-neutral-200 p-2 text-xs rounded-md font-mono focus:outline-none block" />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: HIGH-RES EDITORIAL IMAGES CANVAS ── */}
      <div className="w-full lg:w-[49%] bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-6 text-left block min-w-0">
        <div className="block w-full">
          <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3 block">
            Res Editorial Imagery Canvas
          </h3>
          <p className="text-neutral-400 text-xs font-light mt-1.5 block">Append secure image destination URLs to run inside the fullscreen main banner slideshow module.</p>
        </div>

        {/* NEW IMAGE LINK ADD INPUT OVERLAY */}
        <div className="w-full flex flex-col sm:flex-row gap-2 bg-neutral-50 border border-neutral-200 p-2 rounded-lg items-center block">
          <input 
            type="text" 
            placeholder="Paste secure asset link URL here..." 
            value={newHeroImg}
            onChange={(e) => setNewHeroImg(e.target.value)}
            className="w-full sm:flex-grow bg-white border border-neutral-200 p-2.5 text-xs focus:outline-none focus:border-[#b5862a] rounded-md text-[#1a1a1a] block" 
          />
          <button 
            type="button" 
            onClick={onAddHeroImage} 
            className="w-full sm:w-auto bg-[#1a1a1a] text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#b5862a] transition-all flex-shrink-0 block"
          >
            Append Image
          </button>
        </div>

        {/* DYNAMIC COMPACT IMAGES MONITOR MATRIX */}
        <div className="w-full border-t border-neutral-100 pt-4 block">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-3">Live Active Banners ({heroImages.length})</span>
          
          {/* 🔥 COMPACT FLEXIBLE DISPLAY GRID LAYER */}
          <div className="w-full flex flex-wrap gap-4 max-h-[400px] overflow-y-auto pb-2">
            {heroImages.map((imgUrl, idx) => (
              <div 
                key={idx} 
                className="w-[90px] h-[120px] bg-neutral-50 rounded-lg border border-neutral-200 relative overflow-hidden flex-shrink-0 shadow-2xs group block"
              >
                <img src={imgUrl} alt={`Couture banner background ${idx}`} className="w-full h-full object-cover object-top" />
                
                {/* 🗑️ HIGHLY CLICKABLE ACCURATE DELETION TRIGGER TARGET */}
                <div className="absolute top-1 right-1 opacity-90 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    type="button" 
                    onClick={() => onRemoveHeroImage(idx)} 
                    className="p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full shadow-md transition-colors duration-300 border border-transparent block"
                    title="Remove banner image"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full bg-black/60 py-1 text-center text-white text-[8px] font-mono tracking-tight">
                  Slot #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}