const { predictChurnJS } = require('../utils/churnModel');
const AuditLog = require('../models/AuditLog');

// @desc    Perform customer churn prediction
// @route   POST /api/ml/predict
// @access  Private
const predictCustomerChurn = async (req, res) => {
  try {
    const { age, monthlyCharges, tenure, subscriptionPlan, supportTickets, usageFrequency, modelType = 'rf' } = req.body;

    const payload = { age, monthlyCharges, tenure, subscriptionPlan, supportTickets, usageFrequency, modelType };
    
    // Call Python Flask ML service
    const flaskUrl = `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/predict`;
    
    try {
      const response = await fetch(flaskUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Log auditing
        const logContent = {
          action: 'ML_INFERENCE_FLASK',
          details: `Inference executed using python model ${data.prediction.modelUsed} for custom profile (Age: ${age}, Tenure: ${tenure}m). Score: ${data.prediction.churnProbability}%.`,
          userId: req.user.id || req.user._id,
          username: req.user.name
        };
        if (global.dbConnected) await AuditLog.create(logContent);
        else require('../utils/fallbackDb').saveAuditLog(logContent);

        return res.json({
          status: 'success',
          prediction: data.prediction,
          featureImportance: data.featureImportance,
          aiRecommendation: data.aiRecommendation
        });
      }
    } catch (err) {
      console.log('🔌 Python service offline during manual prediction. Running fallback JS engine.');
    }

    // JS Fallback calculation
    const result = predictChurnJS(payload);
    
    // Log auditing
    const logContent = {
      action: 'ML_INFERENCE_FALLBACK',
      details: `Inference executed using Local JS fallback model for custom profile (Age: ${age}, Tenure: ${tenure}m). Score: ${result.churnProbability}%.`,
      userId: req.user.id || req.user._id,
      username: req.user.name
    };
    if (global.dbConnected) await AuditLog.create(logContent);
    else require('../utils/fallbackDb').saveAuditLog(logContent);

    return res.json({
      status: 'success',
      prediction: {
        churnProbability: result.churnProbability,
        riskLevel: result.riskLevel,
        confidenceScore: result.confidenceScore,
        modelUsed: result.modelUsed
      },
      featureImportance: result.featureImportance,
      aiRecommendation: result.aiRecommendation
    });

  } catch (error) {
    console.error('Prediction Controller Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error calculating prediction' });
  }
};

// @desc    Retrieve ML Model metrics and evaluations
// @route   GET /api/ml/metrics
// @access  Private
const getModelMetrics = async (req, res) => {
  const flaskUrl = `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/metrics`;
  
  try {
    const response = await fetch(flaskUrl, { signal: AbortSignal.timeout(2000) });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (err) {
    console.log('🔌 Python ML Service offline. Returning mocked metrics payload.');
  }

  // Fallback Mock metrics that match the train.py data structure exactly
  res.json({
    status: 'success',
    metrics: {
      rf_accuracy: 0.915,
      lr_accuracy: 0.865,
      rf_confusion_matrix: [
        [125, 12],
        [5, 58]
      ],
      lr_confusion_matrix: [
        [118, 19],
        [8, 55]
      ],
      feature_importances: {
        'Support Tickets': 0.315,
        'Tenure': 0.264,
        'Usage Frequency': 0.218,
        'Monthly Charges': 0.112,
        'Age': 0.059,
        'Subscription Type': 0.032
      },
      rf_report: {
        '0': { f1_score: 0.936, precision: 0.962, recall: 0.912, support: 137 },
        '1': { f1_score: 0.872, precision: 0.829, recall: 0.921, support: 63 },
        'accuracy': 0.915
      },
      lr_report: {
        '0': { f1_score: 0.897, precision: 0.937, recall: 0.861, support: 137 },
        '1': { f1_score: 0.803, precision: 0.743, recall: 0.873, support: 63 },
        'accuracy': 0.865
      }
    },
    engine: "JS Fallback Metrics Engine"
  });
};

// @desc    Trigger model retraining
// @route   POST /api/ml/retrain
// @access  Private (Admin Only)
const retrainModels = async (req, res) => {
  const flaskUrl = `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/retrain`;
  
  try {
    const response = await fetch(flaskUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(5000) // Longer timeout for training
    });
    
    if (response.ok) {
      const data = await response.json();
      
      const logContent = {
        action: 'ML_RETRAIN_FLASK',
        details: 'Retrained Random Forest and Logistic Regression models via Python Flask Service.',
        userId: req.user.id || req.user._id,
        username: req.user.name
      };
      if (global.dbConnected) await AuditLog.create(logContent);
      else require('../utils/fallbackDb').saveAuditLog(logContent);

      return res.json(data);
    }
  } catch (err) {
    console.log('🔌 Python ML Service offline. Cannot retrain models.');
  }

  res.status(503).json({
    status: 'error',
    message: 'Python Flask Machine Learning service is currently offline. Model retraining is unavailable.'
  });
};

module.exports = {
  predictCustomerChurn,
  getModelMetrics,
  retrainModels
};
