const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Apply auth middleware to all order routes
router.use(authenticateToken);

// Helper to get io from req.app
const getIO = (req) => req.app.get('io');

// Allowed status pipeline
const VALID_STATUSES = [
  'CONFIRMED',
  'IN_PROCESS',
  'COMPLETED',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

/**
 * GET /api/orders/stats
 * Aggregate metrics for dashboards
 */
router.get('/stats', (req, res) => {
  try {
    const statsRows = db.prepare(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `).all();

    const stats = {
      TOTAL: 0,
      CONFIRMED: 0,
      IN_PROCESS: 0,
      COMPLETED: 0,
      PACKED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0
    };

    let total = 0;
    for (const row of statsRows) {
      if (stats[row.status] !== undefined) {
        stats[row.status] = row.count;
      }
      total += row.count;
    }
    stats.TOTAL = total;

    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/orders
 * List orders with optional search and status filter.
 * If user is a CLIENT, strictly restricts output to only their orders!
 */
router.get('/', (req, res) => {
  try {
    const { status, search, limit = 100 } = req.query;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    // CLIENT ROLE RESTRICTION: Client can ONLY see their own orders!
    if (req.user && req.user.role === 'CLIENT') {
      const clientId = req.user.client_access_id || req.user.username;
      query += ' AND (client_access_id = ? OR order_number = ?)';
      params.push(clientId, clientId);
    } else if (req.query.client_access_id) {
      query += ' AND (client_access_id = ?)';
      params.push(req.query.client_access_id);
    }

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ' AND (order_number LIKE ? OR client_name LIKE ? OR product LIKE ? OR delivery_address LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY updated_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const orders = db.prepare(query).all(...params);
    return res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/orders/:identifier
 * Find an order by ID or order_number (e.g. ORD-1025).
 * Enforces client ownership check if requested by a logged-in client.
 */
router.get('/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    let order;

    if (!isNaN(identifier)) {
      order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(identifier, identifier);
    } else {
      order = db.prepare('SELECT * FROM orders WHERE order_number = ? COLLATE NOCASE').get(identifier);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: `Order '${identifier}' not found` });
    }

    // CLIENT ROLE RESTRICTION: A client can ONLY access their own order
    if (req.user && req.user.role === 'CLIENT') {
      const clientId = (req.user.client_access_id || req.user.username).toLowerCase();
      const orderClientId = (order.client_access_id || '').toLowerCase();
      const orderNum = order.order_number.toLowerCase();

      if (orderClientId !== clientId && orderNum !== clientId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not authorized to view this work order.'
        });
      }
    }

    // Fetch timeline activities
    const activities = db.prepare(`
      SELECT * FROM order_activities WHERE order_id = ? ORDER BY created_at ASC
    `).all(order.id);

    return res.json({
      success: true,
      data: {
        ...order,
        timeline: activities
      }
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders
 * Create new order by Office Admin.
 * Automatically provisions Client ID & Password.
 */
router.post('/', (req, res) => {
  try {
    const {
      client_name,
      client_phone,
      client_email,
      product,
      category = 'Hoardings',
      quantity = 1,
      dimensions,
      design_notes,
      delivery_address,
      priority = 'NORMAL',
      assigned_to,
      estimated_delivery
    } = req.body;

    if (!client_name || !client_phone || !product || !delivery_address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: client_name, client_phone, product, delivery_address'
      });
    }

    // Generate next Order Number if not provided
    let order_number = req.body.order_number;
    if (!order_number) {
      const maxOrder = db.prepare(`
        SELECT MAX(CAST(substr(order_number, 5) AS INTEGER)) as maxNum 
        FROM orders 
        WHERE order_number LIKE 'ORD-%'
      `).get();

      const nextNum = (maxOrder && maxOrder.maxNum) ? maxOrder.maxNum + 1 : 1026;
      order_number = `ORD-${nextNum}`;
    }

    // Generate or format Client ID & Password
    let client_access_id = req.body.client_access_id;
    if (!client_access_id) {
      const sanitizedName = client_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      client_access_id = `${sanitizedName || 'client'}_${order_number.toLowerCase().replace('-', '')}`;
    }

    let client_password = req.body.client_password;
    if (!client_password) {
      // 6-character clean PIN/password e.g. pass4829
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      client_password = `pass${randomDigits}`;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, client_name, client_phone, client_email,
        client_access_id, client_password,
        product, category, quantity, dimensions, design_notes,
        delivery_address, status, priority, assigned_to,
        estimated_delivery, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, 'CONFIRMED', ?, ?,
        ?, ?, ?
      )
    `);

    const insertActivity = db.prepare(`
      INSERT INTO order_activities (
        order_id, order_number, status_from, status_to, note, actor_role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const upsertUser = db.prepare(`
      INSERT INTO users (username, password, role, name, client_access_id)
      VALUES (?, ?, 'CLIENT', ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        password = excluded.password,
        name = excluded.name,
        client_access_id = excluded.client_access_id
    `);

    let newOrder;
    const createTx = db.transaction(() => {
      const result = insertOrder.run(
        order_number,
        client_name,
        client_phone,
        client_email || null,
        client_access_id,
        client_password,
        product,
        category,
        parseInt(quantity, 10) || 1,
        dimensions || null,
        design_notes || null,
        delivery_address,
        priority,
        assigned_to || null,
        estimated_delivery || null,
        now,
        now
      );

      const orderId = result.lastInsertRowid;

      // Register or update client user account for portal login
      upsertUser.run(
        client_access_id,
        client_password,
        client_name,
        client_access_id
      );

      insertActivity.run(
        orderId,
        order_number,
        null,
        'CONFIRMED',
        `Work order registered by Office Admin. Client credentials provisioned (${client_access_id}).`,
        'OFFICE',
        now
      );

      newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      const activities = db.prepare('SELECT * FROM order_activities WHERE order_id = ?').all(orderId);
      newOrder.timeline = activities;
    });

    createTx();

    // Broadcast realtime event
    const io = getIO(req);
    if (io) {
      io.emit('order:created', newOrder);
    }

    return res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Warehouse Admin or Logistics updates status
 */
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      note,
      actor_role = 'WAREHOUSE',
      delivery_driver,
      driver_phone,
      tracking_number,
      assigned_to
    } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const order = isNaN(id)
      ? db.prepare('SELECT * FROM orders WHERE order_number = ? COLLATE NOCASE').get(id)
      : db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const previousStatus = order.status;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    let updatedOrder;
    const updateTx = db.transaction(() => {
      const driver = delivery_driver !== undefined ? delivery_driver : order.delivery_driver;
      const phone = driver_phone !== undefined ? driver_phone : order.driver_phone;
      const tracking = tracking_number !== undefined ? tracking_number : order.tracking_number;
      const assigned = assigned_to !== undefined ? assigned_to : order.assigned_to;

      db.prepare(`
        UPDATE orders SET
          status = ?,
          delivery_driver = ?,
          driver_phone = ?,
          tracking_number = ?,
          assigned_to = ?,
          updated_at = ?
        WHERE id = ?
      `).run(status, driver, phone, tracking, assigned, now, order.id);

      const defaultNote = `Status advanced from ${previousStatus} to ${status}`;
      db.prepare(`
        INSERT INTO order_activities (
          order_id, order_number, status_from, status_to, note, actor_role, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(order.id, order.order_number, previousStatus, status, note || defaultNote, actor_role, now);

      updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
      updatedOrder.timeline = db.prepare('SELECT * FROM order_activities WHERE order_id = ? ORDER BY created_at ASC').all(order.id);
    });

    updateTx();

    const io = getIO(req);
    if (io) {
      io.emit('order:updated', updatedOrder);
      io.to(`order_${updatedOrder.order_number}`).emit('order:live_status', updatedOrder);
    }

    return res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updatedOrder
    });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders/:id/credentials
 * Office Admin updates or resets client credentials
 */
router.post('/:id/credentials', (req, res) => {
  try {
    const { id } = req.params;
    const { client_access_id, client_password } = req.body;

    const order = isNaN(id)
      ? db.prepare('SELECT * FROM orders WHERE order_number = ? COLLATE NOCASE').get(id)
      : db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const newId = (client_access_id || order.client_access_id).trim();
    const newPass = (client_password || order.client_password).trim();

    db.prepare(`
      UPDATE orders SET client_access_id = ?, client_password = ? WHERE id = ?
    `).run(newId, newPass, order.id);

    db.prepare(`
      INSERT INTO users (username, password, role, name, client_access_id)
      VALUES (?, ?, 'CLIENT', ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        password = excluded.password,
        name = excluded.name,
        client_access_id = excluded.client_access_id
    `).run(newId, newPass, order.client_name, newId);

    return res.json({
      success: true,
      message: 'Client credentials updated successfully',
      data: {
        order_number: order.order_number,
        client_access_id: newId,
        client_password: newPass
      }
    });
  } catch (err) {
    console.error('Error updating client credentials:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
