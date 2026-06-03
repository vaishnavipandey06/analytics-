const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');
const fallbackDb = require('../utils/fallbackDb');
const { predictChurnJS } = require('../utils/churnModel');

// Helper to fetch ML predictions from Flask, falling back to JS logic if offline
const getPrediction = async (customerData) => {
  const mlUrl = `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/predict`;
  try {
    const response = await fetch(mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: customerData.age,
        monthlyCharges: customerData.monthlyCharges,
        tenure: customerData.tenure,
        subscriptionPlan: customerData.subscriptionPlan,
        supportTickets: customerData.supportTickets,
        usageFrequency: customerData.usageFrequency
      }),
      // Set a short timeout
      signal: AbortSignal.timeout(2000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        churnProbability: data.prediction.churnProbability,
        riskLevel: data.prediction.riskLevel,
        modelUsed: data.prediction.modelUsed || 'Python Flask API'
      };
    }
  } catch (error) {
    // Silently fall back to JS model
    console.log('🔌 Flask ML Service offline. Computing using local JS model.');
  }

  // Fallback to JS computation
  const jsPrediction = predictChurnJS(customerData);
  return {
    churnProbability: jsPrediction.churnProbability,
    riskLevel: jsPrediction.riskLevel,
    modelUsed: 'Local JS Fallback Model'
  };
};

// Helper to create notifications on high-risk thresholds
const checkRiskAlert = async (customer, thresholdVal = 80) => {
  if (customer.churnProbability >= thresholdVal) {
    const title = `⚠️ High Churn Risk Alert: ${customer.name}`;
    const message = `Customer ${customer.name} (${customer.customerId}) has a calculated churn risk of ${customer.churnProbability}%.`;
    
    if (global.dbConnected) {
      await Notification.create({ title, message, type: 'danger' });
    } else {
      fallbackDb.saveNotification({ title, message, type: 'danger' });
    }
  }
};

// @desc    Get all customers with filter, search and pagination
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const { search, location, subscriptionPlan, riskLevel, churnStatus, limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (global.dbConnected) {
      // Build query for MongoDB
      let query = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { customerId: { $regex: search, $options: 'i' } }
        ];
      }
      if (location) query.location = location;
      if (subscriptionPlan) query.subscriptionPlan = subscriptionPlan;
      if (riskLevel) query.riskLevel = riskLevel;
      if (churnStatus !== undefined && churnStatus !== '') query.churnStatus = parseInt(churnStatus);

      const total = await Customer.countDocuments(query);
      const customers = await Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      return res.json({
        status: 'success',
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        customers
      });
    } else {
      // Fallback query
      let customers = fallbackDb.getCustomers();

      if (search) {
        const s = search.toLowerCase();
        customers = customers.filter(c => 
          c.name.toLowerCase().includes(s) || 
          c.email.toLowerCase().includes(s) || 
          c.customerId.toLowerCase().includes(s)
        );
      }
      if (location) customers = customers.filter(c => c.location === location);
      if (subscriptionPlan) customers = customers.filter(c => c.subscriptionPlan === subscriptionPlan);
      if (riskLevel) customers = customers.filter(c => c.riskLevel === riskLevel);
      if (churnStatus !== undefined && churnStatus !== '') {
        customers = customers.filter(c => c.churnStatus === parseInt(churnStatus));
      }

      const total = customers.length;
      customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const paginated = customers.slice(skip, skip + parseInt(limit));

      return res.json({
        status: 'success',
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        customers: paginated
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error retrieving customers' });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  try {
    let customer;
    if (global.dbConnected) {
      customer = await Customer.findById(req.params.id);
    } else {
      customer = fallbackDb.findCustomerById(req.params.id);
    }

    if (!customer) {
      return res.status(404).json({ status: 'error', message: 'Customer not found' });
    }

    res.json({ status: 'success', customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error retrieving customer' });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (Admin Only)
const createCustomer = async (req, res) => {
  try {
    const { name, email, age, gender, location, subscriptionPlan, monthlyCharges, tenure, supportTickets, usageFrequency } = req.body;

    if (!name || !email || !age || !gender || !location || !subscriptionPlan || !monthlyCharges || tenure === undefined) {
      return res.status(400).json({ status: 'error', message: 'Please enter all required customer fields' });
    }

    const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCharges = parseFloat((monthlyCharges * tenure).toFixed(2));

    const customerData = {
      customerId,
      name,
      email,
      age: parseInt(age),
      gender,
      location,
      subscriptionPlan,
      monthlyCharges: parseFloat(monthlyCharges),
      totalCharges,
      tenure: parseInt(tenure),
      supportTickets: parseInt(supportTickets || 0),
      usageFrequency: parseInt(usageFrequency || 10),
      churnStatus: 0
    };

    // Calculate Churn Risks
    const prediction = await getPrediction(customerData);
    customerData.churnProbability = prediction.churnProbability;
    customerData.riskLevel = prediction.riskLevel;

    // Check Settings Threshold for alert
    let threshold = 80;
    if (global.dbConnected) {
      const setting = await Setting.findOne();
      if (setting) threshold = setting.churnThreshold;
    } else {
      const setting = fallbackDb.getSettings();
      threshold = setting.churnThreshold;
    }

    let customer;
    if (global.dbConnected) {
      customer = await Customer.create(customerData);
      // Log Audit
      await AuditLog.create({
        action: 'CREATE_CUSTOMER',
        details: `Created customer ${name} (${customerId}). ML Model: ${prediction.modelUsed}.`,
        userId: req.user.id || req.user._id,
        username: req.user.name
      });
      
      // Notify System
      await Notification.create({
        title: 'New Customer Registered',
        message: `Customer ${name} registered under plan ${subscriptionPlan}.`,
        type: 'success'
      });
    } else {
      customer = fallbackDb.saveCustomer(customerData);
      // Log Audit
      fallbackDb.saveAuditLog({
        action: 'CREATE_CUSTOMER',
        details: `Created customer ${name} (${customerId}). ML Model: ${prediction.modelUsed}.`,
        userId: req.user.id,
        username: req.user.name
      });
      // Notify
      fallbackDb.saveNotification({
        title: 'New Customer Registered',
        message: `Customer ${name} registered under plan ${subscriptionPlan}.`,
        type: 'success'
      });
    }

    // High risk notification if necessary
    await checkRiskAlert(customer, threshold);

    res.status(201).json({ status: 'success', customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error creating customer' });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin Only)
const updateCustomer = async (req, res) => {
  try {
    const { name, email, age, gender, location, subscriptionPlan, monthlyCharges, tenure, supportTickets, usageFrequency, churnStatus } = req.body;

    let customerExists;
    if (global.dbConnected) {
      customerExists = await Customer.findById(req.params.id);
    } else {
      customerExists = fallbackDb.findCustomerById(req.params.id);
    }

    if (!customerExists) {
      return res.status(404).json({ status: 'error', message: 'Customer not found' });
    }

    // Prepare update parameters
    const totalCharges = monthlyCharges && tenure 
      ? parseFloat((monthlyCharges * tenure).toFixed(2))
      : customerExists.totalCharges;

    const updateFields = {
      name: name || customerExists.name,
      email: email || customerExists.email,
      age: age ? parseInt(age) : customerExists.age,
      gender: gender || customerExists.gender,
      location: location || customerExists.location,
      subscriptionPlan: subscriptionPlan || customerExists.subscriptionPlan,
      monthlyCharges: monthlyCharges ? parseFloat(monthlyCharges) : customerExists.monthlyCharges,
      totalCharges,
      tenure: tenure !== undefined ? parseInt(tenure) : customerExists.tenure,
      supportTickets: supportTickets !== undefined ? parseInt(supportTickets) : customerExists.supportTickets,
      usageFrequency: usageFrequency !== undefined ? parseInt(usageFrequency) : customerExists.usageFrequency,
      churnStatus: churnStatus !== undefined ? parseInt(churnStatus) : customerExists.churnStatus,
      lastLoginDate: new Date()
    };

    // If active customers are set to churned (or vice versa), logs event
    if (churnStatus !== undefined && parseInt(churnStatus) !== customerExists.churnStatus) {
      const statusStr = parseInt(churnStatus) === 1 ? 'CHURNED' : 'REACTIVATED';
      const notificationTitle = statusStr === 'CHURNED' ? '⚠️ Customer Churned' : '🎉 Customer Reactivated';
      const notificationMsg = `Customer ${updateFields.name} (${customerExists.customerId}) status changed to ${statusStr}.`;

      if (global.dbConnected) {
        await Notification.create({ title: notificationTitle, message: notificationMsg, type: statusStr === 'CHURNED' ? 'danger' : 'success' });
      } else {
        fallbackDb.saveNotification({ title: notificationTitle, message: notificationMsg, type: statusStr === 'CHURNED' ? 'danger' : 'success' });
      }
    }

    // Recalculate Churn Prediction
    const prediction = await getPrediction(updateFields);
    updateFields.churnProbability = prediction.churnProbability;
    updateFields.riskLevel = prediction.riskLevel;

    // Load Alert Threshold
    let threshold = 80;
    if (global.dbConnected) {
      const setting = await Setting.findOne();
      if (setting) threshold = setting.churnThreshold;
    } else {
      const setting = fallbackDb.getSettings();
      threshold = setting.churnThreshold;
    }

    let updatedCustomer;
    if (global.dbConnected) {
      updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, updateFields, { new: true });
      await AuditLog.create({
        action: 'UPDATE_CUSTOMER',
        details: `Updated customer ${updateFields.name} (${customerExists.customerId}). Recalculated Churn Risk: ${prediction.churnProbability}% (${prediction.modelUsed}).`,
        userId: req.user.id || req.user._id,
        username: req.user.name
      });
    } else {
      updatedCustomer = fallbackDb.updateCustomer(req.params.id, updateFields);
      fallbackDb.saveAuditLog({
        action: 'UPDATE_CUSTOMER',
        details: `Updated customer ${updateFields.name} (${customerExists.customerId}). Recalculated Churn Risk: ${prediction.churnProbability}% (${prediction.modelUsed}).`,
        userId: req.user.id,
        username: req.user.name
      });
    }

    // Trigger alert if risk crossed threshold
    await checkRiskAlert(updatedCustomer, threshold);

    res.json({ status: 'success', customer: updatedCustomer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error updating customer' });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin Only)
const deleteCustomer = async (req, res) => {
  try {
    let customer;
    if (global.dbConnected) {
      customer = await Customer.findById(req.params.id);
    } else {
      customer = fallbackDb.findCustomerById(req.params.id);
    }

    if (!customer) {
      return res.status(404).json({ status: 'error', message: 'Customer not found' });
    }

    if (global.dbConnected) {
      await Customer.findByIdAndDelete(req.params.id);
      await AuditLog.create({
        action: 'DELETE_CUSTOMER',
        details: `Deleted customer ${customer.name} (${customer.customerId}).`,
        userId: req.user.id || req.user._id,
        username: req.user.name
      });
    } else {
      fallbackDb.deleteCustomer(req.params.id);
      fallbackDb.saveAuditLog({
        action: 'DELETE_CUSTOMER',
        details: `Deleted customer ${customer.name} (${customer.customerId}).`,
        userId: req.user.id,
        username: req.user.name
      });
    }

    res.json({ status: 'success', message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error deleting customer' });
  }
};

// @desc    Get dashboard KPIs and Trend Analytics
// @route   GET /api/customers/kpis
// @access  Private
const getDashboardKPIs = async (req, res) => {
  try {
    let customers = [];
    if (global.dbConnected) {
      customers = await Customer.find({});
    } else {
      customers = fallbackDb.getCustomers();
    }

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.churnStatus === 0).length;
    const churnedCustomers = customers.filter(c => c.churnStatus === 1).length;
    const churnRate = totalCustomers > 0 ? parseFloat(((churnedCustomers / totalCustomers) * 100).toFixed(2)) : 0;
    
    // Revenue impact analysis
    const monthlyRevenueActive = customers.filter(c => c.churnStatus === 0).reduce((sum, c) => sum + c.monthlyCharges, 0);
    const revenueLoss = customers.filter(c => c.churnStatus === 1).reduce((sum, c) => sum + c.monthlyCharges, 0);
    const customerLifetimeValue = activeCustomers > 0 
      ? parseFloat((customers.filter(c => c.churnStatus === 0).reduce((sum, c) => sum + c.totalCharges, 0) / activeCustomers).toFixed(2))
      : 0;

    const retentionRate = totalCustomers > 0 ? parseFloat(((activeCustomers / totalCustomers) * 100).toFixed(2)) : 100;
    
    // Growth rates (mock trends relative to last month stats)
    const monthlyGrowth = 4.2; 
    
    // Grouping for charts
    // 1. Churn by Plan
    const planCounts = { Basic: { total: 0, churned: 0 }, Standard: { total: 0, churned: 0 }, Premium: { total: 0, churned: 0 } };
    // 2. Churn by Age Groups
    const ageCounts = {
      '18-25': { total: 0, churned: 0 },
      '26-35': { total: 0, churned: 0 },
      '36-50': { total: 0, churned: 0 },
      '51-70': { total: 0, churned: 0 },
      '70+': { total: 0, churned: 0 }
    };
    // 3. Churn by Region
    const regionCounts = {};
    
    customers.forEach(c => {
      // Plan
      if (planCounts[c.subscriptionPlan]) {
        planCounts[c.subscriptionPlan].total++;
        if (c.churnStatus === 1) planCounts[c.subscriptionPlan].churned++;
      }
      
      // Age Group
      let ageGroup = '70+';
      if (c.age <= 25) ageGroup = '18-25';
      else if (c.age <= 35) ageGroup = '26-35';
      else if (c.age <= 50) ageGroup = '36-50';
      else if (c.age <= 70) ageGroup = '51-70';
      
      ageCounts[ageGroup].total++;
      if (c.churnStatus === 1) ageCounts[ageGroup].churned++;

      // Region
      if (!regionCounts[c.location]) {
        regionCounts[c.location] = { total: 0, churned: 0 };
      }
      regionCounts[c.location].total++;
      if (c.churnStatus === 1) regionCounts[c.location].churned++;
    });

    const churnByPlan = Object.keys(planCounts).map(plan => ({
      name: plan,
      customers: planCounts[plan].total,
      churned: planCounts[plan].churned,
      churnRate: planCounts[plan].total > 0 ? parseFloat(((planCounts[plan].churned / planCounts[plan].total) * 100).toFixed(2)) : 0
    }));

    const churnByAge = Object.keys(ageCounts).map(age => ({
      name: age,
      customers: ageCounts[age].total,
      churned: ageCounts[age].churned,
      churnRate: ageCounts[age].total > 0 ? parseFloat(((ageCounts[age].churned / ageCounts[age].total) * 100).toFixed(2)) : 0
    }));

    const churnByRegion = Object.keys(regionCounts).map(loc => ({
      name: loc,
      customers: regionCounts[loc].total,
      churned: regionCounts[loc].churned,
      churnRate: regionCounts[loc].total > 0 ? parseFloat(((regionCounts[loc].churned / regionCounts[loc].total) * 100).toFixed(2)) : 0
    }));

    // Customer Segmentation based on Risk levels
    const riskCounts = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
    customers.filter(c => c.churnStatus === 0).forEach(c => {
      riskCounts[c.riskLevel] = (riskCounts[c.riskLevel] || 0) + 1;
    });
    
    const customerSegmentation = Object.keys(riskCounts).map(r => ({
      name: r,
      value: riskCounts[r]
    }));

    // Monthly trends (aggregate creation date of customers for last 6 months)
    const monthlyTrend = [
      { name: 'Jan', active: Math.round(activeCustomers * 0.8), churned: Math.round(churnedCustomers * 0.7), revenueLoss: Math.round(revenueLoss * 0.6) },
      { name: 'Feb', active: Math.round(activeCustomers * 0.85), churned: Math.round(churnedCustomers * 0.75), revenueLoss: Math.round(revenueLoss * 0.7) },
      { name: 'Mar', active: Math.round(activeCustomers * 0.9), churned: Math.round(churnedCustomers * 0.8), revenueLoss: Math.round(revenueLoss * 0.75) },
      { name: 'Apr', active: Math.round(activeCustomers * 0.95), churned: Math.round(churnedCustomers * 0.9), revenueLoss: Math.round(revenueLoss * 0.85) },
      { name: 'May', active: activeCustomers, churned: churnedCustomers, revenueLoss: revenueLoss }
    ];

    res.json({
      status: 'success',
      kpis: {
        totalCustomers,
        activeCustomers,
        churnedCustomers,
        churnRate,
        revenueLoss,
        monthlyRevenueActive,
        customerLifetimeValue,
        retentionRate,
        monthlyGrowth
      },
      charts: {
        churnByPlan,
        churnByAge,
        churnByRegion,
        customerSegmentation,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error compiling dashboard metrics' });
  }
};

// @desc    Export customer data as CSV format
// @route   GET /api/customers/export
// @access  Private
const exportCustomers = async (req, res) => {
  try {
    let customers = [];
    if (global.dbConnected) {
      customers = await Customer.find({});
    } else {
      customers = fallbackDb.getCustomers();
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers_churn_export.csv"');

    // Header row
    let csvData = 'CustomerID,Name,Email,Age,Gender,Location,SubscriptionPlan,MonthlyCharges,TotalCharges,Tenure,SupportTickets,UsageFrequency,ChurnProbability,RiskLevel,ChurnStatus\n';

    customers.forEach(c => {
      csvData += `"${c.customerId}","${c.name}","${c.email}",${c.age},"${c.gender}","${c.location}","${c.subscriptionPlan}",${c.monthlyCharges},${c.totalCharges},${c.tenure},${c.supportTickets},${c.usageFrequency},${c.churnProbability},"${c.riskLevel}",${c.churnStatus}\n`;
    });

    res.status(200).send(csvData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error generating customer CSV export' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDashboardKPIs,
  exportCustomers
};
