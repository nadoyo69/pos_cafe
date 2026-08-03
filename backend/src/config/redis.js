const { createClient } = require('redis')

const redisHost = process.env.REDIS_HOST || 'redis'
const redisPort = process.env.REDIS_PORT || 6379

const client = createClient({
  url: `redis://${redisHost}:${redisPort}`
})

let isConnected = false

client.on('connect', () => {
  isConnected = true
  console.log('⚡ Redis Cache Engine connected successfully!')
})

client.on('error', (err) => {
  isConnected = false
  console.warn('⚠️ Redis Cache warning:', err.message)
})

async function initRedis() {
  try {
    await client.connect()
  } catch (err) {
    console.warn('⚠️ Redis connection failed, falling back to direct DB queries.')
  }
}

async function getCache(key) {
  if (!isConnected) return null
  try {
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    return null
  }
}

async function setCache(key, value, ttlSeconds = 3600) {
  if (!isConnected) return
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value))
  } catch (err) {
    // Silent fail
  }
}

async function delCache(key) {
  if (!isConnected) return
  try {
    await client.del(key)
  } catch (err) {
    // Silent fail
  }
}

async function flushCachePattern(pattern) {
  if (!isConnected) return
  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(keys)
    }
  } catch (err) {
    // Silent fail
  }
}

module.exports = {
  client,
  initRedis,
  getCache,
  setCache,
  delCache,
  flushCachePattern
}
