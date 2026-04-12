import express from 'express';
import {getProductivityHours} from '../controllers/productivityController.js';

const router = express.Router();

router.get('/productivity-hours', getProductivityHours);

export default router;