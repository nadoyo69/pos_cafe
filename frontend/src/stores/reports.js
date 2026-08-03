import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useReportsStore = defineStore('reports', () => {
  const timeRange = ref('today') // 'today' | 'week' | 'month'

  const overviewMetrics = ref({
    todayRevenue: 4850000,
    revenueGrowth: '+14.8%',
    totalOrders: 142,
    ordersGrowth: '+8.2%',
    avgTicketSize: 34150,
    ticketGrowth: '+5.4%',
    tableOccupancy: '78%',
    occupancyGrowth: '+12%'
  })

  const staffPerformance = ref([
    {
      id: 'st-1',
      name: 'Sarah Jenkins',
      role: 'Senior Cashier',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      totalSales: 2150000,
      ordersProcessed: 64,
      avgSpeedSec: 85,
      customerRating: 4.9,
      badge: 'Top Performer'
    },
    {
      id: 'st-2',
      name: 'Kevin Maulana',
      role: 'Barista & Cashier',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      totalSales: 1680000,
      ordersProcessed: 48,
      avgSpeedSec: 92,
      customerRating: 4.8,
      badge: 'Speed Demon'
    }
  ])

  const topSellingItems = ref([
    { name: 'Caramel Macchiato Grand', category: 'Coffee', unitsSold: 54, revenue: 2052000 },
    { name: 'Iced Spanish Latte', category: 'Coffee', unitsSold: 42, revenue: 1512000 },
    { name: 'Artisan Butter Croissant', category: 'Food', unitsSold: 38, revenue: 1064000 }
  ])

  const systemSettings = ref({
    cafeName: 'Lumière Artisanal Cafe',
    tagline: 'Specialty Coffee & European Bakery',
    address: 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
    phone: '+62 811-9876-5432',
    email: 'hello@lumierecafe.id',
    logo: '',
    taxRatePercent: 10,
    serviceChargePercent: 5,
    currencySymbol: 'Rp',
    autoPrintReceipt: true,
    enableKDS: true,
    soundAlerts: true
  })

  async function fetchOverview() {
    const res = await apiFetch('/reports/overview')
    if (res.success && res.data) {
      if (res.data.todayRevenue !== undefined) overviewMetrics.value.todayRevenue = res.data.todayRevenue
      if (res.data.totalOrders !== undefined) overviewMetrics.value.totalOrders = res.data.totalOrders
      if (res.data.avgTicketSize !== undefined) overviewMetrics.value.avgTicketSize = res.data.avgTicketSize
      if (res.data.topSellingItems && res.data.topSellingItems.length > 0) {
        topSellingItems.value = res.data.topSellingItems
      }
    }
  }

  async function fetchSettings() {
    const res = await apiFetch('/settings/preferences')
    if (res.success && res.data) {
      systemSettings.value = { ...systemSettings.value, ...res.data }
    }
  }

  async function updateSettings(newSettings) {
    systemSettings.value = { ...systemSettings.value, ...newSettings }
    await apiFetch('/settings/preferences', {
      method: 'PUT',
      body: newSettings
    })
    await fetchSettings()
  }

  onMounted(() => {
    fetchSettings()
    fetchOverview()
  })

  return {
    timeRange,
    overviewMetrics,
    staffPerformance,
    topSellingItems,
    systemSettings,
    fetchOverview,
    fetchSettings,
    updateSettings
  }
})
