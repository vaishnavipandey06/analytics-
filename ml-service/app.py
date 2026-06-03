from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RF_MODEL_PATH = os.path.join(BASE_DIR, 'rf_model.pkl')
LR_MODEL_PATH = os.path.join(BASE_DIR, 'lr_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')
METRICS_PATH = os.path.join(BASE_DIR, 'metrics.pkl')

rf_model = None
lr_model = None
scaler = None
metrics = None

def load_resources():
    global rf_model, lr_model, scaler, metrics
    if not (os.path.exists(RF_MODEL_PATH) and os.path.exists(LR_MODEL_PATH) and os.path.exists(SCALER_PATH)):
        print("Model files not found. Training models now...")
        from train import train_models
        train_models()
        
    rf_model = joblib.load(RF_MODEL_PATH)
    lr_model = joblib.load(LR_MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    metrics = joblib.load(METRICS_PATH)

# Load resources when Flask starts
load_resources()

def get_risk_level(prob):
    if prob < 30:
        return 'Low Risk'
    elif prob < 70:
        return 'Medium Risk'
    else:
        return 'High Risk'

def generate_recommendations(features, prob, risk_level):
    age, monthly_charges, tenure, sub_type, support_tickets, usage_frequency = features
    
    recs = []
    actions = []
    
    # Analyze indicators
    if support_tickets >= 4:
        recs.append("Customer has opened a high number of support tickets, suggesting unresolved issues.")
        actions.append("Assign a dedicated customer success agent to resolve pending issues immediately.")
    elif support_tickets >= 2:
        recs.append("Moderate support ticket activity; customer may have outstanding friction points.")
        actions.append("Follow up on recent support tickets to ensure complete satisfaction.")
        
    if usage_frequency < 5:
        recs.append("Low login/usage frequency indicates very poor system engagement.")
        actions.append("Trigger an automated re-engagement campaign with helpful tutorial videos.")
    elif usage_frequency < 12:
        recs.append("Customer engagement has dropped below active levels.")
        actions.append("Send a personalized newsletter showing updates and feature tips.")
        
    if tenure < 6:
        recs.append("Customer is in the critical onboarding phase (under 6 months tenure).")
        actions.append("Offer a personalized onboarding session or setup support.")
        
    if monthly_charges > 100:
        recs.append("Customer is paying high monthly charges, which makes them price-sensitive.")
        actions.append("Provide a loyalty discount (e.g. 15% off next 3 months) or review their plan suitability.")
        
    if not recs:
        if risk_level == 'High Risk':
            recs.append("General indicators show warning patterns; multiple risk factors combine to high churn risk.")
            actions.append("Offer a complimentary upgrade or proactive loyalty reward.")
        else:
            recs.append("No immediate alert signals. The customer is currently stable.")
            actions.append("Continue regular communications and routine satisfaction check-ins.")
            
    return {
        "analysis": " ".join(recs),
        "actions": actions
    }

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json() or {}
        
        # Parse inputs
        age = float(data.get('age', 35))
        monthly_charges = float(data.get('monthlyCharges', 50))
        tenure = float(data.get('tenure', 12))
        
        # Sub plans: Basic=0, Standard=1, Premium=2
        sub_type_raw = data.get('subscriptionPlan', 'Basic')
        plan_map = {'Basic': 0, 'Standard': 1, 'Premium': 2}
        sub_type = plan_map.get(sub_type_raw, 0)
        
        support_tickets = float(data.get('supportTickets', 0))
        usage_frequency = float(data.get('usageFrequency', 15))
        
        model_type = data.get('modelType', 'rf').lower() # 'rf' or 'lr'
        
        # Format for scaler
        features = np.array([[age, monthly_charges, tenure, sub_type, support_tickets, usage_frequency]])
        features_scaled = scaler.transform(features)
        
        # Predict
        if model_type == 'lr':
            prob_churn = lr_model.predict_proba(features_scaled)[0][1] * 100
            confidence = float(lr_model.decision_function(features_scaled)[0]) # simple confidence proxy
            # Normalize confidence proxy for UI
            confidence_score = float(max(50, min(99, 50 + abs(confidence) * 10)))
        else: # Default RF
            prob_churn = rf_model.predict_proba(features_scaled)[0][1] * 100
            # Confidence based on ensemble vote strength
            votes = rf_model.predict_proba(features_scaled)[0]
            confidence_score = float(max(votes) * 100)
            
        prob_churn = float(round(prob_churn, 2))
        confidence_score = float(round(confidence_score, 2))
        risk_level = get_risk_level(prob_churn)
        
        # Get feature importance for visual graphs
        feat_cols = ['Age', 'Monthly Charges', 'Tenure', 'Subscription Type', 'Support Tickets', 'Usage Frequency']
        if model_type == 'lr':
            # Use coefficients for logistic regression
            importances = np.abs(lr_model.coef_[0])
            importances = importances / np.sum(importances)
        else:
            # Use Random Forest feature importances
            importances = rf_model.feature_importances_
            
        feature_importance = [
            {"feature": feat_cols[i], "importance": float(round(importances[i] * 100, 2))}
            for i in range(len(feat_cols))
        ]
        feature_importance = sorted(feature_importance, key=lambda x: x['importance'], reverse=True)
        
        # AI recommendations
        recs = generate_recommendations(
            [age, monthly_charges, tenure, sub_type, support_tickets, usage_frequency],
            prob_churn,
            risk_level
        )
        
        return jsonify({
            "status": "success",
            "prediction": {
                "churnProbability": prob_churn,
                "riskLevel": risk_level,
                "confidenceScore": confidence_score,
                "modelUsed": "Random Forest" if model_type == 'rf' else "Logistic Regression"
            },
            "featureImportance": feature_importance,
            "aiRecommendation": recs
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/metrics', methods=['GET'])
def get_metrics():
    try:
        global metrics
        if metrics is None:
            load_resources()
        return jsonify({
            "status": "success",
            "metrics": metrics
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    try:
        from train import train_models
        train_models()
        load_resources()
        return jsonify({
            "status": "success",
            "message": "Models successfully retrained!",
            "metrics": metrics
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
