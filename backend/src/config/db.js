const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || 'cafe_pos',
  user: process.env.DB_USER || 'cafe_user',
  password: process.env.DB_PASSWORD || 'cafe_secret',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

async function query(text, params) {
  return pool.query(text, params)
}

async function initDatabase() {
  console.log('🔄 Initializing PostgreSQL Database Schema & Connections...')

  let connected = false
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      await pool.query('SELECT NOW()')
      connected = true
      console.log('✅ PostgreSQL Database connected successfully!')
      break
    } catch (err) {
      console.log(`⏳ Waiting for PostgreSQL Database (Attempt ${attempt}/15)...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  if (!connected) return

  // 1. Roles Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      role_key VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      description TEXT,
      permissions_json JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 2. Users Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'cashier',
      avatar TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      last_login_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 3. System Dynamic Menus Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_menus (
      id SERIAL PRIMARY KEY,
      parent_id INTEGER REFERENCES system_menus(id) ON DELETE CASCADE,
      title VARCHAR(100) NOT NULL,
      url_path VARCHAR(150) NOT NULL,
      icon_class VARCHAR(100) DEFAULT 'extension',
      permission_slug VARCHAR(100) NOT NULL,
      sort_order INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 4. Categories Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) DEFAULT 'local_cafe',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 5. Products Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      stock_count INTEGER NOT NULL DEFAULT 50,
      in_stock BOOLEAN DEFAULT TRUE,
      rating NUMERIC(3, 1) DEFAULT 4.9,
      image TEXT,
      addons_json JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS addons_json JSONB DEFAULT '[]'::jsonb;")

  // 6. Cafe Tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cafe_tables (
      id SERIAL PRIMARY KEY,
      table_no VARCHAR(50) UNIQUE NOT NULL,
      zone VARCHAR(50) NOT NULL DEFAULT 'floor-1',
      capacity INTEGER NOT NULL DEFAULT 4,
      status VARCHAR(20) NOT NULL DEFAULT 'available',
      current_customer_name VARCHAR(100),
      current_bill_total NUMERIC(12, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 7. Inventory Items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      item_code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Raw Material',
      product_id INTEGER,
      product_name VARCHAR(150),
      portion_qty NUMERIC(10, 3) NOT NULL DEFAULT 1.000,
      current_qty NUMERIC(12, 3) NOT NULL DEFAULT 10.000,
      unit VARCHAR(30) NOT NULL DEFAULT 'kg',
      min_threshold NUMERIC(12, 3) NOT NULL DEFAULT 5.000,
      last_restocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await pool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS product_id INTEGER;")
  await pool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(150);")
  await pool.query("ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS portion_qty NUMERIC(10, 3) DEFAULT 1.000;")
  await pool.query("ALTER TABLE inventory_items ALTER COLUMN current_qty TYPE NUMERIC(12, 3);")
  await pool.query("ALTER TABLE inventory_items ALTER COLUMN min_threshold TYPE NUMERIC(12, 3);")

  // 8. Discounts & Promos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS discounts (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'percentage',
      value NUMERIC(10, 2) NOT NULL DEFAULT 0,
      min_purchase NUMERIC(12, 2) DEFAULT 0,
      max_discount NUMERIC(12, 2) DEFAULT 0,
      valid_from DATE,
      valid_to DATE,
      usage_limit INTEGER DEFAULT 100,
      usage_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 9. Orders
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      receipt_number VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(100) DEFAULT 'Guest Customer',
      customer_phone VARCHAR(30),
      table_no VARCHAR(50) DEFAULT 'T-01',
      order_type VARCHAR(30) DEFAULT 'Dine-In',
      status VARCHAR(20) DEFAULT 'pending',
      payment_status VARCHAR(50) DEFAULT 'Paid (Cash)',
      payment_method VARCHAR(30) DEFAULT 'Cash',
      subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
      discount_amount NUMERIC(12, 2) DEFAULT 0,
      tax_amount NUMERIC(12, 2) DEFAULT 0,
      total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      amount_paid NUMERIC(12, 2) DEFAULT 0,
      change_due NUMERIC(12, 2) DEFAULT 0,
      notes TEXT,
      cashier_name VARCHAR(100) DEFAULT 'Cashier Desk',
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50);")
  await pool.query("ALTER TABLE orders ALTER COLUMN receipt_number DROP NOT NULL;")

  // 10. Order Items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(150) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      size VARCHAR(50),
      milk VARCHAR(50),
      sugar VARCHAR(50),
      ice VARCHAR(50),
      addons_json JSONB DEFAULT '[]',
      notes TEXT,
      is_ready BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await pool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_name VARCHAR(150);")
  await pool.query("UPDATE order_items SET item_name = product_name WHERE item_name IS NULL;")
  await pool.query("ALTER TABLE order_items ALTER COLUMN total_price SET DEFAULT 0;")
  await pool.query("ALTER TABLE order_items ALTER COLUMN total_price DROP NOT NULL;")

  // 11. Shifts
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shifts (
      id SERIAL PRIMARY KEY,
      shift_code VARCHAR(50) UNIQUE NOT NULL,
      cashier_name VARCHAR(100) NOT NULL,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_time TIMESTAMP,
      duration VARCHAR(30) DEFAULT '0h 0m',
      starting_cash NUMERIC(12, 2) NOT NULL DEFAULT 500000,
      expected_cash NUMERIC(12, 2) DEFAULT 0,
      counted_cash NUMERIC(12, 2) DEFAULT 0,
      discrepancy NUMERIC(12, 2) DEFAULT 0,
      total_sales NUMERIC(12, 2) DEFAULT 0,
      total_orders INTEGER DEFAULT 0,
      total_cash_sales NUMERIC(12, 2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 12. Audit Logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(100) NOT NULL,
      action VARCHAR(150) NOT NULL,
      module VARCHAR(50) NOT NULL,
      ip_address VARCHAR(50),
      status VARCHAR(20) DEFAULT 'Success',
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 13. System Settings
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Cleanup obsolete Shifts menu if existing
  await pool.query("DELETE FROM system_menus WHERE url_path = 'shifts' OR permission_slug = 'shifts';")

  // Ensure all orders have valid created_at timestamp
  await pool.query("UPDATE orders SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;")

  // Seed Default Roles Permissions
  const rCount = await pool.query('SELECT COUNT(*) FROM roles')
  if (parseInt(rCount.rows[0].count, 10) === 0) {
    const adminPerms = JSON.stringify(['pos', 'tables', 'orders', 'shifts', 'categories', 'products', 'discounts', 'inventory', 'reports_overview', 'reports_financial', 'reports_history', 'settings_preferences', 'settings_users', 'settings_tables', 'settings_roles', 'settings_menus', 'settings_logs'])
    const cashierPerms = JSON.stringify(['pos', 'tables', 'orders', 'shifts', 'discounts', 'reports_history'])
    const baristaPerms = JSON.stringify(['tables', 'orders', 'reports_history'])

    await pool.query(`
      INSERT INTO roles (role_key, display_name, description, permissions_json) VALUES
      ('admin', 'General Manager & Admin', 'Full access to all system features, financial reports, user management, and system settings.', '${adminPerms}'),
      ('cashier', 'Senior Cashier', 'Access to Cashier POS, Table Map, Kitchen Display, and daily sales order history.', '${cashierPerms}'),
      ('barista', 'Barista / Kitchen Staff', 'Access to Kitchen Display System (KDS) and table status updates.', '${baristaPerms}');
    `)
  }

  // Seed Default System Dynamic Menus
  const mCount = await pool.query('SELECT COUNT(*) FROM system_menus')
  if (parseInt(mCount.rows[0].count, 10) === 0) {
    // Top Levels
    const p1 = await pool.query("INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES (NULL, 'Main Operations', '-', 'view_quilt', 'main_ops_parent', 1) RETURNING id")
    const p2 = await pool.query("INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES (NULL, 'Menu & Catalog', '-', 'restaurant_menu', 'catalog_parent', 2) RETURNING id")
    const p3 = await pool.query("INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES (NULL, 'Reports & Analytics', '-', 'analytics', 'reports_parent', 3) RETURNING id")
    const p4 = await pool.query("INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES (NULL, 'Administrator', '-', 'settings', 'admin_parent', 10) RETURNING id")

    const p1Id = p1.rows[0].id
    const p2Id = p2.rows[0].id
    const p3Id = p3.rows[0].id
    const p4Id = p4.rows[0].id

    // Main Operations Children
    await pool.query(`
      INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES
      (${p1Id}, 'Cashier POS', 'pos', 'point_of_sale', 'pos', 1),
      (${p1Id}, 'Table Map', 'tables', 'table_restaurant', 'tables', 2),
      (${p1Id}, 'Kitchen KDS', 'orders', 'soup_kitchen', 'orders', 3);
    `)

    // Menu & Catalog Children
    await pool.query(`
      INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES
      (${p2Id}, 'Categories', 'categories', 'category', 'categories', 1),
      (${p2Id}, 'Products & Items', 'products', 'local_offer', 'products', 2),
      (${p2Id}, 'Discounts & Promos', 'discounts', 'sell', 'discounts', 3),
      (${p2Id}, 'Inventory Stock', 'inventory', 'inventory_2', 'inventory', 4);
    `)

    // Reports Children
    await pool.query(`
      INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES
      (${p3Id}, 'Overview Analytics', 'reports/overview', 'bar_chart', 'reports_overview', 1),
      (${p3Id}, 'Financial Reports', 'reports/financial', 'payments', 'reports_financial', 2),
      (${p3Id}, 'Order History', 'reports/history', 'receipt_long', 'reports_history', 3);
    `)

    // Administrator Children
    await pool.query(`
      INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order) VALUES
      (${p4Id}, 'Store Preferences', 'settings/preferences', 'storefront', 'settings_preferences', 1),
      (${p4Id}, 'Users', 'settings/users', 'manage_accounts', 'settings_users', 2),
      (${p4Id}, 'Roles Access', 'settings/roles', 'admin_panel_settings', 'settings_roles', 3),
      (${p4Id}, 'Menu Management', 'settings/menus', 'menu_book', 'settings_menus', 4),
      (${p4Id}, 'Table Setup', 'settings/tables', 'tune', 'settings_tables', 5),
      (${p4Id}, 'Process Audit Logs', 'settings/logs', 'history', 'settings_logs', 6);
    `)
  }

  // Seed Tables
  const tCount = await pool.query('SELECT COUNT(*) FROM cafe_tables')
  if (parseInt(tCount.rows[0].count, 10) < 8) {
    await pool.query(`
      INSERT INTO cafe_tables (table_no, zone, capacity, status, current_customer_name, current_bill_total) VALUES
      ('T-01', 'floor-1', 2, 'available', '', 0),
      ('T-02', 'floor-1', 4, 'available', '', 0),
      ('T-03', 'floor-1', 2, 'occupied', 'Budi Santoso', 86000),
      ('T-04', 'floor-1', 6, 'available', '', 0),
      ('Terrace 01', 'terrace', 4, 'occupied', 'Maya & Dina', 92000),
      ('Terrace 02', 'terrace', 2, 'available', '', 0),
      ('VIP-1', 'floor-2', 8, 'reserved', 'Corporate Group', 0),
      ('VIP-2', 'floor-2', 10, 'available', '', 0)
      ON CONFLICT (table_no) DO NOTHING;
    `)
  }

  // Seed Users
  const uCount = await pool.query('SELECT COUNT(*) FROM users')
  if (parseInt(uCount.rows[0].count, 10) === 0) {
    const passHash = bcrypt.hashSync('password123', 10)

    await pool.query(`
      INSERT INTO users (name, username, email, password, role, avatar, status) VALUES
      ('Alexander Wright', 'admin', 'admin@lumierecafe.id', '${passHash}', 'admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'active'),
      ('Sarah Jenkins', 'kasir', 'kasir@lumierecafe.id', '${passHash}', 'cashier', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'active'),
      ('Kevin Maulana', 'barista', 'barista@lumierecafe.id', '${passHash}', 'barista', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'active');
    `)
  }

  // Seed Categories
  const cCount = await pool.query('SELECT COUNT(*) FROM categories')
  if (parseInt(cCount.rows[0].count, 10) === 0) {
    await pool.query(`
      INSERT INTO categories (slug, name, icon, description) VALUES
      ('coffee', 'Artisan Coffee', 'local_cafe', 'Handcrafted espresso beverages & specialty brews'),
      ('non-coffee', 'Non-Coffee & Teas', 'emoji_food_beverage', 'Kyoto matchas, artisan teas & refreshing coolers'),
      ('food', 'Food & Pastries', 'bakery_dining', 'Freshly baked French croissants & savory toast'),
      ('desserts', 'Desserts & Sweets', 'icecream', 'Belgian chocolates, gelato & sweet treats'),
      ('beans', 'Coffee Beans & Merch', 'shopping_bag', 'Single-origin beans & barista equipment');
    `)
  }

  // Seed Products
  const pCount = await pool.query('SELECT COUNT(*) FROM products')
  if (parseInt(pCount.rows[0].count, 10) === 0) {
    await pool.query(`
      INSERT INTO products (category_id, sku, name, description, price, stock_count, in_stock, rating, image) VALUES
      (1, 'COF-MAC-01', 'Caramel Macchiato Grand', 'Espresso combined with vanilla-flavored syrup, steamed milk and caramel drizzle.', 38000, 45, TRUE, 4.9, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80'),
      (1, 'COF-LAT-02', 'Iced Spanish Latte', 'Rich double shot espresso mixed with sweetened condensed milk and silky cold foam.', 36000, 30, TRUE, 4.8, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'),
      (1, 'COF-CLD-03', 'Kyoto Cold Brew Amber', 'Slow-steeped 18-hour cold brew coffee with subtle chocolate and floral notes.', 42000, 15, TRUE, 5.0, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'),
      (2, 'TEA-MTC-01', 'Uji Matcha Oat Latte', 'Ceremonial grade Uji Matcha from Kyoto whisked with creamy oat milk.', 40000, 22, TRUE, 4.9, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80'),
      (3, 'FOD-CRS-01', 'Artisan Butter Croissant', 'Flaky, buttery French croissant baked fresh every morning with Normandy butter.', 28000, 18, TRUE, 4.7, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'),
      (3, 'FOD-AVO-02', 'Smoked Salmon Avocado Toast', 'Sourdough bread topped with smashed avocado, premium Norwegian smoked salmon and poached egg.', 65000, 12, TRUE, 4.9, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'),
      (4, 'DES-LAV-01', 'Belgian Dark Chocolate Lava Cake', 'Warm chocolate cake with molten Belgian chocolate center served with vanilla gelato.', 45000, 10, TRUE, 4.8, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'),
      (5, 'MER-ETH-250', 'Ethical Ethiopian Yirgacheffe (250g)', 'Single-origin specialty coffee beans with bright acidity, jasmine floral notes, and bergamot.', 135000, 20, TRUE, 5.0, 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80');
    `)
  }

  console.log('✅ PostgreSQL initial dataset verified.')
}

module.exports = {
  pool,
  query,
  initDatabase
}
