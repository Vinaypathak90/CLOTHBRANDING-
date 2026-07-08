import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { 
  Package, Search, Eye, CheckCircle, Truck, X, Image as ImageIcon, 
  RefreshCw, ShieldAlert, Clock, CreditCard, ChevronRight, MapPin, Trash2
} from 'lucide-react';

export default function AdminOrdersControl() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for Managing a specific order
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form State for Update
  const [updateForm, setUpdateForm] = useState({
    order_status: '',
    payment_status: '',
    note: ''
  });

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adm_tk'); 
      const res = await axiosInstance.get('/orders/admin/all', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("[ADMIN ORDERS]: Failed to fetch", err);
      alert("Failed to load orders. Check your connection or admin access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic for search bar
  const filteredOrders = orders.filter(order => 
    order.order_id_string?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.users?.phone?.includes(searchTerm)
  );

  // Open Modal & Prep Data
  const handleManageClick = (order) => {
    setSelectedOrder(order);
    setUpdateForm({
      order_status: order.order_status || 'Pending',
      payment_status: order.payment_status || 'pending_verification',
      note: '' // Blank for fresh note
    });
  };

  // Submit Status Update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      const adminToken = localStorage.getItem('adm_tk');
      const res = await axiosInstance.put(`/orders/admin/update-status/${selectedOrder.id}`, updateForm, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (res.data?.success) {
        alert(res.data.message);
        setSelectedOrder(null);
        fetchOrders(); // Refresh table
      }
    } catch (err) {
      console.error("[ADMIN ORDER UPDATE]: Failed", err);
      alert("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================================
  // 🔥 NEW: Delete Order Logic
  // ==========================================
  const handleDeleteOrder = async (orderId) => {
    const isConfirmed = window.confirm("Are you sure you want to permanently delete this order? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      const adminToken = localStorage.getItem('adm_tk');
      const res = await axiosInstance.delete(`/orders/admin/delete/${orderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (res.data?.success) {
        alert("Order deleted successfully.");
        fetchOrders(); // Refresh table after deletion
      }
    } catch (err) {
      console.error("[ADMIN ORDER DELETE]: Failed", err);
      alert("Failed to delete order. Make sure your backend route is set up.");
    }
  };

  // Helper: Status Colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
      case 'captured': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': 
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="w-full font-body relative">
      
      {/* Top Controls */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-neutral-100 p-3 rounded-full text-[#b5862a]">
            <Package size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#161412]">Order Fulfillment Desk</h2>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-0.5">Total Volumes: {orders.length}</p>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search Order ID, Email, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:border-[#b5862a] bg-neutral-50"
            />
            <Search size={16} className="absolute left-3 top-3 text-neutral-400" />
          </div>
          <button onClick={fetchOrders} className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-md text-neutral-600 hover:text-[#b5862a] transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-neutral-400">
            <RefreshCw size={32} className="animate-spin text-[#b5862a] mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold">Syncing Ledger...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm font-bold uppercase tracking-widest">No matching orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#161412] text-[#F9F7F2] uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th className="p-4 rounded-tl-xl">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Payable Amount</th>
                  <th className="p-4">Financial Status</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#b5862a]">{order.order_id_string}</td>
                    <td className="p-4">
                      <p className="font-bold text-neutral-800">{order.users?.name || 'Guest User'}</p>
                      <p className="text-xs text-neutral-500">{order.users?.phone || 'No Phone'}</p>
                    </td>
                    <td className="p-4 font-bold text-neutral-800">
                      ₹{parseFloat(order.final_payable || order.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md border ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Manage Button */}
                        <button 
                          onClick={() => handleManageClick(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#161412] text-white text-[10px] uppercase font-bold tracking-wider rounded hover:bg-[#b5862a] transition-colors"
                        >
                          <Eye size={14} /> Manage
                        </button>
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Delete Order"
                          className="inline-flex items-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-600 text-[10px] uppercase font-bold tracking-wider rounded border border-red-200 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL: MANAGE ORDER & VERIFY PAYMENT
         ========================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#f7f4ef] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Panel: Order Details & Screenshot */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-white overflow-y-auto border-r border-neutral-200">
              <div className="flex justify-between items-start mb-6 border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#161412]">{selectedOrder.order_id_string}</h3>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Placed: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h4 className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 mb-3 flex items-center gap-2"><Package size={14}/> Purchased Items</h4>
                <div className="space-y-3">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-neutral-50 p-3 border border-neutral-200 rounded flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-neutral-800">{item.product_name || item.name || 'Product'}</p>
                        <p className="text-xs text-neutral-500">Size: {item.size || item.selected_size} | Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold">₹{parseFloat(item.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                 <h4 className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 mb-2 flex items-center gap-2"><MapPin size={14}/> Shipping Address</h4>
                 <div className="bg-neutral-50 p-4 border border-neutral-200 rounded text-sm text-neutral-700">
                   {selectedOrder.shipping_address ? (
                     <>
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
                     </>
                   ) : 'Address not found'}
                 </div>
              </div>

              {/* UPI Screenshot Verifier */}
              <div>
                 <h4 className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 mb-2 flex items-center gap-2"><ImageIcon size={14}/> Payment Proof (Screenshot)</h4>
                 {selectedOrder.payment_screenshot_url ? (
                   <a href={selectedOrder.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="block relative group rounded-lg overflow-hidden border border-neutral-200">
                     <img src={selectedOrder.payment_screenshot_url} alt="UPI Payment Screenshot" className="w-full h-48 object-cover object-top transition-transform group-hover:scale-105" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <span className="text-white text-xs uppercase tracking-widest font-bold border border-white px-4 py-2">View Full Image</span>
                     </div>
                   </a>
                 ) : (
                   <div className="bg-neutral-100 text-neutral-400 p-8 text-center rounded border border-neutral-200 border-dashed">
                     <ShieldAlert size={24} className="mx-auto mb-2" />
                     <p className="text-xs uppercase tracking-wider font-bold">No Screenshot Uploaded</p>
                   </div>
                 )}
              </div>
            </div>

            {/* Right Panel: Update Form & Timeline */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-[#f7f4ef] flex flex-col justify-between overflow-y-auto">
              
              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#161412] mb-4">Action Center</h3>
                  
                  {/* Payment Status Dropdown */}
                  <div className="mb-4">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-2 mb-2"><CreditCard size={14} className="text-[#b5862a]" /> Financial Status</label>
                    <select 
                      value={updateForm.payment_status}
                      onChange={(e) => setUpdateForm({...updateForm, payment_status: e.target.value})}
                      className="w-full p-3 border border-neutral-300 bg-white focus:outline-none focus:border-[#b5862a] rounded"
                    >
                      <option value="pending_verification">Pending Verification (Awaiting Admin Check)</option>
                      <option value="captured">Payment Captured (Approved)</option>
                      <option value="failed">Payment Failed / Fake</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Order Status Dropdown */}
                  <div className="mb-4">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-2 mb-2"><Truck size={14} className="text-[#b5862a]" /> Fulfillment Status</label>
                    <select 
                      value={updateForm.order_status}
                      onChange={(e) => setUpdateForm({...updateForm, order_status: e.target.value})}
                      className="w-full p-3 border border-neutral-300 bg-white focus:outline-none focus:border-[#b5862a] rounded"
                    >
                      <option value="Pending">Pending (Processing)</option>
                      <option value="Confirmed">Confirmed (Sending to Production)</option>
                      <option value="Packed">Packed (Ready for dispatch)</option>
                      <option value="Shipped">Shipped (In Transit)</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Tracking Note */}
                  <div className="mb-4">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-2 mb-2"><Clock size={14} className="text-[#b5862a]" /> Add Timeline Tracking Note</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Shipped via BlueDart. Tracking AWB: 123456789. This will be visible to the customer."
                      value={updateForm.note}
                      onChange={(e) => setUpdateForm({...updateForm, note: e.target.value})}
                      className="w-full p-3 border border-neutral-300 bg-white focus:outline-none focus:border-[#b5862a] rounded resize-y"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-300">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="flex-grow bg-[#161412] text-white py-3.5 uppercase text-xs font-bold tracking-widest hover:bg-[#b5862a] transition-colors rounded disabled:bg-neutral-400"
                  >
                    {isUpdating ? 'Saving Matrix...' : 'Commit Updates'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 bg-white border border-neutral-300 text-neutral-600 py-3.5 uppercase text-xs font-bold tracking-widest hover:bg-neutral-100 rounded"
                  >
                    Close
                  </button>
                </div>
              </form>

              {/* View Existing Timeline (For Admin Reference) */}
              <div className="mt-8 bg-white p-4 rounded-xl border border-neutral-200">
                 <h4 className="text-[11px] uppercase tracking-widest font-bold text-neutral-400 mb-3">Past History Log</h4>
                 <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                   {Array.isArray(selectedOrder.timeline) && selectedOrder.timeline.map((event, i) => (
                     <div key={i} className="flex gap-3 items-start relative pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-[#b5862a] mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="text-xs font-bold text-neutral-800 uppercase">{event.status}</p>
                          <p className="text-[10px] text-neutral-400 font-mono my-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                          <p className="text-xs text-neutral-600 mt-1">{event.note}</p>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}