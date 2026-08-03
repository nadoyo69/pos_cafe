import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useDiscountStore = defineStore('discount', () => {
  const promos = ref([])

  async function fetchPromos() {
    const res = await apiFetch('/discounts')
    if (res.success && res.data) {
      promos.value = res.data.map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        type: p.type,
        value: p.value,
        minPurchase: p.min_purchase || 0,
        maxDiscount: p.max_discount || 0,
        validFrom: p.valid_from || '',
        validTo: p.valid_to || '',
        usageLimit: p.usage_limit || 100,
        usageCount: p.usage_count || 0,
        status: p.status || 'active',
        description: p.description || ''
      }))
    }
  }

  onMounted(() => {
    fetchPromos()
  })

  const activePromos = computed(() => promos.value.filter(p => p.status === 'active'))
  const expiredPromos = computed(() => promos.value.filter(p => p.status === 'expired' || p.status === 'inactive'))

  async function addPromo(data) {
    const res = await apiFetch('/discounts', {
      method: 'POST',
      body: {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        min_purchase: data.minPurchase,
        max_discount: data.maxDiscount,
        valid_from: data.validFrom,
        valid_to: data.validTo,
        usage_limit: data.usageLimit
      }
    })

    if (res.success) {
      await fetchPromos()
    }
  }

  async function updatePromo(data) {
    const res = await apiFetch(`/discounts/${data.id}`, {
      method: 'PUT',
      body: {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        min_purchase: data.minPurchase,
        max_discount: data.maxDiscount,
        valid_from: data.validFrom,
        valid_to: data.validTo,
        usage_limit: data.usageLimit
      }
    })

    if (res.success) {
      await fetchPromos()
    }
  }

  async function deletePromo(id) {
    await apiFetch(`/discounts/${id}`, { method: 'DELETE' })
    promos.value = promos.value.filter(p => p.id !== id)
  }

  async function togglePromoStatus(id) {
    const res = await apiFetch(`/discounts/${id}/toggle`, { method: 'PATCH' })
    if (res.success) {
      await fetchPromos()
    }
  }

  return {
    promos,
    activePromos,
    expiredPromos,
    fetchPromos,
    addPromo,
    updatePromo,
    deletePromo,
    togglePromoStatus
  }
})
