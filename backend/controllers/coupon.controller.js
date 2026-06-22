const { supabase } = require('../config/db');

// ==========================================
// CLIENT FACING CHECKOUT VALIDATIONS
// ==========================================

// 1. Verify and Validate Code active state on cart checkout page
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid token key or promotion has expired.' });
    }

    // Checking validation temporal limits
    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ valid: false, message: 'This coupon timeline window has collapsed.' });
    }

    // Check configuration usage exhaustion ceilings
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ valid: false, message: 'Maximum configuration limits reached for this coupon.' });
    }

    // Check financial requirements threshold limits
    if (Number(orderAmount) < Number(coupon.min_order_value)) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimum required transaction footprint allocation missing. Add items worth $${coupon.min_order_value - orderAmount} more.` 
      });
    }

    // Calculate applied target markdown modifications values
    let dynamicReductionAmt = 0;
    if (coupon.type === 'flat') {
      dynamicReductionAmt = Number(coupon.value);
    } else {
      dynamicReductionAmt = (Number(orderAmount) * Number(coupon.value)) / 100;
      if (coupon.max_discount_cap !== null && dynamicReductionAmt > Number(coupon.max_discount_cap)) {
        dynamicReductionAmt = Number(coupon.max_discount_cap);
      }
    }

    return res.status(200).json({
      valid: true,
      message: 'Promotion criteria applied safely.',
      discountAmount: dynamicReductionAmt,
      code: coupon.code
    });
  } catch (err) { next(err); }
};

// ==========================================
// ADMIN CRM OPERATIONS (SECURE GATEWAY)
// ==========================================

exports.adminCreateCoupon = async (req, res, next) => {
  try {
    const { code, type, value, min_order_value, max_discount_cap, expiry_date, usage_limit } = req.body;

    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        code: code.toUpperCase().trim(),
        type,
        value,
        min_order_value,
        max_discount_cap,
        expiry_date,
        usage_limit
      }])
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, coupon: data });
  } catch (err) { next(err); }
};

exports.adminGetAllCoupons = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) { next(err); }
};

exports.adminDeleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Coupon deleted from records matrix.' });
  } catch (err) { next(err); }
};
