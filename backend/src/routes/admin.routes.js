import { Router } from 'express';
import { presignProductImage } from '../controllers/uploads.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/check', (req, res) => res.json({ data: { ok: true } }));
router.post('/uploads/presign', presignProductImage);

export default router;
