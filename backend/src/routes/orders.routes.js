const express = require('express')
const router = express.Router()
const db = require('../db')
const redis = require('../config/redis')
const { authenticateJWT } = require('../middleware/auth')

// ---------------------------------------------------------------------------
// ORDERS & KITCHEN DISPLAY (KDS) API
// ---------------------------------------------------------------------------
router.get('/orders', async (req, res) => {
  try {
    const cached = await redis.getCache('cache:orders')
    if (cached) return res.json({ success: true, data: cached, source: 'redis' })

    const ordersRes = await db.query(`
      SELECT o.*, t.zone as table_zone
      FROM orders o
      LEFT JOIN cafe_tables t ON o.table_no = t.table_no
      ORDER BY o.created_at DESC
    `)

    const orders = ordersRes.rows

    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id)
      const itemsRes = await db.query(`
        SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id ASC
      `, [orderIds])

      const itemsByOrder = {}
      itemsRes.rows.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
        itemsByOrder[item.order_id].push({
          ...item,
          unit_price: Number(item.unit_price)
        })
      })

      const fullOrders = orders.map(o => ({
        ...o,
        subtotal: Number(o.subtotal),
        discount_amount: Number(o.discount_amount),
        tax_amount: Number(o.tax_amount),
        total_amount: Number(o.total_amount),
        items: itemsByOrder[o.id] || []
      }))

      await redis.setCache('cache:orders', fullOrders, 3600)
      return res.json({ success: true, data: fullOrders, source: 'database' })
    }

    await redis.setCache('cache:orders', [], 3600)
    return res.json({ success: true, data: [], source: 'database' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/orders', async (req, res) => {
  try {
    const { customerName, tableNo, orderType, paymentMethod, subtotal, discountAmount, taxAmount, totalAmount, voucherCode, items } = req.body

    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000)
    const receiptNumber = 'REC-' + Math.floor(10000 + Math.random() * 90000)

    const orderRes = await db.query(`
      INSERT INTO orders (order_number, receipt_number, customer_name, table_no, order_type, payment_method, subtotal, discount_amount, tax_amount, total_amount, voucher_code, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
      RETURNING *
    `, [
      orderNumber,
      receiptNumber,
      customerName || 'Guest Customer',
      tableNo || 'T-01',
      orderType || 'Dine-In',
      paymentMethod || 'CASHIER',
      Number(subtotal || 0),
      Number(discountAmount || 0),
      Number(taxAmount || 0),
      Number(totalAmount || 0),
      voucherCode || ''
    ])

    const createdOrder = orderRes.rows[0]

    // 1. Decrement Promo Voucher usage_count if voucherCode provided
    if (voucherCode && voucherCode.trim()) {
      await db.query(`
        UPDATE discounts 
        SET usage_count = usage_count + 1 
        WHERE LOWER(code) = LOWER($1)
      `, [voucherCode.trim()])
    }

    // 2. Insert Order Items & Deduct Inventory Stock with Portion Qty
    for (const item of items) {
      const pName = item.name || item.item_name
      const qty = Number(item.quantity) || 1
      const unitPrice = Number(item.unitPrice || item.unit_price) || 0
      const linkedProductId = item.productId || item.product_id || null

      const totalPrice = qty * unitPrice

      await db.query(`
        INSERT INTO order_items (order_id, product_name, item_name, quantity, unit_price, total_price, size, milk, sugar, is_ready)
        VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, FALSE)
      `, [
        createdOrder.id,
        pName,
        qty,
        unitPrice,
        totalPrice,
        item.size || 'Standard',
        item.milk || 'Fresh Milk',
        item.sugar || '100%'
      ])

      // Deduct raw material stock in inventory_items based on portion_qty (takaran per porsi)
      const searchKey = `%${pName.split(' ')[0]}%`
      const invDeductRes = await db.query(`
        UPDATE inventory_items 
        SET current_qty = GREATEST(0, current_qty - ($1 * COALESCE(portion_qty, 1)))
        WHERE (product_id = $2 OR LOWER(product_name) = LOWER($3) OR LOWER(name) LIKE LOWER($4))
      `, [qty, linkedProductId, pName, searchKey])

      if (invDeductRes.rowCount === 0) {
        // Fallback deduction from first general inventory item
        await db.query(`
          UPDATE inventory_items 
          SET current_qty = GREATEST(0, current_qty - ($1 * COALESCE(portion_qty, 1)))
          WHERE id = (SELECT id FROM inventory_items ORDER BY id ASC LIMIT 1)
        `, [qty])
      }
    }

    // 3. Update Table Occupancy status in cafe_tables
    await db.query(`
      UPDATE cafe_tables SET status = 'occupied', current_customer_name = $1, current_bill_total = $2
      WHERE table_no = $3
    `, [customerName, totalAmount, tableNo])

    // 4. Invalidate all relevant Redis cache keys for real-time synchronization
    await redis.delCache('cache:orders')
    await redis.delCache('cache:tables')
    await redis.delCache('cache:reports_summary')
    await redis.delCache('cache:discounts')
    await redis.delCache('cache:products')
    await redis.delCache('cache:inventory')

    return res.json({ success: true, message: 'Order submitted and recipe stock deducted', data: createdOrder })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /orders/:id - Edit order items & recalculate bill totals
router.put('/orders/:id', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { items, subtotal, discountAmount, taxAmount, totalAmount } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' })
    }

    const calcSubtotal = subtotal !== undefined ? Number(subtotal) : items.reduce((sum, i) => sum + (Number(i.unit_price || i.unitPrice || i.price || 0) * Number(i.quantity || 1)), 0)
    const calcDiscount = discountAmount !== undefined ? Number(discountAmount) : 0
    const calcTax = taxAmount !== undefined ? Number(taxAmount) : Math.round((calcSubtotal - calcDiscount) * 0.1)
    const calcTotal = totalAmount !== undefined ? Number(totalAmount) : (calcSubtotal - calcDiscount + calcTax)

    const orderRes = await db.query(`
      UPDATE orders SET 
        subtotal = $1,
        discount_amount = $2,
        tax_amount = $3,
        total_amount = $4
      WHERE id = $5 RETURNING *
    `, [calcSubtotal, calcDiscount, calcTax, calcTotal, id])

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    await db.query('DELETE FROM order_items WHERE order_id = $1', [id])

    for (const item of items) {
      const pName = item.item_name || item.name
      const qty = Number(item.quantity) || 1
      const price = Number(item.unit_price || item.unitPrice || item.price) || 0
      const size = item.size || 'Standard'
      const milk = item.milk || 'Fresh Milk'
      const sugar = item.sugar || '100%'

      const totalPrice = qty * price

      await db.query(`
        INSERT INTO order_items (order_id, product_name, item_name, quantity, unit_price, total_price, size, milk, sugar, is_ready)
        VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [id, pName, qty, price, totalPrice, size, milk, sugar, Boolean(item.is_ready)])
    }

    const tableNo = orderRes.rows[0].table_no
    if (tableNo) {
      await db.query('UPDATE cafe_tables SET current_bill_total = $1 WHERE table_no = $2', [calcTotal, tableNo])
    }

    await redis.delCache('cache:orders')
    await redis.delCache('cache:tables')
    await redis.delCache('cache:reports_summary')

    return res.json({ success: true, message: 'Order items updated successfully', data: orderRes.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.patch('/orders/items/:id/ready', authenticateJWT, async (req, res) => {
  try {
    const itemId = Number(req.params.id)
    const { isReady, ready } = req.body
    const readyStatus = isReady !== undefined ? Boolean(isReady) : Boolean(ready)

    const result = await db.query(`
      UPDATE order_items SET is_ready = $1 WHERE id = $2 RETURNING *
    `, [readyStatus, itemId])

    await redis.delCache('cache:orders')
    return res.json({ success: true, message: 'Item readiness status updated', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

router.patch('/orders/:id/status', authenticateJWT, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body

    const result = await db.query(`
      UPDATE orders SET status = $1 WHERE id = $2 RETURNING *
    `, [status, id])

    await redis.delCache('cache:orders')
    await redis.delCache('cache:reports_summary')
    return res.json({ success: true, message: 'Order status updated', data: result.rows[0] })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
