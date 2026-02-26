import CartModel from '../models/cartModel.js';
import OrderModel from '../models/orderModel.js';

export const createOrder = async (req, res) => {
    try {
        const { delivery_address } = req.body;
        
        if (!delivery_address) {
            return res.status(400).json({ 
                success: false, 
                error: 'Delivery address is required' 
            });
        }
        
        const cart = await CartModel.getUserCart(req.user.id);
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cart is empty' 
            });
        }
        
        const orderId = await OrderModel.create(req.user.id, cart, delivery_address);
        
        res.json({ 
            success: true, 
            message: 'Order created successfully',
            data: { 
                order_id: orderId, 
                total: cart.total,
                vendor_id: cart.vendor_id
            }
        });
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const completeOrderImmediately = async (req, res) => {
    try {
        const { delivery_address, total_amount, items, vendor_id } = req.body;
        const userId = req.user.id;
        
        console.log('Completing order immediately for user:', userId);
        
        const orderId = await OrderModel.createImmediateOrder(userId, {
            vendor_id,
            items,
            total: total_amount,
            delivery_fee: 25.00,
            subtotal: total_amount - 25.00
        }, delivery_address);
        
        res.json({ 
            success: true, 
            message: 'Order completed successfully',
            data: { order_id: orderId }
        });
        
    } catch (error) {
        console.error('Error completing order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await OrderModel.getUserOrders(req.user.id);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await OrderModel.getById(req.params.id, req.user.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};