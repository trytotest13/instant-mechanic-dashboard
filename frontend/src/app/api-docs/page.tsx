import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference — Instant Mechanic",
  description: "REST API documentation for the Instant Mechanic operations backend.",
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  params?: { name: string; in: string; required: boolean; description: string }[];
  body?: { field: string; type: string; required: boolean; description: string }[];
  example: string;
};

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/health",
    description: "Health check. Returns server status and current data mode.",
    example: `{ "success": true, "data": { "status": "ok", "mode": "in-memory" } }`,
  },
  {
    method: "GET",
    path: "/api/dashboard",
    description: "Returns all 8 overview KPI numbers computed across all bookings.",
    example: `{
  "success": true,
  "data": {
    "totalBookings": 128,
    "todayBookings": 8,
    "completedBookings": 34,
    "pendingBookings": 20,
    "cancelledBookings": 15,
    "totalRevenue": 87400,
    "activeMechanics": 8,
    "newCustomers": 2
  }
}`,
  },
  {
    method: "GET",
    path: "/api/analytics",
    description: "Returns time-series and breakdown data for charts. Supports a range query param.",
    params: [
      { name: "range", in: "query", required: false, description: "Date range: 14d (default), 30d, or 90d" },
    ],
    example: `{
  "success": true,
  "data": {
    "bookingsOverTime": [{ "date": "Sep 01", "bookings": 12 }, ...],
    "revenueOverTime":  [{ "date": "Sep 01", "revenue": 8400 }, ...],
    "statusBreakdown":  [{ "status": "PENDING", "count": 20 }, ...],
    "categoryBreakdown":[{ "category": "Maintenance", "count": 30 }, ...]
  }
}`,
  },
  {
    method: "GET",
    path: "/api/bookings",
    description: "Paginated, filterable, sortable booking list.",
    params: [
      { name: "search",  in: "query", required: false, description: "Full-text search on booking number, customer name, vehicle" },
      { name: "status",  in: "query", required: false, description: "Filter by status: PENDING, ASSIGNED, MECHANIC_ON_THE_WAY, COMPLETED, CANCELLED" },
      { name: "sort",    in: "query", required: false, description: "Sort field: scheduledAt (default), amount, bookingNumber" },
      { name: "order",   in: "query", required: false, description: "Sort direction: desc (default) or asc" },
      { name: "page",    in: "query", required: false, description: "Page number, 1-indexed (default: 1)" },
      { name: "limit",   in: "query", required: false, description: "Items per page, max 100 (default: 10)" },
    ],
    example: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "bookingNumber": "BK1001",
      "customer": "Rahul Sharma",
      "vehicle": "Maruti Swift",
      "service": "Oil Change",
      "mechanic": "Suresh Yadav",
      "status": "COMPLETED",
      "amount": 950,
      "scheduledAt": "2026-09-01T10:30:00.000Z"
    }
  ],
  "meta": { "total": 128, "page": 1, "totalPages": 13 }
}`,
  },
  {
    method: "GET",
    path: "/api/bookings/:id",
    description: "Full detail for a single booking, including customer contact info and mechanic status.",
    params: [
      { name: "id", in: "path", required: true, description: "Numeric booking ID" },
    ],
    example: `{
  "success": true,
  "data": {
    "id": 1,
    "booking_number": "BK1001",
    "customer": "Rahul Sharma",
    "customer_phone": "9810012345",
    "customer_email": "rahul@example.com",
    "mechanic": "Suresh Yadav",
    "mechanic_status": "busy",
    "service": "Oil Change",
    "category": "Maintenance",
    "vehicle": "Maruti Swift",
    "status": "completed",
    "amount": 950,
    "scheduled_at": "2026-09-01T10:30:00.000Z"
  }
}`,
  },
  {
    method: "PATCH",
    path: "/api/bookings/:id/status",
    description: "Update a booking's status. The change is reflected in all subsequent API responses.",
    params: [
      { name: "id", in: "path", required: true, description: "Numeric booking ID" },
    ],
    body: [
      { field: "status", type: "string", required: true, description: "New status: pending, assigned, on_the_way, completed, or cancelled" },
    ],
    example: `// Request body
{ "status": "completed" }

// Response
{ "success": true, "data": { "id": 1, "status": "completed", ... } }`,
  },
  {
    method: "GET",
    path: "/api/mechanics",
    description: "Returns all mechanics with computed jobs-completed count and current active booking ID.",
    example: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Suresh Yadav",
      "status": "busy",
      "jobs_completed": 8,
      "current_booking": 42
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/customers",
    description: "Returns all customers with their total booking count, ordered by most recently joined.",
    example: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Rahul Sharma",
      "phone": "9810012345",
      "email": "rahul@example.com",
      "bookings": 14,
      "created_at": "2026-08-01T10:00:00.000Z"
    }
  ]
}`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET:    "#2F9E44",
  POST:   "#1971C2",
  PATCH:  "#F08C00",
  DELETE: "#E03131",
};

export default function ApiDocsPage() {
  return (
    <div className="docs-shell">
      <header className="docs-header">
        <div className="docs-brand">
          <div className="docs-brand-mark">IM</div>
          <div>
            <strong>Instant Mechanic</strong>
            <span>API Reference</span>
          </div>
        </div>
        <div className="docs-meta">
          <span className="docs-version">v2.0</span>
          <span className="docs-base">Base URL: <code>{BASE}</code></span>
        </div>
      </header>

      <main className="docs-main">
        <aside className="docs-toc">
          <p className="docs-toc-label">ENDPOINTS</p>
          {endpoints.map(ep => (
            <a key={ep.path + ep.method} href={`#${ep.method}-${ep.path.replace(/\//g, "-").replace(/:/g, "")}`} className="docs-toc-link">
              <span className="docs-method-pill" style={{ background: METHOD_COLORS[ep.method] }}>{ep.method}</span>
              {ep.path}
            </a>
          ))}
          <div className="docs-toc-section">
            <p className="docs-toc-label">RESPONSE FORMAT</p>
            <a href="#response-format" className="docs-toc-link">Standard envelope</a>
            <a href="#error-format" className="docs-toc-link">Error shape</a>
          </div>
        </aside>

        <div className="docs-content">
          <section className="docs-intro">
            <h1>API Reference</h1>
            <p>All endpoints are REST + JSON. The server runs on <code>http://localhost:4000</code> by default. All responses share a common envelope.</p>
          </section>

          {endpoints.map(ep => {
            const id = `${ep.method}-${ep.path.replace(/\//g, "-").replace(/:/g, "")}`;
            return (
              <section key={id} id={id} className="docs-endpoint">
                <div className="docs-endpoint-head">
                  <span className="docs-method-badge" style={{ background: METHOD_COLORS[ep.method] }}>{ep.method}</span>
                  <code className="docs-path">{ep.path}</code>
                </div>
                <p className="docs-description">{ep.description}</p>

                {ep.params && ep.params.length > 0 && (
                  <div className="docs-params">
                    <h3>Parameters</h3>
                    <table>
                      <thead>
                        <tr><th>Name</th><th>In</th><th>Required</th><th>Description</th></tr>
                      </thead>
                      <tbody>
                        {ep.params.map(p => (
                          <tr key={p.name}>
                            <td><code>{p.name}</code></td>
                            <td>{p.in}</td>
                            <td>{p.required ? "Yes" : "No"}</td>
                            <td>{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {ep.body && ep.body.length > 0 && (
                  <div className="docs-params">
                    <h3>Request Body (JSON)</h3>
                    <table>
                      <thead>
                        <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                      </thead>
                      <tbody>
                        {ep.body.map(f => (
                          <tr key={f.field}>
                            <td><code>{f.field}</code></td>
                            <td>{f.type}</td>
                            <td>{f.required ? "Yes" : "No"}</td>
                            <td>{f.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="docs-example">
                  <h3>Example Response</h3>
                  <pre><code>{ep.example}</code></pre>
                </div>
              </section>
            );
          })}

          <section id="response-format" className="docs-endpoint">
            <h2>Standard Response Envelope</h2>
            <p>Every successful response wraps data in a consistent shape:</p>
            <pre><code>{`{
  "success": true,
  "data": <object or array>,
  "meta": { "total": 128, "page": 1, "totalPages": 13 }  // only on paginated endpoints
}`}</code></pre>
          </section>

          <section id="error-format" className="docs-endpoint">
            <h2>Error Shape</h2>
            <p>All errors return an appropriate HTTP status code and a JSON body:</p>
            <pre><code>{`// 404 Not Found
{ "success": false, "error": "Booking not found" }

// 400 Bad Request
{ "success": false, "error": "Invalid status" }

// 500 Internal Server Error
{ "success": false, "error": "Internal server error" }`}</code></pre>
          </section>
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, system-ui, sans-serif; background: #F6F7F9; color: #1B2027; }
        code { font-family: "Fira Code", "Cascadia Code", monospace; }
        .docs-shell { min-height: 100vh; display: flex; flex-direction: column; }
        .docs-header {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
          padding: 16px 30px; background: #1F3A5F; color: #DCE5EE; border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .docs-brand { display: flex; align-items: center; gap: 11px; }
        .docs-brand-mark {
          width: 36px; height: 36px; display: grid; place-items: center; border-radius: 8px;
          background: #FF6B35; color: #fff; font: 700 12px "Space Grotesk", sans-serif;
        }
        .docs-brand strong { display: block; color: #fff; font-size: 13px; }
        .docs-brand span { display: block; color: #AFC0D0; font-size: 10px; margin-top: 2px; }
        .docs-meta { display: flex; align-items: center; gap: 16px; }
        .docs-version { padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,.1); color: #AFC0D0; font-size: 11px; }
        .docs-base { color: #AFC0D0; font-size: 11px; }
        .docs-base code { background: rgba(255,255,255,.08); padding: 2px 5px; border-radius: 3px; color: #C8D9E8; }
        .docs-main { display: flex; flex: 1; }
        .docs-toc {
          width: 240px; flex-shrink: 0; padding: 24px 16px; background: #fff;
          border-right: 1px solid #E3E6EA; position: sticky; top: 0; max-height: 100vh; overflow-y: auto;
        }
        .docs-toc-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: #91A7BB; margin: 16px 0 6px; }
        .docs-toc-label:first-child { margin-top: 0; }
        .docs-toc-section { margin-top: 12px; }
        .docs-toc-link {
          display: flex; align-items: center; gap: 7px; padding: 5px 7px; border-radius: 5px;
          font-size: 11px; color: #53606E; text-decoration: none; margin-bottom: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .docs-toc-link:hover { background: #F0F4F8; color: #1B2027; }
        .docs-method-pill {
          flex-shrink: 0; padding: 2px 5px; border-radius: 3px; color: #fff; font-size: 8px; font-weight: 700;
        }
        .docs-content { flex: 1; padding: 30px; max-width: 860px; }
        .docs-intro { margin-bottom: 32px; }
        .docs-intro h1 { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
        .docs-intro p { color: #53606E; font-size: 13px; line-height: 1.6; }
        .docs-endpoint {
          padding: 24px; margin-bottom: 20px; border: 1px solid #E3E6EA; border-radius: 8px; background: #fff;
        }
        .docs-endpoint-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .docs-method-badge {
          padding: 4px 9px; border-radius: 4px; color: #fff; font-size: 11px; font-weight: 700;
        }
        .docs-path { font-size: 14px; color: #1B2027; font-weight: 500; }
        .docs-description { color: #53606E; font-size: 12px; margin-bottom: 14px; line-height: 1.6; }
        .docs-endpoint h2 { font-size: 16px; font-weight: 600; margin-bottom: 10px; }
        .docs-params { margin: 14px 0; }
        .docs-params h3 { font-size: 11px; font-weight: 700; color: #87909A; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
        .docs-params table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .docs-params th { padding: 7px 10px; background: #FAFBFC; border-bottom: 1px solid #E3E6EA; text-align: left; color: #87909A; font-size: 9px; font-weight: 700; letter-spacing: .06em; }
        .docs-params td { padding: 8px 10px; border-bottom: 1px solid #F0F2F4; color: #53606E; }
        .docs-params td code { background: #EEF3F8; padding: 1px 5px; border-radius: 3px; color: #1F3A5F; font-size: 10px; }
        .docs-example { margin-top: 14px; }
        .docs-example h3 { font-size: 11px; font-weight: 700; color: #87909A; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
        pre { background: #1B2027; border-radius: 6px; padding: 14px 16px; overflow-x: auto; }
        pre code { color: #C8D9E8; font-size: 11px; line-height: 1.6; }
        @media (max-width: 700px) {
          .docs-toc { display: none; }
          .docs-content { padding: 18px; }
        }
      `}</style>
    </div>
  );
}
