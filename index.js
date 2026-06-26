const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Bind API Endpoints
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

// Serve Frontend Static Web Files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback Route to serve the Home page if someone visits root URL directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Root Status Route
app.get('/api/status', (req, res) => {
  res.json({ status: "online", message: "Server API is fully active" });
});

app.listen(PORT, () => {
  console.log(`🚀 System server running perfectly on port ${PORT}`);
});