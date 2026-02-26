import CartModel from '../models/cartModel.js';

export const getCart = async (req, res) => {
    try {
        const cart = await CartModel.getUserCart(req.user.id);
        res.json({ success: true, data: cart });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { vendor_id, menu_item_id, quantity } = req.body;
        const cart = await CartModel.addItem(req.user.id, vendor_id, menu_item_id, quantity);
        res.json({ success: true, message: 'Item added to cart', data: cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        await CartModel.updateQuantity(req.user.id, req.params.item_id, req.body.quantity);
        const cart = await CartModel.getUserCart(req.user.id);
        res.json({ success: true, message: 'Cart updated', data: cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        await CartModel.removeItem(req.user.id, req.params.item_id);
        const cart = await CartModel.getUserCart(req.user.id);
        res.json({ success: true, message: 'Item removed', data: cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const clearCart = async (req, res) => {
    try {
        await CartModel.clearCart(req.user.id);
        res.json({ success: true, message: 'Cart cleared', data: { items: [], subtotal: 0, delivery_fee: 0, total: 0 } });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};