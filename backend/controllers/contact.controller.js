const { supabase } = require('../config/db');
const nodemailer = require('nodemailer');

// Setup your email transport (Use your Gmail or SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } // Add these to your .env
});

// 1. Client Submits Message
// 1. Client Submits Message
exports.submitMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // STEP 1: Save to DB (Yeh tumhara successful chal raha hai)
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, phone, subject, message }])
      .select()
      .single();
      
    if (error) throw error;

    // STEP 2: Send Email Notification (Isko alag try-catch mein daala hai taaki crash na ho)
    try {
      if (transporter && process.env.EMAIL_USER && process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `New Lead: ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
        });
      }
    } catch (emailErr) {
      console.log("⚠️ DB Saved, but Email Notification Failed:", emailErr.message);
      // Notice: Hum yahan throw nahi kar rahe, toh server crash nahi hoga.
    }

    // STEP 3: Send Success Response
    return res.status(200).json({ success: true, message: "Message securely transmitted." });
    
  } catch (err) { 
    console.error("❌ Submit Message Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
// 2. Admin Fetches All Messages
exports.adminGetMessages = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, messages: data });
  } catch (err) { next(err); }
};

// 3. Admin Replies via Email
exports.adminReplyEmail = async (req, res, next) => {
  try {
    const { id, userEmail, replyText, subject } = req.body;

    // Send Email to User
    await transporter.sendMail({
      from: `"Preeti Couture" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Re: ${subject}`,
      text: replyText
    });

    // Update DB status
    const { error } = await supabase.from('contact_messages').update({ reply_text: replyText, status: 'Replied' }).eq('id', id);
    if (error) throw error;

    res.status(200).json({ success: true, message: "Email sent successfully." });
  } catch (err) { next(err); }
};

// 4. Admin marks as replied via WhatsApp
exports.adminMarkWhatsappReplied = async (req, res, next) => {
  try {
    const { id, replyText } = req.body;
    const { error } = await supabase.from('contact_messages').update({ reply_text: replyText, status: 'Replied via WA' }).eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: "Logged as WhatsApp reply." });
  } catch (err) { next(err); }
};

// 5. Admin Deletes a Message
exports.adminDeleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete from database
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    
    res.status(200).json({ success: true, message: "Message deleted permanently." });
  } catch (err) { 
    next(err); 
  }
};
