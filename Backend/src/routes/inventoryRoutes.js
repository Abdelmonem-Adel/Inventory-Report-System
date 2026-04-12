import { Router } from 'express';
import { getInventoryData, getInventoryKPIs } from '../controllers/inventoryController.js';


const router = Router();

router.get('/inventory/data', getInventoryData);
router.get('/inventory/kpis', getInventoryKPIs);


export default router;
