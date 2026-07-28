import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Coupon } from '../models/Coupon';
import { razorpayClient, sendEmail, createShiprocketOrder } from '../config/services';
import { AuthenticatedRequest } from '../middleware/auth';

// Create a new Order in DB and initiate Razorpay checkout order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingDetails, userId, couponCode } = req.body;

    if (!items || !items.length || !shippingDetails) {
      return res.status(400).json({ error: 'Cart items and shipping details are required' });
    }

    let calculatedTotal = 0;
    const orderItems: any[] = [];
    
    // Verify prices & stock from DB
    for (const item of items) {
      let dbProduct = null;
      const isBundleAddon = typeof item.productId === 'string' && item.productId.endsWith('-bundle');
      const cleanProductId = isBundleAddon ? item.productId.replace('-bundle', '') : item.productId;

      if (cleanProductId && cleanProductId.match(/^[0-9a-fA-F]{24}$/)) {
        dbProduct = await Product.findById(cleanProductId);
      }

      if (!dbProduct && !isBundleAddon) {
        return res.status(404).json({ error: `Product ${item.name} not found` });
      }

      let unitPrice = Number(item.price) || 600;
      let swatchName = item.swatchName || 'Standard';

      if (dbProduct) {
        // Stock check
        if (dbProduct.stock < Number(item.quantity)) {
          return res.status(400).json({ error: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stock}` });
        }

        // Decrement stock (only if not a virtual bundle addon)
        if (!isBundleAddon) {
          dbProduct.stock -= Number(item.quantity);
          await dbProduct.save();
        }

        const sizeObj = dbProduct.sizes.find((s) => s.size === Number(item.size));
        unitPrice = sizeObj ? sizeObj.price : dbProduct.basePrice;
        if (isBundleAddon) unitPrice += 600;

        const swatchObj = dbProduct.swatches.find((sw) => sw.hex === item.swatchHex);
        swatchName = swatchObj ? swatchObj.name : 'Custom Swatch';
      }

      calculatedTotal += unitPrice * Number(item.quantity);

      orderItems.push({
        product: dbProduct ? dbProduct._id : cleanProductId,
        name: isBundleAddon ? `${item.name} (Seva Bundle Set)` : (dbProduct ? dbProduct.name : item.name),
        size: Number(item.size) || 0,
        swatchName,
        swatchHex: item.swatchHex || '#C9A84C',
        quantity: Number(item.quantity),
        price: unitPrice,
      });
    }

    // Process coupon code if applied
    let discountAmount = 0;
    let validCouponCode = undefined;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim(), isActive: true });
      if (coupon) {
        const isNotExpired = !coupon.expiryDate || new Date(coupon.expiryDate) >= new Date();
        const hasUsage = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
        const meetsMinAmount = calculatedTotal >= coupon.minOrderAmount;

        if (isNotExpired && hasUsage && meetsMinAmount) {
          if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
          } else if (coupon.discountType === 'percentage') {
            discountAmount = (calculatedTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }
          }
          discountAmount = Number(discountAmount.toFixed(2));
          validCouponCode = coupon.code;
          coupon.usageCount += 1;
          await coupon.save();
        }
      }
    }

    const finalPayableTotal = Math.max(0, calculatedTotal - discountAmount);

    // Unique Order ID for system tracking
    const orderId = `PD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Razorpay Order (Convert finalPayableTotal to Paisa: INR * 100)
    const amountInPaisa = Math.round(finalPayableTotal * 100);
    const rzpOrder = await razorpayClient.orders.create({
      amount: amountInPaisa,
      currency: 'INR',
      receipt: orderId,
      notes: {
        customerEmail: shippingDetails.email,
        customerPhone: shippingDetails.phone,
        couponApplied: validCouponCode || 'None',
      },
    });

    // Check / Auto-Create Account for Checkout
    let activeUserId = userId;
    if (!activeUserId) {
      // Look up if user already exists
      const existingUser = await User.findOne({ email: shippingDetails.email.toLowerCase() });
      if (existingUser) {
        activeUserId = existingUser._id;
      } else {
        // Auto register standard customer account
        const tempPassword = `PremDhaga@${Math.floor(100 + Math.random() * 900)}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);
        const autoUser = new User({
          name: shippingDetails.name,
          email: shippingDetails.email.toLowerCase(),
          phone: shippingDetails.phone,
          password: hashedPassword,
          role: 'customer',
        });
        await autoUser.save();
        activeUserId = autoUser._id;

        // Email temporary credentials
        const loginEmailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #FAF6EF; background-color: #0D0B08; color: #FAF6EF;">
            <h2 style="color: #C9A84C; text-align: center;">Welcome to Prem Dhaga Devotional Atelier! 🌸</h2>
            <p>Pranam ${shippingDetails.name},</p>
            <p>An account has been automatically created for you following your order purchase.</p>
            <div style="padding: 15px; border: 1px solid #C9A84C; margin: 20px 0;">
              <p><strong>Login Email:</strong> ${shippingDetails.email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p>You can login to your account dashboard to track your orders, manage shipping addresses, and sync your wishlist.</p>
            <p style="font-style: italic; color: #8B6914;">"सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।"</p>
          </div>
        `;
        await sendEmail(shippingDetails.email, 'Account Created - Prem Dhaga', loginEmailHtml);
      }
    }

    const newOrder = new Order({
      orderId,
      userId: activeUserId || null,
      items: orderItems,
      totalAmount: finalPayableTotal,
      couponCode: validCouponCode || undefined,
      discountAmount,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      razorpayOrderId: rzpOrder.id,
      shippingDetails,
      trackingTimeline: [
        {
          status: 'pending',
          title: 'Order Created',
          description: 'Your devotional poshak request has been initialized in our database.',
          location: 'Prem Dhaga Server',
          timestamp: new Date(),
        },
      ],
    });

    await newOrder.save();

    return res.status(201).json({
      order: newOrder,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaisa,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_keys_108',
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Verify Razorpay payment signature & confirm database order
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ error: 'Razorpay order ID and payment ID are required.' });
    }

    const order = await Order.findOne({ razorpayOrderId }) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order record not found.' });
    }

    // Verify HMAC signature if secret is available
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = false;

    if (razorpaySecret && razorpaySignature && !razorpaySignature.startsWith('sig_sim')) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === razorpaySignature;
    } else {
      // Allow test mode signatures
      isValid = true;
    }

    if (!isValid) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ error: 'Payment signature verification failed.' });
    }

    // Update payment status in database
    order.paymentStatus = 'paid';
    order.orderStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature || 'verified_sig';

    const alreadyMarkedPaid = order.trackingTimeline.some((t: any) => t.status === 'paid');
    if (!alreadyMarkedPaid) {
      order.trackingTimeline.push(
        {
          status: 'paid',
          title: 'Payment Successful',
          description: 'Payment captured securely via Razorpay.',
          location: 'Razorpay Gateway',
          timestamp: new Date(),
        },
        {
          status: 'confirmed',
          title: 'Order Confirmed',
          description: 'Poshak weaving instructions queued.',
          location: 'Vrindavan Atelier',
          timestamp: new Date(),
        }
      );
    }

    await order.save();

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #FAF6EF; background-color: #0D0B08; color: #FAF6EF;">
        <h2 style="color: #C9A84C; text-align: center;">Jai Shri Krishna 🙏</h2>
        <p>Pranam ${order.shippingDetails.name},</p>
        <p>Thank you for choosing Prem Dhaga. Your order has been placed successfully after payment verification.</p>
        <div style="padding: 15px; border: 1px solid #C9A84C; margin: 20px 0;">
          <h3>Order ID: ${order.orderId}</h3>
          <p><strong>Payment ID:</strong> ${razorpayPaymentId}</p>
          <p><strong>Total Paid: ₹${order.totalAmount}</strong></p>
        </div>
        <p style="font-style: italic; color: #8B6914;">"सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।"</p>
      </div>
    `;
    await sendEmail(order.shippingDetails.email, 'Order Confirmed - Prem Dhaga', emailHtml);

    return res.status(200).json({ message: 'Payment verified and order confirmed', order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Razorpay Payment Success Simulation Route (for offline/local dev)
export const simulatePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findOne({ razorpayOrderId }) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
    order.razorpaySignature = razorpaySignature || 'sig_mock_12345';

    // Add success statuses to timeline
    order.trackingTimeline.push(
      {
        status: 'paid',
        title: 'Payment Successful',
        description: 'Transaction cleared. Funds received securely.',
        location: 'Razorpay Gateway',
        timestamp: new Date(),
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Poshak specifications verified. Weaving sequence initiated.',
        location: 'Vrindavan Atelier',
        timestamp: new Date(),
      }
    );

    // Automatically push confirmed order to Shiprocket Logistics API
    try {
      const shiprocketResult: any = await createShiprocketOrder({
        order_id: order.orderId,
        order_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        pickup_location: 'Primary',
        billing_customer_name: order.shippingDetails.name || 'Devotee',
        billing_last_name: '',
        billing_address: order.shippingDetails.address || 'Vrindavan',
        billing_city: order.shippingDetails.city || 'Mathura',
        billing_pincode: order.shippingDetails.zip || '281001',
        billing_state: order.shippingDetails.state || 'Uttar Pradesh',
        billing_country: 'India',
        billing_email: order.shippingDetails.email || 'customer@premdhaga.com',
        billing_phone: order.shippingDetails.phone || '9876543210',
        shipping_is_billing: true,
        order_items: order.items.map((it: any) => ({
          name: it.name,
          sku: `PD-POSHAK-${it.size}`,
          units: it.quantity,
          selling_price: it.price,
        })),
        payment_method: 'Prepaid',
        sub_total: order.totalAmount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
      });

      if (shiprocketResult && (shiprocketResult.awb_code || shiprocketResult.shipment_id)) {
        order.courierPartner = shiprocketResult.courier_name || 'Shiprocket Logistics (Delhivery / BlueDart)';
        order.trackingId = shiprocketResult.awb_code || `SR-${shiprocketResult.shipment_id}`;
      }
    } catch (srErr) {
      console.warn('[Shiprocket Order Dispatch Error]', srErr);
    }

    await order.save();

    // Stock is already decremented/reserved during order creation. No duplicate decrement on payment success.

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #FAF6EF; background-color: #0D0B08; color: #FAF6EF;">
        <h2 style="color: #C9A84C; text-align: center;">Jai Shri Krishna 🙏</h2>
        <p>Pranam ${order.shippingDetails.name},</p>
        <p>Thank you for choosing Prem Dhaga. Your order has been placed successfully.</p>
        <div style="padding: 15px; border: 1px solid #C9A84C; margin: 20px 0;">
          <h3>Order ID: ${order.orderId}</h3>
          <ul>
            ${order.items.map((i: any) => `<li>${i.name} - Size ${i.size} (${i.swatchName}) x ${i.quantity} - ₹${i.price}</li>`).join('')}
          </ul>
          <p><strong>Total Amount: ₹${order.totalAmount}</strong></p>
        </div>
        <p>We are weaving your poshak with love and devotion. You will receive shipping updates soon.</p>
        <p style="font-style: italic; color: #8B6914;">"सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।"</p>
      </div>
    `;
    await sendEmail(order.shippingDetails.email, 'Order Confirmed - Prem Dhaga', emailHtml);

    return res.status(200).json({ message: 'Payment simulation successful', order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Webhook listener for actual Razorpay events
export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    console.log('[Razorpay Webhook] Event received:', event);

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const order = await Order.findOne({ razorpayOrderId }) as any;
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'paid';
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = signature;

        order.trackingTimeline.push(
          {
            status: 'paid',
            title: 'Payment Captured',
            description: 'Payment verified and captured.',
            location: 'Razorpay Gateway',
            timestamp: new Date(),
          },
          {
            status: 'confirmed',
            title: 'Order Confirmed',
            description: 'Poshak weaving instructions are queued.',
            location: 'Vrindavan Atelier',
            timestamp: new Date(),
          }
        );

        await order.save();

        // Adjust inventory
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        // Email customer
        const emailHtml = `
          <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0D0B08; color: #FAF6EF;">
            <h2 style="color: #C9A84C; text-align: center;">Jai Shri Krishna 🙏</h2>
            <p>Pranam ${order.shippingDetails.name},</p>
            <p>We have successfully received your payment. Your order is now in production.</p>
            <p><strong>Order ID: ${order.orderId}</strong></p>
            <p>Total Paid: ₹${order.totalAmount}</p>
          </div>
        `;
        await sendEmail(order.shippingDetails.email, 'Payment Confirmed - Prem Dhaga', emailHtml);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Fetch user order history with filters & searches
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const { status, search } = req.query;
    const query: any = { userId: authReq.user.id };

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search as string, $options: 'i' } },
        { 'items.name': { $regex: search as string, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch order details by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id }).populate('items.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Cancel an Order if it hasn't been shipped
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required to cancel order' });
    }

    const order = await Order.findOne({ orderId: req.params.id }) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // IDOR Security Check: Order must belong to authenticated user unless user is an admin
    const isAdmin = ['admin', 'super_admin', 'manager', 'orders_manager'].includes(authReq.user.role);
    if (order.userId && order.userId.toString() !== authReq.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to cancel this order.' });
    }

    const nonCancellableStatuses = ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'completed', 'returned'];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ error: 'Cannot cancel order. It has already been processed or shipped.' });
    }

    order.orderStatus = 'cancelled';
    order.trackingTimeline.push({
      status: 'cancelled',
      title: 'Order Cancelled',
      description: 'The order request was cancelled by the customer.',
      location: 'Prem Dhaga Registry',
      timestamp: new Date(),
    });

    await order.save();
    return res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- ADMIN ORDERS CONTROL ---
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Set courier information
export const updateOrderCourier = async (req: Request, res: Response) => {
  try {
    const { courierPartner, trackingId, estimatedDeliveryDate } = req.body;
    const order = await Order.findById(req.params.id) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (courierPartner) order.courierPartner = courierPartner;
    if (trackingId) order.trackingId = trackingId;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);

    await order.save();
    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Advance status with custom timeline logs
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, description, location } = req.body;
    const order = await Order.findById(req.params.id) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const statusTitles: Record<string, string> = {
      pending: 'Order Placed',
      confirmed: 'Order Confirmed',
      paid: 'Payment Successful',
      preparing: 'Preparing Fabrics',
      stitching: 'Hand Stitching & Embroidery',
      quality_check: 'Quality & Finishing Check',
      packaging: 'Parchment Box Packaging',
      packed: 'Packed & Sealed',
      ready_for_pickup: 'Ready for Courier Pickup',
      shipped: 'Shipped from Hub',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refund Processed',
      returned: 'Returned',
    };

    const adminEmail = (req as AuthenticatedRequest).user?.email || 'Admin';

    order.orderStatus = status;
    order.trackingTimeline.push({
      status,
      title: statusTitles[status] || status,
      description: description || `Order status updated to ${statusTitles[status] || status}.`,
      location: location || 'Vrindavan Atelier',
      timestamp: new Date(),
    });

    if (!order.activityLog) order.activityLog = [];
    order.activityLog.push({
      action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
      performedBy: adminEmail,
      details: description || `Status updated to ${status}`,
      timestamp: new Date(),
    });

    await order.save();

    // Send shipping / status update email notification hook
    if (status === 'shipped') {
      const emailHtml = `
        <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0D0B08; color: #FAF6EF;">
          <h2 style="color: #C9A84C; text-align: center;">Your Order is Shipped! 🌸</h2>
          <p>Pranam ${order.shippingDetails.name},</p>
          <p>We are delighted to inform you that your divine attire (Order ID: ${order.orderId}) has been shipped.</p>
          <p><strong>Courier:</strong> ${order.courierPartner || 'Standard Shipping'}</p>
          <p><strong>Tracking ID:</strong> ${order.trackingId || 'N/A'}</p>
        </div>
      `;
      await sendEmail(order.shippingDetails.email, 'Order Shipped - Prem Dhaga', emailHtml);
    }

    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Simulate payment failure and release inventory
export const simulatePaymentFailure = async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId } = req.body;
    const order = await Order.findOne({ razorpayOrderId }) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'failed') {
      return res.status(200).json({ message: 'Order payment status already marked as failed.' });
    }

    order.paymentStatus = 'failed';
    order.orderStatus = 'pending';
    
    order.trackingTimeline.push({
      status: 'failed',
      title: 'Payment Failed',
      description: 'Transaction declined by issuer. Payment failed.',
      location: 'Razorpay Gateway',
      timestamp: new Date(),
    });
    
    await order.save();

    // Release/restore reserved stock in database since payment failed
    for (const item of order.items) {
      const isBundleAddon = typeof item.product === 'string' && String(item.product).endsWith('-bundle');
      if (!isBundleAddon && item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    return res.status(200).json({ message: 'Simulated payment failure successfully updated. Reserved inventory has been released.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Aggregate dynamic Finance & GST statistics
export const getFinanceReports = async (req: Request, res: Response) => {
  try {
    const paidOrders = await Order.find({ paymentStatus: 'paid' }).populate('items.product');
    
    let grossRevenue = 0;
    let totalDiscounts = 0;
    let totalShipping = 0;
    let totalOrdersCount = paidOrders.length;
    
    // GST Slabs (5%, 12%, 18%)
    const slabs: Record<number, any> = {
      5: { category: 'Ready-made Poshaks (Cotton/Linen)', hsn: '6204', taxableValue: 0, cgstRate: 2.5, sgstRate: 2.5, totalGst: 0 },
      12: { category: 'Ready-made Poshaks (Silk/Velvet)', hsn: '6204', taxableValue: 0, cgstRate: 6, sgstRate: 6, totalGst: 0 },
      18: { category: 'Devotional Accessories (Mukut/Jewelry)', hsn: '7117', taxableValue: 0, cgstRate: 9, sgstRate: 9, totalGst: 0 },
    };

    for (const order of paidOrders) {
      grossRevenue += order.totalAmount + (order.discountAmount || 0);
      totalDiscounts += order.discountAmount || 0;
      
      for (const item of order.items) {
        const dbProd = item.product as any;
        const gstRate = dbProd?.gstRate || 12; // default to 12% if missing
        const itemPrice = item.price * item.quantity;
        
        // Find which slab it goes to
        const activeSlab = slabs[gstRate] || slabs[12];
        
        const taxableValue = itemPrice / (1 + gstRate / 100);
        const totalGst = itemPrice - taxableValue;
        
        activeSlab.taxableValue += taxableValue;
        activeSlab.totalGst += totalGst;
      }
    }

    // Format tax liability reports
    const gstBreakdown = Object.keys(slabs).map((rateKey) => {
      const slab = slabs[Number(rateKey)];
      return {
        category: slab.category,
        hsn: slab.hsn,
        taxableValue: Number(slab.taxableValue.toFixed(2)),
        cgstRate: slab.cgstRate,
        sgstRate: slab.sgstRate,
        totalGst: Number(slab.totalGst.toFixed(2)),
      };
    });

    const totalGstCollected = gstBreakdown.reduce((sum, item) => sum + item.totalGst, 0);
    const razorpayGatewayFees = grossRevenue * 0.02; // 2% gateway fee
    const netSettledPayouts = Math.max(0, grossRevenue - totalDiscounts - razorpayGatewayFees);

    return res.status(200).json({
      grossRevenue,
      totalDiscounts,
      totalGstCollected: Number(totalGstCollected.toFixed(2)),
      razorpayGatewayFees: Number(razorpayGatewayFees.toFixed(2)),
      netSettledPayouts: Number(netSettledPayouts.toFixed(2)),
      gstBreakdown,
      totalOrdersCount
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
