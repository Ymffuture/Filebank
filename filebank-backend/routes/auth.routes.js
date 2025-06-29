import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:5173'); // redirect to frontend on success
  });

router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out' });
});

export default router;
