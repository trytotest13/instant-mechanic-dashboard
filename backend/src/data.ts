// ─── In-memory database (no PostgreSQL required) ───────────────────────────

export type Status = 'pending' | 'assigned' | 'on_the_way' | 'completed' | 'cancelled';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Mechanic {
  id: number;
  name: string;
  status: 'available' | 'busy';
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  base_price: number;
}

export interface Booking {
  id: number;
  booking_number: string;
  customer_id: number;
  mechanic_id: number | null;
  service_id: number;
  vehicle: string;
  status: Status;
  amount: number;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

// ─── Customers ───────────────────────────────────────────────────────────────
export const customers: Customer[] = [
  { id: 1, name: 'Rahul Sharma',   phone: '9810012345', email: 'rahul@example.com',   created_at: daysAgo(30) },
  { id: 2, name: 'Priya Singh',    phone: '9820023456', email: 'priya@example.com',   created_at: daysAgo(25) },
  { id: 3, name: 'Amit Kumar',     phone: '9830034567', email: 'amit@example.com',    created_at: daysAgo(20) },
  { id: 4, name: 'Deepa Nair',     phone: '9840045678', email: 'deepa@example.com',   created_at: daysAgo(15) },
  { id: 5, name: 'Vikram Patel',   phone: '9850056789', email: 'vikram@example.com',  created_at: daysAgo(10) },
  { id: 6, name: 'Sunita Verma',   phone: '9860067890', email: 'sunita@example.com',  created_at: daysAgo(8) },
  { id: 7, name: 'Rohan Mehta',    phone: '9870078901', email: 'rohan@example.com',   created_at: daysAgo(5) },
  { id: 8, name: 'Ananya Iyer',    phone: '9880089012', email: 'ananya@example.com',  created_at: daysAgo(3) },
  { id: 9, name: 'Kiran Bose',     phone: '9890090123', email: 'kiran@example.com',   created_at: today() },
  { id: 10, name: 'Meena Joshi',   phone: '9800001234', email: 'meena@example.com',   created_at: today() },
];

// ─── Mechanics ───────────────────────────────────────────────────────────────
export const mechanics: Mechanic[] = [
  { id: 1, name: 'Suresh Yadav',   status: 'busy',      created_at: daysAgo(60) },
  { id: 2, name: 'Ramesh Gupta',   status: 'available', created_at: daysAgo(55) },
  { id: 3, name: 'Manoj Tiwari',   status: 'busy',      created_at: daysAgo(50) },
  { id: 4, name: 'Ajay Mishra',    status: 'available', created_at: daysAgo(45) },
  { id: 5, name: 'Sanjay Dubey',   status: 'busy',      created_at: daysAgo(40) },
  { id: 6, name: 'Vinod Sharma',   status: 'available', created_at: daysAgo(35) },
  { id: 7, name: 'Rakesh Pandey',  status: 'busy',      created_at: daysAgo(30) },
  { id: 8, name: 'Dinesh Pal',     status: 'available', created_at: daysAgo(20) },
];

// ─── Services ────────────────────────────────────────────────────────────────
export const services: Service[] = [
  { id: 1, name: 'Oil Change',           category: 'Maintenance',  base_price: 800 },
  { id: 2, name: 'Tyre Replacement',     category: 'Tyres',        base_price: 2500 },
  { id: 3, name: 'Brake Inspection',     category: 'Brakes',       base_price: 1200 },
  { id: 4, name: 'Battery Replacement',  category: 'Electrical',   base_price: 3500 },
  { id: 5, name: 'AC Service',           category: 'AC & Cooling',  base_price: 2000 },
  { id: 6, name: 'Engine Diagnostics',   category: 'Engine',       base_price: 1500 },
  { id: 7, name: 'Car Wash & Detailing', category: 'Detailing',    base_price: 600 },
  { id: 8, name: 'Suspension Check',     category: 'Suspension',   base_price: 1800 },
];

// ─── Bookings ────────────────────────────────────────────────────────────────
const STATUSES: Status[] = ['pending', 'assigned', 'on_the_way', 'completed', 'cancelled'];
const VEHICLES = [
  'Maruti Swift', 'Honda City', 'Hyundai Creta', 'Tata Nexon', 'Mahindra Scorpio',
  'Toyota Innova', 'Kia Seltos', 'Volkswagen Polo', 'Renault Kwid', 'Ford EcoSport',
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function today(): string {
  return new Date().toISOString();
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBookings(): Booking[] {
  const list: Booking[] = [];
  for (let i = 1; i <= 120; i++) {
    const daysBack = randomBetween(0, 14);
    const svc = services[randomBetween(0, services.length - 1)];
    const statusIdx = randomBetween(0, STATUSES.length - 1);
    const cust = customers[randomBetween(0, customers.length - 1)];
    const mech = randomBetween(0, 3) > 0 ? mechanics[randomBetween(0, mechanics.length - 1)] : null;
    const variance = randomBetween(-200, 800);
    list.push({
      id: i,
      booking_number: `BK${String(1000 + i).padStart(4, '0')}`,
      customer_id: cust.id,
      mechanic_id: mech ? mech.id : null,
      service_id: svc.id,
      vehicle: VEHICLES[randomBetween(0, VEHICLES.length - 1)],
      status: STATUSES[statusIdx],
      amount: Math.max(400, svc.base_price + variance),
      scheduled_at: daysAgo(daysBack),
      created_at: daysAgo(daysBack + 1),
      updated_at: daysAgo(daysBack),
    });
  }
  // Always add a few for today
  for (let i = 121; i <= 128; i++) {
    const svc = services[randomBetween(0, services.length - 1)];
    const cust = customers[randomBetween(0, customers.length - 1)];
    const mech = mechanics[randomBetween(0, mechanics.length - 1)];
    list.push({
      id: i,
      booking_number: `BK${String(1000 + i).padStart(4, '0')}`,
      customer_id: cust.id,
      mechanic_id: mech.id,
      service_id: svc.id,
      vehicle: VEHICLES[randomBetween(0, VEHICLES.length - 1)],
      status: STATUSES[randomBetween(0, 2)],
      amount: svc.base_price + randomBetween(-100, 500),
      scheduled_at: today(),
      created_at: today(),
      updated_at: today(),
    });
  }
  return list;
}

export const bookings: Booking[] = generateBookings();
