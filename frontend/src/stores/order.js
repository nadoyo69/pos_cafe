import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/services/api'
import { showToast } from '@/utils/swal'

export const useOrderStore = defineStore('order', () => {
  const activeStatusTab = ref('all') // 'all' | 'pending' | 'preparing' | 'ready' | 'completed'
  const orders = ref([])
  const knownOrderIds = ref(new Set())
  const isInitialLoad = ref(true)

  // Selection states for Modals
  const selectedOrderForDetail = ref(null)
  const selectedOrderForEdit = ref(null)

  function playOrderChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch (e) {
      console.warn('Audio chime notification muted or blocked by browser', e)
    }
  }

  async function fetchOrders() {
    const res = await apiFetch('/orders')
    if (res.success && Array.isArray(res.data)) {
      const fetched = res.data.map(o => {
        let cleanStatus = (o.status || 'pending').toLowerCase()
        if (cleanStatus.includes('paid') || cleanStatus.includes('cash') || cleanStatus.includes('qris')) {
          cleanStatus = 'pending'
        }
        return {
          id: o.order_number || ('ORD-' + o.id),
          dbId: o.id,
          receiptNumber: o.receipt_number || ('REC-' + o.id),
          tableNo: o.table_no || 'T-01',
          orderType: o.order_type || 'Dine-In',
          customerName: o.customer_name || 'Walk-in Customer',
          createdAt: o.created_at,
          timeAgo: 'Just now',
          status: cleanStatus,
          paymentStatus: `Paid (${o.payment_method || 'CASH'})`,
          paymentMethod: o.payment_method || 'CASH',
          totalAmount: Number(o.total_amount || 0),
          discountAmount: Number(o.discount_amount || 0),
          subtotal: Number(o.subtotal || o.total_amount || 0),
          taxAmount: Number(o.tax_amount || 0),
          notes: o.notes || '',
          items: (o.items || []).map(i => ({
            id: i.id,
            name: i.product_name || i.item_name || i.name || 'Artisan Item',
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unit_price || i.unitPrice) || 0,
            size: i.size || 'Standard',
            milk: i.milk || '',
            sugar: i.sugar || '',
            isReady: i.is_ready ?? false,
            ready: i.is_ready ?? false,
            notes: i.notes || ''
          }))
        }
      })

      // Detect newly arrived orders for audio & toast notification
      if (!isInitialLoad.value) {
        fetched.forEach(o => {
          if (!knownOrderIds.value.has(o.id)) {
            playOrderChime()
            showToast(`🔔 NEW ORDER: #${o.id} for Table ${o.tableNo}!`, 'info')
          }
        })
      }

      knownOrderIds.value = new Set(fetched.map(o => o.id))
      orders.value = fetched
      isInitialLoad.value = false
    }
  }

  async function createOrder(orderData) {
    const res = await apiFetch('/orders', {
      method: 'POST',
      body: {
        customerName: orderData.customerName || 'Guest Customer',
        tableNo: orderData.tableNo || 'T-01',
        orderType: orderData.orderType || 'Dine-In',
        paymentMethod: orderData.paymentMethod || 'CASH',
        subtotal: orderData.subtotal || orderData.totalAmount || 0,
        discountAmount: orderData.discountAmount || 0,
        taxAmount: orderData.taxAmount || 0,
        totalAmount: orderData.totalAmount || 0,
        amountPaid: orderData.amountPaid || orderData.totalAmount || 0,
        voucherCode: orderData.voucherCode || '',
        items: (orderData.items || []).map(i => ({
          name: i.name || i.product_name,
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice || i.unit_price || i.price) || 0,
          size: i.size ? (typeof i.size === 'object' ? i.size.name : i.size) : 'Standard',
          milk: i.milk || '',
          sugar: i.sugar || '',
          ice: i.ice || ''
        }))
      }
    })

    if (res.success && res.data) {
      await fetchOrders()
      return res.data
    }
    return null
  }

  async function updateOrderItems(orderId, updatedItems) {
    const order = orders.value.find(o => o.id === orderId || o.dbId === orderId)
    if (!order) return false

    const dbId = order.dbId || orderId
    const subtotal = updatedItems.reduce((sum, i) => sum + (Number(i.unitPrice || i.price || 0) * Number(i.quantity || 1)), 0)
    const taxAmount = Math.round((subtotal - (order.discountAmount || 0)) * 0.1)
    const totalAmount = subtotal - (order.discountAmount || 0) + taxAmount

    const res = await apiFetch(`/orders/${dbId}`, {
      method: 'PUT',
      body: {
        items: updatedItems.map(i => ({
          item_name: i.name || i.item_name,
          quantity: Number(i.quantity),
          unit_price: Number(i.unitPrice || i.price),
          size: i.size || 'Standard',
          milk: i.milk || '',
          sugar: i.sugar || '',
          is_ready: Boolean(i.isReady || i.ready)
        })),
        subtotal,
        discountAmount: order.discountAmount || 0,
        taxAmount,
        totalAmount
      }
    })

    if (res.success) {
      showToast(`Order #${order.id} items updated!`, 'success')
      await fetchOrders()
      selectedOrderForEdit.value = null
      return true
    } else {
      showToast(res.message || 'Failed to update order items', 'error')
      return false
    }
  }

  const filteredOrders = computed(() => {
    if (activeStatusTab.value === 'all') return orders.value
    return orders.value.filter(o => o.status === activeStatusTab.value)
  })

  const pendingCount = computed(() => orders.value.filter(o => o.status === 'pending').length)
  const preparingCount = computed(() => orders.value.filter(o => o.status === 'preparing').length)
  const readyCount = computed(() => orders.value.filter(o => o.status === 'ready').length)
  const completedCount = computed(() => orders.value.filter(o => o.status === 'completed').length)

  async function updateOrderStatus(orderId, newStatus) {
    const order = orders.value.find(o => o.id === orderId || o.dbId === orderId)
    if (order) {
      order.status = newStatus
      if (newStatus === 'ready') {
        order.items.forEach(i => {
          i.ready = true
          i.isReady = true
        })
      }
      await apiFetch(`/orders/${order.dbId || orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      })
      await fetchOrders()
    }
  }

  async function toggleItemReady(orderId, itemIdOrIndex) {
    const order = orders.value.find(o => o.id === orderId || o.dbId === orderId)
    if (order) {
      let item = order.items.find(i => String(i.id) === String(itemIdOrIndex))
      if (!item && order.items[itemIdOrIndex]) {
        item = order.items[itemIdOrIndex]
      }
      if (item) {
        item.ready = !item.ready
        item.isReady = item.ready
        if (item.id) {
          await apiFetch(`/orders/items/${item.id}/ready`, {
            method: 'PATCH',
            body: { ready: item.ready }
          })
        }
        const allReady = order.items.every(i => i.ready || i.isReady)
        if (allReady && order.status === 'preparing') {
          await updateOrderStatus(orderId, 'ready')
        }
      }
    }
  }

  return {
    activeStatusTab,
    orders,
    filteredOrders,
    pendingCount,
    preparingCount,
    readyCount,
    completedCount,
    selectedOrderForDetail,
    selectedOrderForEdit,
    fetchOrders,
    createOrder,
    updateOrderItems,
    updateOrderStatus,
    toggleItemReady
  }
})
