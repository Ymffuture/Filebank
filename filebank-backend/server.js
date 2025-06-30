import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/file.routes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// CORS config (SPA + token-based auth)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Socket.IO setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Store io globally if needed
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server + Socket.IO running on port ${PORT}`));
