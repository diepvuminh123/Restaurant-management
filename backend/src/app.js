const express = require("express");
const session = require('express-session');


const cors = require("cors");
require('dotenv').config();

const sessionConfig = require('./config/session');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Session Middleware
app.use(session(sessionConfig));

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running ");
});

app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes);


// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Có lỗi xảy ra trên server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
