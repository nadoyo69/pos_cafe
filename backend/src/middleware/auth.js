const jwt = require('jsonwebtoken')
const redis = require('../config/redis')

const JWT_SECRET = process.env.JWT_SECRET || 'lumiere_cafe_pos_jwt_secret_key_2026'

async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization Token not found.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Check Redis session for real-time role/status updates
    const sessionCache = await redis.getCache(`user:session:${decoded.id}`)
    if (sessionCache) {
      if (sessionCache.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account disabled. Contact Administrator.' })
      }
      req.user = { ...decoded, role: sessionCache.role, status: sessionCache.status }
    } else {
      req.user = decoded
    }

    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired JWT token.' })
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || (Array.isArray(role) ? !role.includes(req.user.role) : req.user.role !== role)) {
      return res.status(403).json({ success: false, message: 'Access forbidden: Insufficient role permissions.' })
    }
    next()
  }
}

module.exports = {
  authenticateJWT,
  requireRole,
  JWT_SECRET
}
