import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

import { 
  User, Package, MapPin, LogOut, ChevronRight, 
  Clock, CheckCircle, Truck, AlertCircle, ShoppingBag
} from 'lucide-react';

export default function UserDashboard() {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL (e.g., /user/orders -> 'orders')
  const initialTab = location.pathname.includes('orders') ? 'orders' : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // States
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Sync URL with Tab changes silently
  useEffect(() => {
    navigate(`/user/${activeTab}`, { replace: true });
  }, [activeTab, navigate]);

  // Fetch Orders on Load if in Orders tab
  useEffect(() => {
    if (activeTab === 'orders' && currentUser) {
      fetchMyOrders();
    }
  }, [activeTab, currentUser]);

  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await axiosInstance.get('/orders/my-history');
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    logout(); // Apne AuthContext ka logout function call karo
    navigate('/auth');
  };

  // Helper for Status UI
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { icon: <Clock size={16} />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      case 'confirmed': return { icon: <CheckCircle size={16} />, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'shipped': return { icon: <Truck size={16} />, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'delivered': return { icon: <MapPin size={16} />, color: 'text-green-600 bg-green-50 border-green-200' };
      case 'cancelled': return { icon: <AlertCircle size={16} />, color: 'text-red-600 bg-red-50 border-red-200' };
      default: return { icon: <Clock size={16} />, color: 'text-neutral-600 bg-neutral-50 border-neutral-200' };
    }
  };

  if (!currentUser) return null; // Let ProtectedRoute handle redirect

  return (
    <div className="min-h-screen bg-[#F9F7F2] pt-[120px] pb-24 px-4 md:px-10 font-body text-[#161412]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* ==========================================
            LEFT SIDEBAR: USER NAVIGATION
           ========================================== */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-[#EAE4D8] rounded-xl overflow-hidden shadow-sm sticky top-32">
            
            {/* User Info Header */}
            <div className="p-6 border-b border-[#EAE4D8] bg-neutral-50 text-center">
              <div className="w-16 h-16 bg-[#161412] text-[#d4af37] flex items-center justify-center rounded-full mx-auto mb-3 text-xl font-display uppercase tracking-widest">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <h2 className="font-bold text-lg">{currentUser.name || 'Valued Client'}</h2>
              <p className="text-xs text-neutral-500 font-mono mt-1">{currentUser.email}</p>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col p-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 w-full p-3 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${
                  activeTab === 'profile' ? 'bg-[#161412] text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-[#161412]'
                }`}
              >
                <User size={16} /> My Profile
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 w-full p-3 text-sm font-bold uppercase tracking-wider rounded-md transition-colors mt-1 ${
                  activeTab === 'orders' ? 'bg-[#161412] text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-[#161412]'
                }`}
              >
                <Package size={16} /> Order History
              </button>
              
              <hr className="my-2 border-neutral-100" />
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 text-sm font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* ==========================================
            RIGHT CONTENT AREA
           ========================================== */}
        <div className="flex-grow">
          
          {/* 👤 TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-[#EAE4D8] rounded-xl p-8 shadow-sm animate-in fade-in duration-300">
              <h2 className="font-display text-2xl uppercase tracking-widest mb-6 border-b border-[#EAE4D8] pb-4">Account Details</h2>
              
              <form className="space-y-5 max-w-xl">
                <div>
                  <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 mb-1 block">Full Name</label>
                  <input type="text" value={currentUser.name || ''} readOnly className="w-full p-3 border border-neutral-200 bg-neutral-50 rounded-md text-neutral-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 mb-1 block">Email Address</label>
                  <input type="email" value={currentUser.email || ''} readOnly className="w-full p-3 border border-neutral-200 bg-neutral-50 rounded-md text-neutral-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-400 mb-1 block">Phone Number</label>
                  <input type="text" placeholder="Update your phone number" defaultValue={currentUser.phone || ''} className="w-full p-3 border border-neutral-300 bg-white rounded-md focus:outline-none focus:border-[#b5862a] transition-colors" />
                </div>

                <div className="pt-4">
                  <button type="button" className="bg-[#161412] text-white px-8 py-3 text-xs uppercase font-bold tracking-widest rounded hover:bg-[#d4af37] hover:text-[#161412] transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 📦 TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="font-display text-2xl uppercase tracking-widest mb-2">Order History</h2>
              <p className="text-sm text-neutral-500 mb-6">Track your recent purchases and fulfillment status.</p>

              {loadingOrders ? (
                <div className="p-10 text-center text-[#b5862a]">Loading your collection...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-[#EAE4D8] rounded-xl p-12 text-center flex flex-col items-center shadow-sm">
                  <ShoppingBag size={48} className="text-neutral-300 mb-4" />
                  <h3 className="font-display text-xl mb-2">No Orders Yet</h3>
                  <p className="text-sm text-neutral-500 mb-6">You haven't placed any orders with us yet.</p>
                  <button onClick={() => navigate('/collections')} className="bg-[#161412] text-white px-8 py-3 text-xs uppercase font-bold tracking-widest rounded hover:bg-[#b5862a] transition-colors">
                    Explore Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusUI = getStatusConfig(order.order_status);
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div key={order.id} className="bg-white border border-[#EAE4D8] rounded-xl overflow-hidden shadow-sm">
                        
                        {/* Order Header (Always Visible) */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-neutral-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Order ID</p>
                            <h3 className="font-mono font-bold text-lg text-[#161412]">{order.order_id_string}</h3>
                            <p className="text-xs text-neutral-500 mt-1">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>

                          <div className="flex flex-col md:items-end gap-2">
                            <p className="font-display text-xl font-bold">₹{parseFloat(order.final_payable).toLocaleString('en-IN')}</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border ${statusUI.color}`}>
                              {statusUI.icon} {order.order_status}
                            </span>
                          </div>
                        </div>

                        {/* Order Expanded Details (Timeline & Items) */}
                        {isExpanded && (
                          <div className="border-t border-[#EAE4D8] p-6 bg-[#f7f4ef]/30 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              
                              {/* Left: Items Purchased */}
                              <div>
                                <h4 className="text-xs uppercase font-bold tracking-widest text-neutral-500 mb-4 border-b border-neutral-200 pb-2">Items Purchased</h4>
                                <div className="space-y-3">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 border border-neutral-200 rounded">
                                      <div>
                                        <p className="font-bold text-sm text-neutral-800">{item.product_name || item.name}</p>
                                        <p className="text-xs text-neutral-500">Size: {item.size || item.selected_size} | Qty: {item.quantity}</p>
                                      </div>
                                      <p className="font-bold text-sm">₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right: Live Tracking Timeline */}
                              <div>
                                <h4 className="text-xs uppercase font-bold tracking-widest text-neutral-500 mb-4 border-b border-neutral-200 pb-2">Live Tracking</h4>
                                <div className="relative border-l-2 border-neutral-200 ml-3 space-y-6">
                                  {order.timeline && order.timeline.length > 0 ? (
                                    order.timeline.map((event, idx) => (
                                      <div key={idx} className="pl-6 relative">
                                        <div className="absolute w-3 h-3 bg-[#b5862a] rounded-full -left-[7px] top-1.5 ring-4 ring-[#f7f4ef]"></div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-800">{event.status}</p>
                                        <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                                        {event.note && <p className="text-xs text-neutral-600 mt-1.5 bg-white p-2 rounded border border-neutral-200">{event.note}</p>}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="pl-6 relative">
                                      <div className="absolute w-3 h-3 bg-neutral-300 rounded-full -left-[7px] top-1.5 ring-4 ring-[#f7f4ef]"></div>
                                      <p className="text-xs text-neutral-500">Awaiting processing...</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}