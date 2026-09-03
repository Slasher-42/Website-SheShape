import { Router } from 'express';
import { presignProductImage } from '../controllers/uploads.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import adminProductRoutes from './admin.products.routes.js';
import adminOrderRoutes from './admin.orders.routes.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/check', (req, res) => res.json({ data: { ok: true } }));
router.post('/uploads/presign', presignProductImage);
router.use('/products', adminProductRoutes);
router.use('/orders', adminOrderRoutes);

export default router;
