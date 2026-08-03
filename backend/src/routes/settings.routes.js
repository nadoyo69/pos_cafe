const express = require('express')
const router = express.Router()
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

// ---------------------------------------------------------------------------
// STORE PREFERENCES API (REDIS CACHED FOR FAST SUB-MILLISECOND SERVING)
// ---------------------------------------------------------------------------

// GET Store Preferences
router.get('/settings/preferences', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:settings:preferences')
    if (cached && cached.cafeName && cached.cafeName !== 'LUMIÈRE ARTISANAL CAFE') {
      return res.json({ success: true, data: cached, source: 'redis' })
    }

    const settingsRes = await db.query('SELECT * FROM settings')
    const preferences = {}
    settingsRes.rows.forEach(r => {
      const k = r.key || r.setting_key
      let v = r.value !== undefined ? r.value : r.setting_value
      if (typeof v === 'string') {
        try { v = JSON.parse(v) } catch (e) {}
      }
      if (k) preferences[k] = v
    })

    const formattedData = {
      cafeName: preferences.cafe_name || preferences.cafeName || 'LUMIÈRE ARTISANAL CAFE',
      tagline: preferences.tagline || 'Specialty Coffee & European Bakery',
      phone: preferences.phone || '+62 812-3456-7890',
      email: preferences.email || 'hello@lumierecafe.com',
      address: preferences.address || 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan',
      taxRate: Number(preferences.tax_rate || preferences.taxRate) || 10,
      currency: preferences.currency || 'IDR',
      logo: preferences.logo || '',
      autoPrintReceipt: preferences.auto_print_receipt === 'true' || preferences.auto_print_receipt === true || preferences.autoPrintReceipt === true
    }

    await redis.setCache('cache:settings:preferences', formattedData, 86400)
    return res.json({ success: true, data: formattedData, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// PUT Store Preferences
router.put('/settings/preferences', authenticateJWT, async (req, res) => {
  try {
    const { cafeName, tagline, phone, email, address, taxRate, currency, logo, autoPrintReceipt } = req.body

    const kvPairs = [
      ['cafe_name', JSON.stringify(cafeName || 'LUMIÈRE ARTISANAL CAFE')],
      ['tagline', JSON.stringify(tagline || 'Specialty Coffee & European Bakery')],
      ['phone', JSON.stringify(phone || '')],
      ['email', JSON.stringify(email || '')],
      ['address', JSON.stringify(address || '')],
      ['tax_rate', JSON.stringify(Number(taxRate) || 10)],
      ['currency', JSON.stringify(currency || 'IDR')],
      ['logo', JSON.stringify(logo || '')],
      ['auto_print_receipt', JSON.stringify(Boolean(autoPrintReceipt))]
    ]

    for (const [k, v] of kvPairs) {
      await db.query(`
        INSERT INTO settings (key, value)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [k, v])
    }

    const updatedPreferences = {
      cafeName: cafeName || 'LUMIÈRE ARTISANAL CAFE',
      tagline: tagline || 'Specialty Coffee & European Bakery',
      phone: phone || '+62 812-3456-7890',
      email: email || 'hello@lumierecafe.com',
      address: address || 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan',
      taxRate: Number(taxRate) || 10,
      currency: currency || 'IDR',
      logo: logo || '',
      autoPrintReceipt: Boolean(autoPrintReceipt)
    }

    await redis.delCache('cache:settings:preferences')
    await redis.setCache('cache:settings:preferences', updatedPreferences, 86400)

    await db.query(`
      INSERT INTO audit_logs (user_name, action, module, ip_address, status, details)
      VALUES ($1, 'Store Preferences Updated', 'System Settings', $2, 'Success', 'Updated logo, cafe name, tax rate in DB & Redis')
    `, [req.user?.username || 'admin', req.ip || '127.0.0.1'])

    return res.json({ success: true, message: 'Store Preferences saved to DB & Redis successfully', data: updatedPreferences })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// ---------------------------------------------------------------------------
// SYSTEM DYNAMIC MENUS API (REDIS CACHED)
// ---------------------------------------------------------------------------
router.get('/settings/menus', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:menus')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const menusRes = await db.query('SELECT * FROM system_menus ORDER BY sort_order ASC, id ASC')
    const rawMenus = menusRes.rows

    const parentMap = {}
    const parents = []

    rawMenus.forEach(m => {
      const item = { ...m, children: [] }
      parentMap[m.id] = item
      if (!m.parent_id) parents.push(item)
    })

    rawMenus.forEach(m => {
      if (m.parent_id && parentMap[m.parent_id]) {
        parentMap[m.parent_id].children.push(parentMap[m.id])
      }
    })

    const payload = { flat: rawMenus, tree: parents }
    await redis.setCache('cache:menus', payload, 86400)

    return res.json({ success: true, data: payload, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/settings/menus', authenticateJWT, async (req, res) => {
  try {
    const { parent_id, title, url_path, icon_class, permission_slug, sort_order } = req.body
    const menuRes = await db.query(`
      INSERT INTO system_menus (parent_id, title, url_path, icon_class, permission_slug, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [parent_id || null, title, url_path, icon_class || 'extension', permission_slug, sort_order || 1])

    await redis.delCache('cache:menus')
    return res.json({ success: true, message: 'Menu created', data: menuRes.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/settings/menus/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { parent_id, title, url_path, icon_class, permission_slug, sort_order } = req.body
    const menuRes = await db.query(`
      UPDATE system_menus SET parent_id = $1, title = $2, url_path = $3, icon_class = $4, permission_slug = $5, sort_order = $6
      WHERE id = $7 RETURNING *
    `, [parent_id || null, title, url_path, icon_class || 'extension', permission_slug, sort_order || 1, id])

    await redis.delCache('cache:menus')
    return res.json({ success: true, message: 'Menu updated', data: menuRes.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/settings/menus/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    await db.query('DELETE FROM system_menus WHERE id = $1 OR parent_id = $1', [id])
    await redis.delCache('cache:menus')
    return res.json({ success: true, message: 'Menu deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// ---------------------------------------------------------------------------
// ROLES & ACCESS CONTROL API (REDIS CACHED)
// ---------------------------------------------------------------------------
router.get('/settings/roles', authenticateJWT, async (req, res) => {
  try {
    const cached = await redis.getCache('cache:roles')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const rolesRes = await db.query('SELECT * FROM roles ORDER BY id ASC')
    const formattedRoles = rolesRes.rows.map(r => ({
      id: r.id,
      role_key: r.role_key,
      title: r.display_name || r.title,
      description: r.description,
      permissions: r.permissions_json || []
    }))

    await redis.setCache('cache:roles', formattedRoles, 86400)
    return res.json({ success: true, data: formattedRoles, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/settings/roles/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { title, description, permissions } = req.body

    const roleRes = await db.query(`
      UPDATE roles SET display_name = $1, description = $2, permissions_json = $3, updated_at = NOW()
      WHERE id = $4 RETURNING *
    `, [title, description, JSON.stringify(permissions || []), id])

    const updatedRole = roleRes.rows[0]
    if (updatedRole) {
      await redis.setCache(`cache:role_perms:${updatedRole.role_key}`, updatedRole.permissions_json, 86400)
      await redis.delCache('cache:roles')
    }

    return res.json({ success: true, message: 'Role permissions updated in DB & Redis', data: updatedRole })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// ---------------------------------------------------------------------------
// USER MANAGEMENT & AUDIT LOGS API
// ---------------------------------------------------------------------------
router.get('/settings/users', authenticateJWT, async (req, res) => {
  try {
    const usersRes = await db.query('SELECT id, name, username, email, role, avatar, status, last_login_at, created_at FROM users ORDER BY id ASC')
    return res.json({ success: true, data: usersRes.rows })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/settings/users', authenticateJWT, async (req, res) => {
  try {
    const { name, username, password, email, role, avatar } = req.body
    const bcrypt = require('bcryptjs')
    const hashedPassword = bcrypt.hashSync(password || 'password123', 10)

    const userRes = await db.query(`
      INSERT INTO users (name, username, password, email, role, avatar, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING id, name, username, email, role, avatar, status
    `, [name, username, hashedPassword, email || `${username}@lumierecafe.com`, role || 'cashier', avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'])

    return res.json({ success: true, message: 'User created successfully', data: userRes.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/settings/users/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, role, email, password } = req.body

    let query = 'UPDATE users SET name = $1, role = $2, email = $3 WHERE id = $4 RETURNING id, name, username, role, status'
    let params = [name, role, email, id]

    if (password) {
      const bcrypt = require('bcryptjs')
      const hashedPassword = bcrypt.hashSync(password, 10)
      query = 'UPDATE users SET name = $1, role = $2, email = $3, password = $5 WHERE id = $4 RETURNING id, name, username, role, status'
      params = [name, role, email, id, hashedPassword]
    }

    const userRes = await db.query(query, params)
    const updatedUser = userRes.rows[0]
    if (updatedUser) {
      await redis.setCache(`user:session:${updatedUser.id}`, { role: updatedUser.role, status: updatedUser.status }, 28800)
    }

    return res.json({ success: true, message: 'User updated successfully', data: updatedUser })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/settings/users/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const checkRes = await db.query('SELECT username FROM users WHERE id = $1', [id])
    if (checkRes.rows.length > 0 && checkRes.rows[0].username === 'admin') {
      return res.status(400).json({ success: false, message: 'Default admin user cannot be deleted.' })
    }
    await db.query('DELETE FROM users WHERE id = $1', [id])
    await redis.delCache(`user:session:${id}`)
    return res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/settings/logs', authenticateJWT, async (req, res) => {
  try {
    const logsRes = await db.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100')
    return res.json({ success: true, data: logsRes.rows })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
