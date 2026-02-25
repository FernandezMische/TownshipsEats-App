import VendorModel from '../models/vendorModel.js';
import OrderModel from '../models/orderModel.js';

// Get vendor dashboard data
export const getVendorDashboard = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        // Get vendor info
        const vendor = await VendorModel.getByUserEmail(userEmail);
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        // Get orders by status
        const pendingOrders = await OrderModel.getVendorOrdersByStatus(vendor.id, 'pending');
        const preparingOrders = await OrderModel.getVendorOrdersByStatus(vendor.id, 'preparing');
        const readyOrders = await OrderModel.getVendorOrdersByStatus(vendor.id, 'ready');
        
        // Get earnings
        const todayEarnings = await OrderModel.getVendorEarnings(vendor.id, 'today');
        const weekEarnings = await OrderModel.getVendorEarnings(vendor.id, 'week');
        const monthEarnings = await OrderModel.getVendorEarnings(vendor.id, 'month');

        res.json({
            success: true,
            data: {
                vendor,
                currentOrders: pendingOrders.length + preparingOrders.length + readyOrders.length,
                pendingOrders: pendingOrders.length,
                preparingOrders: preparingOrders.length,
                readyOrders: readyOrders.length,
                earnings: {
                    today: todayEarnings,
                    week: weekEarnings,
                    month: monthEarnings
                }
            }
        });
    } catch (error) {
        console.error('Error fetching vendor dashboard:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get vendor orders
export const getVendorOrders = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const vendor = await VendorModel.getByUserEmail(userEmail);
        
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        const orders = await OrderModel.getVendorOrders(vendor.id);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { orderId } = req.params;
        const { status } = req.body;

        const vendor = await VendorModel.getByUserEmail(userEmail);
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        await OrderModel.updateOrderStatus(orderId, vendor.id, status);
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get vendor earnings
export const getVendorEarnings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { period = 'month' } = req.query;

        console.log(`Fetching earnings for email ${userEmail}, period: ${period}`);

        const vendor = await VendorModel.getByUserEmail(userEmail);
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        const earnings = await OrderModel.getVendorEarnings(vendor.id, period);
        const orders = await OrderModel.getVendorOrdersByPeriod(vendor.id, period);
        const availableBalance = await OrderModel.getAvailableBalance(vendor.id);

        console.log(`Earnings data:`, { earnings, totalOrders: orders.length, availableBalance });

        res.json({
            success: true,
            data: {
                earnings,
                totalOrders: orders.length,
                orders,
                availableBalance
            }
        });
    } catch (error) {
        console.error('Error fetching earnings:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Get vendor menu
export const getVendorMenu = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const vendor = await VendorModel.getByUserEmail(userEmail);
        
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        const menu = await VendorModel.getMenu(vendor.id);
        res.json({ success: true, data: menu });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Add menu item
export const addMenuItem = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const vendor = await VendorModel.getByUserEmail(userEmail);
        
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        const itemId = await VendorModel.addMenuItem(vendor.id, req.body);
        res.json({ success: true, message: 'Item added', data: { id: itemId } });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { itemId } = req.params;
        const vendor = await VendorModel.getByUserEmail(userEmail);
        
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        await VendorModel.updateMenuItem(itemId, vendor.id, req.body);
        res.json({ success: true, message: 'Item updated' });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { itemId } = req.params;
        const vendor = await VendorModel.getByUserEmail(userEmail);
        
        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        await VendorModel.deleteMenuItem(itemId, vendor.id);
        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
