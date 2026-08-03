const express = require('express')
const router = express.Router()
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

// ---------------------------------------------------------------------------
// DISCOUNTS & PROMOS API
// ---------------------------------------------------------------------------

router.get('/discounts', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:discounts')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const result = await db.query('SELECT * FROM discounts ORDER BY id ASC')
    const formatted = result.rows.map(d => {
      const uCount = Number(d.usage_count || 0)
      const uLimit = Number(d.usage_limit || 100)
      const remaining = Math.max(0, uLimit - uCount)
      return {
        ...d,
        usage_count: uCount,
        usage_limit: uLimit,
        remaining_uses: remaining,
        value: Number(d.value),
        min_purchase: Number(d.min_purchase),
        max_discount: Number(d.max_discount)
      }
    })

    await redis.setCache('cache:discounts', formatted, 3600)
    return res.json({ success: true, data: formatted, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/discounts', authenticateJWT, async (req, res) => {
  try {
    const { code, name, type, value, min_purchase, max_discount, valid_from, valid_to, usage_limit, description } = req.body
    const cleanCode = String(code || 'PROMO-' + Math.floor(100 + Math.random() * 900)).toUpperCase().trim()

    const result = await db.query(`
      INSERT INTO discounts (code, name, type, value, min_purchase, max_discount, valid_from, valid_to, usage_limit, usage_count, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, 'active')
      RETURNING *
    `, [
      cleanCode,
      name,
      type || 'percentage',
      Number(value || 0),
      Number(min_purchase || 0),
      Number(max_discount || 0),
      valid_from || null,
      valid_to || null,
      Number(usage_limit || 100),
      description || ''
    ])

    await redis.delCache('cache:discounts')
    return res.json({ success: true, message: 'Discount created successfully', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/discounts/validate', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ success: false, message: 'Voucher code is required' })

    const cleanCode = String(code).toUpperCase().trim()
    const result = await db.query('SELECT * FROM discounts WHERE UPPER(code) = $1 AND status = $2', [cleanCode, 'active'])

    if (result.rows.length === 0) {
      if (cleanCode === 'CAFE10') {
        return res.json({ success: true, data: { code: 'CAFE10', name: '10% Member Discount', type: 'percentage', value: 10 } })
      } else if (cleanCode === 'VIP20') {
        return res.json({ success: true, data: { code: 'VIP20', name: '20% VIP Discount', type: 'percentage', value: 20 } })
      }
      return res.status(404).json({ success: false, message: 'Invalid or expired discount voucher' })
    }

    const discount = result.rows[0]
    const uCount = Number(discount.usage_count || 0)
    const uLimit = Number(discount.usage_limit || 100)

    if (uCount >= uLimit) {
      return res.status(400).json({ success: false, message: `Voucher limit reached (${uCount}/${uLimit} used)` })
    }

    return res.json({
      success: true,
      data: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: Number(discount.value),
        usage_count: uCount,
        usage_limit: uLimit,
        remaining: uLimit - uCount
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/discounts/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { code, name, type, value, min_purchase, max_discount, valid_from, valid_to, usage_limit, status, description } = req.body

    const result = await db.query(`
      UPDATE discounts SET 
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        type = COALESCE($3, type),
        value = COALESCE($4, value),
        min_purchase = COALESCE($5, min_purchase),
        max_discount = COALESCE($6, max_discount),
        valid_from = COALESCE($7, valid_from),
        valid_to = COALESCE($8, valid_to),
        usage_limit = COALESCE($9, usage_limit),
        status = COALESCE($10, status),
        description = COALESCE($11, description)
      WHERE id = $12 RETURNING *
    `, [
      code ? String(code).toUpperCase().trim() : null,
      name || null,
      type || null,
      value !== undefined ? Number(value) : null,
      min_purchase !== undefined ? Number(min_purchase) : null,
      max_discount !== undefined ? Number(max_discount) : null,
      valid_from || null,
      valid_to || null,
      usage_limit !== undefined ? Number(usage_limit) : null,
      status || null,
      description || null,
      id
    ])

    await redis.delCache('cache:discounts')
    return res.json({ success: true, message: 'Discount updated successfully', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/discounts/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    await db.query('DELETE FROM discounts WHERE id = $1', [id])
    await redis.delCache('cache:discounts')
    return res.json({ success: true, message: 'Discount deleted successfully' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
