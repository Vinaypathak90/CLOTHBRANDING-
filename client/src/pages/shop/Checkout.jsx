import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { ShieldCheck, MapPin, CheckCircle, Image as ImageIcon, Smartphone, UploadCloud, Loader2 } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, refreshCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);

  // States for CMS Settings (Fetched from backend)
  const [adminSettings, setAdminSettings] = useState({ upi_id: '', merchant_name: '', whatsapp_number: '' });
  
  // Checkout Form States
  const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Financial Calculations (Logistics and Packaging Removed)
  const subtotal = cartItems.reduce((total, item) => total + ((item.products?.price || item.product?.price || 0) * item.quantity), 0);
  const finalPayable = subtotal;

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
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  // ==========================================
  // 📸 DIRECT CLOUDINARY IMAGE UPLOAD LOGIC
  // ==========================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const cloudData = await res.json();
      
      if (cloudData.secure_url) {
        setScreenshotUrl(cloudData.secure_url);
      } else {
        alert("Upload failed. Please check your Cloudinary configuration.");
      }
    } catch (err) {
      console.error("Image Upload Error:", err);
      alert("Failed to upload image. Please check your internet connection.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // 🚀 ORDER PLACEMENT & WHATSAPP LOGIC
  // ==========================================
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("Your bag is empty!");
      return navigate('/cart');
    }
    
    if (!screenshotUrl) {
      alert("Please upload the payment screenshot to proceed.");
      return;
    }

    try {
      setIsProcessing(true);

      // Clean Items for Database and WhatsApp
      const cleanItems = cartItems.map(item => ({
        product_id: item.product_id || item.id,
        name: item.products?.name || item.product?.name || item.name || 'Luxury Product',
        price: item.products?.price || item.product?.price || item.price || 0,
        image: item.products?.images?.[0] || item.product?.images?.[0] || item.image || '',
        size: item.selected_size || item.size || 'Standard',
        quantity: item.quantity || 1
      }));

      // 1. Send data to backend
      const orderPayload = {
        user_id: currentUser?.id,
        items: cleanItems,
        shipping_address: shippingAddress,
        subtotal_amount: subtotal,
        delivery_charge: 0, // Set to 0 to prevent backend DB null errors
        payment_screenshot_url: screenshotUrl
      };

      const res = await axiosInstance.post('/orders/create-qr', orderPayload);

      if (res.data.success) {
        const orderId = res.data.order.order_id_string;
        
        // 2. Generate Itemized List for WhatsApp
        const itemListText = cleanItems.map((item, index) => {
          return `${index + 1}. ${item.name}\n   Size: ${item.size} | Qty: ${item.quantity} | Price: ₹${item.price}`;
        }).join('\n\n');

        // 3. Construct the comprehensive WhatsApp Message
        const message = `Hello ${adminSettings.merchant_name || 'Preeti Couture'}! ✨\n\nI have placed a new order on your website.\n\n*Order ID:* ${orderId}\n\n*🛍️ ITEMS ORDERED:*\n${itemListText}\n\n*💳 BILLING SUMMARY:*\n*Total Paid:* ₹${finalPayable.toLocaleString('en-IN')}\n\n*Status:* Payment Screenshot Uploaded\n\nPlease verify and confirm my order. Thank you!`;
        
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

            {/* Direct Image Upload Box */}
            <div className="bg-white p-8 rounded-xl border border-[#EAE4D8] shadow-sm">
              <h2 className="text-sm uppercase font-bold tracking-widest text-[#b5862a] flex items-center gap-2 mb-6 border-b border-[#EAE4D8] pb-3">
                <UploadCloud size={18} /> Upload Payment Proof
              </h2>
              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                After making the payment via the QR code, please upload your screenshot below to verify the order.
              </p>
              
              <div className="flex flex-col items-center justify-center w-full">
                {!screenshotUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#b5862a] border-dashed rounded cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                         <Loader2 className="animate-spin text-[#b5862a] mb-2" size={30} />
                      ) : (
                         <ImageIcon className="text-[#b5862a] mb-2" size={30} />
                      )}
                      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                        {isUploading ? "Uploading Securely..." : "Tap to Upload Screenshot"}
                      </p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                ) : (
                  <div className="relative w-full border border-green-200 bg-green-50 rounded p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={screenshotUrl} alt="Uploaded Proof" className="w-14 h-14 object-cover rounded border border-neutral-300 shadow-sm" />
                      <div>
                        <div className="text-sm font-bold text-green-700 flex items-center gap-1 mb-1">
                          <CheckCircle size={16} /> Upload Confirmed
                        </div>
                        <p className="text-[10px] text-neutral-500 font-mono break-all line-clamp-1">{screenshotUrl}</p>
                      </div>
                    </div>
                    <button onClick={() => setScreenshotUrl('')} className="text-[10px] uppercase tracking-widest text-red-500 font-bold hover:underline bg-white px-3 py-1.5 rounded border border-red-200">Replace</button>
                  </div>
                )}
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
                
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-neutral-800">
                  <span>Total Payable</span>
                  <span className="text-[#d4af37]">₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing || isUploading}
                className={`w-full py-4 rounded font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 ${isProcessing || isUploading ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed' : 'bg-[#d4af37] text-[#161412] hover:bg-white'}`}
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