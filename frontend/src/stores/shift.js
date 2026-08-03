import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useShiftStore = defineStore('shift', () => {
  const currentShift = ref(null)
  const shiftHistory = ref([])

  async function fetchShifts() {
    // Obsolete shifts endpoint disabled per logged-in cashier role tracking
    return { success: true, data: [] }
  }

  const isShiftOpen = computed(() => true)
  const shiftElapsed = computed(() => 'Active Session')

  async function openShift(cashierName, startingCash) {
    return { success: true }
  }

  async function closeShift(countedCash) {
    return { success: true }
  }

  return {
    currentShift,
    shiftHistory,
    isShiftOpen,
    shiftElapsed,
    fetchShifts,
    openShift,
    closeShift
  }
})
