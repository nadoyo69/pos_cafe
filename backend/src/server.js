process.env.TZ = 'Asia/Jakarta'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const db = require('./db')
const redis = require('./config/redis')

const authRoutes = require('./routes/auth.routes')
const settingsRoutes = require('./routes/settings.routes')
const productsRoutes = require('./routes/products.routes')
const categoriesRoutes = require('./routes/categories.routes')
const tablesRoutes = require('./routes/tables.routes')
const ordersRoutes = require('./routes/orders.routes')
const inventoryRoutes = require('./routes/inventory.routes')
const reportsRoutes = require('./routes/reports.routes')
const discountsRoutes = require('./routes/discounts.routes')

const app = express()
const PORT = process.env.PORT || 8000

// Universal Security & CORS Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Initialize PostgreSQL Database & Redis Cache
db.initDatabase()
redis.initRedis()

// Mount Modular API Routers
const apiRouter = express.Router()
apiRouter.use(authRoutes)
apiRouter.use(settingsRoutes)
apiRouter.use(productsRoutes)
apiRouter.use(categoriesRoutes)
apiRouter.use(tablesRoutes)
apiRouter.use(ordersRoutes)
apiRouter.use(inventoryRoutes)
apiRouter.use(reportsRoutes)
apiRouter.use(discountsRoutes)

// API Route Prefixes
app.use('/api/v1', apiRouter)
app.use('/api', apiRouter)

// Universal Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'LUMIÈRE POS Modular Architecture',
    timezone: 'Asia/Jakarta (WIB)',
    cache: 'Redis 7 Alpine',
    database: 'PostgreSQL 15'
  })
})

// Start Express HTTP Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lumière POS Server running on port ${PORT} [Timezone: Asia/Jakarta]`)
})
