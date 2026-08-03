const express = require('express')
const router = express.Router()
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

// ---------------------------------------------------------------------------
// TABLES & FLOOR MAP API (POSTGRESQL TABLE: cafe_tables)
// ---------------------------------------------------------------------------
router.get('/tables', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:tables')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const result = await db.query('SELECT * FROM cafe_tables ORDER BY id ASC')
    await redis.setCache('cache:tables', result.rows, 3600)
    return res.json({ success: true, data: result.rows, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/tables', authenticateJWT, async (req, res) => {
  try {
    const { table_no, zone, capacity } = req.body
    const result = await db.query(`
      INSERT INTO cafe_tables (table_no, zone, capacity, status)
      VALUES ($1, $2, $3, 'available')
      RETURNING *
    `, [table_no, zone || 'floor-1', Number(capacity) || 4])

    await redis.delCache('cache:tables')
    return res.json({ success: true, message: 'Table created', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/tables/:id', async (req, res) => {
  try {
    const paramId = req.params.id
    const numericId = Number(paramId)
    const { table_no, zone, capacity, status, current_customer_name, current_bill_total } = req.body

    const result = await db.query(`
      UPDATE cafe_tables SET 
        table_no = COALESCE($1, table_no),
        zone = COALESCE($2, zone),
        capacity = COALESCE($3, capacity),
        status = COALESCE($4, status),
        current_customer_name = COALESCE($5, current_customer_name),
        current_bill_total = COALESCE($6, current_bill_total)
      WHERE id = $7 OR table_no = $8 RETURNING *
    `, [table_no || null, zone || null, capacity ? Number(capacity) : null, status || null, current_customer_name || null, current_bill_total !== undefined ? Number(current_bill_total) : null, isNaN(numericId) ? -1 : numericId, String(paramId)])

    await redis.delCache('cache:tables')
    return res.json({ success: true, message: 'Table updated successfully', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/tables/:id', authenticateJWT, async (req, res) => {
  try {
    const paramId = req.params.id
    const numericId = Number(paramId)

    await db.query('DELETE FROM cafe_tables WHERE id = $1 OR table_no = $2', [isNaN(numericId) ? -1 : numericId, String(paramId)])
    await redis.delCache('cache:tables')
    return res.json({ success: true, message: 'Table deleted successfully' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
