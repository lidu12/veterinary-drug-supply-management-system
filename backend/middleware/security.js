const rateLimit = require('express-rate-limit');
const db = require('../config/db');

// General API Rate Limiter (Max 100 requests per 15 mins per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Strict Login Rate Limiter (Max 10 login attempts per 15 mins per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again later.'
  }
});

/**
 * Middleware: Rapid Request Intrusion Detection
 * Flags rapid request bursts (< 150ms gap) to authentication endpoints
 */
const requestTracker = new Map();

const detectRapidRequests = async (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  if (requestTracker.has(clientIp)) {
    const lastRequestTime = requestTracker.get(clientIp);
    const diff = now - lastRequestTime;

    if (diff < 150 && req.path.includes('/api/auth')) {
      try {
        await db.query(
          `INSERT INTO security_alerts (alert_type, severity, description, ip_address)
           VALUES ($1, $2, $3, $4)`,
          [
            'RAPID_REQUEST_ANOMALY',
            'MEDIUM',
            `Rapid request burst detected from IP ${clientIp} to ${req.method} ${req.path} (${diff}ms gap)`,
            clientIp
          ]
        );
      } catch (err) {
        console.error('Failed to log rapid request alert:', err.message);
      }
    }
  }

  requestTracker.set(clientIp, now);

  if (requestTracker.size > 1000) {
    requestTracker.clear();
  }

  next();
};

/**
 * XSS Sanitizer: Strips malicious script tags from request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

module.exports = {
  apiLimiter,
  loginLimiter,
  detectRapidRequests,
  sanitizeInput
};
