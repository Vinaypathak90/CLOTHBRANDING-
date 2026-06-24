import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import axiosInstance from '../../api/axiosInstance';
import { User, Package, Heart, LogOut, Calendar, Shield, ArrowRight, Eye } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, logoutUser } = useContext(AuthContext);
  const { refreshCart } = useContext(CartContext);
  
  // Dashboard Core Sub-states
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'wishlist' | 'settings'
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ====================================================================
  // 🔄 PIPELINE HYDRATION (FETCH PROFILE METRICS FROM BACKEND)
  // ====================================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Live Order History array matrix from backend database nodes
        const ordersRes = await axiosInstance.get('/orders/my-orders');
        setOrders(ordersRes.data.orders || []);

        // Fetch User Embedded Curated Wishlist items mapping
        const wishlistRes = await axiosInstance.get('/wishlist/my-wishlist');
        setWishlistItems(wishlistRes.data.wishlist || []);
      } catch (err) {
        console.error("Dashboard Pipeline Exception: Sync parameters failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const handleGlobalLogout = () => {
    logoutUser();
    refreshCart(); // Force clear tracking states on shopping bags instantly
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#f7f4ef]">
        <div className="w-12 h-[1px] bg-[#b5862a] animate-pulse mb-3"></div>
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#b5862a] font-bold">Refining Profile Ledger Matrix...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] pb-24 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        
        {/* ====================================================================
            SECTION A: PREMIUM BRANDED HERO IDENTITY HEADER
           ==================================================================== */}
        <div className="w-full border-b border-neutral-300/60 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#e8e4dc] border border-neutral-300 flex items-center justify-center text-neutral-600 shadow-sm relative overflow-hidden group">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar profile slot" className="w-full h-full object-cover" />
              ) : (
                <User size={24} strokeWidth={1.2} />
              )}
            </div>
            <div>
              <span className="block text-[0.65rem] tracking-[0.25em] uppercase text-[#b5862a] font-bold mb-0.5">Welcome To Atelier</span>
              <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-normal capitalize tracking-wide">{currentUser?.name}</h1>
            </div>
          </div>

          {/* Secure Logout CTA Block */}
          <button 
            onClick={handleGlobalLogout}
            className="flex items-center gap-2 text-[0.7rem] tracking-[0.2em] font-bold uppercase py-2.5 px-5 border border-neutral-300 rounded-xs hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-all duration-300 shadow-xs"
          >
            <LogOut size={13} /> Terminate Session
          </button>
        </div>

        {/* ====================================================================
            SECTION B: DASHBOARD STRUCTURAL EXECUTION LAYOUT GRID
           ==================================================================== */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 items-start">
          
          {/* ── LEFT UTILITY TERMINALS PANEL (NAVIGATION NAVIGATION HUB) ── */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible border-b lg:border-b-0 lg:border-r border-neutral-300/60 pb-4 lg:pb-0 lg:pr-8 gap-1 md:gap-2 whitespace-nowrap scrollbar-none">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3.5 text-[0.75rem] font-bold tracking-[0.15em] uppercase flex items-center gap-3 transition-all rounded-xs ${
                activeTab === 'orders' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              <Package size={15} strokeWidth={activeTab === 'orders' ? 2 : 1.5} /> Order Execution Logs ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left px-4 py-3.5 text-[0.75rem] font-bold tracking-[0.15em] uppercase flex items-center gap-3 transition-all rounded-xs ${
                activeTab === 'wishlist' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              <Heart size={15} strokeWidth={activeTab === 'wishlist' ? 2 : 1.5} /> Private Curation Matrix ({wishlistItems.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3.5 text-[0.75rem] font-bold tracking-[0.15em] uppercase flex items-center gap-3 transition-all rounded-xs ${
                activeTab === 'settings' ? 'bg-[#1a1a1a] text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              <User size={15} strokeWidth={activeTab === 'settings' ? 2 : 1.5} /> Ledger Specifications
            </button>
          </div>

          {/* ── RIGHT UTILITY WORKSPACE SHEET (DYNAMIC COMPONENT DRAWER) ── */}
          <div className="lg:col-span-9 w-full">
            
            {/* VIEW MATRIX 1: LIVE ORDER HISTORY TABLES */}
            {activeTab === 'orders' && (
              <div className="w-full flex flex-col gap-6">
                <h3 className="text-[0.8rem] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">Historical Order Registers</h3>
                
                {orders.length === 0 ? (
                  <div className="w-full border border-dashed border-neutral-300 rounded-sm p-12 text-center bg-white/40">
                    <Package size={28} className="mx-auto text-neutral-300 mb-4" strokeWidth={1} />
                    <p className="text-[0.85rem] text-neutral-500 font-light tracking-wide mb-6">No premium checkout records matched inside this profile token matrix.</p>
                    <button className="px-8 py-3.5 bg-[#1a1a1a] text-white text-[0.7rem] font-bold tracking-[0.2em] uppercase hover:bg-[#b5862a] transition-all rounded-xs">Initialize First Purchase</button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-4">
                    {orders.map((order) => (
                      <div key={order.id} className="w-full bg-white border border-neutral-300/70 p-6 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-1.5">
                        <span className="text-[0.68rem] font-bold text-[#b5862a] uppercase tracking-widest">
  ID: #{order.order_number || String(order.id || '').substring(0, 8).toUpperCase()}
</span>   <div className="flex items-center gap-4 text-[0.85rem] text-neutral-500 font-light mt-0.5">
                            <span className="flex items-center gap-1"><Calendar size={13}/> {new Date(order.created_at).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                            <span>•</span>
                            <span className="font-bold text-[#1a1a1a]">Rs. {Number(order.total_price).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Status Badges Mapping Arrays */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <span className={`px-3 py-1.5 text-[0.62rem] font-bold tracking-widest uppercase rounded-xs border ${
                            order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                            order.status === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            'bg-neutral-100 border-neutral-200 text-neutral-600'
                          }`}>
                            {order.status}
                          </span>
                          
                          <button className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-xs transition-colors border border-neutral-200">
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW MATRIX 2: CURATED SAVED ACCOUNT WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="w-full">
                <h3 className="text-[0.8rem] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-6">Embedded Curation Framework</h3>
                
                {wishlistItems.length === 0 ? (
                  <div className="w-full border border-dashed border-neutral-300 rounded-sm p-12 text-center bg-white/40">
                    <Heart size={28} className="mx-auto text-neutral-300 mb-4" strokeWidth={1} />
                    <p className="text-[0.85rem] text-neutral-500 font-light tracking-wide">Your private atelier layout curation matrix is entirely unpopulated.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="bg-white border border-neutral-300/60 p-4 rounded-xs shadow-xs group cursor-pointer" onClick={() => window.location.href=`/shop/product/${item.products?.id}`}>
                        <div className="aspect-[3/4] w-full bg-[#e8e4dc] overflow-hidden rounded-xs mb-3">
                          <img src={item.products?.images?.[0]} alt={item.products?.name} className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500" />
                        </div>
                        <h4 className="text-[0.82rem] font-medium text-neutral-800 tracking-wide truncate capitalize">{item.products?.name}</h4>
                        <p className="text-[0.85rem] font-bold text-[#b5862a] mt-0.5">Rs. {Number(item.products?.price).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW MATRIX 3: ACCOUNT LEDGER PARAMETERS */}
            {activeTab === 'settings' && (
              <div className="w-full bg-white border border-neutral-300/70 p-6 md:p-10 rounded-sm shadow-xs flex flex-col gap-6">
                <h3 className="text-[0.8rem] font-bold tracking-[0.25em] uppercase text-neutral-400 border-b pb-3 mb-2">Security Parameter Specifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[0.9rem] font-light">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.68rem] font-bold tracking-wider text-neutral-400 uppercase">Registered Silhouette Identity Name</label>
                    <div className="w-full bg-[#f7f4ef]/50 border border-neutral-200 px-4 py-3 rounded-xs text-neutral-800 capitalize font-medium">{currentUser?.name}</div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.68rem] font-bold tracking-wider text-neutral-400 uppercase">Encrypted Communication Endpoint (Email)</label>
                    <div className="w-full bg-[#f7f4ef]/50 border border-neutral-200 px-4 py-3 rounded-xs text-neutral-500 font-medium">{currentUser?.email}</div>
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[0.68rem] font-bold tracking-wider text-neutral-400 uppercase">System Clearance Authorization Signature</label>
                    <div className="flex items-center gap-2 text-[0.7rem] font-bold bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xs w-fit uppercase tracking-widest shadow-xs">
                      <Shield size={13} /> Authority Clearance Mapping: Verified {currentUser?.role} Mode
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}