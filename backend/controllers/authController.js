const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const logAudit = require('../middleware/auditLogger');

/**
 * Register User
 * Route: POST /api/auth/register
 */
const register = async (req, res) => {
  const { username, email, password, role } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    // Check if email or username already exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Account with this email or username already exists.'
      });
    }

    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Validate role constraint
    const userRole = ['Admin', 'Staff', 'Auditor'].includes(role) ? role : 'Staff';

    // Insert new user record
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash, userRole]
    );

    const newUser = result.rows[0];

    // Record Audit Trail
    await logAudit({
      userId: newUser.id,
      userEmail: newUser.email,
      userRole: newUser.role,
      action: 'AUTH_REGISTER',
      resource: '/api/auth/register',
      details: `Registered new user: ${username} with role ${userRole}`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: newUser
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user registration.'
    });
  }
};

/**
 * Login User with 5-Attempt Account Lockout & IP Intrusion Detection
 * Route: POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  try {
    // 1. Fetch user by email
    const result = await db.query(
      `SELECT id, username, email, password_hash, role, failed_login_attempts, locked_until, last_login_ip
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      await logAudit({
        userEmail: email,
        action: 'AUTH_LOGIN_FAILED',
        resource: '/api/auth/login',
        details: 'Failed login: Email not found',
        ipAddress: clientIp,
        userAgent,
        status: 'FAILED'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];

    // 2. Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMins = Math.ceil((new Date(user.locked_until) - new Date()) / (60 * 1000));

      await logAudit({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'AUTH_BLOCKED_LOCKOUT',
        resource: '/api/auth/login',
        details: `Blocked login on locked account. Lock remaining: ${remainingMins} mins`,
        ipAddress: clientIp,
        userAgent,
        status: 'BLOCKED'
      });

      return res.status(403).json({
        success: false,
        message: `Account is locked due to 5 consecutive failed login attempts. Try again in ${remainingMins} minutes.`
      });
    }

    // 3. Verify Password Hash with Bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const attempts = (user.failed_login_attempts || 0) + 1;

      if (attempts >= 5) {
        // Lock account for 15 minutes
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);

        await db.query(
          `UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
          [attempts, lockUntil, user.id]
        );

        // Raise Security Threat Alert
        await db.query(
          `INSERT INTO security_alerts (alert_type, severity, description, user_id, ip_address)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            'ACCOUNT_LOCKED',
            'HIGH',
            `Account ${user.email} locked after 5 consecutive failed password attempts from IP ${clientIp}`,
            user.id,
            clientIp
          ]
        );

        await logAudit({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          action: 'AUTH_ACCOUNT_LOCKED',
          resource: '/api/auth/login',
          details: 'Account threshold reached (5 failed attempts). Account locked for 15 minutes.',
          ipAddress: clientIp,
          userAgent,
          status: 'BLOCKED'
        });

        return res.status(403).json({
          success: false,
          message: 'Account locked for 15 minutes due to 5 failed login attempts.'
        });
      } else {
        await db.query(
          `UPDATE users SET failed_login_attempts = $1 WHERE id = $2`,
          [attempts, user.id]
        );

        await logAudit({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          action: 'AUTH_LOGIN_FAILED',
          resource: '/api/auth/login',
          details: `Failed password attempt (${attempts}/5)`,
          ipAddress: clientIp,
          userAgent,
          status: 'FAILED'
        });

        return res.status(401).json({
          success: false,
          message: `Invalid email or password. Warning: Attempt ${attempts} of 5 before account lockout.`
        });
      }
    }

    // 4. Password Correct -> Reset lock counters and detect IP anomalies
    if (user.last_login_ip && user.last_login_ip !== clientIp) {
      await db.query(
        `INSERT INTO security_alerts (alert_type, severity, description, user_id, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'UNUSUAL_IP_LOGIN',
          'MEDIUM',
          `User ${user.email} logged in from a new IP address (${clientIp} vs previous ${user.last_login_ip})`,
          user.id,
          clientIp
        ]
      );
    }

    // Reset failed counter & update login stats
    await db.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2`,
      [clientIp, user.id]
    );

    // 5. Issue Signed JWT Token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'tropical_vet_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: '/api/auth/login',
      details: 'User authenticated successfully',
      ipAddress: clientIp,
      userAgent,
      status: 'SUCCESS'
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login processing.'
    });
  }
};

/**
 * Get Authenticated Profile
 * Route: GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, email, role, last_login, last_login_ip, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
