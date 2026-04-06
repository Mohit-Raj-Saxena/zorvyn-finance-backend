const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account is inactive' });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;