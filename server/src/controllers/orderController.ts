import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { razorpayClient, sendEmail, useRazorpayMock } from '../config/services';

// Create a new Order in DB and initiate Razorpay checkout order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingDetails, userId } = req.body;

    if (!items || !items.length || !shippingDetails) {
      return res.status(400).json({ error: 'Cart items and shipping details are required' });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    // Verify prices from DB
    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ error: `Product ${item.name} not found` });
      }

      // Find price matching the size
      const sizeObj = dbProduct.sizes.find((s) => s.size === Number(item.size));
      const unitPrice = sizeObj ? sizeObj.price : dbProduct.basePrice;

      calculatedTotal += unitPrice * Number(item.quantity);

      // Find swatch name matching hex
      const swatchObj = dbProduct.swatches.find((sw) => sw.hex === item.swatchHex);
      const swatchName = swatchObj ? swatchObj.name : 'Custom Swatch';

      orderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        size: Number(item.size),
        swatchName,
        swatchHex: item.swatchHex,
        quantity: Number(item.quantity),
        price: unitPrice,
      });
    }

    // Unique Order ID for system tracking
    const orderId = `PD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Razorpay Order (Convert totalAmount to Paisa: INR * 100)
    const amountInPaisa = calculatedTotal * 100;
    const rzpOrder = await razorpayClient.orders.create({
      amount: amountInPaisa,
      currency: 'INR',
      receipt: orderId,
      notes: {
        customerEmail: shippingDetails.email,
        customerPhone: shippingDetails.phone,
      },
    });

    const newOrder = new Order({
      orderId,
      userId: userId || null,
      items: orderItems,
      totalAmount: calculatedTotal,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      razorpayOrderId: rzpOrder.id,
      shippingDetails,
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

    await order.save();

    // Decrease Inventory/Stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

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

// Fetch user order history
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
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

// --- ADMIN ORDERS ---
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true }) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Send shipping update email if status changes
    if (status === 'shipped') {
      const emailHtml = `
        <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0D0B08; color: #FAF6EF;">
          <h2 style="color: #C9A84C; text-align: center;">Your Order is Shipped! 🌸</h2>
          <p>Pranam ${order.shippingDetails.name},</p>
          <p>We are delighted to inform you that your beloved Laddu Gopal's poshak (Order ID: ${order.orderId}) has been shipped and is on its way to you.</p>
        </div>
      `;
      await sendEmail(order.shippingDetails.email, 'Order Shipped - Prem Dhaga', emailHtml);
    }

    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
