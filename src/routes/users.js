const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile
} = require('../controllers/userController');

// GET /api/users/profile - get current logged in user
router.get('/profile', auth, getProfile);

// GET /api/users - get all users (admin only)
router.get('/', auth, roles('admin'), getAllUsers);

// GET /api/users/:id - get user by ID (admin only)
router.get('/:id', auth, roles('admin'), getUserById);

// PUT /api/users/:id - update user role or status (admin only)
router.put('/:id', auth, roles('admin'), updateUser);

// DELETE /api/users/:id - delete user (admin only)
router.delete('/:id', auth, roles('admin'), deleteUser);

module.exports = router;