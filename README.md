# ChurnVision – Customer Churn Prediction & Analytics Platform

ChurnVision is an enterprise-grade full-stack MERN business intelligence dashboard that analyzes customer churn patterns, forecasts churn risk using Machine Learning models, and suggests actionable AI-driven retention strategies.

---

## 🚀 Port & Access Quick Links

- **Frontend Application**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Service**: [http://localhost:5050/](http://localhost:5050/)
- **Python ML Service**: [http://localhost:8000/](http://localhost:8000/)

---

## 👤 Simulated Demo Accounts

Use these credentials to test role-based access control inside the dashboard:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@churnvision.com` | `admin123` | Full access (CRUD, retrain ML models, update system settings) |
| **Analyst** | `analyst@churnvision.com` | `analyst123` | Read-only access (run predictions, view charts, export reports) |

---

## 📂 Directory Architecture

```
/analytics
├── backend/                  # Node.js + Express API Server
│   ├── config/               # Database connection scripts
│   ├── controllers/          # Express route controllers (Auth, CRUD, ML proxy)
│   ├── data/                 # JSON file databases (used during local MongoDB offline fallback)
│   ├── middleware/           # JWT security & role access middleware
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # API endpoint configurations
│   ├── utils/                # PDF/Excel template scripts & offline JS ML fallback engine
│   ├── .env                  # Backend environment settings
│   ├── package.json          # Node dependencies (express, mongoose, pdfkit, exceljs)
│   └── server.js             # Express bootstrap script
│
├── frontend/                 # React.js + Vite + Tailwind CSS Single Page App (SPA)
│   ├── src/
│   │   ├── components/       # Layout frames, loaders, and input modals
│   │   ├── context/          # Auth state managers (JWT session hooks)
│   │   ├── pages/            # View views (Dashboard, Prediction, Management, Settings)
│   │   ├── App.jsx           # React router paths & protected route boundaries
│   │   ├── index.css         # Tailwind directives & theme colors config
│   │   └── main.jsx          # React app wrapper mount
│   ├── tailwind.config.js    # Tailwind theme specifications
│   ├── postcss.config.js     # CSS parser configurations
│   ├── index.html            # Main viewport HTML (SEO optimized)
│   └── package.json          # React dependencies (recharts, framer-motion, react-icons)
│
└── ml-service/               # Python Flask Machine Learning microservice
    ├── requirements.txt      # Python dependencies (flask, scikit-learn, pandas)
    ├── generate_data.py      # Script to generate synthetic customer churn CSV
    ├── train.py              # Script to fit RF and LR models, export pickles
    └── app.py                # Flask microservice serving prediction APIs
```

---

## 🔧 Environment Configurations

### Backend Settings (`backend/.env`)
```ini
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/churnvision
JWT_SECRET=churnvision_super_secret_jwt_key_2026_safe
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

---

## 📡 REST API Documentation

All routes require a `Authorization: Bearer <JWT_TOKEN>` header (except public authentication routes).

### Authentication (`/api/auth`)
- `POST /register`: Create a new User (Admin/Analyst)
- `POST /login`: Verify credentials and retrieve JWT
- `GET /profile`: Fetch active session details
- `POST /forgot-password`: Recover password credentials
- `POST /reset-password`: Set new password credentials

### Cohorts & Customers (`/api/customers`)
- `GET /`: Retrieve customers (supports search, plan, location, status filters)
- `GET /kpis`: Aggregate stats (active count, revenue leak, CLV, charts)
- `GET /export`: Download customer database as CSV
- `GET /:id`: Fetch detail of single customer
- `POST /`: Add new customer (Admin only)
- `PUT /:id`: Edit customer metrics (Admin only)
- `DELETE /:id`: Remove customer (Admin only)

### Machine Learning (`/api/ml`)
- `POST /predict`: Query prediction features (Age, Charges, Tenure, Tickets, Usage)
- `GET /metrics`: Fetch model accuracies and confusion matrices
- `POST /retrain`: Fit models on new data (Admin only)

### Reports (`/api/reports`)
- `GET /pdf`: Stream executive PDF document
- `GET /excel`: Stream workbook spreadsheet
- `POST /share`: Dispatch PDF/Excel via email (simulated)

### Settings (`/api/settings`)
- `GET /`: Retrieve platform settings (threshold, default model)
- `PUT /`: Update platform settings (Admin only)
- `GET /logs`: Fetch system audit trails (Admin only)

---

## 🏃 Running the Application Locally

1. **Start the Backend API Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *Note: If local MongoDB is missing, the server automatically boots in JSON Fallback Database mode.*

2. **Start the Frontend Vite Client**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Access the web app at [http://localhost:5173/](http://localhost:5173/)*

3. **Start the Flask ML Service (Optional)**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   python app.py
   ```
   *Note: If Flask service is offline, the backend's rule-based JS prediction engine will automatically calculate risk scores and recommended actions.*
