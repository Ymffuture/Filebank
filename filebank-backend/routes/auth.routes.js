import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        displayName: payload.name,
        email: payload.email,
        picture: payload.picture
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ user, token });

  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});


router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/update-picture', async (req, res) => {
  try {
    const userId = req.user.id; // or extract from token
    const { picture } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { picture },
      { new: true }
    );

    res.json({
      id: user._id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      googleId: user.googleId,
      picture: user.picture
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update picture' });
  }
});

export default router;
