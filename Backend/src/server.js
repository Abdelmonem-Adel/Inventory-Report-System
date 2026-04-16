import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./DB/config/DBconniction.js"
connectDB();

import passport from 'passport';

const app = express();

app.use(passport.initialize());

const allowedOrigins = [
  'inventory.breadfastwh.online',
  'www.inventory.breadfastwh.online',
  'localhost:3000',
  '127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // 2. Clean origin for comparison (remove protocol and trailing slash)
    const cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // 3. Check against allowed list or environment variable
    const isAllowed = allowedOrigins.some(ao => cleanOrigin === ao.replace(/^https?:\/\//, '').replace(/\/$/, '')) || (process.env.FRONTEND_URL && cleanOrigin === process.env.FRONTEND_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''));

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`[CORS] Rejected origin: ${origin} (Cleaned: ${cleanOrigin})`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers crash on 204
}));


import importRoutes from "./routes/importRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import locationRoutes from "./routes/LocationRoutes.js";
import productivityRoutes from "./routes/productivityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uniqueInventoryRoutes from "./routes/uniqueInventoryRoutes.js";




app.use(express.json());



app.use('/api', importRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', locationRoutes);
app.use('/api', productivityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', uniqueInventoryRoutes);




const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


