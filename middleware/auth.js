const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to check if user is logged in
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No security token found. Access denied.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attaches user ID and role to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware to restrict access only to Admins
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Requires Admin privileges.' });
  }
};

module.exports = { auth, adminOnly };