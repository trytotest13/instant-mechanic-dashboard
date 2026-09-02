import { Router } from 'express';
import { customers, bookings } from '../data';

const router = Router();

router.get('/', (_req, res) => {
  const data = customers.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    created_at: c.created_at,
    bookings: bookings.filter(b => b.customer_id === c.id).length,
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ success: true, data });
});

export default router;
