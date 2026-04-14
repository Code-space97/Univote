const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized. No token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'voter') {
      req.user = await Voter.findById(decoded.id).select('-password');
      req.role = 'voter';
    } else if (decoded.role === 'admin') {
      req.user = await Admin.findById(decoded.id).select('-password');
      req.role = 'admin';
    }
    if (!req.user) return res.status(401).json({ message: 'User not found.' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

module.exports = { protect, adminOnly };
