const express = require('express')
const router = express.Router()
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

// ---------------------------------------------------------------------------
// PRODUCTS CATALOG API WITH DYNAMIC ADDONS PER PRODUCT
// ---------------------------------------------------------------------------
router.get('/products', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:products')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const result = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `)

    const products = result.rows.map(p => {
      let addons = []
      if (p.addons_json) {
        addons = typeof p.addons_json === 'string' ? JSON.parse(p.addons_json) : p.addons_json
      }
      return {
        ...p,
        price: Number(p.price),
        rating: Number(p.rating),
        category: p.category_name || 'Artisan Coffee',
        category_slug: p.category_slug || 'coffee',
        addons: Array.isArray(addons) ? addons : []
      }
    })

    await redis.setCache('cache:products', products, 3600)
    return res.json({ success: true, data: products, source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/products', authenticateJWT, async (req, res) => {
  try {
    let { category_id, category, sku, name, description, price, stock_count, image, addons } = req.body

    let catId = Number(category_id)
    if (isNaN(catId) || catId <= 0) {
      const categorySearch = category || category_id || 'Artisan Coffee'
      const catRes = await db.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1', [String(categorySearch)])
      catId = catRes.rows.length > 0 ? catRes.rows[0].id : 1
    }

    const cleanSku = sku || ('SKU-' + Math.floor(1000 + Math.random() * 9000))
    const addonsJson = JSON.stringify(Array.isArray(addons) ? addons : [])

    const result = await db.query(`
      INSERT INTO products (category_id, sku, name, description, price, stock_count, image, addons_json, in_stock, rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, TRUE, 4.9)
      RETURNING *
    `, [
      catId,
      cleanSku,
      name,
      description || '',
      Number(price || 0),
      Number(stock_count || 50),
      image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      addonsJson
    ])

    await redis.delCache('cache:products')
    return res.json({ success: true, message: 'Product added with dynamic addons successfully', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/products/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, description, price, stock_count, image, category_id, category, addons } = req.body

    let catId = Number(category_id)
    if (isNaN(catId) || catId <= 0) {
      if (category) {
        const catRes = await db.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1', [String(category)])
        catId = catRes.rows.length > 0 ? catRes.rows[0].id : 1
      }
    }

    const addonsJson = addons !== undefined ? JSON.stringify(Array.isArray(addons) ? addons : []) : null

    const result = await db.query(`
      UPDATE products SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        stock_count = COALESCE($4, stock_count),
        image = COALESCE($5, image),
        category_id = COALESCE($6, category_id),
        addons_json = COALESCE($7::jsonb, addons_json)
      WHERE id = $8 RETURNING *
    `, [name, description, price ? Number(price) : null, stock_count !== undefined ? Number(stock_count) : null, image, isNaN(catId) ? null : catId, addonsJson, id])

    await redis.delCache('cache:products')
    return res.json({ success: true, message: 'Product updated successfully', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.patch('/products/:id/toggle-stock', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await db.query(`
      UPDATE products SET in_stock = NOT in_stock WHERE id = $1 RETURNING *
    `, [id])

    await redis.delCache('cache:products')
    return res.json({ success: true, message: 'Stock status toggled', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/products/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    await db.query('DELETE FROM products WHERE id = $1', [id])
    await redis.delCache('cache:products')
    return res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
