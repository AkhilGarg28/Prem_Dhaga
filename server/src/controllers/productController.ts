import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Collection } from '../models/Collection';
import { uploadImageToCloudinary } from '../config/services';

// --- COLLECTIONS ---
export const getCollections = async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };
    const collections = await Collection.find(filter).sort({ createdAt: -1 });

    // Attach product count to each collection
    const result = await Promise.all(
      collections.map(async (col) => {
        const productCount = await Product.countDocuments({ collectionId: col._id });
        return {
          ...col.toObject(),
          itemCount: productCount,
          productCount,
        };
      })
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { title, description, coverImage, bannerImage, isFeatured, isActive } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Collection.findOne({ slug });
    if (existing) return res.status(400).json({ error: 'Collection with this title already exists' });

    let finalCover = coverImage || '';
    if (req.file) {
      finalCover = await uploadImageToCloudinary(req.file.buffer, 'collections');
    }

    const collection = new Collection({
      title,
      slug,
      description,
      coverImage: finalCover,
      bannerImage: bannerImage || finalCover,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    await collection.save();
    return res.status(201).json(collection);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, coverImage, bannerImage, isFeatured, isActive } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    if (title && title !== collection.title) {
      collection.title = title;
      collection.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) collection.description = description;
    if (coverImage !== undefined) collection.coverImage = coverImage;
    if (bannerImage !== undefined) collection.bannerImage = bannerImage;
    if (isFeatured !== undefined) collection.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) collection.isActive = Boolean(isActive);

    await collection.save();
    return res.status(200).json(collection);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Collection.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Collection not found' });
    return res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- PRODUCTS ---
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { collectionSlug, search, featured, tags, minPrice, maxPrice, status } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    } else if (process.env.NODE_ENV === 'production') {
      // Default to active products only for public catalog in production
      query.status = 'active';
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (tags) {
      const tagList = (tags as string).split(',').map((t) => t.trim());
      query.tags = { $in: tagList };
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (collectionSlug) {
      const col = await Collection.findOne({ slug: collectionSlug as string });
      if (col) {
        query.collectionId = col._id;
      } else {
        return res.status(200).json([]);
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { tags: { $regex: search as string, $options: 'i' } },
        { sku: { $regex: search as string, $options: 'i' } },
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
    const {
      name,
      slug,
      description,
      basePrice,
      discountPrice,
      collectionId,
      stock,
      sizes,
      swatches,
      isFeatured,
      isTrending,
      isBestSeller,
      material,
      fabric,
      weight,
      barcode,
      gstRate,
      status,
      tags,
    } = req.body;

    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await uploadImageToCloudinary(file.buffer, 'products');
        imageUrls.push(url);
      }
    }

    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const parsedSwatches = typeof swatches === 'string' ? JSON.parse(swatches) : swatches;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const product = new Product({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      basePrice,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      images: imageUrls.length > 0 ? imageUrls : req.body.images || ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'],
      collectionId: collectionId || (await Collection.findOne())?._id,
      sizes: parsedSizes || [
        { size: 0, price: basePrice },
        { size: 1, price: Number(basePrice) + 150 },
        { size: 2, price: Number(basePrice) + 300 },
        { size: 3, price: Number(basePrice) + 450 },
        { size: 4, price: Number(basePrice) + 600 },
      ],
      swatches: parsedSwatches || [{ name: 'Royal Gold', hex: '#C9A84C' }],
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isTrending: isTrending === 'true' || isTrending === true,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      stock: (stock !== undefined && stock !== '') ? Number(stock) : 10,
      weight: weight ? Number(weight) : 200,
      material,
      fabric,
      barcode,
      gstRate: gstRate ? Number(gstRate) : 12,
      status: status || 'active',
      tags: parsedTags || [],
    });

    await product.save();
    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json(updated);
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
