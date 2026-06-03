import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def train_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, 'churn_data.csv')
    
    if not os.path.exists(csv_path):
        print("Dataset not found. Generating new dataset...")
        from generate_data import generate_customer_data
        generate_customer_data()
        
    df = pd.read_csv(csv_path)
    
    # Feature preprocessing
    # Encode SubscriptionPlan as ordinal
    plan_map = {'Basic': 0, 'Standard': 1, 'Premium': 2}
    df['SubscriptionType_Encoded'] = df['SubscriptionPlan'].map(plan_map).fillna(0)
    
    # Features: Age, MonthlyCharges, Tenure, SubscriptionType_Encoded, SupportTickets, UsageFrequency
    feature_cols = ['Age', 'MonthlyCharges', 'Tenure', 'SubscriptionType_Encoded', 'SupportTickets', 'UsageFrequency']
    X = df[feature_cols]
    y = df['ChurnStatus']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale numerical features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 1. Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=8)
    rf_model.fit(X_train_scaled, y_train)
    rf_y_pred = rf_model.predict(X_test_scaled)
    rf_acc = accuracy_score(y_test, rf_y_pred)
    
    # 2. Logistic Regression
    lr_model = LogisticRegression(random_state=42)
    lr_model.fit(X_train_scaled, y_train)
    lr_y_pred = lr_model.predict(X_test_scaled)
    lr_acc = accuracy_score(y_test, lr_y_pred)
    
    print(f"Random Forest Test Accuracy: {rf_acc * 100:.2f}%")
    print(f"Logistic Regression Test Accuracy: {lr_acc * 100:.2f}%")
    
    # Feature Importances for RF
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    feature_importance_dict = {feature_cols[i]: float(importances[i]) for i in range(len(feature_cols))}
    
    # Metrics payload
    rf_cm = confusion_matrix(y_test, rf_y_pred).tolist()
    lr_cm = confusion_matrix(y_test, lr_y_pred).tolist()
    
    metrics = {
        'rf_accuracy': float(rf_acc),
        'lr_accuracy': float(lr_acc),
        'rf_confusion_matrix': rf_cm,
        'lr_confusion_matrix': lr_cm,
        'feature_importances': feature_importance_dict,
        'rf_report': classification_report(y_test, rf_y_pred, output_dict=True),
        'lr_report': classification_report(y_test, lr_y_pred, output_dict=True)
    }
    
    # Save artifacts
    joblib.dump(rf_model, os.path.join(base_dir, 'rf_model.pkl'))
    joblib.dump(lr_model, os.path.join(base_dir, 'lr_model.pkl'))
    joblib.dump(scaler, os.path.join(base_dir, 'scaler.pkl'))
    joblib.dump(metrics, os.path.join(base_dir, 'metrics.pkl'))
    
    print("Saved rf_model.pkl, lr_model.pkl, scaler.pkl, and metrics.pkl successfully!")

if __name__ == "__main__":
    train_models()
