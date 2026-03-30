import express from 'express';
import userController from '../controllers/userController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// GET /users (all roles)
router.get('/', authMiddleware, userController.getUsers);

// POST /users (Admin & Top Admin)
router.post('/', authMiddleware, roleMiddleware('top_admin', 'admin'), userController.createUser);

// PUT /users/:id (Top Admin only)
router.put('/:id', authMiddleware, roleMiddleware('top_admin'), userController.editUser);

// DELETE /users/:id (Top Admin only)
router.delete('/:id', authMiddleware, roleMiddleware('top_admin'), userController.deleteUser);

export default router;
