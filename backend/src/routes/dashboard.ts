import { Router } from 'express';
import { bookings, customers, mechanics, services } from '../data';

const router = Router();

router.get('/', (_req, res) => {
  const todayStr = new Date().toDateString();

  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(b => new Date(b.scheduled_at).toDateString() === todayStr).length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0);
  const activeMechanics = mechanics.filter(m => m.status === 'available' || m.status === 'busy').length;
  const newCustomers = customers.filter(c => new Date(c.created_at).toDateString() === todayStr).length;

  res.json({
    success: true,
    data: {
      totalBookings,
      todayBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      activeMechanics,
      newCustomers,
    },
  });
});

export default router;
