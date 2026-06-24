import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { 
  Plus, Edit3, Trash2, Save, X, Eye, EyeOff, Package, 
  DollarSign, Tag, List, Info, Sliders, RefreshCw, 
  AlertCircle, Image, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ====================================================================
// 📂 SUB-COMPONENT 1: PRODUCT LISTING TABLE LAYER
// ====================================================================
function ProductTable({ catalog, onEdit, onDelete, onToggleVisibility }) {
  return (
    <div className="w-full bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm block">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-neutral-50/75 border-b border-neutral-200 text-neutral-500 text-xs uppercase font-bold tracking-wider select-none">
              <th className="p-5 w-28">Image</th>
              <th className="p-5">Product Details</th>
              <th className="p-5 w-48">SKU / Registry</th>
              <th className="p-5 w-48">Financial Metrics</th>
              <th className="p-5 w-44">Inventory Status</th>
              <th className="p-5 w-36">Badges</th>
              <th className="p-5 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-base">
            {catalog.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-16 text-center text-neutral-400 font-light text-lg">
                  No couture blueprints found inside the current system registry catalog.
                </td>
              </tr>
            ) : (
              catalog.map((product) => {
                const rawMargin = product.price - product.cost_price;
                const totalStock = Array.isArray(product.variants)
                  ? product.variants.reduce((acc, curr) => acc + Number(curr.stock || 0), 0)
                  : 0;

                return (
                  <tr key={product.id} className={`hover:bg-neutral-50/80 transition-colors ${product.is_hidden ? 'opacity-50 bg-neutral-50/40' : ''}`}>
                    {/* Thumbnail */}
                    <td className="p-5">
                      <div className="w-16 h-20 bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden relative flex-shrink-0 shadow-sm">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-mono font-bold">NO IMG</div>
                        )}
                      </div>
                    </td>

                    {/* Name & Category */}
                    <td className="p-5 max-w-xs">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="font-semibold text-neutral-900 text-base line-clamp-2" title={product.name}>{product.name}</span>
                        <span className="text-sm text-neutral-500 font-normal truncate">
                          {product.categories?.name || 'Unassigned Category'}
                        </span>
                      </div>
                    </td>

                    {/* SKU & Slug */}
                    <td className="p-5">
                      <div className="flex flex-col gap-1 text-left font-mono text-sm">
                        <span className="font-bold text-neutral-800 select-all">{product.sku}</span>
                        <span className="text-xs text-neutral-400 truncate max-w-[180px]">{product.slug}</span>
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="p-5">
                      <div className="flex flex-col text-left text-sm gap-1">
                        <div className="font-medium text-neutral-900">
                          Price: <span className="font-bold text-base">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.discount_price && <span className="text-red-500 font-normal line-through ml-2 text-xs">₹{product.discount_price}</span>}
                        </div>
                        <div className="text-neutral-500 text-xs">Cost: ₹{product.cost_price.toLocaleString('en-IN')}</div>
                        <div className={`text-xs font-bold mt-0.5 ${rawMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Margin: +₹{rawMargin.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </td>

                    {/* Inventory */}
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className={`text-sm font-bold ${totalStock > 10 ? 'text-neutral-800' : totalStock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          {totalStock} Units Active
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                          {product.variants?.map((v, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded-md font-mono text-neutral-700" title={`${v.colorName}: ${v.stock} pcs`}>
                              {v.size}-{v.stock}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Badges */}
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2 items-center justify-start max-w-[140px]">
                        {product.is_featured && <span className="text-[10px] font-bold bg-[#b5862a]/10 text-[#b5862a] border border-[#b5862a]/20 px-2 py-1 rounded-md uppercase tracking-wider">Featured</span>}
                        {product.is_bestseller && <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-md uppercase tracking-wider">Bestseller</span>}
                        {product.is_new_arrival && <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md uppercase tracking-wider">New</span>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button type="button" onClick={() => onToggleVisibility(product)} className="p-2.5 text-neutral-500 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-200 transition-colors rounded-lg border border-neutral-200" title={product.is_hidden ? "Un-hide product" : "Hide product"}>
                          {product.is_hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button type="button" onClick={() => onEdit(product)} className="p-2.5 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 border border-blue-100 transition-colors rounded-lg" title="Edit Product">
                          <Edit3 size={18} />
                        </button>
                        <button type="button" onClick={() => onDelete(product.id)} className="p-2.5 text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-100 transition-colors rounded-lg" title="Delete Product">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================================
// 📂 SUB-COMPONENT 2: FULL COMPREHENSIVE PRODUCT FORM MODAL
// ====================================================================
function ProductModalForm({ isOpen, onClose, onSave, categories, editProduct }) {
  const [formData, setFormData] = useState({
    name: '', slug: '', sku: '', description: '', price: '', cost_price: '', discount_price: '',
    category_id: '', is_featured: false, is_bestseller: false, is_new_arrival: true, is_hidden: false,
    images: [], variants: [], bullet_points: [], model_info: { height: '', bust: '', waist: '', wears: '' }, tags: []
  });

  const [inputImage, setInputImage] = useState('');
  const [inputTag, setInputTag] = useState('');
  const [inputBullet, setInputBullet] = useState('');
  const [inputVariant, setInputVariant] = useState({ size: 'Medium', stock: '10', colorName: 'Classic Black', colorHex: '#000000' });

  useEffect(() => {
    if (editProduct) {
      setFormData({
        ...editProduct,
        images: Array.isArray(editProduct.images) ? editProduct.images : [],
        variants: Array.isArray(editProduct.variants) ? editProduct.variants : [],
        bullet_points: Array.isArray(editProduct.bullet_points) ? editProduct.bullet_points : [],
        tags: Array.isArray(editProduct.tags) ? editProduct.tags : [],
        model_info: editProduct.model_info && typeof editProduct.model_info === 'object'
          ? { height: '', bust: '', waist: '', wears: '', ...editProduct.model_info }
          : { height: '', bust: '', waist: '', wears: '' }
      });
    } else {
      setFormData({
        name: '', slug: '', sku: '', description: '', price: '', cost_price: '', discount_price: '',
        category_id: categories[0]?.id || '', is_featured: false, is_bestseller: false, is_new_arrival: true, is_hidden: false,
        images: [], variants: [], bullet_points: [], model_info: { height: '', bust: '', waist: '', wears: '' }, tags: []
      });
    }
  }, [editProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-['DM_Sans'] select-text animate-fade-in">
      <div className="bg-white border border-[#e8e2d8] w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col my-8 max-h-[95vh]">
        
        {/* Modal Window Ribbon Header */}
        <div className="w-full bg-neutral-50 p-6 border-b border-neutral-200 flex justify-between items-center select-none sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#b5862a]/10 text-[#b5862a] flex items-center justify-center"><Package size={20} /></div>
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-neutral-900">
                {editProduct ? 'Modify Garment Design Blueprint' : 'Instantiate New Couture Asset'}
              </h2>
              <p className="text-xs uppercase font-bold tracking-widest text-neutral-500 mt-1">Relational Schema Operations Panel</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2.5 text-neutral-400 hover:text-red-600 bg-white border border-neutral-200 rounded-full hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Parameter Configurations Body Form Scroller Section */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-full text-sm">
          
          {/* LEFT COMPACT HALF: CENTRAL SPECIFICATIONS STRINGS META */}
          <div className="flex flex-col gap-6 min-w-0">
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#b5862a] border-b border-neutral-200 pb-2 flex items-center gap-2 select-none"><Info size={18} /> Primary Metadata</h3>
            
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">Garment Public Profile Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Silk Asymmetric Drape Gown" className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] focus:ring-1 focus:ring-[#b5862a] transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">Inventory Serial SKU</label>
                <input type="text" required value={formData.sku} onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))} placeholder="PRT-SUNKISS-001" className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] font-mono font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">Semantic Slug (Optional)</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated-if-blank" className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] font-mono text-neutral-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">Collection Mapping Category</label>
              <select value={formData.category_id || ''} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))} className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] font-medium text-neutral-800">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">Narrative Description</label>
              <textarea rows={5} required value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe body drape profile lines, luxury tailoring weaves..." className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] font-normal leading-relaxed resize-y" />
            </div>

            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#b5862a] border-b border-neutral-200 pb-2 flex items-center gap-2 mt-4 select-none"><DollarSign size={18} /> Financial Ledger Allocation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">MSRP Retail Price</label>
                <input type="number" required step="0.01" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} placeholder="₹5000" className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] font-bold text-neutral-900" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">Factory Cost Price</label>
                <input type="number" required step="0.01" value={formData.cost_price} onChange={(e) => setFormData(p => ({ ...p, cost_price: e.target.value }))} placeholder="₹1200" className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] text-neutral-700 font-medium" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-neutral-500">Discount Price</label>
                <input type="number" step="0.01" value={formData.discount_price || ''} onChange={(e) => setFormData(p => ({ ...p, discount_price: e.target.value }))} placeholder="Optional" className="w-full bg-neutral-50 border border-neutral-300 p-3.5 text-base rounded-lg focus:outline-none focus:border-[#b5862a] text-red-600 font-bold" />
              </div>
            </div>

            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#b5862a] border-b border-neutral-200 pb-2 flex items-center gap-2 mt-4 select-none"><Sliders size={18} /> Visibility & Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-neutral-50 border border-neutral-200 rounded-xl select-none">
              <label className="flex items-center gap-3 cursor-pointer text-base font-medium text-neutral-800">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))} className="w-5 h-5 rounded border-neutral-300 text-[#b5862a] focus:ring-[#b5862a]" /> Featured Showcase
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-base font-medium text-neutral-800">
                <input type="checkbox" checked={formData.is_bestseller} onChange={(e) => setFormData(p => ({ ...p, is_bestseller: e.target.checked }))} className="w-5 h-5 rounded border-neutral-300 text-purple-600 focus:ring-purple-600" /> Bestseller Tag
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-base font-medium text-neutral-800">
                <input type="checkbox" checked={formData.is_new_arrival} onChange={(e) => setFormData(p => ({ ...p, is_new_arrival: e.target.checked }))} className="w-5 h-5 rounded border-neutral-300 text-green-600 focus:ring-green-600" /> New Arrival
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-base font-bold text-red-600">
                <input type="checkbox" checked={formData.is_hidden} onChange={(e) => setFormData(p => ({ ...p, is_hidden: e.target.checked }))} className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-600" /> Hidden (Draft/Vault)
              </label>
            </div>
          </div>

          {/* RIGHT COMPACT HALF: HEAVY JSONB OBJECT ARRAYS PIPE MANAGERS */}
          <div className="flex flex-col gap-6 min-w-0">
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#b5862a] border-b border-neutral-200 pb-2 flex items-center gap-2 select-none"><Image size={18} /> Cloudinary Editorial Imagery Arrays</h3>
            <div className="w-full flex gap-3">
              <input type="text" placeholder="Paste structural image URL link..." value={inputImage} onChange={(e) => setInputImage(e.target.value)} className="flex-grow bg-neutral-50 border border-neutral-300 p-3 text-base rounded-lg focus:outline-none focus:border-[#b5862a]" />
              <button type="button" onClick={() => { if (!inputImage.trim()) return; setFormData(p => ({ ...p, images: [...p.images, inputImage.trim()] })); setInputImage(''); }} className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#b5862a] transition-colors">Append</button>
            </div>
            <div className="w-full flex gap-3 overflow-x-auto pb-2 min-h-[100px]">
              {formData.images.map((img, idx) => (
                <div key={idx} className="w-20 h-24 bg-neutral-100 border border-neutral-200 rounded-lg relative flex-shrink-0 shadow-sm">
                  <img src={img} alt="preview" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))} className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white hover:bg-red-700 rounded-full shadow-md"><X size={12} /></button>
                </div>
              ))}
            </div>

            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#b5862a] border-b border-neutral-200 pb-2 flex items-center gap-2 select-none mt-2"><Sliders size={18} /> Variants & Stock Matrix</h3>
            <div className="bg-[#f7f4ef]/80 p-5 rounded-xl border border-neutral-200 flex flex-col gap-4 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-500 block mb-1.5">Size</span>
                  <input type="text" value={inputVariant.size} onChange={(e) => setInputVariant(p => ({ ...p, size: e.target.value }))} className="w-full bg-white border border-neutral-300 p-2.5 text-sm rounded-lg focus:outline-none focus:border-[#b5862a]" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-500 block mb-1.5">Stock Pcs</span>
                  <input type="number" value={inputVariant.stock} onChange={(e) => setInputVariant(p => ({ ...p, stock: e.target.value }))} className="w-full bg-white border border-neutral-300 p-2.5 text-sm rounded-lg focus:outline-none focus:border-[#b5862a]" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-500 block mb-1.5">Color Label</span>
                  <input type="text" value={inputVariant.colorName} onChange={(e) => setInputVariant(p => ({ ...p, colorName: e.target.value }))} className="w-full bg-white border border-neutral-300 p-2.5 text-sm rounded-lg focus:outline-none focus:border-[#b5862a]" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-500 block mb-1.5">Hex Code</span>
                  <div className="flex gap-2 items-center bg-white border border-neutral-300 rounded-lg p-1.5 focus-within:border-[#b5862a]">
                    <input type="color" value={inputVariant.colorHex} onChange={(e) => setInputVariant(p => ({ ...p, colorHex: e.target.value }))} className="w-8 h-8 p-0 bg-transparent border-0 cursor-pointer flex-shrink-0 rounded" />
                    <input type="text" value={inputVariant.colorHex} onChange={(e) => setInputVariant(p => ({ ...p, colorHex: e.target.value }))} className="w-full bg-transparent border-none p-1 text-xs font-mono focus:outline-none" />
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => { setFormData(p => ({ ...p, variants: [...p.variants, { ...inputVariant, stock: parseInt(inputVariant.stock) || 0 }] })); }} className="w-full bg-neutral-800 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#b5862a] transition-colors">Commit Variant Node</button>
            </div>
            
            <div className="flex flex-wrap gap-2.5 max-h-[140px] overflow-y-auto bg-neutral-50 p-4 border border-neutral-200 rounded-xl min-h-[60px]">
              {formData.variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0 border border-neutral-300 shadow-inner" style={{ backgroundColor: v.colorHex }} />
                  <span>{v.size} <span className="text-neutral-400">({v.stock} pcs)</span> - <span className="font-light text-neutral-600">{v.colorName}</span></span>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, variants: p.variants.filter((_, i) => i !== idx) }))} className="text-neutral-400 hover:text-red-600 ml-2 bg-neutral-50 hover:bg-red-50 p-1 rounded-md transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>

            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#b5862a] border-b border-neutral-200 pb-2 flex items-center gap-2 select-none mt-2"><List size={18} /> Technical Bullet Points</h3>
            <div className="w-full flex gap-3">
              <input type="text" placeholder="e.g., Fabric: 100% Heavy Silk weave" value={inputBullet} onChange={(e) => setInputBullet(e.target.value)} className="flex-grow bg-neutral-50 border border-neutral-300 p-3 text-base rounded-lg focus:outline-none focus:border-[#b5862a]" />
              <button type="button" onClick={() => { if (!inputBullet.trim()) return; setFormData(p => ({ ...p, bullet_points: [...p.bullet_points, inputBullet.trim()] })); setInputBullet(''); }} className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#b5862a] transition-colors">Append</button>
            </div>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-2">
              {formData.bullet_points.map((bp, idx) => (
                <div key={idx} className="w-full bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 flex justify-between items-center text-left shadow-sm">
                  <span className="text-sm text-neutral-700 font-normal leading-relaxed">{bp}</span>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, bullet_points: p.bullet_points.filter((_, i) => i !== idx) }))} className="text-neutral-400 hover:text-red-600 bg-white hover:bg-red-50 p-1.5 rounded-md border border-neutral-200 flex-shrink-0 ml-4 transition-colors"><X size={16} /></button>
                </div>
              ))}
            </div>

            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#b5862a] border-b border-neutral-200 pb-2 flex items-center gap-2 select-none mt-2"><Tag size={18} /> Model Info & Search Tags</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 border border-neutral-200 rounded-xl">
              <div><span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Height</span><input type="text" value={formData.model_info.height} onChange={(e) => setFormData(p => ({ ...p, model_info: { ...p.model_info, height: e.target.value } }))} placeholder="5ft 10in" className="w-full bg-white border border-neutral-300 p-2 rounded-md text-sm focus:border-[#b5862a] focus:outline-none" /></div>
              <div><span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Bust</span><input type="text" value={formData.model_info.bust} onChange={(e) => setFormData(p => ({ ...p, model_info: { ...p.model_info, bust: e.target.value } }))} placeholder="34" className="w-full bg-white border border-neutral-300 p-2 rounded-md text-sm focus:border-[#b5862a] focus:outline-none" /></div>
              <div><span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Waist</span><input type="text" value={formData.model_info.waist} onChange={(e) => setFormData(p => ({ ...p, model_info: { ...p.model_info, waist: e.target.value } }))} placeholder="25" className="w-full bg-white border border-neutral-300 p-2 rounded-md text-sm focus:border-[#b5862a] focus:outline-none" /></div>
              <div><span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Wears</span><input type="text" value={formData.model_info.wears} onChange={(e) => setFormData(p => ({ ...p, model_info: { ...p.model_info, wears: e.target.value } }))} placeholder="Small" className="w-full bg-white border border-neutral-300 p-2 rounded-md text-sm focus:border-[#b5862a] focus:outline-none" /></div>
            </div>
            
            <div className="w-full flex gap-3">
              <input type="text" placeholder="Add custom semantic search tag... e.g., evening-wear" value={inputTag} onChange={(e) => setInputTag(e.target.value)} className="flex-grow bg-neutral-50 border border-neutral-300 p-3 text-base rounded-lg focus:outline-none focus:border-[#b5862a]" />
              <button type="button" onClick={() => { if (!inputTag.trim()) return; setFormData(p => ({ ...p, tags: [...p.tags, inputTag.toLowerCase().trim()] })); setInputTag(''); }} className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#b5862a] transition-colors">Inject</button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
              {formData.tags.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-300 px-3 py-1.5 rounded-lg shadow-sm">
                  #{t} <button type="button" onClick={() => setFormData(p => ({ ...p, tags: p.tags.filter((_, i) => i !== idx) }))} className="text-neutral-400 hover:text-red-600 bg-white rounded p-0.5"><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Core Dispatch Execution Buttons Ribbon */}
          <div className="col-span-1 lg:col-span-2 border-t border-neutral-200 pt-6 mt-4 flex flex-col sm:flex-row justify-end gap-4 select-none">
            <button type="button" onClick={onClose} className="px-8 py-4 border border-neutral-300 rounded-lg text-sm font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-100 transition-colors w-full sm:w-auto">Abort Changes</button>
            <button type="submit" className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-10 py-4 rounded-lg text-sm font-bold tracking-[0.2em] uppercase shadow-lg hover:bg-[#b5862a] transition-all w-full sm:w-auto">
              <Save size={18} /> Commit Blueprint
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ====================================================================
// 👑 MAIN MASTER ORCHESTRATOR COMPONENT (PRODUCT DASHBOARD CONTROL PANEL)
// ====================================================================
export default function AdminProductDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchDashboardCatalog = async () => {
    try {
      setLoading(true);
      const [catalogRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/products/all-catalog'),
        axiosInstance.get('/cms/manifest')
      ]);

      if (catalogRes.data?.success) {
        setCatalog(catalogRes.data.catalog);
      }
      if (categoriesRes.data) {
        setCategories([{ id: 1, name: 'Sunkissed Stories Collection' }]);
      }
    } catch (err) {
      triggerNotification('error', 'Relational database lookup failed. Unable to fetch master design catalog registries.');
      console.error("❌ [CATALOG COREGATE EXECUTION FAULT]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('adm_tk');
    if (!adminToken) {
      console.warn("🚨 [SECURITY EVENT INTERCEPT]: Access block triggered.");
      navigate('/designer-studio-gate'); 
      return;
    }
    fetchDashboardCatalog();
  }, [navigate]);

  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  const handleToggleVisibility = async (product) => {
    try {
      const updatedHiddenState = !product.is_hidden;
      const res = await axiosInstance.put(`/products/update/${product.id}`, { is_hidden: updatedHiddenState });
      if (res.data?.success) {
        triggerNotification('success', `Visibility updated for: ${product.name}`);
        setCatalog(prev => prev.map(item => item.id === product.id ? { ...item, is_hidden: updatedHiddenState } : item));
      }
    } catch (err) {
      triggerNotification('error', 'Failed to mutate structural visibility toggle.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("🚨 WARNING: Are you certain you want to delete this product? This action cannot be undone.")) return;
    try {
      const res = await axiosInstance.delete(`/products/delete/${id}`);
      if (res.data?.success) {
        triggerNotification('success', 'Product blueprint wiped completely from storage.');
        setCatalog(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      triggerNotification('error', 'Database deletion sequence failed.');
    }
  };

  const handleSaveProduct = async (computedPayload) => {
    try {
      if (selectedProduct) {
        const res = await axiosInstance.put(`/products/update/${selectedProduct.id}`, computedPayload);
        if (res.data?.success) {
          triggerNotification('success', 'Garment profile updated successfully.');
          fetchDashboardCatalog();
          setIsModalOpen(false);
        }
      } else {
        const res = await axiosInstance.post('/products/create', computedPayload);
        if (res.data?.success) {
          triggerNotification('success', 'New couture design added successfully.');
          fetchDashboardCatalog();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      triggerNotification('error', err.response?.data?.message || 'Failed to sync product data.');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f7f4ef] flex flex-col items-center justify-center text-[#1a1a1a]">
        <RefreshCw size={32} className="animate-spin text-[#b5862a] mb-6" />
        <p className="text-sm font-bold tracking-[0.3em] uppercase font-['DM_Sans']">Fetching Relational Schema...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] pt-24 pb-32 px-4 sm:px-8 lg:px-12 text-left overflow-x-hidden select-text">
      <div className="max-w-[1600px] mx-auto w-full block">
        
        {/* EDITORIAL CONTROL DESK HEADER SECTION */}
        <div className="w-full border-b border-[#e8e2d8] pb-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 select-none">
          <div>
            <span className="text-xs tracking-[0.4em] uppercase text-[#b5862a] font-bold block mb-2">Kostume County Masters</span>
            <h1 className="font-['Playfair_Display'] text-4xl font-normal text-neutral-900">Couture Catalog Desk</h1>
          </div>
          
          <button
            onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white px-8 py-4 text-sm font-bold tracking-[0.2em] uppercase rounded-lg shadow-lg hover:bg-[#b5862a] transition-all duration-300 flex-shrink-0"
          >
            <Plus size={18} /> Ingest New Silhouette
          </button>
        </div>

        {/* FEEDBACK STATUS REEL MESSAGE ALERTS */}
        {notification.message && (
          <div className={`w-full p-5 mb-8 rounded-xl flex items-center gap-4 border text-base shadow-sm transition-all animate-fade-in ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="font-medium tracking-wide text-left">{notification.message}</p>
          </div>
        )}

        {/* FACTORED COMPONENT 1: MASTER PRODUCT INDEX LISTINGS VIEW */}
        <ProductTable 
          catalog={catalog} 
          onEdit={(prod) => { setSelectedProduct(prod); setIsModalOpen(true); }} 
          onDelete={handleDeleteProduct} 
          onToggleVisibility={handleToggleVisibility} 
        />

        {/* FACTORED COMPONENT 2: MASTER CONFIGURATION MODAL DIALOG ELEMENT */}
        <ProductModalForm 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} 
          onSave={handleSaveProduct} 
          categories={categories} 
          editProduct={selectedProduct} 
        />

      </div>
    </div>
  );
}