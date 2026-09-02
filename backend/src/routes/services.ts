import { Router } from 'express';
import { services } from '../data';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, data: services });
});

export default router;
