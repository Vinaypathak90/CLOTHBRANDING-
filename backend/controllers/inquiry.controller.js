const { supabase } = require('../config/db');

// ==========================================
// CLIENT FACING OPERATIONS (PUBLIC ROUTE)
// ==========================================

// 1. Submit Contact/Inquiry Form
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Input validations basic check
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All mandatory fields must be populated.' });
    }

    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        subject: subject ? subject.trim() : 'General Inquiry',
        message: message.trim(),
        status: 'Pending'
      }])
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Your message has crossed into our system matrix. We will connect shortly.",
      data
    });
  } catch (err) { next(err); }
};

// ==========================================
// ADMIN CRM OPERATIONS (SECURE GATEWAY)
// ==========================================

// 2. Admin Module: Fetch all contact submissions for CRM dashboard overview
exports.adminGetAllInquiries = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) { next(err); }
};

// 3. Admin Module: Change status (e.g., Pending -> Reviewed)
exports.adminUpdateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nextStatus } = req.body; // Reviewed or Archived

    const { data, error } = await supabase
      .from('inquiries')
      .update({ status: nextStatus })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Inquiry lifecycle status updated.', data });
  } catch (err) { next(err); }
};
