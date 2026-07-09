// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    // 1. Apne Gmail ka transporter (postman) banao
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Email ka format set karo
    const mailOptions = {
      from: `"Preedarshini Couture" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent, // Yahan hum sundar HTML design bhej sakte hain
    };

    // 3. Email bhej do
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL SENT SUCCESSFULLY TO]:", toEmail);
    return info;

  } catch (error) {
    console.error("❌ [EMAIL SENDING FAILED]:", error.message);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;