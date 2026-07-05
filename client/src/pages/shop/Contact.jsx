import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// 🔥 FIX: Removed Instagram, Twitter, Linkedin from here to prevent Vite Cache Errors
import { MapPin, Phone, Mail, Send, MessageCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { CMSContext } from '../../context/CMSContext';

// 🔥 FIX: Added pure SVG components so they never break regardless of lucide-react version
const InstagramIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>);
const TwitterIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>);
const LinkedinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>);

export default function ContactUs() {
  const navigate = useNavigate();
  const { cmsConfig } = useContext(CMSContext);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [agreePolicy, setAgreePolicy] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreePolicy) {
      alert("Please agree to the privacy policy to continue.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/contact/submit', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setAgreePolicy(false);
      setTimeout(() => setSubmitStatus(null), 8000);
    } catch (err) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe Fallbacks from CMS
  const heroTitle = cmsConfig?.contact_hero_title || "GET IN TOUCH";
  const heroSubtitle = cmsConfig?.contact_hero_subtitle || "We'd love to hear from you. Fill out the form or reach us directly.";
  const displayEmail = cmsConfig?.contact_email || "hello@preeticouture.com";
  const displayPhone = cmsConfig?.contact_phone || "+1 555-123-4567";
  const waNumber = cmsConfig?.contact_whatsapp || "919000000000";
  const displayAddress = cmsConfig?.contact_address || "123 Innovation Drive, Suite 400\nSeattle, WA 98101";
  const mapIframeSrc = cmsConfig?.contact_map_src || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.610582531649!2d-122.33857502422055!3d47.61426617119299!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54906ab3f9202519%3A0xc3178c56ccbf5b27!2sSeattle%2C%20WA!5e0!3m2!1sen!2sus!4v1704987654321!5m2!1sen!2sus";

  return (
    <div className="relative min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-['DM_Sans'] pb-24 overflow-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-white z-0 border-b border-gray-100">
         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto pt-24 md:pt-32 px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }} 
          className="max-w-2xl mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#111827] uppercase tracking-tight mb-4">
            {heroTitle}
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed">
            {heroSubtitle}
          </p>
        </motion.div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: CONTACT FORM CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full"
          >
            <h2 className="text-xl font-bold text-[#1a1a1a] uppercase tracking-wide mb-8">Send a Message</h2>

            {submitStatus === 'success' ? (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-8 rounded-2xl text-center flex flex-col items-center justify-center h-[400px]">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                <p className="text-gray-600">Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Full Name<span className="text-red-500">*</span></label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Full Name*" className="w-full bg-[#f8f9fa] border border-gray-200 px-5 py-3.5 text-sm rounded-full focus:bg-white focus:border-[#b5862a] focus:ring-1 focus:ring-[#b5862a] outline-none transition-all" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Email Address<span className="text-red-500">*</span></label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Email Address*" className="w-full bg-[#f8f9fa] border border-gray-200 px-5 py-3.5 text-sm rounded-full focus:bg-white focus:border-[#b5862a] focus:ring-1 focus:ring-[#b5862a] outline-none transition-all" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Phone Number<span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Phone Number*" className="w-full bg-[#f8f9fa] border border-gray-200 px-5 py-3.5 text-sm rounded-full focus:bg-white focus:border-[#b5862a] focus:ring-1 focus:ring-[#b5862a] outline-none transition-all" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Subject<span className="text-red-500">*</span></label>
                    <input type="text" name="subject" required value={formData.subject} onChange={handleChange} placeholder="Subject*" className="w-full bg-[#f8f9fa] border border-gray-200 px-5 py-3.5 text-sm rounded-full focus:bg-white focus:border-[#b5862a] focus:ring-1 focus:ring-[#b5862a] outline-none transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700">Message<span className="text-red-500">*</span></label>
                  <textarea rows={4} name="message" required value={formData.message} onChange={handleChange} placeholder="Message*" className="w-full bg-[#f8f9fa] border border-gray-200 px-5 py-4 text-sm rounded-2xl focus:bg-white focus:border-[#b5862a] focus:ring-1 focus:ring-[#b5862a] outline-none resize-y transition-all" />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="privacy" checked={agreePolicy} onChange={(e) => setAgreePolicy(e.target.checked)} className="w-4 h-4 text-[#b5862a] border-gray-300 rounded focus:ring-[#b5862a] cursor-pointer" />
                  <label htmlFor="privacy" className="text-xs text-gray-500 cursor-pointer">I agree to the <span className="text-blue-600 hover:underline">privacy policy</span></label>
                </div>

                <button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-[#0052cc] text-white py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#0043a8] transition-colors flex items-center justify-center shadow-md disabled:bg-gray-400">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* RIGHT: INFO & MAP CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full lg:w-[420px] bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col shrink-0"
          >
            <h2 className="text-xl font-bold text-[#1a1a1a] uppercase tracking-wide mb-6">Visit Our Office</h2>
            
            {/* Map iframe */}
            <div className="w-full h-[180px] bg-gray-200 rounded-xl overflow-hidden mb-8 border border-gray-100">
              <iframe 
                src={mapIframeSrc}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Contact Details List */}
            <div className="flex flex-col gap-6">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f3ff] flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-[#0052cc]" />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-xs font-bold text-gray-900 uppercase">Call Us</span>
                  <span className="text-sm text-gray-600">{displayPhone}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f3ff] flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-[#0052cc]" />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-xs font-bold text-gray-900 uppercase">Email Us</span>
                  <span className="text-sm text-gray-600">{displayEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e6f3ff] flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-[#0052cc]" />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-xs font-bold text-gray-900 uppercase">Our Address</span>
                  <span className="text-sm text-gray-600 whitespace-pre-line">{displayAddress}</span>
                </div>
              </div>

            </div>

            <hr className="my-8 border-gray-100" />

            {/* Social Media */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-900 uppercase">Social Media</span>
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 rounded-md bg-[#0077b5] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                  <LinkedinIcon />
                </a>
                <a href="#" className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                  <TwitterIcon />
                </a>
                <a href="#" className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                  <InstagramIcon />
                </a>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a 
              href={`https://wa.me/${waNumber}?text=Hi, I have an inquiry.`} 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 w-full bg-[#25D366] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-[#1ebe57] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>

          </motion.div>

        </div>
      </div>
    </div>
  );
}