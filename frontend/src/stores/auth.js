import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const storedUser = localStorage.getItem('cafe_user')
  const initialUser = storedUser ? JSON.parse(storedUser) : {
    id: 2,
    username: 'kasir',
    name: 'Sarah Jenkins',
    role: 'cashier',
    roleLabel: 'Senior Cashier',
    permissions: ['pos', 'tables', 'orders', 'shifts', 'discounts', 'reports_history'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    shiftStartedAt: new Date().toISOString()
  }

  const user = ref(initialUser)
  const isAuthenticated = ref(!!localStorage.getItem('jwt_token') || !!localStorage.getItem('cafe_user_logged_in'))

  const roleLabelMap = {
    admin: 'General Manager & Admin',
    cashier: 'Senior Cashier',
    barista: 'Head Barista'
  }

  const defaultRolePermissions = {
    admin: ['pos', 'tables', 'orders', 'shifts', 'categories', 'products', 'discounts', 'inventory', 'reports_overview', 'reports_financial', 'reports_history', 'settings_preferences', 'settings_users', 'settings_tables', 'settings_roles', 'settings_logs'],
    cashier: ['pos', 'tables', 'orders', 'shifts', 'discounts', 'reports_history'],
    barista: ['tables', 'orders', 'reports_history']
  }

  function hasPermission(permKey) {
    if (!user.value) return false
    const role = (user.value.role || 'cashier').toLowerCase()
    if (role === 'admin') return true
    
    const userPerms = user.value.permissions || defaultRolePermissions[role] || []
    return Array.isArray(userPerms) && userPerms.includes(permKey)
  }

  async function login(username, password) {
    const cleanUser = (username || '').trim()
    const cleanPass = (password || '').trim()

    // 1. Call Backend JWT Auth API
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: { username: cleanUser, password: cleanPass }
    })

    if (res.success && res.token) {
      localStorage.setItem('jwt_token', res.token)
      const rawRole = (res.user.role || 'cashier').toLowerCase()
      const userPerms = res.user.permissions || defaultRolePermissions[rawRole] || []
      
      user.value = {
        id: res.user.id,
        username: res.user.username,
        name: res.user.name,
        role: rawRole,
        roleLabel: roleLabelMap[rawRole] || 'Staff Member',
        permissions: userPerms,
        avatar: res.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        shiftStartedAt: new Date().toISOString()
      }
      isAuthenticated.value = true
      localStorage.setItem('cafe_user_logged_in', 'true')
      localStorage.setItem('cafe_user', JSON.stringify(user.value))
      return { success: true, message: `Welcome back, ${res.user.name}!` }
    }

    // Fallback for offline demo credentials
    if ((cleanUser === 'kasir' && cleanPass === 'password123') || (cleanUser === 'admin' && cleanPass === 'password123') || (cleanUser === 'barista' && cleanPass === 'password123')) {
      const role = cleanUser === 'admin' ? 'admin' : (cleanUser === 'barista' ? 'barista' : 'cashier')
      const name = cleanUser === 'admin' ? 'Alexander Wright' : (cleanUser === 'barista' ? 'Kevin Maulana' : 'Sarah Jenkins')
      
      user.value = {
        id: cleanUser === 'admin' ? 1 : (cleanUser === 'barista' ? 3 : 2),
        username: cleanUser,
        name,
        role,
        roleLabel: roleLabelMap[role] || 'Staff Member',
        permissions: defaultRolePermissions[role] || [],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        shiftStartedAt: new Date().toISOString()
      }
      isAuthenticated.value = true
      localStorage.setItem('cafe_user_logged_in', 'true')
      localStorage.setItem('cafe_user', JSON.stringify(user.value))
      return { success: true, message: `Welcome, ${user.value.name}!` }
    }

    return { 
      success: false, 
      message: res.message || 'Invalid Username or Password! (Default: admin/password123, kasir/password123, barista/password123)' 
    }
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (e) {
      console.warn('Logout API call exception handled.')
    }
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('cafe_user_logged_in')
    localStorage.removeItem('cafe_user')
  }

  return {
    user,
    isAuthenticated,
    hasPermission,
    login,
    logout
  }
})
