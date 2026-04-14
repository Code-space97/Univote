const express = require('express');
const Voter = require('../models/Voter');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET voter profile
router.get('/profile', (req, res) => {
  if (req.role !== 'voter') return res.status(403).json({ message: 'Voter access only.' });
  res.json(req.user);
});

// PUT update password
router.put('/profile/password', async (req, res) => {
  try {
    if (req.role !== 'voter') return res.status(403).json({ message: 'Voter access only.' });
    const { currentPassword, newPassword } = req.body;
    const voter = await Voter.findById(req.user._id);
    if (!(await voter.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect.' });
    voter.password = newPassword;
    await voter.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
