const Record = require('../models/Record');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper function to check valid MongoDB ID
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new record (admin only)
const createRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, type, category, date, notes } = req.body;

    const record = await Record.create({
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Record created successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all records with filtering and search (viewer, analyst, admin)
const getAllRecords = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = { isDeleted: false };

    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Search in notes and category
    if (search) {
      filter.$or = [
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Record.countDocuments(filter);
    const records = await Record.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single record by ID (viewer, analyst, admin)
const getRecordById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }

    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json({ record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a record (admin only)
const updateRecord = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, type, category, date, notes } = req.body;

    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (amount !== undefined) record.amount = amount;
    if (type) record.type = type;
    if (category) record.category = category;
    if (date) record.date = date;
    if (notes !== undefined) record.notes = notes;

    await record.save();
    res.status(200).json({ message: 'Record updated successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Soft delete a record (admin only)
const deleteRecord = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }

    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Soft delete - mark as deleted instead of removing
    record.isDeleted = true;
    record.deletedAt = new Date();
    await record.save();

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
};