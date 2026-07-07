import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Save, Phone, QrCode, Building2, ShieldAlert } from 'lucide-react';

export default function AdminPaymentSettings() {
  // State Matrix for Dynamic Variables
  const [whatsapp, setWhatsapp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hydrate settings when dashboard loads
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Yeh API hum next step mein banayenge
        const res = await axiosInstance.get('/cms/settings');
        if (res.data && res.data.settings) {
          setWhatsapp(res.data.settings.whatsapp_number || '');
          setUpiId(res.data.settings.upi_id || '');
          setMerchantName(res.data.settings.merchant_name || '');
        }
      } catch (err) {
        console.error("[ADMIN SYS]: Failed to fetch gateway settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Overriding existing config in the database
      const res = await axiosInstance.post('/cms/settings', {
        whatsapp_number: whatsapp,
        upi_id: upiId,
        merchant_name: merchantName
      });

      if (res.data.success) {
        alert("System Configuration Updated! The changes are now live on the Checkout Page.");
      }
    } catch (err) {
      console.error("[ADMIN SYS]: Matrix save failed", err);
      alert("Failed to update settings. Please check server connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 shadow-sm border border-[#EAE4D8] max-w-3xl">
      
      {/* Header Section */}
      <div className="mb-8 border-b border-[#EAE4D8] pb-5">
        <h2 className="font-display text-2xl uppercase tracking-widest text-[#161412]">
          Payment & Contact Engine
        </h2>
        <p className="text-neutral-500 text-sm mt-2 font-body">
          Configure the active UPI credentials and WhatsApp redirection number for the guest/user checkout flow.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6 font-body">
        
        {/* UPI Merchant Name */}
        <div>
          <label className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-neutral-500 mb-2 font-bold">
            <Building2 size={14} className="text-[#b5862a]" /> Display Merchant Name
          </label>
          <input 
            type="text" 
            required
            placeholder="e.g., Preeti Couture" 
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            className="w-full p-4 border border-neutral-300 bg-transparent focus:outline-none focus:border-[#b5862a] transition-colors"
          />
        </div>

        {/* UPI ID */}
        <div>
          <label className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-neutral-500 mb-2 font-bold">
            <QrCode size={14} className="text-[#b5862a]" /> Active UPI ID
          </label>
          <input 
            type="text" 
            required
            placeholder="e.g., brandname@icici" 
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full p-4 border border-neutral-300 bg-transparent focus:outline-none focus:border-[#b5862a] transition-colors"
          />
        </div>

        {/* WhatsApp Redirection Number */}
        <div>
          <label className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-neutral-500 mb-2 font-bold">
            <Phone size={14} className="text-[#b5862a]" /> WhatsApp Business Number
          </label>
          <input 
            type="text" 
            required
            placeholder="e.g., 919876543210 (Include Country Code, No +)" 
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-4 border border-neutral-300 bg-transparent focus:outline-none focus:border-[#b5862a] transition-colors"
          />
          <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
            <ShieldAlert size={12} /> Do not include '+' or spaces. Customers will be redirected here after checkout.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-6">
          <button 
            type="submit"
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 w-full md:w-auto px-10 py-4 text-xs uppercase tracking-[0.25em] font-bold transition-all duration-300 ${
              isSaving 
                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' 
                : 'bg-[#161412] text-white hover:bg-[#d4af37] hover:text-[#161412]'
            }`}
          >
            {isSaving ? 'Synchronizing...' : (
              <>
                <Save size={16} /> Deploy Configuration
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}