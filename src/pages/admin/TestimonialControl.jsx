import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Trash2, CheckCircle, XCircle, RefreshCw, MessageSquare, Send } from 'lucide-react';

export default function TestimonialControl() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState({}); // Tracking replies per ID

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get('/testimonials/admin/list');
      setReviews(res.data.testimonials);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleStatus = async (id, currentStatus) => {
    await axiosInstance.put('/testimonials/admin/status', { id, is_approved: !currentStatus });
    fetchReviews();
  };

  const handleReply = async (id) => {
    await axiosInstance.put('/testimonials/admin/reply', { id, reply_text: replyInputs[id] });
    setReplyInputs({...replyInputs, [id]: ''}); // Clear input
    fetchReviews();
  };

  const deleteReview = async (id) => {
    if (window.confirm("Delete this review?")) {
      await axiosInstance.delete(`/testimonials/admin/delete/${id}`);
      fetchReviews();
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200">
      <h2 className="text-xl font-bold mb-6 text-[#1a1a1a]">Manage Customer Feedback</h2>
      {loading ? <RefreshCw className="animate-spin" /> : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="border p-4 rounded-lg flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{r.user_name} <span className="text-xs text-neutral-400">({r.rating} stars)</span></p>
                  <p className="italic text-neutral-600">"{r.review_text}"</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(r.id, r.is_approved)}>
                    {r.is_approved ? <CheckCircle className="text-green-500" size={20}/> : <XCircle className="text-red-500" size={20}/>}
                  </button>
                  <Trash2 className="text-red-400 cursor-pointer" onClick={() => deleteReview(r.id)} size={20}/>
                </div>
              </div>

              {/* Reply Section */}
              <div className="bg-neutral-50 p-3 rounded border">
                {r.reply_text ? (
                  <p className="text-sm text-[#b5862a] font-medium">Admin Reply: {r.reply_text}</p>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      className="flex-grow p-2 text-sm border rounded" 
                      placeholder="Write a reply..."
                      value={replyInputs[r.id] || ''}
                      onChange={(e) => setReplyInputs({...replyInputs, [r.id]: e.target.value})}
                    />
                    <button onClick={() => handleReply(r.id)} className="bg-black text-white px-3 py-1 rounded"><Send size={16}/></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}