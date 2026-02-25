import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDriverDashboard, acceptDelivery } from '../controllers/driverController.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDriverDashboard);
router.post('/deliveries/:orderId/accept', acceptDelivery);

export default router;
