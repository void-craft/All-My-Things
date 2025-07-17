// server/src/routes/auth.routes.ts
import { Router } from 'express';
import passport from 'passport';

const authRouter = Router();

// Route to initiate Google OAuth login
authRouter.get(
  '/google',
  (_req, res, next) => {
    console.log('Backend: /auth/google route hit!');
    // Basic check for environment variables, can be moved to a config validation file if complex
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Backend: CRITICAL ERROR: Google Client ID or Secret not loaded from .env');
      res.status(500).send('Server configuration error: Google credentials missing.');
      return;
    }
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Callback route after Google authentication
authRouter.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login', // Redirect to frontend login page if authentication fails
    session: true
  }),
  (req, res) => {
    console.log('Google authentication successful! User:', req.user?.name);
    res.redirect('/'); // Redirect to your frontend's home page
  }
);

// Logout Route
authRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      console.log('User logged out and session destroyed.');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

// Current User Endpoint (for frontend to check login status)
authRouter.get('/current_user', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    console.log('Current user requested:', req.user.name);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } else {
    console.log('No user authenticated.');
    res.status(401).json({ message: 'Not authenticated' });
  }
});

export default authRouter;