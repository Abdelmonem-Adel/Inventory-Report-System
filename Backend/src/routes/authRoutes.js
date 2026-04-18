import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';

// POST /auth/login
router.post('/login', authController.login);

export default router;
