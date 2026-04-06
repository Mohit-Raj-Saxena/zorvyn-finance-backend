const Record = require('../models/Record');

// Get dashboard summary (viewer, analyst, admin)
const getSummary = async (req, res) => {
  try {
    // Total income
    const incomeResult = await Record.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total expenses
    const expenseResult = await Record.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const netBalance = totalIncome - totalExpenses;

    res.status(200).json({
      totalIncome,
      totalExpenses,
      netBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get category wise totals (analyst, admin)
const getCategoryTotals = async (req, res) => {
  try {
    const categoryTotals = await Record.aggregate([
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          breakdown: {
            $push: {
              type: '$_id.type',
              total: '$total'
            }
          },
          categoryTotal: { $sum: '$total' }
        }
      },
      { $sort: { categoryTotal: -1 } }
    ]);

    res.status(200).json({ categoryTotals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent activity (viewer, analyst, admin)
const getRecentActivity = async (req, res) => {
  try {
    const recentRecords = await Record.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ recentActivity: recentRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get monthly trends (analyst, admin)
const getMonthlyTrends = async (req, res) => {
  try {
    const trends = await Record.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          breakdown: {
            $push: {
              type: '$_id.type',
              total: '$total'
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({ monthlyTrends: trends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get weekly trends (analyst, admin)
const getWeeklyTrends = async (req, res) => {
  try {
    const trends = await Record.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            week: { $week: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            week: '$_id.week'
          },
          breakdown: {
            $push: {
              type: '$_id.type',
              total: '$total'
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.week': -1 } },
      { $limit: 8 }
    ]);

    res.status(200).json({ weeklyTrends: trends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSummary, getCategoryTotals, getRecentActivity, getMonthlyTrends, getWeeklyTrends };