import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./DB/config/DBconniction.js"
connectDB();

const app = express();

app.use(cors());


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
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api', uniqueInventoryRoutes);




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


