import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { ShieldCheck, MapPin, QrCode, CheckCircle, Image as ImageIcon, Smartphone } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, refreshCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);

  // States for CMS Settings (Fetched from backend)
  const [adminSettings, setAdminSettings] = useState({ upi_id: '', merchant_name: '', whatsapp_number: '' });
  
  // Checkout Form States
  const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Financial Calculations
  const subtotal = cartItems.reduce((total, item) => total + ((item.products?.price || item.product?.price || 0) * item.quantity), 0);
  const deliveryCharge = subtotal > 5000 ? 0 : 250; // Free shipping over 5000
  const finalPayable = subtotal + deliveryCharge;

  // Fetch Admin Payment Settings on Load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get('/cms/settings');
        if (res.data?.success && res.data.settings) {
          setAdminSettings(res.data.settings);
        }
      } catch (err) {
        console.error("Failed to load payment settings:", err);
      }
    };
    fetchSettings();
  }, []);

  // Generate dynamic UPI Link for QR
  const upiLink = `upi://pay?pa=${adminSettings.upi_id}&pn=${encodeURIComponent(adminSettings.merchant_name)}&am=${finalPayable}&cu=INR`;
  // Using a free, reliable QR generation API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  // Handle Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("Your bag is empty!");
      return navigate('/cart');
    }
    
    if (!screenshotUrl) {
      alert("Please provide the payment screenshot URL.");
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Send data to backend (Our WhatsApp Order Controller)
      const orderPayload = {
        user_id: currentUser?.id,
        items: cartItems,
        shipping_address: shippingAddress,
        subtotal_amount: subtotal,
        delivery_charge: deliveryCharge,
        payment_screenshot_url: screenshotUrl
      };

      const res = await axiosInstance.post('/orders/create-qr', orderPayload);

      if (res.data.success) {
        // 2. Clear Cart visually and on DB
        // (If you want to clear DB cart, you can call a clear API here. For now, we proceed)
        
        // 3. Construct WhatsApp Message
        const orderId = res.data.order.order_id_string;
        const message = `Hello ${adminSettings.merchant_name}! ✨\n\nI have placed a new order on your website.\n\n*Order ID:* ${orderId}\n*Amount Paid:* ₹${finalPayable.toLocaleString('en-IN')}\n*Status:* Payment Screenshot Uploaded\n\nPlease verify and confirm my order. Thank you!`;
        
        const whatsappUrl = `https://wa.me/${adminSettings.whatsapp_number}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        // Redirect user to their order history dashboard
        navigate('/user/orders');
      }

    } catch (err) {
      console.error("Order processing failed:", err);
      alert("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] pt-[120px] pb-24 font-body text-[#161412]">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-widest text-[#161412]">Secure Checkout</h1>
          <p className="text-neutral-500 text-sm mt-3 uppercase tracking-wider font-bold"><ShieldCheck className="inline mb-1 mr-1 text-green-600" size={16}/> 100% Secure Encrypted Payment</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ==========================================
              LEFT PANEL: SHIPPING & PAYMENT PROOF
             ========================================== */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            {/* Address Form */}
            <div className="bg-white p-8 rounded-xl border border-[#EAE4D8] shadow-sm">
              <h2 className="text-sm uppercase font-bold tracking-widest text-[#b5862a] flex items-center gap-2 mb-6 border-b border-[#EAE4D8] pb-3">
                <MapPin size={18} /> Shipping Destination
              </h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1 block">Complete Street Address</label>
                  <input type="text" required value={shippingAddress.street} onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})} className="w-full p-3 border border-neutral-300 rounded focus:border-[#b5862a] focus:outline-none text-sm" placeholder="House/Flat No, Street, Landmark" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1 block">City</label>
                  <input type="text" required value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full p-3 border border-neutral-300 rounded focus:border-[#b5862a] focus:outline-none text-sm" placeholder="New Delhi" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1 block">State / Province</label>
                  <input type="text" required value={shippingAddress.state} onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} className="w-full p-3 border border-neutral-300 rounded focus:border-[#b5862a] focus:outline-none text-sm" placeholder="Delhi" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1 block">Postal Pincode</label>
                  <input type="text" required value={shippingAddress.pincode} onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})} className="w-full p-3 border border-neutral-300 rounded focus:border-[#b5862a] focus:outline-none text-sm" placeholder="110001" />
                </div>
              </form>
            </div>

            {/* Payment Verification Upload */}
            <div className="bg-white p-8 rounded-xl border border-[#EAE4D8] shadow-sm">
              <h2 className="text-sm uppercase font-bold tracking-widest text-[#b5862a] flex items-center gap-2 mb-6 border-b border-[#EAE4D8] pb-3">
                <ImageIcon size={18} /> Payment Verification
              </h2>
              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                After scanning the QR code and completing the payment, please paste the URL/Link of your payment screenshot here. 
                <br/><span className="text-red-500 font-bold">* Required for order confirmation.</span>
              </p>
              <div>
                <input 
                  type="url" 
                  required
                  placeholder="https://your-image-link-here.com/screenshot.jpg" 
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="w-full p-4 border border-neutral-300 rounded focus:border-[#b5862a] focus:outline-none text-sm font-mono bg-neutral-50" 
                />
              </div>
            </div>

          </div>

          {/* ==========================================
              RIGHT PANEL: PAYMENT QR & SUMMARY
             ========================================== */}
          <div className="w-full lg:w-1/3">
            <div className="bg-[#161412] text-white p-8 rounded-xl sticky top-32 shadow-xl">
              
              <h3 className="font-display text-xl uppercase tracking-widest mb-6 border-b border-neutral-800 pb-4 text-center">Scan & Pay</h3>
              
              {/* Dynamic QR Code */}
              <div className="bg-white p-4 rounded-xl flex justify-center items-center mb-6 max-w-[200px] mx-auto">
                {adminSettings.upi_id ? (
                  <img src={qrImageUrl} alt="UPI Payment QR" className="w-full h-auto rounded" />
                ) : (
                  <div className="text-neutral-500 text-xs text-center py-10">QR System Loading...</div>
                )}
              </div>

              <div className="text-center mb-6">
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Paying To</p>
                <p className="font-bold tracking-wider text-[#d4af37]">{adminSettings.merchant_name || 'Preeti Couture'}</p>
                <p className="text-xs font-mono text-neutral-400 mt-1">{adminSettings.upi_id}</p>
              </div>

              {/* Order Aggregation */}
              <div className="space-y-3 mb-6 text-sm border-t border-neutral-800 pt-6">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Logistics</span>
                  <span>{deliveryCharge === 0 ? <span className="text-[#d4af37]">COMPLEMENTARY</span> : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-neutral-800">
                  <span>Total Payable</span>
                  <span className="text-[#d4af37]">₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-[#d4af37] text-[#161412] py-4 rounded font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing...' : <><Smartphone size={16}/> Confirm & WhatsApp</>}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}