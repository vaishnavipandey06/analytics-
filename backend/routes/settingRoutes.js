const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getAuditLogs
} = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSettings);
router.put('/', protect, authorize('Admin'), updateSettings);
router.get('/logs', protect, authorize('Admin'), getAuditLogs);

module.exports = router;
