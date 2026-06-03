const express = require('express');
const router = express.Router();
const {
  generatePDFReport,
  generateExcelReport,
  shareReportEmail
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/pdf', protect, generatePDFReport);
router.get('/excel', protect, generateExcelReport);
router.post('/share', protect, shareReportEmail);

module.exports = router;
