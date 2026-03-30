import express from "express";
import multer from "multer";
import { importInventoryFile } from "../controllers/importController.js";
import { importScansFile } from "../controllers/importScansController.js";
import { importUniqueInventoryFile } from "../controllers/importUniqueInventoryController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/import-inventory", upload.single("file"), importInventoryFile);
router.post("/import-scans", upload.single("file"), importScansFile);
router.post("/import-unique-inventory", upload.single("file"), importUniqueInventoryFile);

export default router;