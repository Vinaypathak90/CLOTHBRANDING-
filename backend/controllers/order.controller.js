const { supabase } = require('../config/db');
const crypto = require('crypto');

// ====================================================================
// 🛠️ UTILITY CORE: SAFE INVOICE ID GENERATORS
// ====================================================================
const designatorCodeGenerator = () => {
  const randomizedSeed = Math.floor(100000 + Math.random() * 900000);
  return `PRT-${new Date().getFullYear()}-${randomizedSeed}`;
};

const whatsappOrderCodeGenerator = () => {
  return `PRT-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

// ====================================================================
// 👤 CLIENT CONTEXT PIPELINES (PUBLIC / SECURE SHOP ENGINE)
// ====================================================================

// 1. Checkout Step: Create Order via Gateway (Legacy Code Path Retention)
exports.instantiateCheckoutOrder = async (req, res, next) => {
  try {
    const { items, shipping_address, subtotal_amount, discount_amount, delivery_charge, final_payable, razorpay_order_id } = req.body;
    const authenticatedClientId = req.user ? req.user.id : null; 

    const assignedCustomInvoiceId = designatorCodeGenerator();
    const immediateInitialTimestamp = new Date().toISOString();
    
    const baselineTrackingTimeline = [
      {
        status: 'Pending',
        timestamp: immediateInitialTimestamp,
        note: 'Order request received. Payment processing validation active.'
      }
    ];

    const { data: orderRecord, error } = await supabase
      .from('orders')
      .insert([{
        order_id_string: assignedCustomInvoiceId,
        user_id: authenticatedClientId,
        items,
        shipping_address,
        subtotal_amount,
        discount_amount,
        delivery_charge,
        final_payable,
        razorpay_order_id,
        payment_status: 'pending',
        order_status: 'Pending',
        timeline: baselineTrackingTimeline
      }])
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Checkout processing instance saved successfully.',
      order: orderRecord
    });
  } catch (err) { next(err); }
};

// 2. Checkout Step: Create WhatsApp Custom Order (New Manual UPI QR Flow)
exports.createWhatsAppOrder = async (req, res, next) => {
  try {
    const { 
      user_id, 
      items, 
      shipping_address, 
      subtotal_amount,
      delivery_charge = 0,
      discount_amount = 0,
      payment_screenshot_url
    } = req.body;

    const final_payable = (Number(subtotal_amount) + Number(delivery_charge)) - Number(discount_amount);
    const order_id_string = whatsappOrderCodeGenerator();

    const initialTimeline = [{
      status: "Pending",
      timestamp: new Date().toISOString(),
      note: "Order placed via QR Checkout. Awaiting Admin verification."
    }];

    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert([{
        order_id_string,
        user_id: user_id || null, 
        items,
        shipping_address,
        subtotal_amount,
        delivery_charge,
        discount_amount,
        final_payable,
        payment_screenshot_url,
      
        payment_status: 'pending_verification',
        order_status: 'Pending',
        timeline: initialTimeline
      }])
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Order recorded. Please confirm on WhatsApp.',
      order: newOrder
    });
  } catch (err) { next(err); }
};

// 3. Logistics Pipeline: Fetch Tracking Matrix details via unique string label
exports.getOrderTrackingPipeline = async (req, res, next) => {
  try {
    const { order_id_string } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, delivery_agents(name, phone, current_location_link)')
      .eq('order_id_string', order_id_string.toUpperCase().trim())
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Requested order footprint cannot be mapped within logistics networks.' });
    }

    return res.status(200).json(order);
  } catch (err) { next(err); }
};

// 4. User Dashboard: List all past orders (Legacy compact layout mapping)
exports.getClientOrderHistory = async (req, res, next) => {
  try {
    const { data: historicOrders, error } = await supabase
      .from('orders')
      .select('id, order_id_string, final_payable, order_status, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(historicOrders);
  } catch (err) { next(err); }
};

// 5. User Dashboard: Hydrate full historic purchase profiles (UX Engine Pipe)
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[ATELIER ENGINE]: Hydrating historic purchase grids for user node: ${userId}`);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) { next(err); }
};

// 6. User Dashboard Alternative Context Route (Safety fallback route handler map)
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.user_id; 
    if (!userId) {
      return res.status(400).json({ success: false, message: "User context identification string missing." });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, orders });
  } catch (err) { next(err); }
};

// ====================================================================
// 👑 ADMIN CRM OPERATIONS (AUTHENTICATED MASTER DESK CONTROL GRID)
// ====================================================================

// 7. Admin Panel: Master query execution to audit all incoming system operations logs
exports.adminGetAllOrdersDashboard = async (req, res, next) => {
  try {
    const { statusFilter } = req.query;
    
    let queryBuilder = supabase.from('orders').select('*, users(name, email, phone)');
    if (statusFilter) {
      queryBuilder = queryBuilder.eq('order_status', statusFilter);
    }
    
    const { data: fullOrdersRegister, error } = await queryBuilder.order('created_at', { ascending: false });
    if (error) throw error;

    return res.status(200).json({
      success: true,
      orders: fullOrdersRegister
    });
  } catch (err) { next(err); }
};

// 8. Admin Panel: Advance fulfillment cycle logs and push entries into JSONB timeline array
exports.adminMutateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id || req.params.orderId;
    const { nextStatusState, administrativeNote, order_status, payment_status, note } = req.body;

    // Normalize parameters to support both legacy and newly configured payload styles smoothly
    const targetOrderStatus = order_status || nextStatusState;
    const targetPaymentStatus = payment_status; // Optional parameter update mapping target
    const targetNote = note || administrativeNote;

    const { data: activeCurrentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('timeline')
      .eq('id', orderId)
      .single();

    if (fetchError || !activeCurrentOrder) {
      return res.status(404).json({ success: false, message: 'Target order record identifier tracking node execution failure.' });
    }

    const modifiedHistoryTimelineArray = [...(activeCurrentOrder.timeline || [])];
    modifiedHistoryTimelineArray.push({
      status: targetOrderStatus,
      timestamp: new Date().toISOString(),
      note: targetNote || `Fulfillment cycle status shifted execution target to: ${targetOrderStatus}`
    });

    const updatePayload = {
      order_status: targetOrderStatus,
      timeline: modifiedHistoryTimelineArray,
      updated_at: new Date().toISOString()
    };

    if (targetPaymentStatus) {
      updatePayload.payment_status = targetPaymentStatus;
    }

    const { data: updatedOrderRecord, error: mutationError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select('*')
      .single();

    if (mutationError) throw mutationError;

    return res.status(200).json({
      success: true,
      message: 'Logistics tracking pipeline timeline step expanded securely.',
      order: updatedOrderRecord
    });
  } catch (err) { next(err); }
};

// 9. Admin Panel: Allocate courier parameters dynamically onto standard grids
exports.adminAssignCourierAgent = async (req, res, next) => {
  try {
    const { orderId, courierAgentId } = req.body;

    const { data: orderPayload, error } = await supabase
      .from('orders')
      .update({ 
        delivery_agent_id: courierAgentId,
        order_status: 'Shipped',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Courier coordination records mapped successfully inside order registry.',
      order: orderPayload
    });
  } catch (err) { next(err); }
};
// ====================================================================
// 🔥 ADMIN: DELETE ORDER PERMANENTLY
// ====================================================================
exports.deleteOrder = async (req, res, next) => {
  try {
    // 🔥 FIX: Handled both 'id' and 'orderId' just like your update function!
    const orderId = req.params.id || req.params.orderId;

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID parameter is missing in the request.' 
      });
    }

    // Optional but Recommended: Double-check if the requester is an admin
    if (req.user && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access Denied: You do not have permission to delete orders.' 
      });
    }

    // 1. Verify if the order exists before deleting
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId) // 🔥 Using the dynamic orderId here
      .maybeSingle();

    if (fetchError) throw fetchError;
    
    if (!existingOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or already deleted.' 
      });
    }

    // 2. Perform the permanent delete operation
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId); // 🔥 Using the dynamic orderId here

    if (deleteError) throw deleteError;

    // Log the action on the backend for security tracking
    console.log(`🗑️ [ORDER DELETED]: Order ID ${orderId} was deleted by Admin.`);

    return res.status(200).json({ 
      success: true, 
      message: 'Order has been permanently deleted from the database.' 
    });

  } catch (error) {
    console.error("❌ [ADMIN DELETE ORDER ERROR]:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete the order due to a server error.' 
    });
  }
};