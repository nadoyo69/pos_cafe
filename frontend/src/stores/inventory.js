import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref([])

  async function fetchInventory() {
    const res = await apiFetch('/inventory')
    if (res.success && res.data) {
      items.value = res.data.map(i => ({
        id: i.id,
        code: i.item_code,
        name: i.name,
        category: i.category,
        productId: i.product_id || null,
        productName: i.product_name || 'All Products (General)',
        portionQty: Number(i.portion_qty || 1),
        currentQty: Number(i.current_qty || 0),
        unit: i.unit,
        minThreshold: Number(i.min_threshold || 5),
        lastRestocked: i.last_restocked_at || 'Recently'
      }))
    }
  }

  onMounted(() => {
    fetchInventory()
  })

  const lowStockCount = computed(() => items.value.filter(i => i.currentQty > 0 && i.currentQty <= i.minThreshold).length)
  const inStockCount = computed(() => items.value.filter(i => i.currentQty > i.minThreshold).length)

  async function addItem(data) {
    const res = await apiFetch('/inventory', {
      method: 'POST',
      body: {
        name: data.name,
        category: data.category,
        unit: data.unit,
        current_qty: data.currentQty,
        min_threshold: data.minThreshold,
        product_id: data.productId,
        product_name: data.productName,
        portion_qty: data.portionQty
      }
    })
    if (res.success) {
      await fetchInventory()
    }
  }

  async function updateItem(data) {
    const res = await apiFetch(`/inventory/${data.id}`, {
      method: 'PUT',
      body: {
        name: data.name,
        category: data.category,
        unit: data.unit,
        current_qty: data.currentQty,
        min_threshold: data.minThreshold,
        product_id: data.productId,
        product_name: data.productName,
        portion_qty: data.portionQty
      }
    })
    if (res.success) {
      await fetchInventory()
    }
  }

  async function deleteItem(id) {
    await apiFetch(`/inventory/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(i => i.id !== id)
  }

  async function stockIn(id, qty) {
    const res = await apiFetch(`/inventory/${id}/stock-in`, {
      method: 'POST',
      body: { qty }
    })
    if (res.success) {
      await fetchInventory()
    }
  }

  async function stockOut(id, qty) {
    const res = await apiFetch(`/inventory/${id}/stock-out`, {
      method: 'POST',
      body: { qty }
    })
    if (res.success) {
      await fetchInventory()
    }
  }

  return {
    items,
    lowStockCount,
    inStockCount,
    fetchInventory,
    addItem,
    updateItem,
    deleteItem,
    stockIn,
    stockOut
  }
})
