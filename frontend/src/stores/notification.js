import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([
    {
      id: 'n-001',
      title: 'New Order Received',
      message: 'Order ORD-8825 from Table T-03 (Budi Santoso) — 3 items, Rp 94,600',
      type: 'order',
      icon: 'receipt_long',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'n-002',
      title: 'Low Stock Alert',
      message: 'Caramel Syrup Monin is running low (2 bottles remaining, threshold: 3)',
      type: 'warning',
      icon: 'inventory_2',
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'n-003',
      title: 'Out of Stock',
      message: 'Smoked Salmon Fillet is out of stock — menu item may be affected',
      type: 'critical',
      icon: 'error',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: false
    },
    {
      id: 'n-004',
      title: 'Shift Closing Reminder',
      message: 'Your shift has been open for 7 hours. Consider closing and reconciling cash drawer.',
      type: 'info',
      icon: 'schedule',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'n-005',
      title: 'Order Ready for Pickup',
      message: 'Order ORD-8822 (Maya & Dina, Terrace 01) is ready to be served',
      type: 'success',
      icon: 'check_circle',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'n-006',
      title: 'Promo Code Limit Reached',
      message: 'HAPPYHOUR promo code has reached its usage limit (300/300). Auto-deactivated.',
      type: 'warning',
      icon: 'loyalty',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ])

  const isOpen = ref(false)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function close() {
    isOpen.value = false
  }

  function markAsRead(id) {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  function markAllRead() {
    notifications.value.forEach(n => n.read = true)
  }

  function clearAll() {
    notifications.value = []
  }

  function timeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return {
    notifications,
    isOpen,
    unreadCount,
    toggle,
    close,
    markAsRead,
    markAllRead,
    clearAll,
    timeAgo
  }
})
