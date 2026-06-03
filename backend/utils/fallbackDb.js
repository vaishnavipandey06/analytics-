const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');

// Ensure data directory and files exist
const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Helper to initialize files with default arrays or objects
  const initFile = (filePath, defaultData) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  };

  // Seed default admin and analyst if users.json is empty
  const defaultUsers = [
    {
      id: 'usr-1',
      name: 'Admin User',
      email: 'admin@churnvision.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'Admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-2',
      name: 'Analyst User',
      email: 'analyst@churnvision.com',
      password: bcrypt.hashSync('analyst123', 10),
      role: 'Analyst',
      createdAt: new Date().toISOString()
    }
  ];

  initFile(USERS_FILE, defaultUsers);
  initFile(NOTIFICATIONS_FILE, [
    {
      id: 'notif-1',
      title: 'System Initialized',
      message: 'ChurnVision platform initialized with JSON database fallback.',
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);
  initFile(SETTINGS_FILE, {
    churnThreshold: 80,
    emailNotifications: true,
    defaultModel: 'rf',
    theme: 'dark',
    alertEmail: 'admin@churnvision.com',
    updatedAt: new Date().toISOString()
  });
  initFile(AUDIT_LOGS_FILE, [
    {
      id: 'log-1',
      action: 'SYSTEM_START',
      details: 'Express Server booted successfully using JSON fallback databases.',
      userId: 'System',
      username: 'System',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString()
    }
  ]);

  // Seed default customers if empty
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    const seedCustomers = generateMockCustomers(100);
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(seedCustomers, null, 2));
  }
};

// Generate realistic mock customers for fallback DB
function generateMockCustomers(count = 100) {
  const genders = ['Male', 'Female'];
  const locations = ['North', 'South', 'East', 'West', 'Central'];
  const plans = ['Basic', 'Standard', 'Premium'];
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Robert', 'Sophia', 'William', 'Olivia', 'David', 'Emma', 'Richard', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore'];

  const customers = [];

  for (let i = 0; i < count; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const subscriptionPlan = plans[Math.floor(Math.random() * plans.length)];
    
    let monthlyCharges = 29.99;
    if (subscriptionPlan === 'Standard') monthlyCharges = 69.99;
    if (subscriptionPlan === 'Premium') monthlyCharges = 129.99;
    // Add small random variation
    monthlyCharges = parseFloat((monthlyCharges + (Math.random() * 10 - 5)).toFixed(2));

    const tenure = Math.floor(Math.random() * 60) + 1; // 1 to 60 months
    const totalCharges = parseFloat((monthlyCharges * tenure).toFixed(2));
    const supportTickets = Math.floor(Math.random() * 6); // 0 to 5
    const usageFrequency = Math.floor(Math.random() * 28) + 2; // 2 to 30 logins

    // Compute synthetic risk to mimic ML model
    let score = 0.1;
    if (tenure < 6) score += 0.3;
    if (supportTickets >= 3) score += 0.35;
    if (usageFrequency < 8) score += 0.25;
    score += Math.random() * 0.1;
    score = Math.min(0.99, Math.max(0.01, score));

    const churnProbability = parseFloat((score * 100).toFixed(2));
    const churnStatus = churnProbability > 55 ? 1 : 0;
    
    let riskLevel = 'Low Risk';
    if (churnProbability >= 70) riskLevel = 'High Risk';
    else if (churnProbability >= 30) riskLevel = 'Medium Risk';

    const lastLoginDays = Math.floor(Math.random() * 30);
    const lastLoginDate = new Date();
    lastLoginDate.setDate(lastLoginDate.getDate() - lastLoginDays);

    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

    customers.push({
      id: `cust-fallback-${1000 + i}`,
      customerId: `CUST-${1000 + i}`,
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
      age: Math.floor(Math.random() * 50) + 18,
      gender,
      location,
      subscriptionPlan,
      monthlyCharges,
      totalCharges,
      tenure,
      supportTickets,
      lastLoginDate: lastLoginDate.toISOString(),
      usageFrequency,
      churnStatus,
      churnProbability,
      riskLevel,
      createdAt: new Date(Date.now() - tenure * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return customers;
}

// Read/Write utilities
const readFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const fallbackDb = {
  // USERS
  getUsers: () => readFile(USERS_FILE),
  saveUser: (user) => {
    const users = readFile(USERS_FILE);
    const newUser = { id: `usr-${Date.now()}`, ...user, createdAt: new Date().toISOString() };
    users.push(newUser);
    writeFile(USERS_FILE, users);
    return newUser;
  },
  findUserByEmail: (email) => {
    const users = readFile(USERS_FILE);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id) => {
    const users = readFile(USERS_FILE);
    return users.find(u => u.id === id);
  },
  updateUserPassword: (email, newHashedPassword) => {
    const users = readFile(USERS_FILE);
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      users[idx].password = newHashedPassword;
      writeFile(USERS_FILE, users);
      return true;
    }
    return false;
  },

  // CUSTOMERS
  getCustomers: () => readFile(CUSTOMERS_FILE),
  findCustomerById: (id) => {
    const customers = readFile(CUSTOMERS_FILE);
    return customers.find(c => c.id === id || c.customerId === id);
  },
  saveCustomer: (cust) => {
    const customers = readFile(CUSTOMERS_FILE);
    const newCust = {
      id: `cust-fallback-${Date.now()}`,
      customerId: cust.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      ...cust
    };
    customers.push(newCust);
    writeFile(CUSTOMERS_FILE, customers);
    return newCust;
  },
  updateCustomer: (id, updateData) => {
    const customers = readFile(CUSTOMERS_FILE);
    const idx = customers.findIndex(c => c.id === id || c.customerId === id);
    if (idx !== -1) {
      customers[idx] = { ...customers[idx], ...updateData };
      writeFile(CUSTOMERS_FILE, customers);
      return customers[idx];
    }
    return null;
  },
  deleteCustomer: (id) => {
    const customers = readFile(CUSTOMERS_FILE);
    const filtered = customers.filter(c => c.id !== id && c.customerId !== id);
    if (filtered.length !== customers.length) {
      writeFile(CUSTOMERS_FILE, filtered);
      return true;
    }
    return false;
  },

  // NOTIFICATIONS
  getNotifications: () => readFile(NOTIFICATIONS_FILE),
  saveNotification: (notif) => {
    const notifications = readFile(NOTIFICATIONS_FILE);
    const newNotif = {
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif
    };
    notifications.unshift(newNotif); // Add to beginning
    // Limit to 50 notifications in fallback mode
    if (notifications.length > 50) notifications.pop();
    writeFile(NOTIFICATIONS_FILE, notifications);
    return newNotif;
  },
  markAllNotificationsRead: () => {
    const notifications = readFile(NOTIFICATIONS_FILE);
    notifications.forEach(n => n.read = true);
    writeFile(NOTIFICATIONS_FILE, notifications);
    return true;
  },

  // SETTINGS
  getSettings: () => readFile(SETTINGS_FILE),
  saveSettings: (settingsData) => {
    const current = readFile(SETTINGS_FILE);
    const updated = { ...current, ...settingsData, updatedAt: new Date().toISOString() };
    writeFile(SETTINGS_FILE, updated);
    return updated;
  },

  // AUDIT LOGS
  getAuditLogs: () => readFile(AUDIT_LOGS_FILE),
  saveAuditLog: (logData) => {
    const logs = readFile(AUDIT_LOGS_FILE);
    const newLog = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...logData
    };
    logs.unshift(newLog);
    // Limit to 100 audit logs
    if (logs.length > 100) logs.pop();
    writeFile(AUDIT_LOGS_FILE, logs);
    return newLog;
  }
};

// Initialize DB files
initDb();

module.exports = fallbackDb;
