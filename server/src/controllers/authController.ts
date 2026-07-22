import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'prem_dhaga_dev_secret_key_108';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Only allow setting admin/manager/support role if secret key matches or in non-production
    let assignedRole = 'customer';
    const roles = [
      'super_admin',
      'admin',
      'manager',
      'product_manager',
      'inventory_manager',
      'orders_manager',
      'content_editor',
      'content_manager',
      'marketing_manager',
      'finance_manager',
      'customer_support',
    ];
    if (role && roles.includes(role)) {
      if (req.body.adminSecret === process.env.ADMIN_SECRET || process.env.NODE_ENV !== 'production') {
        assignedRole = role;
      } else {
        return res.status(403).json({ error: 'Invalid admin secret key' });
      }
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: assignedRole,
      savedAddresses: [],
      wishlist: [],
      cart: [],
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        language: user.language,
        notificationsEnabled: user.notificationsEnabled,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(authReq.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error getting profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const { name, email, phone, password, profilePhoto, language, notificationsEnabled, preferredPaymentMethod } = req.body;

    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ error: 'Email already in use' });
      user.email = email;
    }
    if (phone) user.phone = phone;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (language) user.language = language;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
    if (preferredPaymentMethod) user.preferredPaymentMethod = preferredPaymentMethod;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        language: user.language,
        notificationsEnabled: user.notificationsEnabled,
        preferredPaymentMethod: user.preferredPaymentMethod,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- ADDRESSES ---
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json(user.savedAddresses || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newAddress = req.body; // { name, street, city, state, zip, country, phone, isDefault }
    if (newAddress.isDefault) {
      user.savedAddresses.forEach((addr) => { addr.isDefault = false; });
    }
    user.savedAddresses.push(newAddress);
    await user.save();

    return res.status(201).json(user.savedAddresses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { id } = req.params;
    const updateData = req.body;

    const address = user.savedAddresses.id(id);
    if (!address) return res.status(404).json({ error: 'Address not found' });

    if (updateData.isDefault) {
      user.savedAddresses.forEach((addr) => { addr.isDefault = false; });
    }

    Object.assign(address, updateData);
    await user.save();

    return res.status(200).json(user.savedAddresses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { id } = req.params;
    const address = user.savedAddresses.id(id);
    if (!address) return res.status(404).json({ error: 'Address not found' });

    user.savedAddresses.pull(id);
    await user.save();

    return res.status(200).json(user.savedAddresses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- WISHLIST ---
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await User.findById(authReq.user.id).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json(user.wishlist || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const { productId } = req.body;
    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    return res.status(200).json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const { productId } = req.params;
    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId);
    await user.save();

    return res.status(200).json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// --- CART SYNC ---
export const getCart = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await User.findById(authReq.user.id).populate('cart.product');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json(user.cart || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const syncCart = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });

    const { cartItems } = req.body; // array of { product, size, swatchHex, swatchName, quantity }
    const user = await User.findById(authReq.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.cart = cartItems;
    await user.save();

    return res.status(200).json({ message: 'Cart synced successfully', cart: user.cart });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
