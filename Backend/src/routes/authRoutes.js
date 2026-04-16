import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import authController from '../controllers/authController.js';
import '../config/passport.config.js';

const router = express.Router();

// POST /auth/login
router.post('/login', authController.login);

// GET /auth/google
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    prompt: 'select_account',
    hd: 'breadfast.com' // Suggest domain
}));

// GET /auth/google/callback
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        console.log(`[AuthRoutes] Callback reached. User found: ${!!user}`, info);
        
        if (err || !user) {
            const errorMsg = encodeURIComponent(info?.message || 'Authentication failed');
            console.log(`[AuthRoutes] Redirecting to frontend with error: ${decodeURIComponent(errorMsg)}`);
            return res.redirect(`${frontendUrl}/auth-success?error=${errorMsg}`);
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'supersecret',
            { expiresIn: '8h' }
        );

        res.redirect(`${frontendUrl}/auth-success?token=${token}`);
    })(req, res, next);
});

export default router;
