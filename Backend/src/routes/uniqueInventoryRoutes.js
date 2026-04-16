import express from "express";
import UniqueInventory from "../DB/models/uniqueInventory.model.js";

import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// GET all unique inventory summary
router.get("/unique-inventory-summary", authMiddleware, async (req, res) => {
  try {
    const data = await UniqueInventory.find({}).sort({ date: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
