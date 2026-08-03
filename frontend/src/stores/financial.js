import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useFinancialStore = defineStore('financial', () => {
  const dateRange = ref('month') // 'today' | 'week' | 'month' | 'quarter'

  const financialSummary = ref({
    grossRevenue: 0,
    costOfGoodsSold: 0,
    operatingExpenses: 0,
    netTaxCollected: 0,
    netProfitMargin: '0%'
  })

  const paymentBreakdown = ref([])
  const incomeStatementRows = ref([])

  const grossProfit = computed(() => {
    return financialSummary.value.grossRevenue - financialSummary.value.costOfGoodsSold
  })

  const netProfit = computed(() => {
    return grossProfit.value - financialSummary.value.operatingExpenses
  })

  async function fetchFinancials() {
    const res = await apiFetch('/reports/financial')
    if (res.success && res.data) {
      if (res.data.financialSummary) financialSummary.value = res.data.financialSummary
      if (res.data.paymentBreakdown) paymentBreakdown.value = res.data.paymentBreakdown
      if (res.data.incomeStatementRows) incomeStatementRows.value = res.data.incomeStatementRows
    }
  }

  onMounted(() => {
    fetchFinancials()
  })

  return {
    dateRange,
    financialSummary,
    grossProfit,
    netProfit,
    paymentBreakdown,
    incomeStatementRows,
    fetchFinancials
  }
})
