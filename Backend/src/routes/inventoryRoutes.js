import { Router } from 'express';
import { getInventoryData, getInventoryKPIs } from '../controllers/inventoryController.js';
import { authMiddleware } from '../middlewares/auth.js';


const router = Router();

router.get('/inventory/data', authMiddleware, getInventoryData);
router.get('/inventory/kpis', authMiddleware, getInventoryKPIs);


export default router;
