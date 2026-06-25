import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Collection } from '../models/Collection';
import { uploadImageToCloudinary } from '../config/services';

// --- COLLECTIONS ---
export const getCollections = async (req: Request, res: Response) => {
  try {
    const collections = await Collection.find({ isActive: true });
    return res.status(200).json(collections);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Collection.findOne({ slug });
    if (existing) return res.status(400).json({ error: 'Collection with this title already exists' });

    let coverImage = '';
    if (req.file) {
      coverImage = await uploadImageToCloudinary(req.file.buffer, 'collections');
    }

    const collection = new Collection({
      title,
      slug,
      description,
      coverImage,
    });
    await collection.save();
    return res.status(201).json(collection);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- PRODUCTS ---
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { collectionSlug, search, featured } = req.query;
    const query: any = {};

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (collectionSlug) {
      const col = await Collection.findOne({ slug: collectionSlug as string });
      if (col) {
        query.collectionId = col._id;
      } else {
        // Collection not found, return empty array
        return res.status(200).json([]);
      }
    }

    if (search) {
      // Atlas search fallback or simple regex search
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).populate('collectionId', 'title slug');
    return res.status(200).json(products);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('collectionId');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json(product);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, basePrice, collectionId, sizes, swatches, isFeatured, stock } = req.body;

    if (!name || !basePrice || !collectionId) {
      return res.status(400).json({ error: 'Name, basePrice, and collectionId are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Product.findOne({ slug });
    if (existing) return res.status(400).json({ error: 'Product with this name already exists' });

    // Handle files if uploaded
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await uploadImageToCloudinary(file.buffer, 'products');
        imageUrls.push(url);
      }
    }

    // Parse structures if they are sent as JSON strings
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const parsedSwatches = typeof swatches === 'string' ? JSON.parse(swatches) : swatches;

    const product = new Product({
      name,
      slug,
      description,
      basePrice,
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'],
      collectionId,
      sizes: parsedSizes || [
        { size: 0, price: basePrice },
        { size: 1, price: Number(basePrice) + 100 },
        { size: 2, price: Number(basePrice) + 200 },
        { size: 3, price: Number(basePrice) + 300 },
        { size: 4, price: Number(basePrice) + 400 },
        { size: 5, price: Number(basePrice) + 500 },
        { size: 6, price: Number(basePrice) + 600 },
        { size: 7, price: Number(basePrice) + 700 },
        { size: 8, price: Number(basePrice) + 800 },
      ],
      swatches: parsedSwatches || [
        { name: 'Vrindavan Green', hex: '#3B6B3B' },
        { name: 'Lotus Pink', hex: '#D4788A' },
        { name: 'Royal Gold', hex: '#C9A84C' },
        { name: 'Peacock Blue', hex: '#1B5E6E' },
      ],
      isFeatured: isFeatured === 'true' || isFeatured === true,
      stock: stock ? Number(stock) : 10,
    });

    await product.save();
    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
