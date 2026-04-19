import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import passport from 'passport';

// @desc    Initiate Google OAuth
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google OAuth callback
// @route   GET /auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    // Successful authentication, redirect to frontend.
    res.redirect(`${process.env.FRONTEND_URL}/inventory`);
  }
);

// @desc    Get authenticated user data
// @route   GET /auth/user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Default session cookie name
      res.json({ message: 'Logged out' });
    });
  });
});

// Existing login route
router.post('/login', authController.login);

export default router;
