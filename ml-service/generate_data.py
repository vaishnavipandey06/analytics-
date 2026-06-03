import pandas as pd
import numpy as np
import os
import random

def generate_customer_data(num_records=1000):
    np.random.seed(42)
    random.seed(42)
    
    # Pre-defined columns
    genders = ['Male', 'Female']
    locations = ['North', 'South', 'East', 'West', 'Central']
    plans = ['Basic', 'Standard', 'Premium']
    
    ages = np.random.randint(18, 70, size=num_records)
    gender_choices = np.random.choice(genders, size=num_records)
    location_choices = np.random.choice(locations, size=num_records)
    plan_choices = np.random.choice(plans, size=num_records, p=[0.4, 0.4, 0.2])
    
    # Monthly charges based on plan
    monthly_charges = []
    for plan in plan_choices:
        if plan == 'Basic':
            monthly_charges.append(round(random.uniform(20.0, 50.0), 2))
        elif plan == 'Standard':
            monthly_charges.append(round(random.uniform(50.0, 100.0), 2))
        else: # Premium
            monthly_charges.append(round(random.uniform(100.0, 180.0), 2))
    monthly_charges = np.array(monthly_charges)
    
    tenures = np.random.randint(1, 72, size=num_records) # months
    total_charges = np.round(monthly_charges * tenures * np.random.uniform(0.9, 1.05, size=num_records), 2)
    support_tickets = np.random.poisson(lam=1.5, size=num_records) # lower value usually, high value means issues
    
    # Usage frequency: times per month (e.g. 1 to 30)
    usage_frequency = np.random.randint(1, 31, size=num_records)
    
    # Calculate custom churn status based on features to create a strong predictive pattern
    # High support tickets, high monthly charges, low tenure, low usage frequency increase churn probability
    churn_probabilities = []
    for i in range(num_records):
        score = 0.0
        # Age effect (slightly higher churn in younger profiles)
        if ages[i] < 30:
            score += 0.1
        # Tenure effect (new users are much more likely to churn)
        if tenures[i] < 6:
            score += 0.35
        elif tenures[i] < 12:
            score += 0.15
        # Support tickets effect (more issues = churn)
        if support_tickets[i] >= 4:
            score += 0.4
        elif support_tickets[i] >= 2:
            score += 0.15
        # Usage frequency effect (low engagement = churn)
        if usage_frequency[i] < 5:
            score += 0.3
        elif usage_frequency[i] < 12:
            score += 0.1
        # Monthly charges relative to plan average
        if plan_choices[i] == 'Basic' and monthly_charges[i] > 40:
            score += 0.15
        elif plan_choices[i] == 'Standard' and monthly_charges[i] > 85:
            score += 0.15
        elif plan_choices[i] == 'Premium' and monthly_charges[i] > 150:
            score += 0.15
            
        # Base churn factor
        score += random.uniform(-0.1, 0.1)
        # Bound between 0 and 1
        prob = max(0.0, min(1.0, score))
        churn_probabilities.append(prob)
        
    churn_status = [1 if p > 0.5 else 0 for p in churn_probabilities]
    
    # Create DataFrame
    data = pd.DataFrame({
        'CustomerID': [f"CUST-{1000 + i}" for i in range(num_records)],
        'Name': [f"Customer {i+1}" for i in range(num_records)],
        'Email': [f"cust{i+1}@example.com" for i in range(num_records)],
        'Age': ages,
        'Gender': gender_choices,
        'Location': location_choices,
        'SubscriptionPlan': plan_choices,
        'MonthlyCharges': monthly_charges,
        'TotalCharges': total_charges,
        'Tenure': tenures,
        'SupportTickets': support_tickets,
        'UsageFrequency': usage_frequency,
        'LastLoginDate': [(pd.Timestamp.now() - pd.Timedelta(days=int(random.randint(0, 45)))).strftime('%Y-%m-%d') for _ in range(num_records)],
        'ChurnStatus': churn_status
    })
    
    # Make sure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'churn_data.csv')
    data.to_csv(csv_path, index=False)
    print(f"Generated {num_records} synthetic customer records at: {csv_path}")
    print(f"Overall Churn Rate: {data['ChurnStatus'].mean() * 100:.2f}%")

if __name__ == "__main__":
    generate_customer_data()
