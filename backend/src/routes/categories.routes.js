const express = require('express')
const router = express.Router()
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

// ---------------------------------------------------------------------------
// CATEGORIES API
// ---------------------------------------------------------------------------
router.get('/categories', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:categories')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const result = await db.query('SELECT * FROM categories ORDER BY id ASC')
    await redis.setCache('cache:categories', result.rows, 3600)
    return res.json({ success: true, data: result.rows, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/categories', authenticateJWT, async (req, res) => {
  try {
    const { name, slug, icon, description } = req.body
    const cleanSlug = slug || String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const result = await db.query(`
      INSERT INTO categories (name, slug, icon, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, cleanSlug, icon || 'local_cafe', description || ''])

    await redis.delCache('cache:categories')
    return res.json({ success: true, message: 'Category added', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/categories/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, slug, icon, description } = req.body

    const result = await db.query(`
      UPDATE categories SET name = $1, slug = $2, icon = $3, description = $4
      WHERE id = $5 RETURNING *
    `, [name, slug, icon, description, id])

    await redis.delCache('cache:categories')
    return res.json({ success: true, message: 'Category updated', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/categories/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    await db.query('DELETE FROM categories WHERE id = $1', [id])
    await redis.delCache('cache:categories')
    return res.json({ success: true, message: 'Category deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
