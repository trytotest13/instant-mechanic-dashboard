import { Router } from 'express';
import { mechanics, bookings } from '../data';

const router = Router();

router.get('/', (_req, res) => {
  const data = mechanics.map(m => {
    const jobsCompleted = bookings.filter(
      b => b.mechanic_id === m.id && b.status === 'completed'
    ).length;
    const currentBooking = bookings.find(
      b => b.mechanic_id === m.id && (b.status === 'assigned' || b.status === 'on_the_way')
    );
    return {
      id: m.id,
      name: m.name,
      status: currentBooking ? 'busy' : 'available',
      jobs_completed: jobsCompleted,
      current_booking: currentBooking?.booking_number ?? null,
    };
  });

  res.json({ success: true, data });
});

export default router;
