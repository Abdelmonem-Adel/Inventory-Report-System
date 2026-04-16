import express from 'express';
import {getProductivityHours} from '../controllers/productivityController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/productivity-hours', authMiddleware, getProductivityHours);

export default router;
