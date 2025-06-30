import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/file.routes.js';

dotenv.config();
connectDB();

const app = express();

// CORS config (SPA + token-based auth)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Only needed if you're dealing with cookies (optional here)
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
