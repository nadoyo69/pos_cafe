const express = require('express')
const router = express.Router()
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

// ---------------------------------------------------------------------------
// INVENTORY STOCK API (LINKED TO PRODUCTS & RECIPE DOSAGE/TAKARAN)
// ---------------------------------------------------------------------------
router.get('/inventory', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:inventory')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const result = await db.query(`
      SELECT i.*, p.name as linked_product_name, p.sku as product_sku
      FROM inventory_items i
      LEFT JOIN products p ON i.product_id = p.id
      ORDER BY i.id ASC
    `)

    const items = result.rows.map(i => ({
      ...i,
      current_qty: Number(i.current_qty),
      min_threshold: Number(i.min_threshold),
      portion_qty: Number(i.portion_qty || 1),
      product_name: i.linked_product_name || i.product_name || 'All Products (General)'
    }))

    await redis.setCache('cache:inventory', items, 3600)
    return res.json({ success: true, data: items, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/inventory', authenticateJWT, async (req, res) => {
  try {
    const { name, category, unit, current_qty, min_threshold, product_id, product_name, portion_qty } = req.body
    const itemCode = 'INV-' + Math.floor(1000 + Math.random() * 9000)

    let prodId = Number(product_id)
    let prodName = product_name || null

    if ((!prodId || isNaN(prodId)) && prodName) {
      const pRes = await db.query('SELECT id, name FROM products WHERE LOWER(name) = LOWER($1) LIMIT 1', [String(prodName).trim()])
      if (pRes.rows.length > 0) {
        prodId = pRes.rows[0].id
        prodName = pRes.rows[0].name
      }
    }

    const result = await db.query(`
      INSERT INTO inventory_items (item_code, name, category, current_qty, unit, min_threshold, product_id, product_name, portion_qty)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      itemCode,
      name,
      category || 'Coffee',
      Number(current_qty || 0),
      unit || 'kg',
      Number(min_threshold || 5),
      isNaN(prodId) ? null : prodId,
      prodName,
      Number(portion_qty || 1)
    ])

    await redis.delCache('cache:inventory')
    return res.json({ success: true, message: 'Inventory item linked to product added', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/inventory/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, category, unit, current_qty, min_threshold, product_id, product_name, portion_qty } = req.body

    let prodId = Number(product_id)
    let prodName = product_name || null

    if ((!prodId || isNaN(prodId)) && prodName) {
      const pRes = await db.query('SELECT id, name FROM products WHERE LOWER(name) = LOWER($1) LIMIT 1', [String(prodName).trim()])
      if (pRes.rows.length > 0) {
        prodId = pRes.rows[0].id
        prodName = pRes.rows[0].name
      }
    }

    const result = await db.query(`
      UPDATE inventory_items SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        unit = COALESCE($3, unit),
        current_qty = COALESCE($4, current_qty),
        min_threshold = COALESCE($5, min_threshold),
        product_id = $6,
        product_name = $7,
        portion_qty = COALESCE($8, portion_qty)
      WHERE id = $9 RETURNING *
    `, [
      name,
      category,
      unit,
      current_qty !== undefined ? Number(current_qty) : null,
      min_threshold !== undefined ? Number(min_threshold) : null,
      isNaN(prodId) ? null : prodId,
      prodName,
      portion_qty !== undefined ? Number(portion_qty) : null,
      id
    ])

    await redis.delCache('cache:inventory')
    return res.json({ success: true, message: 'Inventory item updated', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/inventory/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    await db.query('DELETE FROM inventory_items WHERE id = $1', [id])
    await redis.delCache('cache:inventory')
    return res.json({ success: true, message: 'Inventory item deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/inventory/:id/stock-in', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const qty = Number(req.body.qty || 1)

    const result = await db.query(`
      UPDATE inventory_items SET current_qty = current_qty + $1, last_restocked_at = NOW()
      WHERE id = $2 RETURNING *
    `, [qty, id])

    await redis.delCache('cache:inventory')
    return res.json({ success: true, message: 'Stock added', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/inventory/:id/stock-out', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const qty = Number(req.body.qty || 1)

    const result = await db.query(`
      UPDATE inventory_items SET current_qty = GREATEST(0, current_qty - $1)
      WHERE id = $2 RETURNING *
    `, [qty, id])

    await redis.delCache('cache:inventory')
    return res.json({ success: true, message: 'Stock removed', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
