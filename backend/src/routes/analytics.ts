import { Router } from 'express';
import { bookings, services } from '../data';

const router = Router();

router.get('/', (req, res) => {
  const rangeDays = req.query.range === '90d' ? 90 : req.query.range === '30d' ? 30 : 14;

  // Build date series
  const dates: string[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toDateString());
  }

  // Bookings over time
  const bookingsOverTime = dates.map(dateStr => {
    const count = bookings.filter(b => new Date(b.scheduled_at).toDateString() === dateStr).length;
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
      bookings: count,
    };
  });

  // Revenue over time
  const revenueOverTime = dates.map(dateStr => {
    const revenue = bookings
      .filter(b => new Date(b.scheduled_at).toDateString() === dateStr && b.status === 'completed')
      .reduce((sum, b) => sum + b.amount, 0);
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }),
      revenue,
    };
  });

  // Status breakdown
  const statusMap: Record<string, number> = {};
  bookings.forEach(b => {
    statusMap[b.status] = (statusMap[b.status] ?? 0) + 1;
  });
  const statusBreakdown = Object.entries(statusMap)
    .map(([status, count]) => ({ status: status.toUpperCase(), count }))
    .sort((a, b) => b.count - a.count);

  // Category breakdown
  const catMap: Record<string, number> = {};
  bookings.forEach(b => {
    const svc = services.find(s => s.id === b.service_id);
    if (svc) catMap[svc.category] = (catMap[svc.category] ?? 0) + 1;
  });
  const categoryBreakdown = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    data: { bookingsOverTime, revenueOverTime, statusBreakdown, categoryBreakdown },
  });
});

export default router;
