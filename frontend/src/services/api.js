const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

export async function apiFetch(endpoint, options = {}, retries = 3) {
  const token = localStorage.getItem('jwt_token')
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body)
  }

  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(targetUrl, config)
      
      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('cafe_user_logged_in')
        localStorage.removeItem('cafe_user')
        if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/customer') && window.location.pathname !== '/') {
          window.location.href = '/login'
        }
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
          continue
        }
        return { success: false, message: 'Server is temporarily unavailable. Retrying...' }
      }

      const data = await res.json()
      return data
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
        continue
      }
      console.warn(`API Request to ${endpoint} failed:`, err.message)
      return { success: false, message: err.message || 'Network connection failed.' }
    }
  }
}
