import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Save, Plus, Trash2, Edit3, Check, X, Layout, Image as ImageIcon, List, ShieldAlert, CheckCircle, RefreshCw, Package, LogOut, MessageSquareQuote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TestimonialControl from './TestimonialControl';

// ====================================================================
// 📂 SUB-COMPONENT 1: IDENTITY & NAVBAR LAYER (WITH INLINE EDITING)
// ====================================================================
function IdentityNavbarTab({ config, setConfig, newMenu, setNewMenu, onAddNavItem, onRemoveNavItem }) {
  const menuItems = Array.isArray(config?.navigation_menu) ? config.navigation_menu : [];
  const [editingNavIndex, setEditingNavIndex] = useState(null);
  const [editNavData, setEditNavData] = useState({ label: '', path: '' });

  const startEditingNav = (idx, item) => {
    setEditingNavIndex(idx);
    setEditNavData({ label: item.label, path: item.path });
  };

  const saveInlineNavEdit = (idx) => {
    const updatedMenu = [...menuItems];
    updatedMenu[idx] = editNavData;
    setConfig(prev => ({ ...prev, navigation_menu: updatedMenu }));
    setEditingNavIndex(null);
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 items-start min-w-0">
      
      {/* BRAND TEXT & THEME CONFIGS */}
      <div className="flex flex-col gap-8 w-full">
        
        {/* Core Identity */}
        <div className="w-full bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-5 text-left shadow-sm">
          <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">Brand Core Identity</h3>
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Branding Logo Text</label>
            <input type="text" value={config?.logo_text || ''} onChange={(e) => setConfig(prev => ({ ...prev, logo_text: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Custom Logo Image URL</label>
            <input type="text" value={config?.logo_image_url || ''} onChange={(e) => setConfig(prev => ({ ...prev, logo_image_url: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-4 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Copyright Text Manifesto</label>
            <input type="text" value={config?.copyright_text || ''} onChange={(e) => setConfig(prev => ({ ...prev, copyright_text: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
          </div>
          
          {/* 🔗 SOCIAL MEDIA CONNECTIONS MATRIX */}
          <div className="flex flex-col gap-4 border-t border-neutral-100 pt-5 mt-2 w-full">
            <h4 className="font-['Playfair_Display'] text-base font-medium text-[#b5862a] mb-1">Social Networks Architecture</h4>
            
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-2">
                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 font-mono font-bold">IG</span> Instagram URL Link
              </label>
              <input type="text" placeholder="https://instagram.com/brand" value={config?.social_links?.instagram || ''} onChange={(e) => setConfig(prev => ({ ...prev, social_links: { ...(prev.social_links || {}), instagram: e.target.value } }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-2">
                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 font-mono font-bold">FB</span> Facebook Profile Link
              </label>
              <input type="text" placeholder="https://facebook.com/brand" value={config?.social_links?.facebook || ''} onChange={(e) => setConfig(prev => ({ ...prev, social_links: { ...(prev.social_links || {}), facebook: e.target.value } }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-2">
                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 font-mono font-bold">X</span> X / Twitter Handle Link
              </label>
              <input type="text" placeholder="https://x.com/brand" value={config?.social_links?.x || ''} onChange={(e) => setConfig(prev => ({ ...prev, social_links: { ...(prev.social_links || {}), x: e.target.value } }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
            </div>
          </div>
        </div>
{/* 🔥 NEW ARRIVALS PAGE SETTINGS (NEW BLOCK ADDED HERE) */}
        <div className="w-full bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-5 text-left shadow-sm">
          <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">
            New Arrivals Page Settings
          </h3>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Eyebrow Text (Small Top Text)</label>
            <input type="text" placeholder="e.g. Just Dropped" value={config?.new_arrivals_eyebrow || ''} onChange={(e) => setConfig(prev => ({ ...prev, new_arrivals_eyebrow: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a]" />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Main Header Title</label>
            <input type="text" placeholder="e.g. New Arrivals" value={config?.new_arrivals_title || ''} onChange={(e) => setConfig(prev => ({ ...prev, new_arrivals_title: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a]" />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Page Description</label>
            <textarea rows={4} placeholder="Explore the freshest..." value={config?.new_arrivals_subtitle || ''} onChange={(e) => setConfig(prev => ({ ...prev, new_arrivals_subtitle: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] resize-y" />
          </div>
        </div>
        {/* 🔥 NEW SECTION: COLLECTION HIGHLIGHT SETTINGS */}
        <div className="w-full bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-5 text-left shadow-sm">
          <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">
            Homepage Product Slider Settings
          </h3>
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Collection Header Title</label>
            <input type="text" placeholder="e.g. Sunkissed Stories" value={config?.collection_title || ''} onChange={(e) => setConfig(prev => ({ ...prev, collection_title: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Collection Narrative Description</label>
            <textarea rows={4} placeholder="Describe the vibe of this collection..." value={config?.collection_description || ''} onChange={(e) => setConfig(prev => ({ ...prev, collection_description: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a] font-light leading-relaxed resize-y" />
          </div>
        </div>

      </div>

      {/* DYNAMIC NAVIGATION LINK MATRIX */}
      <div className="w-full bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-6 text-left shadow-sm">
        <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">Navigation Links Menu</h3>
        
        <div className="bg-[#f7f4ef]/60 p-4 rounded-xl border border-dashed border-neutral-200 flex flex-col gap-3 w-full">
          <div className="flex flex-col md:flex-row gap-3 items-end w-full">
            <div className="w-full md:w-[40%] flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold text-neutral-400">Visual Label</span>
              <input type="text" placeholder="e.g., Shop Lounge" value={newMenu.label} onChange={(e) => setNewMenu(p => ({ ...p, label: e.target.value }))} className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-md focus:outline-none focus:border-[#b5862a]" />
            </div>
            <div className="w-full md:w-[40%] flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold text-neutral-400">Route Path</span>
              <input type="text" placeholder="e.g., /shop" value={newMenu.path} onChange={(e) => setNewMenu(p => ({ ...p, path: e.target.value }))} className="w-full bg-white border border-neutral-200 p-2.5 text-xs rounded-md font-mono focus:outline-none focus:border-[#b5862a]" />
            </div>
            <button type="button" onClick={onAddNavItem} className="w-full md:w-[20%] bg-neutral-900 text-white py-2.5 rounded-md text-xs font-bold uppercase hover:bg-[#b5862a] tracking-wider flex justify-center items-center gap-1"><Plus size={12} /> Add</button>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto w-full pr-1">
          {menuItems.map((menuItem, idx) => (
            <div key={idx} className="w-full bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
              {editingNavIndex === idx ? (
                <div className="flex flex-col sm:flex-row gap-2 flex-grow mr-4 text-left w-full">
                  <input type="text" value={editNavData.label} onChange={(e) => setEditNavData(p => ({ ...p, label: e.target.value }))} className="bg-white border p-2 text-xs rounded flex-grow" />
                  <input type="text" value={editNavData.path} onChange={(e) => setEditNavData(p => ({ ...p, path: e.target.value }))} className="bg-white border p-2 text-xs rounded font-mono flex-grow" />
                  <div className="flex gap-1.5 justify-end">
                    <button type="button" onClick={() => saveInlineNavEdit(idx)} className="p-2 bg-green-600 text-white rounded-md"><Check size={12} /></button>
                    <button type="button" onClick={() => setEditingNavIndex(null)} className="p-2 bg-neutral-400 text-white rounded-md"><X size={12} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-bold text-neutral-800">{menuItem.label}</p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{menuItem.path}</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <button type="button" onClick={() => startEditingNav(idx, menuItem)} className="p-2 text-neutral-400 hover:text-[#b5862a] transition-colors"><Edit3 size={14} /></button>
                    <button type="button" onClick={() => onRemoveNavItem(idx)} className="p-2 text-neutral-300 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ====================================================================
// 📂 SUB-COMPONENT 2: HERO BANNER DESIGN MANAGER
// ====================================================================
function HeroSectionTab({ config, setConfig, newHeroImg, setNewHeroImg, onAddHeroImage, onRemoveHeroImage }) {
  const heroImages = Array.isArray(config?.hero_images) ? config.hero_images : [];

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 items-start min-w-0">
      
      {/* LEFT COLUMN: HERO TEXT COPIES CONTROLLERS */}
      <div className="w-full bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-5 text-left shadow-sm">
        <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">
          Hero Copy Typography
        </h3>
        
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Hero Eyebrow Text</label>
          <input type="text" value={config?.hero_eyebrow || ''} onChange={(e) => setConfig(prev => ({ ...prev, hero_eyebrow: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Main Banner Title (Header Base)</label>
          <input type="text" value={config?.hero_title_main || ''} onChange={(e) => setConfig(prev => ({ ...prev, hero_title_main: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Italic Highlight Accent Title</label>
          <input type="text" value={config?.hero_title_highlight || ''} onChange={(e) => setConfig(prev => ({ ...prev, hero_title_highlight: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Hero Subtitle Narrative Text</label>
          <textarea rows={3} value={config?.hero_subtitle || ''} onChange={(e) => setConfig(prev => ({ ...prev, hero_subtitle: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a] font-light leading-relaxed" />
        </div>

        <div className="flex flex-col gap-4 border-t border-neutral-100 pt-4 mt-2 w-full">
          <div className="w-full flex flex-col gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-[10px] uppercase font-bold tracking-wide text-[#b5862a]">Primary Button</span>
            <input type="text" placeholder="Label Text" value={config?.hero_cta_text_1 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_text_1: e.target.value }))} className="w-full bg-white border p-2 text-xs rounded focus:outline-none" />
            <input type="text" placeholder="Route Path" value={config?.hero_cta_link_1 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_link_1: e.target.value }))} className="w-full bg-white border p-2 text-xs rounded font-mono focus:outline-none" />
          </div>
          <div className="w-full flex flex-col gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-[10px] uppercase font-bold tracking-wide text-neutral-400">Secondary Button</span>
            <input type="text" placeholder="Label Text" value={config?.hero_cta_text_2 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_text_2: e.target.value }))} className="w-full bg-white border p-2 text-xs rounded focus:outline-none" />
            <input type="text" placeholder="Route Path" value={config?.hero_cta_link_2 || ''} onChange={(e) => setConfig(p => ({ ...p, hero_cta_link_2: e.target.value }))} className="w-full bg-white border p-2 text-xs rounded font-mono focus:outline-none" />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: IMAGES CANVAS BUCKET */}
      <div className="w-full bg-white border border-neutral-200 p-6 rounded-xl flex flex-col gap-6 text-left shadow-sm">
        <div>
          <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">
            Res Editorial Imagery Canvas
          </h3>
          <p className="text-neutral-400 text-xs font-light mt-1.5">Append secure image destination URLs to run inside the main slider module loops.</p>
        </div>

        {/* INPUT RECTOR FOR INJECTING NEW BLOCKS */}
        <div className="w-full flex flex-col sm:flex-row gap-2 bg-neutral-50 border border-neutral-200 p-2 rounded-lg items-center">
          <input 
            type="text" 
            placeholder="Paste secure image destination web URL link here..." 
            value={newHeroImg}
            onChange={(e) => setNewHeroImg(e.target.value)}
            className="w-full sm:flex-grow bg-white border border-neutral-200 p-2.5 text-xs focus:outline-none focus:border-[#b5862a] rounded-md text-[#1a1a1a]" 
          />
          <button 
            type="button" 
            onClick={onAddHeroImage} 
            className="w-full sm:w-auto bg-[#1a1a1a] text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#b5862a] flex-shrink-0"
          >
            Append Image
          </button>
        </div>

        {/* 🔥 FIXED IMAGES MONITOR MATRIX: COMPACT 3x3 GRID MATRIX */}
        <div className="w-full border-t border-neutral-100 pt-5 mt-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 block mb-4">
            Live Active Banners ({heroImages.length})
          </span>
          
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto p-1">
            {heroImages.map((imgUrl, idx) => (
              <div 
                key={idx} 
                className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl flex flex-col gap-3 relative shadow-sm min-w-0"
              >
                <div className="w-full h-28 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-200 relative flex-shrink-0">
                  <img 
                    src={imgUrl} 
                    alt="Couture framework line preview asset" 
                    className="w-full h-full object-cover object-top" 
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-[9px] text-white font-mono px-2 py-0.5 rounded">Slot #{idx + 1}</span>
                  
                  <button 
                    type="button" 
                    onClick={() => onRemoveHeroImage(idx)} 
                    className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-600 text-red-600 hover:text-white rounded-full shadow-md transition-colors duration-300 border border-neutral-100 flex items-center justify-center cursor-pointer z-10"
                    title="Purge image slide link node row"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="w-full flex flex-col gap-0.5 text-left">
                  <span className="text-[8px] uppercase font-bold text-neutral-400 tracking-tight">Edit URL String:</span>
                  <input 
                    type="text" 
                    value={imgUrl} 
                    onChange={(e) => {
                      const mutatedImages = [...heroImages];
                      mutatedImages[idx] = e.target.value;
                      setConfig(prev => ({ ...prev, hero_images: mutatedImages }));
                    }}
                    className="w-full bg-white border border-neutral-200 p-2 text-[11px] font-mono rounded-md text-neutral-700 focus:outline-none focus:border-[#b5862a]"
                    placeholder="Branding source url path"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ====================================================================
// 📂 SUB-COMPONENT 3: FEATURES LAYOUT MATRIX (WITH INLINE EDITING)
// ====================================================================
function FeaturesGridTab({ config, setConfig, newFeature, setNewFeature, onAddFeatureItem, onRemoveFeatureItem }) {
  const features = Array.isArray(config?.features_list) ? config.features_list : [];
  const [editingFeatureIndex, setEditingFeatureIndex] = useState(null);
  const [editFeatureData, setEditFeatureData] = useState({ title: '', description: '' });

  const startEditingFeature = (idx, item) => {
    setEditingFeatureIndex(idx);
    setEditFeatureData({ title: item.title, description: item.description });
  };

  const saveInlineFeatureEdit = (idx) => {
    const updatedFeatures = [...features];
    updatedFeatures[idx] = editFeatureData;
    setConfig(prev => ({ ...prev, features_list: updatedFeatures }));
    setEditingFeatureIndex(null);
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 items-start min-w-0">
      
      {/* LEFT CELL: FEATURE CREATION HOOK CARD */}
      <div className="w-full bg-white border border-neutral-200 p-6 rounded-xl text-left flex flex-col gap-4 shadow-sm">
        <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">Append Brand Core Feature</h3>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Feature Card Headline Title</label>
          <input type="text" placeholder="e.g., Artisanal Stitching" value={newFeature.title} onChange={(e) => setNewFeature(p => ({ ...p, title: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Card Narrative Description</label>
          <textarea rows={4} placeholder="Describe your unique tailoring standard layout advantage..." value={newFeature.description} onChange={(e) => setNewFeature(p => ({ ...p, description: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] font-light text-[#1a1a1a] leading-relaxed" />
        </div>
        <button type="button" onClick={onAddFeatureItem} className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#b5862a] transition-all duration-300 mt-2 flex justify-center items-center gap-1.5 shadow-sm">
          <Plus size={14} /> Inject Feature Card
        </button>
      </div>

      {/* RIGHT CELL: INLINE EDITABLE LIST CARDS MONITOR */}
      <div className="flex flex-col gap-5 text-left min-w-0">
        <div className="bg-white p-5 border border-neutral-200 rounded-xl shadow-sm w-full">
          <span className="text-[0.65rem] tracking-[0.3em] font-bold text-[#b5862a] uppercase block mb-1">Live Manifest Monitor</span>
          <h3 className="font-['Playfair_Display'] text-xl font-normal text-neutral-800">Active Structural Features Grid Elements</h3>
        </div>

        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1 w-full">
          {features.map((item, idx) => (
            <div key={idx} className="w-full bg-white p-5 rounded-xl border border-neutral-200 flex gap-4 items-start justify-between shadow-sm hover:shadow-md transition-all duration-300 text-left">
              
              {editingFeatureIndex === idx ? (
                <div className="flex flex-col gap-3 flex-grow mr-4 text-left w-full">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase text-neutral-400 font-bold">Edit Feature Headline</span>
                    <input type="text" value={editFeatureData.title} onChange={(e) => setEditFeatureData(p => ({ ...p, title: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-xs rounded-md focus:outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase text-neutral-400 font-bold">Edit Description Narrative</span>
                    <textarea rows={3} value={editFeatureData.description} onChange={(e) => setEditFeatureData(p => ({ ...p, description: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-xs rounded-md focus:outline-none font-light leading-relaxed" />
                  </div>
                  <div className="flex gap-2 pt-1 justify-end">
                    <button type="button" onClick={() => saveInlineFeatureEdit(idx)} className="px-4 py-2 bg-green-600 text-white text-[10px] font-bold uppercase rounded-md tracking-wider flex items-center gap-1"><Check size={11} /> Save</button>
                    <button type="button" onClick={() => setEditingFeatureIndex(null)} className="px-4 py-2 bg-neutral-400 text-white text-[10px] font-bold uppercase rounded-md tracking-wider flex items-center gap-1"><X size={11} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 items-start">
                    <span className="w-7 h-7 bg-[#b5862a] text-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 shadow-sm">{idx + 1}</span>
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-[0.95rem] font-bold tracking-wide text-neutral-900">{item.title}</h4>
                      <p className="text-xs text-neutral-500 font-light leading-relaxed mt-1 max-w-xl">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => startEditingFeature(idx, item)} className="p-2 text-neutral-400 hover:text-[#b5862a] transition-colors rounded-full hover:bg-neutral-50"><Edit3 size={15} /></button>
                    <button type="button" onClick={() => onRemoveFeatureItem(idx)} className="text-neutral-300 hover:text-red-600 p-2 transition-colors rounded-full hover:bg-neutral-50"><Trash2 size={16} /></button>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

// ====================================================================
// 👑 MAIN MASTER PLATFORM CONTROL DESK ORCHESTRATOR WITH SYSTEM SIDEBAR
// ====================================================================
export default function AdminCMSDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('identity'); 
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  const [config, setConfig] = useState({
    logo_text: '', logo_image_url: '', accent_color_hex: '#C9A84C', bg_color_hex: '#EFECE3', text_color_hex: '#1A1A1A',
    navigation_menu: [], hero_eyebrow: '', hero_title_main: '', hero_title_highlight: '', hero_subtitle: '',
    hero_images: [], hero_cta_text_1: '', hero_cta_link_1: '', hero_cta_text_2: '', hero_cta_link_2: '',
    copyright_text: '', features_list: [], social_links: { instagram: '', facebook: '', x: '' },
    collection_title: '', collection_description: '',
    new_arrivals_eyebrow: 'Just Dropped', new_arrivals_title: 'New Arrivals', new_arrivals_subtitle: 'Explore the freshest silhouettes...', // 🔥 Initialize new fields
  });

  const [newMenu, setNewMenu] = useState({ label: '', path: '/' });
  const [newHeroImg, setNewHeroImg] = useState('');
  const [newFeature, setNewFeature] = useState({ title: '', description: '' });

  useEffect(() => {
    // 🛡️ STRICT PRODUCTION PROTECTION ACCESS LAYER
    const adminToken = localStorage.getItem('adm_tk');
    if (!adminToken) {
      console.warn("🚨 [SECURITY INTERCEPT]: Unauthorized dashboard path execution route blocked.");
      navigate('/designer-studio-gate'); 
      return;
    }

    const fetchCurrentSettings = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/cms/manifest');
        if (res.data) {
          setConfig({
            ...res.data,
            navigation_menu: Array.isArray(res.data.navigation_menu) ? res.data.navigation_menu : [],
            hero_images: Array.isArray(res.data.hero_images) ? res.data.hero_images : [],
            features_list: Array.isArray(res.data.features_list) ? res.data.features_list : [],
            social_links: res.data.social_links && typeof res.data.social_links === 'object' 
              ? { instagram: '', facebook: '', x: '', ...res.data.social_links }
              : { instagram: '', facebook: '', x: '' },
            collection_title: res.data.collection_title || '', // Fallback to empty string
            collection_description: res.data.collection_description || ''
          });
        }
      } catch (err) {
        triggerNotification('error', 'Failed to retrieve active database configuration layout models.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentSettings();
  }, [navigate]);

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  const handleSaveCMSManifest = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const res = await axiosInstance.put('/cms/crm-update', config);
      if (res.data?.success) {
        triggerNotification('success', 'Layout changes written and updated cleanly across production endpoints!');
      }
    } catch (err) {
      triggerNotification('error', 'Failed to submit dynamic update payload ledger parameters.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('adm_tk');
    navigate('/designer-studio-gate');
  };

  // Mutators Link Pipes Handlers
  const handleAddNavItem = () => {
    if (!newMenu.label.trim()) return;
    setConfig(prev => ({ ...prev, navigation_menu: [...prev.navigation_menu, newMenu] }));
    setNewMenu({ label: '', path: '/' });
  };
  const handleRemoveNavItem = (idx) => {
    setConfig(prev => ({ ...prev, navigation_menu: prev.navigation_menu.filter((_, i) => i !== idx) }));
  };

  const handleAddHeroImage = () => {
    if (!newHeroImg.trim()) return;
    setConfig(prev => ({ ...prev, hero_images: [...prev.hero_images, newHeroImg.trim()] }));
    setNewHeroImg('');
  };
  const handleRemoveHeroImage = (indexToRemove) => {
    setConfig(prev => ({
      ...prev,
      hero_images: prev.hero_images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddFeatureItem = () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) return;
    setConfig(prev => ({ ...prev, features_list: [...prev.features_list, newFeature] }));
    setNewFeature({ title: '', description: '' });
  };
  const handleRemoveFeatureItem = (idx) => {
    setConfig(prev => ({ ...prev, features_list: prev.features_list.filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f7f4ef] flex flex-col items-center justify-center text-[#1a1a1a]">
        <RefreshCw size={24} className="animate-spin text-[#b5862a] mb-4" />
        <p className="text-xs font-bold tracking-[0.3em] uppercase">Hydrating Admin Control Desk...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] flex items-stretch overflow-x-hidden">
      
      {/* 🕶️ PREMIUM LEFT SIDEBAR ARCHITECTURE PANEL */}
      <aside className="w-64 bg-[#1a1a1a] text-white flex flex-col justify-between p-6 select-none flex-shrink-0 hidden md:flex border-r border-neutral-800">
        <div className="flex flex-col gap-8 text-left">
          {/* Dashboard Head Framework Brand Title */}
          <div>
            <span className="text-[9px] tracking-[0.3em] text-[#b5862a] uppercase font-bold block mb-0.5">Control Terminal v1.0</span>
            <h2 className="font-['Playfair_Display'] text-lg font-normal tracking-wide text-neutral-100">PREETI COUTURE</h2>
          </div>

          {/* Nav Links Node Mapping Selection List */}
          <div className="flex flex-col gap-1.5 w-full">
            <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 mb-2 block">CMS Brand Layouts</span>
            
            <button 
              type="button" 
              onClick={() => setActiveTab('identity')} 
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-md text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'identity' ? 'bg-[#b5862a] text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Layout size={14} /> Identity & Navbar
            </button>
            
            <button 
              type="button" 
              onClick={() => setActiveTab('hero')} 
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-md text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'hero' ? 'bg-[#b5862a] text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <ImageIcon size={14} /> Hero Showcase
            </button>
            
            <button 
              type="button" 
              onClick={() => setActiveTab('features')} 
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-md text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'features' ? 'bg-[#b5862a] text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <List size={14} /> Features Grid
            </button>
            
            <button 
              onClick={() => setActiveTab('reviews')} 
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-md text-xs font-bold uppercase transition-all ${
                activeTab === 'reviews' ? 'bg-[#b5862a] text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <MessageSquareQuote size={14} /> Reviews Control
            </button>
            
            <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 mt-6 mb-2 block">Catalog Inventory</span>
            
            {/* 🔥 CROSS NAVIGATION REDIRECT TO PRODUCTS CONTROL TERM */}
            <button 
              type="button" 
              onClick={() => navigate('/admin/products-control')} 
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-md text-xs font-bold tracking-wider uppercase text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all"
            >
              <Package size={14} /> Products Catalog
            </button>
          </div>
        </div>

        {/* Sidebar Foot Action Button */}
        <button 
          type="button" 
          onClick={handleLogOut} 
          className="w-full flex items-center gap-2 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/20 transition-all text-left"
        >
          <LogOut size={14} /> Evacuate Session
        </button>
      </aside>

      {/* 👑 RIGHT WORKSPACE CANVAS VIEW PORT AREA */}
      <main className="flex-grow p-6 sm:p-10 lg:p-12 overflow-y-auto block text-left">
        <div className="max-w-[1400px] mx-auto w-full">
          
          {/* DYNAMIC DASHBOARD TOP ALIGNMENT HEADER */}
          <div className="w-full border-b border-[#e8e2d8] pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
            <div>
              <span className="text-[10px] tracking-[0.30em] uppercase text-[#b5862a] font-bold block mb-0.5">Administrative Section Dashboard</span>
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-normal text-neutral-800">
                {activeTab === 'identity' && 'Identity & Navigation Matrix'}
                {activeTab === 'hero' && 'Hero Layout Architecture'}
                {activeTab === 'features' && 'Features Structural Grid'}
                {activeTab === 'reviews' && 'Customer Reviews Control'}
              </h1>
            </div>
            
            {/* Save Button (Hide on Reviews Tab since Reviews save instantly) */}
            {activeTab !== 'reviews' && (
              <button 
                type="button" 
                onClick={handleSaveCMSManifest} 
                disabled={isSaving} 
                className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-xs font-bold tracking-[0.2em] uppercase rounded-md shadow-md hover:bg-[#b5862a] disabled:bg-neutral-400 transition-all duration-300 flex-shrink-0"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {isSaving ? 'Publishing Updates...' : 'Publish Layout Changes'}
              </button>
            )}
          </div>

          {/* NOTIFICATION PIPELINE TOAST FEEDBACK ALERTS */}
          {notification.message && (
            <div className={`w-full p-4 mb-8 rounded-lg flex items-center gap-3 border text-sm shadow-sm transition-all ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
              <p className="font-medium tracking-wide text-left">{notification.message}</p>
            </div>
          )}

          {/* 🔥 ACTIVE SUBTAB VIEW INJECTIONS MAP 🔥 */}
          <div className="w-full block mt-2">
            {activeTab === 'identity' && (
              <IdentityNavbarTab config={config} setConfig={setConfig} newMenu={newMenu} setNewMenu={setNewMenu} onAddNavItem={handleAddNavItem} onRemoveNavItem={handleRemoveNavItem} />
            )}
            
            {activeTab === 'hero' && (
              <HeroSectionTab config={config} setConfig={setConfig} newHeroImg={newHeroImg} setNewHeroImg={setNewHeroImg} onAddHeroImage={handleAddHeroImage} onRemoveHeroImage={handleRemoveHeroImage} />
            )}
            
            {activeTab === 'features' && (
              <FeaturesGridTab config={config} setConfig={setConfig} newFeature={newFeature} setNewFeature={setNewFeature} onAddFeatureItem={handleAddFeatureItem} onRemoveFeatureItem={handleRemoveFeatureItem} />
            )}
            
            {activeTab === 'reviews' && (
              <TestimonialControl />
            )}
          </div>

        </div>
      </main>

    </div>
  );
}