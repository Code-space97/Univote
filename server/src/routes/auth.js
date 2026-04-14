const express = require('express');
const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/voter/login
router.post('/voter/login', async (req, res) => {
  try {
    const { voterId, password } = req.body;
    if (!voterId || !password)
      return res.status(400).json({ message: 'Voter ID and password are required.' });

    const voter = await Voter.findOne({ voterId });
    if (!voter || !(await voter.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid Voter ID or password.' });

    if (!voter.isActive)
      return res.status(403).json({ message: 'Your account is deactivated. Contact admin.' });

    const token = signToken(voter._id, 'voter');
    res.json({
      token,
      user: { id: voter._id, name: voter.name, voterId: voter.voterId, email: voter.email, department: voter.department, year: voter.year, role: 'voter' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid username or password.' });

    const token = signToken(admin._id, 'admin');
    res.json({
      token,
      user: { id: admin._id, name: admin.name, username: admin.username, role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/admin/setup — Create first admin (use ADMIN_SETUP_KEY)
router.post('/admin/setup', async (req, res) => {
  try {
    const { setupKey, username, password, name, email } = req.body;
    if (setupKey !== process.env.ADMIN_SETUP_KEY)
      return res.status(403).json({ message: 'Invalid setup key.' });

    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Admin already exists.' });

    const admin = await Admin.create({ username, password, name, email });
    const token = signToken(admin._id, 'admin');
    res.status(201).json({ token, message: 'Admin created successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user, role: req.role });
});

module.exports = router;
