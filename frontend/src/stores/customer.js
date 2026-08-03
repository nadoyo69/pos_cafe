import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useOrderStore } from './order'

export const useCustomerStore = defineStore('customer', () => {
  const orderStore = useOrderStore()
  const customerInfo = ref(JSON.parse(localStorage.getItem('cafe_customer_info')) || { name: 'Guest Customer', tableNo: 'T-01', phone: '' })

  const activeOrders = computed(() => {
    if (!customerInfo.value || !customerInfo.value.tableNo) return []
    return orderStore.orders.filter(o => o.tableNo === customerInfo.value.tableNo)
  })

  function registerCustomer(data) {
    customerInfo.value = {
      name: data.name || 'Guest Customer',
      phone: data.phone || '',
      tableNo: data.tableNo || 'T-01',
      registeredAt: new Date().toISOString()
    }
    localStorage.setItem('cafe_customer_info', JSON.stringify(customerInfo.value))
    orderStore.fetchOrders()
  }

  function clearCustomer() {
    customerInfo.value = { name: 'Guest Customer', tableNo: 'T-01', phone: '' }
    localStorage.removeItem('cafe_customer_info')
  }

  const setCustomerSession = registerCustomer
  const clearCustomerSession = clearCustomer

  function addOrder() {
    orderStore.fetchOrders()
  }

  return {
    customerInfo,
    activeOrders,
    registerCustomer,
    setCustomerSession,
    clearCustomer,
    clearCustomerSession,
    addOrder
  }
})
