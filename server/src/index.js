const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const ordersRouter = require('./routes/orders');
const { router: authRouter } = require('./routes/auth');
require('./db'); // Ensure DB schema & seed are initialized

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Setup Socket.io with permissive CORS for local dev
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Attach io instance to express app so routes can broadcast
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger for visibility
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Order Tracking System API'
  });
});

// Socket.io Real-time Event Handling
io.on('connection', (socket) => {
  console.log(`⚡ Client connected via WebSocket: ${socket.id}`);

  // When a client tracking page opens for a specific order
  socket.on('join_order_room', (orderNumber) => {
    if (orderNumber) {
      const room = `order_${orderNumber.toUpperCase()}`;
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
    }
  });

  socket.on('leave_order_room', (orderNumber) => {
    if (orderNumber) {
      const room = `order_${orderNumber.toUpperCase()}`;
      socket.leave(room);
      console.log(`📴 Socket ${socket.id} left room: ${room}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`
  🚀 ===============================================
  📦 ORDER TRACKING BACKEND SERVER ONLINE
  🌐 REST API:    http://localhost:${PORT}/api/orders
  ⚡ Socket.IO:   Ready on port ${PORT}
  📁 Database:    SQLite database initialized
  ===============================================
  `);
});
