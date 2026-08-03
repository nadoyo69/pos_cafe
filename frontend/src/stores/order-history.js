import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useOrderHistoryStore = defineStore('orderHistory', () => {
  const dateFilter = ref('today') // 'today' | 'week' | 'month' | 'all'
  const orders = ref([])

  async function fetchHistory() {
    const res = await apiFetch('/reports/history')
    if (res.success && res.data) {
      orders.value = res.data.map(o => ({
        id: o.order_number,
        dbId: o.id,
        receiptNumber: o.receipt_number,
        customerName: o.customer_name,
        tableNo: o.table_no,
        orderType: o.order_type,
        items: (o.items || []).map(i => ({ name: i.product_name, qty: i.quantity, price: Number(i.unit_price) })),
        itemCount: (o.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
        subtotal: Number(o.subtotal || o.total_amount),
        discountAmount: Number(o.discount_amount || 0),
        taxAmount: Number(o.tax_amount || 0),
        total: Number(o.total_amount || 0),
        paymentMethod: o.payment_method || 'CASH',
        cashierName: o.cashier_name || 'Sarah Jenkins',
        status: o.status,
        createdAt: o.created_at,
        completedAt: o.completed_at
      }))
    }
  }

  onMounted(() => {
    fetchHistory()
  })

  const filteredOrders = computed(() => {
    const now = new Date()
    const nowDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) // "YYYY-MM-DD"
    const nowMonthStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' })

    return orders.value.filter(o => {
      if (dateFilter.value === 'all') return true
      if (!o.createdAt) return false

      let d = new Date(o.createdAt)
      if (isNaN(d.getTime())) {
        d = new Date(String(o.createdAt).replace(' ', 'T'))
      }
      if (isNaN(d.getTime())) return false

      const orderDateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
      const orderMonthStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' })

      if (dateFilter.value === 'today') {
        return orderDateStr === nowDateStr
      }
      if (dateFilter.value === 'week') {
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 7
      }
      if (dateFilter.value === 'month') {
        return orderMonthStr === nowMonthStr
      }
      return true
    })
  })

  const totalOrders = computed(() => filteredOrders.value.length)
  const totalRevenue = computed(() => filteredOrders.value.reduce((sum, o) => sum + o.total, 0))
  const averageOrderValue = computed(() => totalOrders.value > 0 ? Math.round(totalRevenue.value / totalOrders.value) : 0)

  const topPaymentMethod = computed(() => {
    const counts = {}
    filteredOrders.value.forEach(o => {
      counts[o.paymentMethod] = (counts[o.paymentMethod] || 0) + 1
    })
    let top = 'N/A'
    let max = 0
    Object.entries(counts).forEach(([method, count]) => {
      if (count > max) { max = count; top = method }
    })
    return top
  })

  function getOrderById(id) {
    return orders.value.find(o => o.id === id)
  }

  async function refundOrder(id) {
    const order = orders.value.find(o => o.id === id)
    if (order) {
      order.status = 'refunded'
      await apiFetch(`/orders/${order.dbId || id}/refund`, { method: 'POST' })
    }
  }

  return {
    dateFilter,
    orders,
    filteredOrders,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    topPaymentMethod,
    fetchHistory,
    getOrderById,
    refundOrder
  }
})
