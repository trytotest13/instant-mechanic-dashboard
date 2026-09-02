"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://instant-mechanic-dashboard-b6p7.onrender.com/api";

type Page = "overview" | "bookings" | "mechanics" | "customers" | "analytics";

type OverviewData = {
  totalBookings: number;
  todayBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  activeMechanics: number;
  newCustomers: number;
};

type AnalyticsData = {
  bookingsOverTime: { date: string; bookings: number }[];
  revenueOverTime: { date: string; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
};

type Booking = {
  id: string;
  bookingNumber: string;
  customer: string;
  vehicle: string;
  service: string;
  mechanic: string;
  status: string;
  amount: number;
  scheduledAt: string;
};

type Mechanic = {
  id: number;
  name: string;
  status: string;
  jobs_completed: number;
  current_booking: number | null;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  bookings: number;
  created_at: string;
};

const statusText: Record<string, string> = {
  PENDING: "Pending",
  pending: "Pending",
  ASSIGNED: "Assigned",
  assigned: "Assigned",
  MECHANIC_ON_THE_WAY: "On the way",
  ON_THE_WAY: "On the way",
  on_the_way: "On the way",
  onway: "On the way",
  COMPLETED: "Completed",
  completed: "Completed",
  CANCELLED: "Cancelled",
  cancelled: "Cancelled",
};

const statusTone: Record<string, string> = {
  PENDING: "pending",
  pending: "pending",
  ASSIGNED: "assigned",
  assigned: "assigned",
  MECHANIC_ON_THE_WAY: "onway",
  ON_THE_WAY: "onway",
  on_the_way: "onway",
  onway: "onway",
  COMPLETED: "completed",
  completed: "completed",
  CANCELLED: "cancelled",
  cancelled: "cancelled",
};

const PIE_COLORS = ["#F0A202", "#1971C2", "#FF6B35", "#2F9E44", "#E03131"];

type IconName =
  | "grid"
  | "calendar"
  | "calendar-clock"
  | "check-circle"
  | "hourglass"
  | "calendar-x"
  | "rupee"
  | "wrench"
  | "user-plus"
  | "users"
  | "car"
  | "chart"
  | "search"
  | "bell"
  | "plus";

function Icon({ name }: { name: IconName }) {
  switch (name) {
    case "grid":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="14" rx="1.5" />
          <rect width="7" height="7" x="3" y="14" rx="1.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="3" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2.5" />
        </svg>
      );
    case "calendar-clock":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="3" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M8 14h3M8 17h5" strokeWidth="2" />
        </svg>
      );
    case "check-circle":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" />
          <path d="m8 12 2.8 2.8 5.2-5.6" strokeWidth="2.4" />
        </svg>
      );
    case "hourglass":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12M6 21h12M7 3v4.5a5 5 0 0 0 1.8 3.8L12 13.5l3.2-2.2A5 5 0 0 0 17 7.5V3M7 21v-4.5a5 5 0 0 1 1.8-3.8L12 10.5l3.2 2.2a5 5 0 0 1 1.8 3.8V21" />
        </svg>
      );
    case "calendar-x":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" />
          <path d="m15 9-6 6M9 9l6 6" strokeWidth="2.4" />
        </svg>
      );
    case "rupee":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h12M6 9h11M6 14l8.5 7M6 14h3a4.5 4.5 0 0 0 0-9" />
        </svg>
      );
    case "wrench":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "user-plus":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" x2="19" y1="8" y2="14" />
          <line x1="22" x2="16" y1="11" y2="11" />
        </svg>
      );
    case "users":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "car":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "chart":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      );
    case "search":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "bell":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "plus":
      return (
        <svg className="v2-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5v14" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Sort icon ────────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc";

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`v2-sort-arrow${active ? " active" : ""}`}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

// ─── Page: Bookings ──────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
type BookingSortField = "bookingNumber" | "customer" | "vehicle" | "service" | "amount" | "scheduledAt";

function BookingsPage({
  allBookings,
  isTodayFilter,
  onClearToday,
  onToggleToday,
}: {
  allBookings: Booking[];
  isTodayFilter?: boolean;
  onClearToday?: () => void;
  onToggleToday?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<BookingSortField>("scheduledAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  function handleSort(field: BookingSortField) {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleStatus(v: string) { setStatusFilter(v); setPage(1); }

  const filtered = useMemo(() => {
    return allBookings
      .filter(b => {
        const matchesSearch =
          !search ||
          b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
          b.customer.toLowerCase().includes(search.toLowerCase()) ||
          b.vehicle.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || b.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let av: string | number = (a as Record<string, unknown>)[sortField] as string | number ?? "";
        let bv: string | number = (b as Record<string, unknown>)[sortField] as string | number ?? "";
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [allBookings, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function pageNumbers() {
    const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }

  return (
    <section className="v2-content">
      <div className="v2-section-head">
        <div>
          <h2>{isTodayFilter ? "Today's Bookings" : "All Bookings"}</h2>
          <span>{filtered.length} booking{filtered.length !== 1 ? "s" : ""} found {isTodayFilter ? "(scheduled for today)" : ""}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className={`v2-secondary small${isTodayFilter ? " active" : ""}`}
            onClick={onToggleToday}
            aria-pressed={isTodayFilter}
            title={isTodayFilter ? "Show all bookings" : "Filter by today's bookings"}
          >
            <Icon name="calendar" />
            {isTodayFilter ? "✓ Today" : "Today"}
          </button>

        </div>
      </div>
      <div className="v2-panel v2-bookings-panel" style={{ marginTop: 0 }}>
        <div className="v2-toolbar">
          <div className="v2-search">
            <Icon name="search" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by booking ID, customer or vehicle"
            />
          </div>
          <select value={statusFilter} onChange={e => handleStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All status</option>
            {Object.entries(statusText).map(([key, label]) => (
              <option value={key} key={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="v2-table-wrap">
          <table className="v2-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("bookingNumber")} className="v2-sortable">
                  BOOKING ID <SortArrow active={sortField === "bookingNumber"} dir={sortDir} />
                </th>
                <th onClick={() => handleSort("customer")} className="v2-sortable">
                  CUSTOMER <SortArrow active={sortField === "customer"} dir={sortDir} />
                </th>
                <th onClick={() => handleSort("vehicle")} className="v2-sortable">
                  VEHICLE <SortArrow active={sortField === "vehicle"} dir={sortDir} />
                </th>
                <th onClick={() => handleSort("service")} className="v2-sortable">
                  SERVICE <SortArrow active={sortField === "service"} dir={sortDir} />
                </th>
                <th>MECHANIC</th>
                <th>STATUS</th>
                <th onClick={() => handleSort("amount")} className="v2-sortable">
                  AMOUNT <SortArrow active={sortField === "amount"} dir={sortDir} />
                </th>
                <th onClick={() => handleSort("scheduledAt")} className="v2-sortable">
                  DATE <SortArrow active={sortField === "scheduledAt"} dir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr><td colSpan={8} className="v2-empty">No bookings match your filters.</td></tr>
              ) : pageItems.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.bookingNumber}</strong></td>
                  <td><strong>{b.customer}</strong></td>
                  <td>{b.vehicle}</td>
                  <td>{b.service}</td>
                  <td>{b.mechanic}</td>
                  <td>
                    <span className={`v2-badge ${statusTone[b.status] ?? ""}`}>
                      {statusText[b.status] ?? b.status}
                    </span>
                  </td>
                  <td><strong>₹{b.amount.toLocaleString("en-IN")}</strong></td>
                  <td><small>{new Date(b.scheduledAt).toLocaleDateString("en-IN")}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="v2-pagination">
            <span className="v2-pagination-info">
              {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="v2-pagination-controls">
              <button onClick={() => setPage(1)} disabled={safePage === 1} aria-label="First page">«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous page">‹</button>
              {pageNumbers().map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={n === safePage ? "active" : ""}
                  aria-current={n === safePage ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next page">›</button>
              <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} aria-label="Last page">»</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page: Mechanics ─────────────────────────────────────────────────────────
function MechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/mechanics`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setMechanics(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="v2-content">
      <div className="v2-section-head">
        <div><h2>Mechanics</h2><span>{mechanics.length} team members</span></div>
      </div>
      <div className="v2-panel" style={{ marginTop: 0 }}>
        <div className="v2-table-wrap">
          <table className="v2-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>STATUS</th>
                <th>JOBS COMPLETED</th>
                <th>CURRENT BOOKING</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="v2-empty">Loading mechanics...</td></tr>
              ) : mechanics.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={`/avatars/mechanic-${((m.id - 1) % 4) + 1}.jpg`}
                        alt={m.name}
                        className="v2-avatar-img"
                      />
                      <strong>{m.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`v2-badge ${m.status === "available" ? "completed" : "assigned"}`}>
                      {m.status === "available" ? "Available" : "Busy"}
                    </span>
                  </td>
                  <td><strong>{m.jobs_completed}</strong></td>
                  <td>
                    {m.current_booking
                      ? <strong>{m.current_booking}</strong>
                      : <span style={{ color: "#9CA3AF" }}>None</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Customer Avatar Helper ──────────────────────────────────────────────────
const CUSTOMER_AVATARS: Record<string, string> = {
  "Rahul Sharma": "/avatars/customer-2.jpg",
  "Priya Singh":  "/avatars/customer-1.jpg",
  "Amit Kumar":   "/avatars/customer-4.jpg",
  "Deepa Nair":   "/avatars/customer-3.jpg",
  "Vikram Patel": "/avatars/customer-2.jpg",
  "Sunita Verma": "/avatars/customer-1.jpg",
  "Rohan Mehta":  "/avatars/customer-4.jpg",
  "Ananya Iyer":  "/avatars/customer-3.jpg",
  "Kiran Bose":   "/avatars/customer-2.jpg",
  "Meena Joshi":  "/avatars/customer-1.jpg",
};

function getCustomerAvatar(name: string, id: number) {
  return CUSTOMER_AVATARS[name] ?? ((id % 2 === 0) ? "/avatars/customer-2.jpg" : "/avatars/customer-1.jpg");
}

// ─── Page: Customers ─────────────────────────────────────────────────────────
function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/customers`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setCustomers(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    customers.filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    ), [customers, search]);

  return (
    <section className="v2-content">
      <div className="v2-section-head">
        <div><h2>Customers</h2><span>{filtered.length} registered customers</span></div>
      </div>
      <div className="v2-panel" style={{ marginTop: 0 }}>
        <div className="v2-toolbar">
          <div className="v2-search">
            <Icon name="search" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone" />
          </div>
        </div>
        <div className="v2-table-wrap">
          <table className="v2-table">
            <thead>
              <tr>
                <th style={{ width: "26%" }}>CUSTOMER</th>
                <th style={{ width: "18%" }}>PHONE</th>
                <th style={{ width: "26%" }}>EMAIL</th>
                <th style={{ width: "15%" }}>BOOKINGS</th>
                <th style={{ width: "15%" }}>MEMBER SINCE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="v2-empty">Loading customers...</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={getCustomerAvatar(c.name, c.id)}
                        alt={c.name}
                        className="v2-avatar-img"
                      />
                      <strong style={{ fontSize: 14 }}>{c.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: "#374151", fontWeight: 500 }}>{c.phone}</td>
                  <td style={{ color: "#4B5563" }}>{c.email}</td>
                  <td>
                    <span className="v2-badge assigned" style={{ minWidth: 26, justifyContent: "center" }}>
                      {c.bookings}
                    </span>
                  </td>
                  <td style={{ color: "#4B5563", fontSize: 13 }}>
                    {new Date(c.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Page: Analytics ─────────────────────────────────────────────────────────
function AnalyticsPage({ analytics }: { analytics: AnalyticsData | null }) {
  const statusData = analytics?.statusBreakdown ?? [];
  const categoryData = analytics?.categoryBreakdown ?? [];

  if (!analytics) return (
    <section className="v2-content">
      <div className="v2-section-head"><div><h2>Analytics</h2><span>Loading data...</span></div></div>
    </section>
  );

  return (
    <section className="v2-content">
      <div className="v2-section-head">
        <div><h2>Analytics</h2><span>Operational performance insights</span></div>
      </div>

      <div className="v2-chart-grid">
        <section className="v2-panel v2-wide">
          <div className="v2-panel-head">
            <div><h2>Revenue over time</h2><span>Completed bookings revenue — last 14 days</span></div>
          </div>
          <div className="v2-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueOverTime}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E3E6EA" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6B7480", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#6B7480", fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                <Tooltip formatter={(v: number) => [`\u20b9${v.toLocaleString("en-IN")}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2.5} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="v2-panel">
          <div className="v2-panel-head">
            <div><h2>Booking status</h2><span>Distribution breakdown</span></div>
          </div>
          <div className="v2-donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={60} outerRadius={85} paddingAngle={3}>
                  {statusData.map((item, i) => (
                    <Cell key={item.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, statusText[name] || name.replace(/_/g, ' ')]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="v2-legend">
            {statusData.map((item, i) => (
              <div key={item.status}>
                <span className="v2-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {statusText[item.status] ?? item.status}
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ marginTop: 20 }}>
        <section className="v2-panel">
          <div className="v2-panel-head">
            <div><h2>Service categories</h2><span>Bookings by service type</span></div>
          </div>
          <div style={{ height: 320, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={[...categoryData].sort((a, b) => b.count - a.count)}
                layout="vertical"
                margin={{ left: 8, right: 36, top: 10, bottom: 10 }}
              >
                <CartesianGrid stroke="#E3E6EA" horizontal={false} />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="category" tick={{ fill: "#4B5563", fontSize: 12, fontWeight: 500 }} width={125} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1F3A5F" radius={[0, 6, 6, 0]} barSize={22} label={{ position: "right", fill: "#1F3A5F", fontSize: 12, fontWeight: 700 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </section>
  );
}

// ─── New Booking Modal ───────────────────────────────────────────────────────
type ServiceOption = { id: number; name: string; category: string; base_price: number };
type CustomerOption = { id: number; name: string };
type MechanicOption = { id: number; name: string; status: string };

function NewBookingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [mechanics, setMechanics] = useState<MechanicOption[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [mechanicId, setMechanicId] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [amount, setAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/customers`).then(r => r.json()),
      fetch(`${API}/services`).then(r => r.json()),
      fetch(`${API}/mechanics`).then(r => r.json()),
    ]).then(([c, s, m]) => {
      setCustomers(c.data ?? []);
      setServices(s.data ?? []);
      setMechanics(m.data ?? []);
    });
  }, []);

  const selectedService = services.find(s => s.id === Number(serviceId));

  useEffect(() => {
    if (selectedService) setAmount(String(selectedService.base_price));
  }, [serviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!customerId || !serviceId || !vehicle.trim() || !scheduledAt) {
      setFormError("Customer, service, vehicle and scheduled date are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: Number(customerId),
          service_id: Number(serviceId),
          mechanic_id: mechanicId ? Number(mechanicId) : null,
          vehicle: vehicle.trim(),
          scheduled_at: new Date(scheduledAt).toISOString(),
          amount: Number(amount) || selectedService?.base_price,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create booking");
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="v2-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="v2-modal">
        <div className="v2-modal-header">
          <div>
            <h2>New Booking</h2>
            <p>Fill in the details to create a service booking.</p>
          </div>
          <button className="v2-modal-close" onClick={onClose} aria-label="Close">&#x2715;</button>
        </div>

        {success ? (
          <div className="v2-modal-success">
            <div className="v2-modal-success-icon">&#x2713;</div>
            <strong>Booking created!</strong>
            <span>Refreshing dashboard...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="v2-modal-form">
            {formError && <div className="v2-modal-error">{formError}</div>}

            <div className="v2-modal-grid">
              <label className="v2-field">
                <span>Customer *</span>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <label className="v2-field">
                <span>Service *</span>
                <select value={serviceId} onChange={e => setServiceId(e.target.value)} required>
                  <option value="">Select service</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
                </select>
              </label>

              <label className="v2-field">
                <span>Vehicle *</span>
                <input
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  placeholder="e.g. Honda City"
                  required
                />
              </label>

              <label className="v2-field">
                <span>Mechanic (optional)</span>
                <select value={mechanicId} onChange={e => setMechanicId(e.target.value)}>
                  <option value="">Assign later</option>
                  {mechanics.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.status})</option>
                  ))}
                </select>
              </label>

              <label className="v2-field">
                <span>Scheduled Date &amp; Time *</span>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </label>

              <label className="v2-field">
                <span>Amount (&#x20b9;) {selectedService && <em className="v2-field-hint">Base: &#x20b9;{selectedService.base_price}</em>}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Auto-filled from service"
                  min="0"
                />
              </label>
            </div>

            <div className="v2-modal-footer">
              <button type="button" className="v2-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="v2-primary" disabled={submitting}>
                {submitting ? "Creating..." : "Create Booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Notifications Panel ────────────────────────────────────────────────────
function NotificationsPanel({ bookings, onClose }: { bookings: Booking[]; onClose: () => void }) {
  const todayStr = new Date().toDateString();

  const todayNew = bookings.filter(
    b => new Date(b.scheduledAt).toDateString() === todayStr &&
    (b.status === "PENDING" || b.status === "ASSIGNED")
  );
  const todayCompleted = bookings.filter(
    b => new Date(b.scheduledAt).toDateString() === todayStr && b.status === "COMPLETED"
  );
  const todayCancelled = bookings.filter(
    b => new Date(b.scheduledAt).toDateString() === todayStr && b.status === "CANCELLED"
  );

  function timeStr(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  const total = todayNew.length + todayCompleted.length + todayCancelled.length;

  return (
    <>
      <div className="v2-notif-backdrop" onClick={onClose} />
      <aside className="v2-notif-panel">
        <div className="v2-notif-header">
          <div>
            <strong>Notifications</strong>
            <span>{total} updates today</span>
          </div>
          <button className="v2-modal-close" onClick={onClose} aria-label="Close">&#x2715;</button>
        </div>
        <div className="v2-notif-body">
          {total === 0 && (
            <div className="v2-notif-empty">No activity today yet.</div>
          )}
          {todayNew.length > 0 && (
            <div className="v2-notif-group">
              <p className="v2-notif-group-label">New bookings</p>
              {todayNew.map(b => (
                <div key={b.id} className="v2-notif-item">
                  <span className={`v2-badge ${statusTone[b.status] ?? ""}`}>{statusText[b.status] ?? b.status}</span>
                  <div>
                    <strong>{b.bookingNumber} &bull; {b.customer}</strong>
                    <small>{b.service} &bull; {b.vehicle}</small>
                  </div>
                  <time>{timeStr(b.scheduledAt)}</time>
                </div>
              ))}
            </div>
          )}
          {todayCompleted.length > 0 && (
            <div className="v2-notif-group">
              <p className="v2-notif-group-label">Completed today</p>
              {todayCompleted.map(b => (
                <div key={b.id} className="v2-notif-item">
                  <span className="v2-badge completed">Done</span>
                  <div>
                    <strong>{b.bookingNumber} &bull; {b.customer}</strong>
                    <small>{b.service} &bull; &#x20b9;{b.amount.toLocaleString("en-IN")}</small>
                  </div>
                  <time>{timeStr(b.scheduledAt)}</time>
                </div>
              ))}
            </div>
          )}
          {todayCancelled.length > 0 && (
            <div className="v2-notif-group">
              <p className="v2-notif-group-label">Cancelled today</p>
              {todayCancelled.map(b => (
                <div key={b.id} className="v2-notif-item">
                  <span className="v2-badge cancelled">Cancelled</span>
                  <div>
                    <strong>{b.bookingNumber} &bull; {b.customer}</strong>
                    <small>{b.service}</small>
                  </div>
                  <time>{timeStr(b.scheduledAt)}</time>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardV2() {
  const [page, setPage] = useState<Page>("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [todayFilter, setTodayFilter] = useState(false);
  const bookingsPanelRef = useRef<HTMLElement>(null);



  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  async function load() {
    try {
      setError("");
      const qs = new URLSearchParams({ limit: "100" });
      if (search) qs.set("search", search);
      if (statusFilter) qs.set("status", statusFilter);

      const [dashRes, analyticsRes, bookingsRes] = await Promise.all([
        fetch(`${API}/dashboard`, { cache: "no-store" }),
        fetch(`${API}/analytics`, { cache: "no-store" }),
        fetch(`${API}/bookings?${qs.toString()}`, { cache: "no-store" }),
      ]);

      if (!dashRes.ok || !analyticsRes.ok || !bookingsRes.ok)
        throw new Error("Unable to load dashboard data.");

      const dashJson = await dashRes.json();
      const analyticsJson = await analyticsRes.json();
      const bookingJson = await bookingsRes.json();

      setOverview(dashJson.data);
      setAnalytics(analyticsJson.data);
      setBookings(bookingJson.data ?? []);
    } catch {
      setError("Could not connect to the operations API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [search, statusFilter]);

  const metrics = overview ? [
    { label: "Total bookings",   value: overview.totalBookings,     note: "All time",              icon: "calendar" as const,       color: "blue" },
    { label: "Today's bookings", value: overview.todayBookings,     note: "Scheduled today",       icon: "calendar-clock" as const, color: "indigo" },
    { label: "Completed",        value: overview.completedBookings, note: "Successfully serviced", icon: "check-circle" as const,   color: "green" },
    { label: "Pending",          value: overview.pendingBookings,   note: "Needs attention",       icon: "hourglass" as const,      color: "amber" },
    { label: "Cancelled",        value: overview.cancelledBookings, note: "Cancelled bookings",    icon: "calendar-x" as const,     color: "red" },
    { label: "Revenue",          value: `\u20b9${overview.totalRevenue.toLocaleString("en-IN")}`, note: "Completed jobs", icon: "rupee" as const, color: "teal" },
    { label: "Active mechanics", value: overview.activeMechanics,   note: "Available or working",  icon: "wrench" as const,         color: "orange" },
    { label: "New customers",    value: overview.newCustomers,       note: "Added today",           icon: "users" as const,          color: "purple" },
  ] : [];

  const statusData = useMemo(() => analytics?.statusBreakdown ?? [], [analytics]);
  const categoryData = useMemo(() => analytics?.categoryBreakdown ?? [], [analytics]);

  // Today filter: when active, restrict all booking displays to current calendar day
  function isTodayDate(dateStr: string) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  const displayBookings = useMemo(
    () => todayFilter
      ? bookings.filter(b => isTodayDate(b.scheduledAt))
      : bookings,
    [bookings, todayFilter]
  );

  const pageEyebrow: Record<Page, string> = {
    overview:  "OPERATIONS / OVERVIEW",
    bookings:  "OPERATIONS / BOOKINGS",
    mechanics: "OPERATIONS / MECHANICS",
    customers: "OPERATIONS / CUSTOMERS",
    analytics: "OPERATIONS / ANALYTICS",
  };
  const pageTitle: Record<Page, string> = {
    overview:  `${greeting}, Operations`,
    bookings:  "Bookings",
    mechanics: "Mechanics",
    customers: "Customers",
    analytics: "Analytics",
  };
  const pageSubtitle: Record<Page, string> = {
    overview:  "Here's what's happening across your service network.",
    bookings:  "Manage and track all service bookings.",
    mechanics: "View your team's availability and performance.",
    customers: "Browse and manage your customer base.",
    analytics: "Deep-dive into your operational metrics.",
  };

  // Nav items used by both sidebar and mobile nav
  const navItems: { id: Page; label: string; icon: IconName; badge?: number }[] = [
    { id: "overview",  label: "Overview",   icon: "grid"     },
    { id: "bookings",  label: "Bookings",   icon: "calendar", badge: overview?.pendingBookings },
    { id: "mechanics", label: "Mechanics",  icon: "wrench"   },
    { id: "customers", label: "Customers",  icon: "users"    },
    { id: "analytics", label: "Analytics",  icon: "chart"    },
  ];

  return (
    <div className="v2-shell">
      {/* ── Sidebar (desktop) ── */}
      <aside className="v2-sidebar">
        <div className="v2-brand">
          <img src="/logo.jpg" alt="Instant Mechanic Logo" className="v2-brand-mark" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "cover" }} />
          <div>
            <strong>Instant Mechanic</strong>
            <span>Operations</span>
          </div>
        </div>

        <div className="v2-nav-label">WORKSPACE</div>
        <nav className="v2-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => setPage(item.id)}
            >
              <Icon name={item.icon} />
              {item.label}
              {item.badge !== undefined && <em>{item.badge}</em>}
            </button>
          ))}
        </nav>

        <div className="v2-sidebar-bottom">
          <div className="v2-user">
            <img src="/avatars/admin.jpg" alt="Operations Admin" className="v2-avatar-img" />
            <div><strong>Operations Admin</strong><small>Administrator</small></div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="v2-main">
        <header className="v2-header">
          <div>
            <p className="v2-eyebrow">{pageEyebrow[page]}</p>
            <h1>{pageTitle[page]}</h1>
            <p className="v2-subtitle">{pageSubtitle[page]}</p>
          </div>
          <div className="v2-header-actions">
            <button
              className={`v2-icon-button${showNotifications ? " active" : ""}`}
              aria-label="Notifications"
              onClick={() => setShowNotifications(v => !v)}
            >
              <Icon name="bell" />
              {bookings.filter(b => isTodayDate(b.scheduledAt) && b.status === "PENDING").length > 0 && (
                <span className="v2-bell-dot" />
              )}
            </button>

            <button className="v2-primary" onClick={() => setShowModal(true)}><Icon name="plus" /> New booking</button>
          </div>
        </header>

        {error && (
          <div className="v2-error">
            <span>{error}</span>
            <button onClick={load}>Retry</button>
          </div>
        )}

        {/* Overview */}
        {page === "overview" && (
          <section className="v2-content">
            <div className="v2-section-head">
              <div><h2>Performance snapshot</h2><span>Live operational metrics</span></div>
            </div>

            <div className="v2-metrics">
              {loading && !overview
                ? Array.from({ length: 8 }).map((_, i) => <div className="v2-skeleton" key={i} />)
                : metrics.map(m => (
                  <article className="v2-metric" key={m.label}>
                    <div className="v2-metric-top">
                      <span className={`v2-metric-icon ${m.color}`}><Icon name={m.icon} /></span>
                      <span className="v2-metric-label">{m.label}</span>
                    </div>
                    <strong>{typeof m.value === "number" ? m.value.toLocaleString("en-IN") : m.value}</strong>
                    <small>{m.note}</small>
                  </article>
                ))}
            </div>

            {overview && analytics && (
              <>
                <div className="v2-chart-grid">
                  <section className="v2-panel v2-wide">
                    <div className="v2-panel-head">
                      <div><h2>Bookings over time</h2><span>Last 14 days</span></div>
                    </div>
                    <div className="v2-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.bookingsOverTime}>
                          <defs>
                            <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1F3A5F" stopOpacity={0.22} />
                              <stop offset="100%" stopColor="#1F3A5F" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#E3E6EA" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: "#6B7480", fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: "#6B7480", fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                          <Tooltip />
                          <Area type="monotone" dataKey="bookings" stroke="#1F3A5F" strokeWidth={2.5} fill="url(#bookingsFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="v2-panel">
                    <div className="v2-panel-head">
                      <div><h2>Booking status</h2><span>Current distribution</span></div>
                    </div>
                    <div className="v2-donut-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={65} outerRadius={90} paddingAngle={3}>
                            {statusData.map((item, i) => (
                              <Cell key={item.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number, name: string) => [value, statusText[name] ?? name.replace(/_/g, " ")]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="v2-donut-center"><strong>{overview.totalBookings}</strong><span>Total</span></div>
                    </div>
                    <div className="v2-legend">
                      {statusData.map((item, i) => (
                        <div key={item.status}>
                          <span className="v2-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          {statusText[item.status] ?? item.status}
                          <strong>{item.count}</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="v2-lower-grid">
                  <section className="v2-panel" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="v2-panel-head">
                      <div><h2>Service categories</h2><span>Bookings by service</span></div>
                    </div>
                    <div className="v2-category-chart">
                      <ResponsiveContainer width="100%" height="100%" minHeight={430}>
                        <BarChart
                          data={[...categoryData].sort((a, b) => b.count - a.count)}
                          layout="vertical"
                          margin={{ left: 8, right: 36, top: 10, bottom: 10 }}
                        >
                          <CartesianGrid stroke="#E3E6EA" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} hide />
                          <YAxis type="category" dataKey="category" tick={{ fill: "#4B5563", fontSize: 13, fontWeight: 500 }} width={110} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#1F3A5F" radius={[0, 6, 6, 0]} barSize={24} label={{ position: "right", fill: "#1F3A5F", fontSize: 13, fontWeight: 700 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="v2-panel v2-bookings-panel" ref={bookingsPanelRef}>
                    <div className="v2-panel-head">
                      <div>
                        <h2>Recent bookings</h2>
                         <span>Latest operational activity</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button className="v2-secondary small" onClick={() => setPage("bookings")}>View all</button>
                      </div>
                    </div>
                    <div className="v2-toolbar">
                      <div className="v2-search">
                        <Icon name="search" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search booking or customer" />
                      </div>
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status">
                        <option value="">All status</option>
                        {Object.entries(statusText).map(([k, l]) => <option value={k} key={k}>{l}</option>)}
                      </select>
                    </div>
                    <div className="v2-table-wrap">
                      <table className="v2-table">
                        <thead>
                          <tr>
                            <th>BOOKING</th>
                            <th>CUSTOMER</th>
                            <th>VEHICLE</th>
                            <th>SERVICE</th>
                            <th>STATUS</th>
                            <th>AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayBookings.length === 0 ? (
                            <tr><td colSpan={6} className="v2-empty">No bookings scheduled for today.</td></tr>
                          ) : displayBookings.slice(0, 8).map(b => (
                            <tr key={b.id}>
                              <td><strong>{b.bookingNumber}</strong><small>{new Date(b.scheduledAt).toLocaleDateString("en-IN")}</small></td>
                              <td><strong>{b.customer}</strong></td>
                              <td><small>{b.vehicle}</small></td>
                              <td>{b.service}</td>
                              <td><span className={`v2-badge ${statusTone[b.status] ?? ""}`}>{statusText[b.status] ?? b.status}</span></td>
                              <td><strong>₹{b.amount.toLocaleString("en-IN")}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </>
            )}
          </section>
        )}

        {page === "bookings"  && <BookingsPage allBookings={displayBookings} isTodayFilter={todayFilter} onClearToday={() => setTodayFilter(false)} onToggleToday={() => setTodayFilter(v => !v)} />}
        {page === "mechanics" && <MechanicsPage />}
        {page === "customers" && <CustomersPage />}
        {page === "analytics" && <AnalyticsPage analytics={analytics} />}
      </main>

      {/* ── Mobile bottom nav (shown at ≤520px) ── */}
      <nav className="v2-mobile-nav" aria-label="Mobile navigation">
        {navItems.map(item => (
          <button
            key={item.id}
            className={page === item.id ? "active" : ""}
            onClick={() => setPage(item.id)}
            aria-label={item.label}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <em className="v2-mobile-badge">{item.badge}</em>
            )}
          </button>
        ))}
      </nav>

      {/* ── Notifications Panel ── */}
      {showNotifications && (
        <NotificationsPanel bookings={bookings} onClose={() => setShowNotifications(false)} />
      )}

      {/* ── New Booking Modal ── */}
      {showModal && (
        <NewBookingModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { load(); }}
        />
      )}
    </div>
  );
}
