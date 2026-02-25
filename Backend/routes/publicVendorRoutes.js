import express from 'express';
import { getVendors, getVendorById } from '../controllers/publicVendorController.js';

const router = express.Router();

router.get('/', getVendors);
router.get('/:id', getVendorById);

export default router;
