import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import { getImageKitAuth, uploadImageToImageKit } from './src/controllers/authController.js';

export function createServer() {
  const app = express();
  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Attach io instance to req for controllers
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Real-Time Customer Live Location Stream
    socket.on('customer_live_location', (data) => {
      io.emit('order_location_update', {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });

  // Middleware with 50MB payload limit (Prevents PayloadTooLargeError)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // System & Health Check routes
  app.get('/health', (req, res) => res.json({ ok: true, service: 'api', stack: 'node' }));
  app.get('/api/version', (req, res) => res.json({ version: 'v1.0.0', runtime: 'node', deploy_target: 'render' }));
  app.get('/api/ping', (req, res) => res.json({ ok: true, message: 'pong' }));

  // Direct ImageKit Routes Mapping
  app.get('/api/imagekit-auth', getImageKitAuth);
  app.post('/api/upload-image', uploadImageToImageKit);

  // API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/customer', customerRoutes);
  app.use('/api/payment', paymentRoutes);

  // 404 Handler
  app.use((req, res) => res.status(404).json({ ok: false, error: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` }));

  return server;
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] === modulePath) {
  const port = process.env.PORT || 3001;
  await connectDB();
  const server = createServer();
  server.listen(port, () => {
    console.log(`Backend & Socket.io running on :${port}`);
  });
}
