import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { CustomOrder } from '../models/CustomOrder';
import { Product } from '../models/Product';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total sales (only from paid/processing/shipped/delivered orders)
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Orders count
    const totalOrdersCount = await Order.countDocuments();
    const paidOrdersCount = paidOrders.length;

    // 3. Average Order Value (AOV)
    const averageOrderValue = paidOrdersCount > 0 ? Number((totalRevenue / paidOrdersCount).toFixed(2)) : 0;

    // 4. Custom Orders counts
    const customOrdersCount = await CustomOrder.countDocuments();
    const pendingCustomOrdersCount = await CustomOrder.countDocuments({ status: 'submitted' });

    // 5. Inventory counts
    const lowStockThreshold = 5;
    const lowStockProducts = await Product.find({ stock: { $lte: lowStockThreshold } }).select('name stock');

    // 6. Top Products Sold (Aggregation style)
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of paidOrders) {
      for (const item of order.items) {
        const prodId = item.product.toString();
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSalesMap[prodId].quantity += item.quantity;
        productSalesMap[prodId].revenue += item.price * item.quantity;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 7. Last 6 Months Sales Chart Data (mock representation for chart baseline)
    // We can compute actual monthly aggregates
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const targetMonthIndex = (currentMonth - i + 12) % 12;
      const targetMonthName = months[targetMonthIndex];
      
      // Filter orders in that month (simple estimation or exact mongo date match)
      // For mock simplicity, we will calculate based on this year's orders:
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const monthOrders = await Order.find({
        paymentStatus: 'paid',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      chartData.push({
        name: targetMonthName,
        revenue: monthRevenue,
        orders: monthOrders.length,
      });
    }

    return res.status(200).json({
      summary: {
        totalRevenue,
        paidOrdersCount,
        totalOrdersCount,
        averageOrderValue,
        customOrdersCount,
        pendingCustomOrdersCount,
        lowStockCount: lowStockProducts.length,
      },
      topProducts,
      lowStockProducts,
      chartData,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
