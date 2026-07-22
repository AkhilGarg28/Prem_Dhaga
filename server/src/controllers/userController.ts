import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { AuditLog } from '../models/AuditLog';

// Fetch all registered customers with aggregated spending details (LTV)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Aggregate LTV and order counts for each user
    const usersWithLTV = await Promise.all(
      users.map(async (user) => {
        const userOrders = await Order.find({ userId: user._id, paymentStatus: 'paid' });
        const orderCount = userOrders.length;
        const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          ...user.toObject(),
          orderCount,
          totalSpent: Number(totalSpent.toFixed(2)),
        };
      })
    );

    return res.status(200).json(usersWithLTV);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch individual user profile & order history details
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      user,
      orders,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Reset a user's password (Admin administrative action)
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ error: 'New password is required.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Log the audit event
    const audit = new AuditLog({
      userId: (req as any).user?.id,
      action: 'PASSWORD_RESET',
      details: `Password reset successfully for user: ${user.email}`,
      ipAddress: req.ip,
    });
    await audit.save();

    return res.status(200).json({ message: 'User password reset successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const audit = new AuditLog({
      userId: (req as any).user?.id,
      action: 'DELETE_USER',
      details: `Deleted user account: ${user.email}`,
      ipAddress: req.ip,
    });
    await audit.save();

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update user role (STRICTLY restricted to super_admin)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    if (authReq.user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Only Super Admin can modify user roles and admin permissions.' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const audit = new AuditLog({
      userId: authReq.user?.id,
      action: 'ROLE_UPDATE',
      details: `Updated role for user ${user.email} to: [${role}]`,
      ipAddress: req.ip,
    });
    await audit.save();

    return res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch administrative audit logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.status(200).json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
