const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDashboardKPIs,
  exportCustomers
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getCustomers);
router.get('/kpis', protect, getDashboardKPIs);
router.get('/export', protect, exportCustomers);
router.get('/:id', protect, getCustomerById);

// Admin-only operations for creating, updating, and deleting customer entries
router.post('/', protect, authorize('Admin'), createCustomer);
router.put('/:id', protect, authorize('Admin'), updateCustomer);
router.delete('/:id', protect, authorize('Admin'), deleteCustomer);

module.exports = router;
