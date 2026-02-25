import express from 'express';
import {
    getVendorDashboard,
    getVendorOrders,
    updateOrderStatus,
    getVendorEarnings,
    getVendorMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
} from '../controllers/vendorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All vendor routes require authentication
router.use(protect);

// Dashboard
router.get('/dashboard', getVendorDashboard);

// Orders
router.get('/orders', getVendorOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// Earnings - THIS MUST BE HERE
router.get('/earnings', getVendorEarnings);

// Menu management
router.get('/menu', getVendorMenu);
router.post('/menu', addMenuItem);
router.put('/menu/:itemId', updateMenuItem);
router.delete('/menu/:itemId', deleteMenuItem);

export default router;