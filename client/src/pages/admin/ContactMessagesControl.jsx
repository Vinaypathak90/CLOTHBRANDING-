import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Mail, MessageCircle, CheckCircle, RefreshCw, Clock, User, Phone, Tag, Trash2 } from 'lucide-react';

export default function ContactMessagesControl() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState({});
  const [sendingId, setSendingId] = useState(null); // Track which message is currently being replied to
  const [deletingId, setDeletingId] = useState(null); // Track which message is currently being deleted

  // 📥 Fetch all messages from backend
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/contact/admin/list');
      if (res.data && res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✉️ Handle Email Reply
  const handleEmailReply = async (id, email, subject) => {
    const replyText = replyInputs[id];
    if (!replyText || replyText.trim() === '') {
      return alert("Bhai, pehle reply box mein kuch message toh type karo!");
    }

    try {
      setSendingId(id);
      await axiosInstance.post('/contact/admin/reply-email', { 
        id, 
        userEmail: email, 
        subject, 
        replyText 
      });
      
      // Clear input and refresh list
      setReplyInputs(prev => ({ ...prev, [id]: '' }));
      fetchMessages();
    } catch (err) {
      console.error(err);
      alert("Email send karne mein error aayi. Backend check karo.");
    } finally {
      setSendingId(null);
    }
  };

  // 💬 Handle WhatsApp Reply
  const handleWhatsappReply = async (id, phone) => {
    const replyText = replyInputs[id];
    if (!replyText || replyText.trim() === '') {
      return alert("Bhai, pehle reply box mein kuch message toh type karo!");
    }
    
    try {
      setSendingId(id);
      
      // Remove any spaces or special characters from phone number
      const cleanPhone = phone.replace(/\D/g, ''); 
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyText)}`;
      
      // Open WhatsApp Web/App in a new tab
      window.open(waUrl, '_blank');
      
      // Save status in DB to mark as Replied via WA
      await axiosInstance.post('/contact/admin/reply-wa', { id, replyText });
      
      setReplyInputs(prev => ({ ...prev, [id]: '' }));
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  // 🗑️ Handle Delete Message
  const handleDeleteMessage = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this message?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      const res = await axiosInstance.delete(`/contact/admin/delete/${id}`);
      if (res.data && res.data.success) {
        // UI se message immediately hata do (Bina refresh kiye fast lagega)
        setMessages(prev => prev.filter(msg => msg.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Error deleting message.");
    } finally {
      setDeletingId(null);
    }
  };

  // Format Date neatly
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin text-[#b5862a] mb-4" size={28} />
        <p className="text-xs tracking-widest uppercase font-bold text-neutral-400">Loading Customer Inquiries...</p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 gap-8 items-start min-w-0">
      
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="font-['Playfair_Display'] text-2xl font-normal text-[#1a1a1a]">Inbox CRM</h2>
          <p className="text-sm text-neutral-500 mt-1 font-light">Manage, reply to, and clean up customer inquiries.</p>
        </div>
        <button 
          onClick={fetchMessages}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#b5862a] hover:text-[#1a1a1a] transition-colors bg-white px-4 py-2 rounded-md shadow-sm border border-neutral-200"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="w-full bg-white border border-dashed border-neutral-300 rounded-xl py-24 text-center flex flex-col items-center">
          <Mail size={32} className="text-neutral-300 mb-4" />
          <p className="text-lg text-neutral-500 font-['Playfair_Display'] italic">Inbox is completely empty.</p>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mt-2">No customer inquiries yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md relative group">
              
              {/* TOP HEADER OF MESSAGE CARD */}
              <div className="bg-neutral-50 border-b border-neutral-200 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                
                {/* User Details */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#1a1a1a]">
                    <User size={16} className="text-[#b5862a]" />
                    <span className="font-bold text-sm tracking-wide">{msg.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-500">
                    <span className="flex items-center gap-1.5"><Mail size={12} /> {msg.email}</span>
                    {msg.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {msg.phone}</span>}
                  </div>
                </div>

                {/* Status, Time & Delete Button */}
                <div className="flex items-start gap-4 shrink-0">
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm border ${
                      msg.status === 'Unread' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5'
                    }`}>
                      {msg.status !== 'Unread' && <CheckCircle size={10} />}
                      {msg.status}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                      <Clock size={10} /> {formatDate(msg.created_at)}
                    </span>
                  </div>
                  
                  {/* 🔥 THE NEW DELETE BUTTON */}
                  <button 
                    onClick={() => handleDeleteMessage(msg.id)}
                    disabled={deletingId === msg.id}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600 rounded-md transition-all duration-300 disabled:opacity-50"
                    title="Delete Message"
                  >
                    {deletingId === msg.id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>

              </div>

              {/* MESSAGE CONTENT */}
              <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#b5862a]">
                    <Tag size={12} /> Subject:
                  </span>
                  <p className="text-sm font-bold text-[#1a1a1a]">{msg.subject || "No Subject"}</p>
                </div>
                
                <div className="bg-[#f7f4ef]/50 border border-[#e8e2d8] p-4 rounded-lg">
                  <p className="text-sm font-light text-neutral-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>

                {/* SHOW PREVIOUS REPLY IF ANY */}
                {msg.reply_text && (
                  <div className="bg-green-50/50 border border-green-100 p-4 rounded-lg mt-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-green-700 block mb-1">Your Previous Reply:</span>
                    <p className="text-sm text-green-800 italic">"{msg.reply_text}"</p>
                  </div>
                )}

                <hr className="border-neutral-100 my-2" />

                {/* REPLY ACTION BOX */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Quick Reply Dashboard</span>
                  <textarea 
                    rows={3}
                    placeholder={`Type your reply to ${msg.name} here...`}
                    value={replyInputs[msg.id] || ''}
                    onChange={(e) => setReplyInputs({ ...replyInputs, [msg.id]: e.target.value })}
                    className="w-full bg-white border border-neutral-200 p-3.5 text-sm rounded-md focus:outline-none focus:border-[#b5862a] resize-y"
                  />
                  
                  <div className="flex flex-wrap gap-3 mt-1">
                    <button 
                      onClick={() => handleEmailReply(msg.id, msg.email, msg.subject)}
                      disabled={sendingId === msg.id}
                      className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#b5862a] transition-all disabled:opacity-50 shadow-sm"
                    >
                      {sendingId === msg.id ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                      {sendingId === msg.id ? 'Sending...' : 'Reply via Email'}
                    </button>

                    {msg.phone && (
                      <button 
                        onClick={() => handleWhatsappReply(msg.id, msg.phone)}
                        disabled={sendingId === msg.id}
                        className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#1ebe57] transition-all disabled:opacity-50 shadow-sm"
                      >
                        {sendingId === msg.id ? <RefreshCw size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                        Send WhatsApp Script
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}