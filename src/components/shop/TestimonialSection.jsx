import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/testimonials/list');
        if (res.data?.success) {
          // Data ko double kar rahe hain taaki scroll gapless (smooth) rahe
          const data = res.data.testimonials;
          setTestimonials([...data, ...data, ...data]); 
        }
      } catch (err) {
        console.error("Testimonial fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="w-full py-24 bg-[#F9F7F2] overflow-hidden">
      <div className="max-w-[1400px] mx-auto text-center mb-16">
        <span className="text-[0.65rem] tracking-[0.5em] uppercase text-[#b5862a] font-bold">Client Diaries</span>
        <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#161412] mt-4">Words of Appreciation</h2>
      </div>

      {/* Infinite Scroll Wrapper */}
      <motion.div 
        className="flex gap-6 cursor-grab"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 40, 
          ease: "linear", 
          repeat: Infinity 
        }}
      >
        {testimonials.map((t, index) => (
          <div 
            key={index} 
            className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-2xl border border-neutral-100 shadow-[0_5px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#f7f4ef] mb-6 flex items-center justify-center text-[#b5862a] font-bold text-lg">
              {t.user_name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < t.rating ? "#b5862a" : "transparent"} color="#b5862a" />
              ))}
            </div>

            <p className="text-neutral-600 font-light italic mb-6 leading-relaxed text-sm">"{t.review_text}"</p>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1a1a1a]">{t.user_name}</h4>
          </div>
        ))}
      </motion.div>
    </section>
  );
}