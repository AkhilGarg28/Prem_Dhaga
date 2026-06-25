import { Request, Response } from 'express';
import { CustomOrder } from '../models/CustomOrder';
import { uploadImageToCloudinary } from '../config/services';

export const createCustomOrder = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, size, fabric, primaryColor, secondaryColor, embroideryType, description } = req.body;

    if (!name || !email || !phone || !fabric || !primaryColor || !embroideryType) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const sketchUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await uploadImageToCloudinary(file.buffer, 'custom_sketches');
        sketchUrls.push(url);
      }
    }

    const customOrderId = `PD-CUST-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newCustomOrder = new CustomOrder({
      customOrderId,
      clientDetails: { name, email, phone },
      poshakDetails: {
        size: size ? Number(size) : undefined,
        fabric,
        primaryColor,
        secondaryColor,
        embroideryType,
        description,
      },
      sketches: sketchUrls,
      status: 'submitted',
    });

    await newCustomOrder.save();
    return res.status(201).json(newCustomOrder);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCustomOrderById = async (req: Request, res: Response) => {
  try {
    const order = await CustomOrder.findOne({ customOrderId: req.params.id });
    if (!order) return res.status(404).json({ error: 'Custom order not found' });
    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- ADMIN CUSTOM ORDERS ---
export const getAllCustomOrders = async (req: Request, res: Response) => {
  try {
    const orders = await CustomOrder.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCustomOrder = async (req: Request, res: Response) => {
  try {
    const { status, quotedPrice, notes } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (quotedPrice !== undefined) updateData.quotedPrice = Number(quotedPrice);
    if (notes !== undefined) updateData.notes = notes;

    const order = await CustomOrder.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) return res.status(404).json({ error: 'Custom order not found' });
    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
