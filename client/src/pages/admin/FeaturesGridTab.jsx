import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function FeaturesGridTab({ config, newFeature, setNewFeature, onAddFeatureItem, onRemoveFeatureItem }) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT CELL: FEATURE CREATION HOOK */}
      <div className="lg:col-span-5 bg-white border border-neutral-200 p-6 rounded-xl text-left flex flex-col gap-4 w-full">
        <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#b5862a] border-b border-neutral-100 pb-3">
          Append Brand Core Feature
        </h3>
        
        <div className="w-full flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Feature Card Headline Title</label>
          <input 
            type="text" 
            placeholder="e.g., Organic Silk Linings" 
            value={newFeature.title}
            onChange={(e) => setNewFeature(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]" 
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Card Narrative Description</label>
          <textarea 
            rows={4} 
            placeholder="Describe the exceptional tailoring technique or logisitcs advantage..." 
            value={newFeature.description}
            onChange={(e) => setNewFeature(p => ({ ...p, description: e.target.value }))}
            className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] font-light text-[#1a1a1a] leading-relaxed" 
          />
        </div>

        <button 
          type="button" 
          onClick={onAddFeatureItem} 
          className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#b5862a] transition-all duration-300 mt-2 flex justify-center items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} /> Inject Feature Card
        </button>
      </div>

      {/* RIGHT CELL: LIVE MATRIX RENDERING LIST */}
      <div className="lg:col-span-7 flex flex-col gap-5 text-left w-full">
        <div className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xs w-full">
          <span className="text-[0.65rem] tracking-[0.3em] font-bold text-[#b5862a] uppercase block mb-1">Live Manifest Monitor</span>
          <h3 className="font-['Playfair_Display'] text-xl font-normal text-neutral-800">Active Structural Features Grid Elements</h3>
        </div>

        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1 w-full">
          {config.features_list.map((item, idx) => (
            <div 
              key={idx} 
              className="w-full bg-white p-5 rounded-xl border border-neutral-200 flex gap-4 items-start justify-between shadow-xs hover:shadow-sm transition-all duration-300"
            >
              <div className="flex gap-4 items-start">
                <span className="w-7 h-7 bg-[#b5862a] text-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 shadow-2xs">
                  {idx + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-[0.95rem] font-bold tracking-wide text-neutral-900">{item.title}</h4>
                  <p className="text-xs text-neutral-500 font-light leading-relaxed mt-1 max-w-xl">{item.description}</p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => onRemoveFeatureItem(idx)} 
                className="text-neutral-300 hover:text-red-600 p-2 transition-colors flex-shrink-0 rounded-full hover:bg-neutral-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}