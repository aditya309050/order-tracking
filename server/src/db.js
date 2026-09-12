const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/orders.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- 'OFFICE_ADMIN', 'WAREHOUSE_ADMIN', 'CLIENT'
    name TEXT NOT NULL,
    client_access_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    client_access_id TEXT,
    client_password TEXT,
    product TEXT NOT NULL,
    category TEXT DEFAULT 'Hoardings',
    quantity INTEGER NOT NULL DEFAULT 1,
    dimensions TEXT,
    design_notes TEXT,
    delivery_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    priority TEXT DEFAULT 'NORMAL',
    assigned_to TEXT,
    delivery_driver TEXT,
    driver_phone TEXT,
    tracking_number TEXT,
    estimated_delivery TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    order_number TEXT NOT NULL,
    status_from TEXT,
    status_to TEXT NOT NULL,
    note TEXT,
    actor_role TEXT NOT NULL DEFAULT 'WAREHOUSE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
  );
`);

// Safe migrations to add columns if upgrading existing database
try {
  db.exec("ALTER TABLE orders ADD COLUMN client_access_id TEXT");
} catch (e) {
  // column already exists
}

try {
  db.exec("ALTER TABLE orders ADD COLUMN client_password TEXT");
} catch (e) {
  // column already exists
}

// Seed or update default users
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password, role, name, client_access_id)
  VALUES (@username, @password, @role, @name, @client_access_id)
`);

const defaultUsers = [
  {
    username: 'office',
    password: 'office123',
    role: 'OFFICE_ADMIN',
    name: 'Office Operations Admin',
    client_access_id: null
  },
  {
    username: 'warehouse',
    password: 'warehouse123',
    role: 'WAREHOUSE_ADMIN',
    name: 'Shop Floor & Warehouse Ops',
    client_access_id: null
  },
  {
    username: 'abc_client',
    password: 'abc123',
    role: 'CLIENT',
    name: 'ABC Company',
    client_access_id: 'abc_client'
  },
  {
    username: 'apex_client',
    password: 'apex123',
    role: 'CLIENT',
    name: 'Apex Retail Group',
    client_access_id: 'apex_client'
  }
];

for (const u of defaultUsers) {
  insertUser.run(u);
}

// Update demo orders with client credentials if null
db.prepare(`
  UPDATE orders SET client_access_id = 'abc_client', client_password = 'abc123'
  WHERE order_number = 'ORD-1025' AND (client_access_id IS NULL OR client_access_id = '')
`).run();

db.prepare(`
  UPDATE orders SET client_access_id = 'apex_client', client_password = 'apex123'
  WHERE order_number = 'ORD-1024' AND (client_access_id IS NULL OR client_access_id = '')
`).run();

// Check if seed data is needed
const count = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

if (count === 0) {
  console.log('🌱 Seeding initial demo orders...');

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_number, client_name, client_phone, client_email, client_access_id, client_password,
      product, category, quantity, dimensions, design_notes,
      delivery_address, status, priority, assigned_to,
      delivery_driver, driver_phone, tracking_number,
      estimated_delivery, created_at, updated_at
    ) VALUES (
      @order_number, @client_name, @client_phone, @client_email, @client_access_id, @client_password,
      @product, @category, @quantity, @dimensions, @design_notes,
      @delivery_address, @status, @priority, @assigned_to,
      @delivery_driver, @driver_phone, @tracking_number,
      @estimated_delivery, @created_at, @updated_at
    )
  `);

  const insertActivity = db.prepare(`
    INSERT INTO order_activities (
      order_id, order_number, status_from, status_to, note, actor_role, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seedData = [
    {
      order_number: 'ORD-1025',
      client_name: 'ABC Company',
      client_phone: '+1 (555) 234-5678',
      client_email: 'procurement@abccompany.com',
      client_access_id: 'abc_client',
      client_password: 'abc123',
      product: 'Hoardings',
      category: 'Hoardings',
      quantity: 20,
      dimensions: '20ft x 10ft',
      design_notes: 'High-resolution flex banner with anti-UV coating. Heavy metal grommets every 2ft.',
      delivery_address: '452 Industrial Parkway, Metro City, NY 10001',
      status: 'CONFIRMED',
      priority: 'HIGH',
      assigned_to: null,
      delivery_driver: null,
      driver_phone: null,
      tracking_number: null,
      estimated_delivery: '2026-09-15',
      created_at: '2026-09-10 08:30:00',
      updated_at: '2026-09-10 08:30:00',
      activities: [
        { from: null, to: 'CONFIRMED', note: 'Order created by Office Admin (Aditya) after deposit verification.', role: 'OFFICE', at: '2026-09-10 08:30:00' }
      ]
    },
    {
      order_number: 'ORD-1024',
      client_name: 'Apex Retail Group',
      client_phone: '+1 (555) 876-5432',
      client_email: 'storeops@apexretail.com',
      client_access_id: 'apex_client',
      client_password: 'apex123',
      product: '3D Acrylic LED Letters',
      category: 'Signage',
      quantity: 1,
      dimensions: '8ft x 3ft (Total word length)',
      design_notes: 'Warm white (3000K) LED backlight, black acrylic edges, frosted front diffusion plate.',
      delivery_address: '789 Market Street, Suite 4B, Boston, MA 02110',
      status: 'IN_PROCESS',
      priority: 'NORMAL',
      assigned_to: 'CNC Team Alpha',
      delivery_driver: null,
      driver_phone: null,
      tracking_number: null,
      estimated_delivery: '2026-09-13',
      created_at: '2026-09-09 10:15:00',
      updated_at: '2026-09-09 14:20:00',
      activities: [
        { from: null, to: 'CONFIRMED', note: 'Purchase Order #PO-881 approved by Office Admin.', role: 'OFFICE', at: '2026-09-09 10:15:00' },
        { from: 'CONFIRMED', to: 'IN_PROCESS', note: 'Laser cutting started in Warehouse Bay 3.', role: 'WAREHOUSE', at: '2026-09-09 14:20:00' }
      ]
    }
  ];

  const seedTransaction = db.transaction(() => {
    for (const item of seedData) {
      const { activities, ...orderRow } = item;
      const result = insertOrder.run(orderRow);
      const orderId = result.lastInsertRowid;

      for (const act of activities) {
        insertActivity.run(
          orderId,
          orderRow.order_number,
          act.from,
          act.to,
          act.note,
          act.role,
          act.at
        );
      }
    }
  });

  seedTransaction();
  console.log('✅ Seeded demo orders with client credentials.');
}

module.exports = db;
