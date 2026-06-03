// Javascript Fallback ML Engine mimicking the Python Flask Service

const getRiskLevel = (prob) => {
  if (prob < 30) return 'Low Risk';
  if (prob < 70) return 'Medium Risk';
  return 'High Risk';
};

const generateRecommendations = (features, prob, riskLevel) => {
  const { age, monthlyCharges, tenure, subscriptionPlan, supportTickets, usageFrequency } = features;
  
  const recs = [];
  const actions = [];

  if (supportTickets >= 4) {
    recs.append ? null : recs.push("Customer has opened a high number of support tickets, suggesting unresolved issues.");
    actions.push("Assign a dedicated customer success agent to resolve pending issues immediately.");
  } else if (supportTickets >= 2) {
    recs.push("Moderate support ticket activity; customer may have outstanding friction points.");
    actions.push("Follow up on recent support tickets to ensure complete satisfaction.");
  }
      
  if (usageFrequency < 5) {
    recs.push("Low login/usage frequency indicates very poor system engagement.");
    actions.push("Trigger an automated re-engagement campaign with helpful tutorial videos.");
  } else if (usageFrequency < 12) {
    recs.push("Customer engagement has dropped below active levels.");
    actions.push("Send a personalized newsletter showing updates and feature tips.");
  }
      
  if (tenure < 6) {
    recs.push("Customer is in the critical onboarding phase (under 6 months tenure).");
    actions.push("Offer a personalized onboarding session or setup support.");
  }
      
  if (monthlyCharges > 100) {
    recs.push("Customer is paying high monthly charges, which makes them price-sensitive.");
    actions.push("Provide a loyalty discount (e.g. 15% off next 3 months) or review their plan suitability.");
  }
      
  if (recs.length === 0) {
    if (riskLevel === 'High Risk') {
      recs.push("General indicators show warning patterns; multiple risk factors combine to high churn risk.");
      actions.push("Offer a complimentary upgrade or proactive loyalty reward.");
    } else {
      recs.push("No immediate alert signals. The customer is currently stable.");
      actions.push("Continue regular communications and routine satisfaction check-ins.");
    }
  }
          
  return {
    analysis: recs.join(" "),
    actions: actions
  };
};

const predictChurnJS = (customerData) => {
  const {
    age = 35,
    monthlyCharges = 50,
    tenure = 12,
    subscriptionPlan = 'Basic',
    supportTickets = 0,
    usageFrequency = 15
  } = customerData;

  // Compute probability based on weighted parameters (mimicking RF behavior)
  let score = 0.12;

  // Younger age adds slight churn
  if (age < 28) score += 0.08;
  
  // High charges relative to subscription adds churn
  if (subscriptionPlan === 'Basic' && monthlyCharges > 40) score += 0.12;
  if (subscriptionPlan === 'Standard' && monthlyCharges > 85) score += 0.12;
  if (subscriptionPlan === 'Premium' && monthlyCharges > 140) score += 0.15;

  // New customers are highly volatile
  if (tenure < 4) score += 0.35;
  else if (tenure < 10) score += 0.15;
  else if (tenure > 36) score -= 0.15; // Loyals have negative score modifier

  // Support tickets is a heavy factor
  if (supportTickets >= 4) score += 0.40;
  else if (supportTickets >= 2) score += 0.18;

  // Low usage frequency is a heavy factor
  if (usageFrequency < 6) score += 0.28;
  else if (usageFrequency < 14) score += 0.10;
  else if (usageFrequency > 22) score -= 0.08;

  // Math limits
  const probability = parseFloat(Math.min(99.9, Math.max(0.1, score * 100)).toFixed(2));
  const riskLevel = getRiskLevel(probability);
  const confidenceScore = parseFloat((85 + Math.random() * 12).toFixed(2)); // High-confidence simulations

  // Feature importances
  const featureImportance = [
    { feature: 'Support Tickets', importance: supportTickets >= 3 ? 32.5 : 20.0 },
    { feature: 'Tenure', importance: tenure < 12 ? 28.0 : 18.5 },
    { feature: 'Usage Frequency', importance: usageFrequency < 10 ? 22.0 : 15.0 },
    { feature: 'Monthly Charges', importance: 12.5 },
    { feature: 'Age', importance: 8.5 },
    { feature: 'Subscription Type', importance: 5.5 }
  ];
  
  // Normalize importances
  const totalImp = featureImportance.reduce((acc, f) => acc + f.importance, 0);
  featureImportance.forEach(f => f.importance = parseFloat(((f.importance / totalImp) * 100).toFixed(2)));
  featureImportance.sort((a, b) => b.importance - a.importance);

  const aiRec = generateRecommendations({
    age, monthlyCharges, tenure, subscriptionPlan, supportTickets, usageFrequency
  }, probability, riskLevel);

  return {
    churnProbability: probability,
    riskLevel,
    confidenceScore,
    featureImportance,
    aiRecommendation: aiRec,
    modelUsed: "Rule-Based JS Engine (Offline Fallback)"
  };
};

module.exports = { predictChurnJS };
