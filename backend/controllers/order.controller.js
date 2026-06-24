const { supabase } = require('../config/db');

// Helper system to safely generate deterministic random uppercase invoice identifiers
const designatorCodeGenerator = () => {
  const randomizedSeed = Math.floor(100000 + Math.random() * 900000);
  return `PRT-${new Date().getFullYear()}-${randomizedSeed}`;
};

// ==========================================
// CLIENT CONTEXT PIPELINES (PUBLIC / SECURE)
// ==========================================

// 1. Checkout Step: Create Order & Init Tracking Pipeline
exports.instantiateCheckoutOrder = async (req, res, next) => {
  try {
    const { items, shipping_address, subtotal_amount, discount_amount, delivery_charge, final_payable, razorpay_order_id } = req.body;
    const authenticatedClientId = req.user ? req.user.id : null; // Accommodate guest users natively

    const assignedCustomInvoiceId = designatorCodeGenerator();
    const immediateInitialTimestamp = new Date().toISOString();
    
    // Construct first verification node log element entry inside timeline array
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

// 2. Fetch tracking details for a single specific order via custom string identifier
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

// 3. User Dashboard: List all past orders executed by a specific profile account
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

// 4. FETCH PROFILE EXECUTED ORDERS (Natively feeds the Profile Dashboard Viewport)
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[ATELIER ENGINE]: Hydrating historic purchase grids for user node: ${userId}`);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ [SUPABASE HISTORY ERROR]:", error.message);
      return next(error);
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) { next(err); }
};

// ==========================================
// ADMIN CRM OPERATIONS (SECURE CONTROL PANEL)
// ==========================================

// 5. Admin Module: Master query pipeline execution to audit all incoming operations state logs
exports.adminGetAllOrdersDashboard = async (req, res, next) => {
  try {
    const { statusFilter } = req.query;
    
    let queryBuilder = supabase.from('orders').select('*, users(name, email)');
    if (statusFilter) {
      queryBuilder = queryBuilder.eq('order_status', statusFilter);
    }
    
    const { data: fullOrdersRegister, error } = await queryBuilder.order('created_at', { ascending: false });
    if (error) throw error;

    return res.status(200).json(fullOrdersRegister);
  } catch (err) { next(err); }
};

// 6. Admin Module: Advance pipeline steps and inject historical entries into the JSONB array
exports.adminMutateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nextStatusState, administrativeNote } = req.body;

    // Fetch existing order profile coordinates to download active timeline arrays matrix snapshot
    const { data: activeCurrentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('timeline, order_status')
      .eq('id', id)
      .single();

    if (fetchError || !activeCurrentOrder) {
      return res.status(404).json({ message: 'Target order record identifier tracking node execution failure.' });
    }

    const modifiedHistoryTimelineArray = [...activeCurrentOrder.timeline];
    modifiedHistoryTimelineArray.push({
      status: nextStatusState,
      timestamp: new Date().toISOString(),
      note: administrativeNote || `Fulfillment cycle status shifted execution target to: ${nextStatusState}`
    });

    // Execute atomic changes updates back down onto database table structure properties
    const { data: updatedOrderRecord, error: mutationError } = await supabase
      .from('orders')
      .update({
        order_status: nextStatusState,
        timeline: modifiedHistoryTimelineArray,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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

// 7. Admin Module: Allocate courier agent parameters
exports.adminAssignCourierAgent = async (req, res, next) => {
  try {
    const { orderId, courierAgentId } = req.body;

    const { data: orderPayload, error } = await supabase
      .from('orders')
      .update({ 
        delivery_agent_id: courierAgentId,
        order_status: 'Shipped' // Automatically advance workflow to Shipped state
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