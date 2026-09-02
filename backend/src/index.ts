import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dashboardRouter from './routes/dashboard';
import analyticsRouter from './routes/analytics';
import bookingsRouter from './routes/bookings';
import mechanicsRouter from './routes/mechanics';
import customersRouter from './routes/customers';
import servicesRouter from './routes/services';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = !corsOrigin || corsOrigin === '*'
  ? { origin: true }
  : { origin: corsOrigin };
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', mode: 'in-memory' } });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/mechanics', mechanicsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/services', servicesRouter);


// Global error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`🚀 API listening on http://localhost:${port} (in-memory mode)`));
