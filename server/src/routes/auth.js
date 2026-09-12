const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple secure token encoding/decoding helper
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    client_access_id: user.client_access_id,
    issuedAt: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token) {
  try {
    if (!token) return null;
    const jsonStr = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

// Auth middleware helper
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    req.user = null;
    return next();
  }

  req.user = decoded;
  next();
}

/**
 * POST /api/auth/login
 * Unified login endpoint for Office Admin, Warehouse Admin, and Clients
 */
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username / Client ID and Password are required'
      });
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // 1. Check in users table
    let user = db.prepare(`
      SELECT * FROM users 
      WHERE username = ? COLLATE NOCASE OR client_access_id = ? COLLATE NOCASE
    `).get(cleanUsername, cleanUsername);

    if (user) {
      if (user.password !== cleanPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Please verify your password.'
        });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          client_access_id: user.client_access_id
        }
      });
    }

    // 2. Check in orders table for direct client_access_id or order_number login
    const order = db.prepare(`
      SELECT * FROM orders 
      WHERE (client_access_id = ? COLLATE NOCASE OR order_number = ? COLLATE NOCASE)
        AND client_password = ?
    `).get(cleanUsername, cleanUsername, cleanPassword);

    if (order) {
      // Auto-register or link user account for this client
      const clientAccessId = order.client_access_id || `client_${order.order_number.toLowerCase().replace('-', '_')}`;
      
      let clientUser = db.prepare('SELECT * FROM users WHERE username = ?').get(clientAccessId);
      if (!clientUser) {
        const result = db.prepare(`
          INSERT INTO users (username, password, role, name, client_access_id)
          VALUES (?, ?, 'CLIENT', ?, ?)
        `).run(clientAccessId, cleanPassword, order.client_name, clientAccessId);

        clientUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      }

      const token = generateToken(clientUser);
      return res.json({
        success: true,
        token,
        user: {
          id: clientUser.id,
          username: clientUser.username,
          role: 'CLIENT',
          name: order.client_name,
          client_access_id: clientAccessId,
          order_number: order.order_number
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Account not found or invalid credentials'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user information
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Unauthorized or session expired' });
  }

  // Refresh user details from database
  const user = db.prepare('SELECT id, username, role, name, client_access_id FROM users WHERE id = ?').get(decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User record no longer exists' });
  }

  return res.json({ success: true, user });
});

module.exports = {
  router,
  authenticateToken,
  verifyToken
};
