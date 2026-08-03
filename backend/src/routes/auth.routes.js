const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

const JWT_SECRET = process.env.JWT_SECRET || 'lumiere_cafe_pos_jwt_secret_key_2026'

async function getRolePermissions(roleKey) {
  const cached = await redis.getCache(`cache:role_perms:${roleKey}`)
  if (cached) return cached

  const roleRes = await db.query('SELECT permissions_json FROM roles WHERE role_key = $1', [roleKey])
  if (roleRes.rows.length > 0) {
    const perms = roleRes.rows[0].permissions_json
    await redis.setCache(`cache:role_perms:${roleKey}`, perms, 86400)
    return perms
  }

  const defaults = {
    admin: ['pos', 'tables', 'orders', 'shifts', 'categories', 'products', 'discounts', 'inventory', 'reports_overview', 'reports_financial', 'reports_history', 'settings_preferences', 'settings_users', 'settings_tables', 'settings_roles', 'settings_menus', 'settings_logs'],
    cashier: ['pos', 'tables', 'orders', 'shifts', 'discounts', 'reports_history'],
    barista: ['tables', 'orders', 'reports_history']
  }
  return defaults[roleKey] || []
}

// POST Login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' })
    }

    const cleanUser = String(username).trim().toLowerCase()
    const cleanPass = String(password).trim()

    const userRes = await db.query('SELECT * FROM users WHERE LOWER(username) = $1', [cleanUser])
    const user = userRes.rows[0]

    if (!user || !bcrypt.compareSync(cleanPass, user.password)) {
      await db.query(`
        INSERT INTO audit_logs (user_name, action, module, ip_address, status, details)
        VALUES ($1, 'Failed Login Attempt', 'Security Auth', $2, 'Failed', 'Invalid credentials provided.')
      `, [cleanUser, req.ip || '127.0.0.1'])
      return res.status(401).json({ success: false, message: 'Invalid Username or Password!' })
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account disabled. Contact Administrator.' })
    }

    const permissions = await getRolePermissions(user.role)

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])
    await redis.setCache(`user:session:${user.id}`, { role: user.role, status: user.status, permissions }, 28800)

    await db.query(`
      INSERT INTO audit_logs (user_name, action, module, ip_address, status, details)
      VALUES ($1, 'Staff Login Success', 'Security Auth', $2, 'Success', 'Authenticated via JWT Security')
    `, [`${user.name} (${user.username})`, req.ip || '127.0.0.1'])

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      token_type: 'bearer',
      expires_in: 28800,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        permissions,
        last_login_at: user.last_login_at
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// POST Logout
router.post('/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' })
})

// GET /auth/me
router.get('/auth/me', authenticateJWT, async (req, res) => {
  const userRes = await db.query('SELECT id, name, username, email, role, avatar, status FROM users WHERE id = $1', [req.user.id])
  const user = userRes.rows[0]
  if (user) {
    user.permissions = await getRolePermissions(user.role)
  }
  return res.json({ success: true, user })
})

module.exports = router
