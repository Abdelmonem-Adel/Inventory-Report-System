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
  'https://inventory.breadfastwh.online',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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


