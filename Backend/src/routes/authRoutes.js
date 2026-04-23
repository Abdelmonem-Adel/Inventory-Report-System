import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import passport from 'passport';


// GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// GET /auth/google/callback
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
      }
      if (!user) {
        // Pass the specific reason: not_breadfast | not_registered
        const reason = info?.message || 'unknown';
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${reason}`);
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
        return res.redirect(`${process.env.FRONTEND_URL}/inventory`);
      });
    })(req, res, next);
  }
);

// GET /auth/user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// GET /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); 
      res.json({ message: 'Logged out' });
    });
  });
});

// POST /auth/login
router.post('/login', authController.login);

export default router;
