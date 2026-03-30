import express from "express";
import UniqueInventory from "../DB/models/uniqueInventory.model.js";

const router = express.Router();

// GET all unique inventory summary
router.get("/unique-inventory-summary", async (req, res) => {
  try {
    const data = await UniqueInventory.find({}).sort({ date: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
