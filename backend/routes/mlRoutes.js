const express = require('express');
const router = express.Router();
const {
  predictCustomerChurn,
  getModelMetrics,
  retrainModels
} = require('../controllers/mlController');
const { protect, authorize } = require('../middleware/auth');

router.post('/predict', protect, predictCustomerChurn);
router.get('/metrics', protect, getModelMetrics);
router.post('/retrain', protect, authorize('Admin'), retrainModels);

module.exports = router;
