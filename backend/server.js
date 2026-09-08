const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Import Security & Custom Middlewares
const { apiLimiter, detectRapidRequests, sanitizeInput } = require('./middleware/security');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// 1. GLOBAL SECURITY & NETWORK MIDDLEWARES
// ============================================================================

// Set secure HTTP headers (OWASP Recommended)
app.use(helmet({
  contentSecurityPolicy: false, // Set to true with custom directives in production
  crossOriginEmbedderPolicy: false
}));

// Enable CORS for frontend client
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers with payload size limit (mitigates memory exhaustion / DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Custom Intrusion Detection & Sanitization Middlewares
app.use(detectRapidRequests);
app.use(sanitizeInput);

// Apply General Rate Limiter to all /api/ routes
app.use('/api/', apiLimiter);

// ============================================================================
// 2. SYSTEM HEALTH & DIAGNOSTIC ROUTES
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Tropical Veterinary Drug Supply Management Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api', (req, res) => {
  res.json({
    system: 'Secure Veterinary Drug Supply Management API',
    version: '1.0.0',
    organization: 'Tropical Veterinary',
    status: 'Online',
    endpoints: [
      '/api/auth',
      '/api/inventory',
      '/api/suppliers',
      '/api/transactions',
      '/api/audit'
    ]
  });
});

// ============================================================================
// 3. API ROUTE MOUNTS
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/audit', auditRoutes);

// ============================================================================
// 4. 404 NOT FOUND & ERROR HANDLING
// ============================================================================

// 404 Catch-all handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Centralized Error Handler (prevents stack trace disclosure to clients)
app.use((err, req, res, next) => {
  console.error('Unhandled System Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error. Incident recorded.',
    errorId: Date.now().toString(36)
  });
});

// ============================================================================
// 5. BOOTSTRAP SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🐾 Tropical Veterinary - Drug Supply Management Backend');
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 API Gateway: http://localhost:${PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/health`);
  console.log('🛡️ Security: Helmet, Rate-Limiting, XSS Sanitizer, RBAC Enabled');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;
