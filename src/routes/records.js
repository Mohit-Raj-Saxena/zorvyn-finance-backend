const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
} = require('../controllers/recordController');

const createRecordValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .custom(value => value > 0).withMessage('Amount must be greater than 0'),
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date'),
  body('notes')
    .optional()
    .trim()
];

const updateRecordValidation = [
  body('amount')
    .optional()
    .isNumeric().withMessage('Amount must be a number')
    .custom(value => value > 0).withMessage('Amount must be greater than 0'),
  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date'),
  body('notes')
    .optional()
    .trim()
];

// POST /api/records - create a record (admin only)
router.post('/', auth, roles('admin'), createRecordValidation, createRecord);

// GET /api/records - get all records with filtering (viewer, analyst, admin)
router.get('/', auth, roles('viewer', 'analyst', 'admin'), getAllRecords);

// GET /api/records/:id - get single record (viewer, analyst, admin)
router.get('/:id', auth, roles('viewer', 'analyst', 'admin'), getRecordById);

// PUT /api/records/:id - update a record (admin only)
router.put('/:id', auth, roles('admin'), updateRecordValidation, updateRecord);

// DELETE /api/records/:id - soft delete a record (admin only)
router.delete('/:id', auth, roles('admin'), deleteRecord);

module.exports = router;