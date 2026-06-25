const { supabase } = require('../config/db');

// ====================================================================
// 🟢 FETCH ALL APPROVED TESTIMONIALS (For Website)
// ====================================================================
exports.getTestimonials = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false }); // Latest reviews first

    if (error) throw error;

    return res.status(200).json({ success: true, testimonials: data });
  } catch (err) {
    console.error("❌ [FETCH TESTIMONIALS ERROR]:", err);
    next(err);
  }
};

// ====================================================================
// 🟢 SUBMIT NEW TESTIMONIAL (From Website User)
// ====================================================================
exports.submitTestimonial = async (req, res, next) => {
  try {
    const { user_name, rating, review_text } = req.body;

    if (!user_name || !rating || !review_text) {
      return res.status(400).json({ success: false, message: "Name, Rating, and Review Text are required." });
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([{ 
        user_name: user_name.trim(), 
        rating: parseInt(rating), 
        review_text: review_text.trim() 
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ 
      success: true, 
      message: "Thank you! Your review has been submitted successfully.", 
      testimonial: data 
    });
  } catch (err) {
    console.error("❌ [SUBMIT TESTIMONIAL ERROR]:", err);
    next(err);
  }
};

// Add these to existing controller
exports.adminGetAllTestimonials = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, testimonials: data });
  } catch (err) { next(err); }
};

exports.adminUpdateTestimonialStatus = async (req, res, next) => {
  try {
    const { id, is_approved } = req.body;
    const { data, error } = await supabase
      .from('testimonials')
      .update({ is_approved })
      .eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: "Status updated." });
  } catch (err) { next(err); }
};

exports.adminDeleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (err) { next(err); }
};

exports.adminReplyToTestimonial = async (req, res, next) => {
  try {
    const { id, reply_text } = req.body;
    const { data, error } = await supabase
      .from('testimonials')
      .update({ reply_text: reply_text })
      .eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: "Reply sent successfully." });
  } catch (err) { next(err); }
};
