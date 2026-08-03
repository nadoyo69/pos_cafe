import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const orderType = ref('Dine-In') // 'Dine-In' | 'Takeaway' | 'Delivery'
  const activeTable = ref('T-04')
  const customerName = ref('Guest Customer')
  const discountPercent = ref(0)
  const isCartDrawerOpen = ref(true)
  const isCheckoutModalOpen = ref(false)
  const isReceiptModalOpen = ref(false)
  const lastPaidReceipt = ref(null)

  function addToCart(product, customization = {}) {
    const size = customization.size || (product.sizes ? product.sizes[0] : null)
    const priceDelta = size ? (size.priceDelta || 0) : 0
    let unitPrice = (product.price || 0) + priceDelta

    if (customization.addons) {
      customization.addons.forEach(a => {
        unitPrice += a.price
      })
    }

    const itemKey = `${product.id}-${size ? size.id : 'std'}-${customization.milk || ''}-${customization.sugar || ''}-${customization.ice || ''}-${(customization.addons || []).map(a=>a.id).sort().join(',')}`

    const existingIndex = items.value.findIndex(i => i.itemKey === itemKey)

    if (existingIndex !== -1) {
      items.value[existingIndex].quantity += (customization.quantity || 1)
    } else {
      items.value.push({
        itemKey,
        id: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        unitPrice,
        price: unitPrice,
        basePrice: product.price,
        size,
        milk: customization.milk || null,
        sugar: customization.sugar || null,
        ice: customization.ice || null,
        addons: customization.addons || [],
        notes: customization.notes || '',
        quantity: customization.quantity || 1
      })
    }
  }

  function removeFromCart(index) {
    items.value.splice(index, 1)
  }

  function updateQuantity(index, delta) {
    const item = items.value[index]
    if (!item) return
    item.quantity += delta
    if (item.quantity <= 0) {
      items.value.splice(index, 1)
    }
  }

  function clearCart() {
    items.value = []
    discountPercent.value = 0
    customerName.value = 'Guest Customer'
  }

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  })

  const discountAmount = computed(() => {
    return Math.round((subtotal.value * discountPercent.value) / 100)
  })

  const subtotalAfterDiscount = computed(() => {
    return Math.max(0, subtotal.value - discountAmount.value)
  })

  const taxAmount = computed(() => {
    return Math.round(subtotalAfterDiscount.value * 0.10) // 10% PB1 tax
  })

  const total = computed(() => {
    return subtotalAfterDiscount.value + taxAmount.value
  })

  async function applyDiscountCode(code) {
    const res = await apiFetch('/discounts/validate', {
      method: 'POST',
      body: { code }
    })

    if (res.success && res.data) {
      if (res.data.type === 'percentage') {
        discountPercent.value = res.data.value
      } else {
        discountPercent.value = Math.min(100, Math.round((res.data.value / subtotal.value) * 100))
      }
      return { success: true, message: `${res.data.name} Applied!` }
    }

    if (code.toUpperCase() === 'CAFE10') {
      discountPercent.value = 10
      return { success: true, message: '10% Member Discount Applied!' }
    } else if (code.toUpperCase() === 'VIP20') {
      discountPercent.value = 20
      return { success: true, message: '20% VIP Discount Applied!' }
    }
    return { success: false, message: 'Invalid or Expired Voucher Code' }
  }

  function processCheckout(paymentDetails = {}) {
    const receiptNumber = 'REC-' + Math.floor(1000 + Math.random() * 9000)
    const timestamp = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

    const receipt = {
      receiptNumber,
      timestamp,
      orderType: orderType.value,
      table: activeTable.value,
      customerName: customerName.value,
      cashierName: 'Sarah Jenkins',
      items: [...items.value],
      subtotal: subtotal.value,
      discountAmount: discountAmount.value,
      taxAmount: taxAmount.value,
      total: total.value,
      paymentMethod: paymentDetails.paymentMethod || paymentDetails.method || 'Cash',
      amountPaid: paymentDetails.amountPaid || total.value,
      changeDue: paymentDetails.changeDue || 0
    }

    lastPaidReceipt.value = receipt
    clearCart()
    return receipt
  }

  async function completeCheckout(paymentDetails) {
    const receipt = processCheckout(paymentDetails)
    isCheckoutModalOpen.value = false
    isReceiptModalOpen.value = true
    return receipt
  }

  return {
    items,
    orderType,
    activeTable,
    customerName,
    discountPercent,
    isCartDrawerOpen,
    isCheckoutModalOpen,
    isReceiptModalOpen,
    lastPaidReceipt,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    applyDiscountCode,
    processCheckout,
    completeCheckout
  }
})
