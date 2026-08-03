import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useSettingsStore = defineStore('settings', () => {
  const users = ref([])
  const logs = ref([])
  const roles = ref([])

  async function fetchUsers() {
    const res = await apiFetch('/settings/users')
    if (res.success && res.data) {
      users.value = res.data.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role === 'admin' ? 'General Manager' : (u.role === 'barista' ? 'Head Barista' : 'Senior Cashier'),
        rawRole: u.role,
        status: u.status,
        avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        lastLogin: u.last_login_at || 'Never'
      }))
    }
  }

  async function fetchLogs() {
    const res = await apiFetch('/settings/logs')
    if (res.success && res.data) {
      logs.value = res.data.map(l => ({
        id: 'log-' + l.id,
        timestamp: l.created_at,
        user: l.user_name,
        action: l.action,
        module: l.module,
        ip: l.ip_address || '127.0.0.1',
        status: l.status,
        details: l.details
      }))
    }
  }

  async function fetchRoles() {
    const res = await apiFetch('/settings/roles')
    if (res.success && res.data && res.data.length > 0) {
      roles.value = res.data.map(r => ({
        id: r.id,
        role_key: r.role_key,
        title: r.display_name,
        description: r.description,
        permissions: r.permissions || []
      }))
    } else if (roles.value.length === 0) {
      roles.value = [
        {
          id: 1,
          role_key: 'admin',
          title: 'General Manager & Admin',
          description: 'Full access to all system features, financial reports, user management, and settings.',
          permissions: ['pos', 'tables', 'orders', 'shifts', 'categories', 'products', 'discounts', 'inventory', 'reports_overview', 'reports_financial', 'reports_history', 'settings_preferences', 'settings_users', 'settings_tables', 'settings_roles', 'settings_logs']
        },
        {
          id: 2,
          role_key: 'cashier',
          title: 'Senior Cashier',
          description: 'Access to Cashier POS, Table Map, Kitchen Display, and daily sales order history.',
          permissions: ['pos', 'tables', 'orders', 'shifts', 'discounts', 'reports_history']
        },
        {
          id: 3,
          role_key: 'barista',
          title: 'Barista / Kitchen Staff',
          description: 'Access to Kitchen Display System (KDS) and table status updates.',
          permissions: ['tables', 'orders', 'reports_history']
        }
      ]
    }
  }

  onMounted(() => {
    fetchUsers()
    fetchLogs()
    fetchRoles()
  })

  async function addUser(user) {
    const res = await apiFetch('/settings/users', {
      method: 'POST',
      body: {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password || 'password123',
        role: user.rawRole || (user.role.includes('Admin') ? 'admin' : (user.role.includes('Barista') ? 'barista' : 'cashier')),
        avatar: user.avatar
      }
    })
    if (res.success) {
      await fetchUsers()
    }
  }

  async function updateUser(updatedUser) {
    const res = await apiFetch(`/settings/users/${updatedUser.id}`, {
      method: 'PUT',
      body: {
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        password: updatedUser.password,
        role: updatedUser.rawRole || (updatedUser.role.includes('Admin') ? 'admin' : (updatedUser.role.includes('Barista') ? 'barista' : 'cashier')),
        avatar: updatedUser.avatar,
        status: updatedUser.status
      }
    })
    if (res.success) {
      await fetchUsers()
    }
  }

  async function deleteUser(id) {
    await apiFetch(`/settings/users/${id}`, { method: 'DELETE' })
    users.value = users.value.filter(u => u.id !== id)
  }

  async function toggleUserStatus(id) {
    const res = await apiFetch(`/settings/users/${id}/toggle`, { method: 'PATCH' })
    if (res.success) {
      await fetchUsers()
    }
  }

  async function updateRole(updatedRole) {
    const res = await apiFetch(`/settings/roles/${updatedRole.id}`, {
      method: 'PUT',
      body: {
        display_name: updatedRole.title,
        description: updatedRole.description,
        permissions: updatedRole.permissions
      }
    })

    if (res.success) {
      await fetchRoles()
    } else {
      const idx = roles.value.findIndex(r => r.id === updatedRole.id)
      if (idx !== -1) {
        roles.value[idx] = { ...roles.value[idx], ...updatedRole }
      }
    }
  }

  async function addRole(role) {
    roles.value.push({
      id: Date.now(),
      role_key: (role.title || '').toLowerCase().replace(/\s+/g, '-'),
      title: role.title,
      description: role.description,
      permissions: role.permissions || []
    })
  }

  async function deleteRole(id) {
    roles.value = roles.value.filter(r => r.id !== id)
  }

  return {
    users,
    roles,
    logs,
    fetchUsers,
    fetchLogs,
    fetchRoles,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    addRole,
    updateRole,
    deleteRole
  }
})
