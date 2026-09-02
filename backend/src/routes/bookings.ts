import { Router } from 'express';
import { bookings, customers, mechanics, services, Status } from '../data';

const router = Router();

router.get('/', (req, res) => {
  const search = (req.query.search as string | undefined)?.toLowerCase() ?? '';
  const statusFilter = req.query.status as Status | undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const sortField = (req.query.sort as string) || 'scheduled_at';
  const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

  let filtered = bookings.map(b => {
    const customer = customers.find(c => c.id === b.customer_id);
    const mechanic = b.mechanic_id ? mechanics.find(m => m.id === b.mechanic_id) : null;
    const service = services.find(s => s.id === b.service_id);
    return {
      id: b.id,
      bookingNumber: b.booking_number,
      customer: customer?.name ?? 'Unknown',
      vehicle: b.vehicle,
      service: service?.name ?? 'Unknown',
      mechanic: mechanic?.name ?? 'Unassigned',
      status: b.status.toUpperCase().replace('ON_THE_WAY', 'MECHANIC_ON_THE_WAY'),
      amount: b.amount,
      scheduledAt: b.scheduled_at,
    };
  });

  // Filter
  if (search) {
    filtered = filtered.filter(b =>
      b.customer.toLowerCase().includes(search) ||
      b.vehicle.toLowerCase().includes(search) ||
      b.bookingNumber.toLowerCase().includes(search)
    );
  }
  if (statusFilter) {
    const norm = statusFilter.toUpperCase().replace('ON_THE_WAY', 'MECHANIC_ON_THE_WAY');
    filtered = filtered.filter(b => b.status === norm);
  }

  // Sort
  filtered.sort((a, b) => {
    let av: number | string = (a as any)[sortField] ?? a.scheduledAt;
    let bv: number | string = (b as any)[sortField] ?? b.scheduledAt;
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);

  res.json({ success: true, data, meta: { total, page, totalPages } });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

  const customer = customers.find(c => c.id === booking.customer_id);
  const mechanic = booking.mechanic_id ? mechanics.find(m => m.id === booking.mechanic_id) : null;
  const service = services.find(s => s.id === booking.service_id);

  res.json({
    success: true,
    data: {
      ...booking,
      customer: customer?.name,
      customer_phone: customer?.phone,
      customer_email: customer?.email,
      mechanic: mechanic?.name,
      mechanic_status: mechanic?.status,
      service: service?.name,
      category: service?.category,
    },
  });
});

router.patch('/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

  const allowed: Status[] = ['pending', 'assigned', 'on_the_way', 'completed', 'cancelled'];
  const newStatus = req.body.status as Status;
  if (!allowed.includes(newStatus)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  booking.status = newStatus;
  booking.updated_at = new Date().toISOString();

  res.json({ success: true, data: booking });
});

router.post('/', (req, res) => {
  const { customer_id, service_id, mechanic_id, vehicle, scheduled_at, amount } = req.body;

  const customer = customers.find(c => c.id === Number(customer_id));
  if (!customer) return res.status(400).json({ success: false, error: 'Invalid customer_id' });

  const service = services.find(s => s.id === Number(service_id));
  if (!service) return res.status(400).json({ success: false, error: 'Invalid service_id' });

  const mechanic = mechanic_id ? mechanics.find(m => m.id === Number(mechanic_id)) : null;

  if (!vehicle || !vehicle.trim()) {
    return res.status(400).json({ success: false, error: 'vehicle is required' });
  }
  if (!scheduled_at) {
    return res.status(400).json({ success: false, error: 'scheduled_at is required' });
  }

  const nextId = Math.max(...bookings.map(b => b.id), 0) + 1;
  const booking_number = `BK${String(1000 + nextId).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newBooking = {
    id: nextId,
    booking_number,
    customer_id: Number(customer_id),
    mechanic_id: mechanic ? mechanic.id : null,
    service_id: Number(service_id),
    vehicle: vehicle.trim(),
    status: 'pending' as const,
    amount: Number(amount) || service.base_price,
    scheduled_at: new Date(scheduled_at).toISOString(),
    created_at: now,
    updated_at: now,
  };

  bookings.push(newBooking);

  res.status(201).json({
    success: true,
    data: {
      ...newBooking,
      customer: customer.name,
      mechanic: mechanic?.name ?? null,
      service: service.name,
    },
  });
});

export default router;
