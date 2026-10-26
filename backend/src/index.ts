import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket';

// Route imports
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import zoneRoutes from './routes/zoneRoutes';
import crowdRoutes from './routes/crowdRoutes';
import alertRoutes from './routes/alertRoutes';
import incidentRoutes from './routes/incidentRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import cctvRoutes from './routes/cctvRoutes';
import weatherRoutes from './routes/weatherRoutes';
import reportRoutes from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import simulationRoutes from './routes/simulationRoutes';
import riskRoutes from './routes/riskRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/emergency-units', emergencyRoutes);
app.use('/api/cctv', cctvRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/risk', riskRoutes);

// Root health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'KumbhRakshak Emergency Alert System Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` KumbhRakshak Backend API & Real-time Socket Server`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

export default app;
