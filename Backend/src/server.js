import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./DB/config/DBconniction.js"
connectDB();

import passport from 'passport';

const app = express();

// --- BULLETPROOF CORS START ---
const isDomainAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
  return cleanOrigin.endsWith('breadfastwh.online') || 
         cleanOrigin === 'localhost:3000' || 
         cleanOrigin === '127.0.0.1:3000';
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  // LOG EVERYTHING FOR DEBUGGING
  console.log(`[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${origin}`);
  
  // ALLOW ALL TEMPORARILY
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Also use the cors package as a backup / secondary layer
app.use(cors({
  origin: true, // Reflect request origin
  credentials: true
}));
// --- DEBUG CORS END ---

app.use(passport.initialize());


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


