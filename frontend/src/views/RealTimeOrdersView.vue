<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header Status Summary -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Status Tabs -->
        <button 
          v-for="tab in [
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'New / Pending', count: orderStore.pendingCount, color: 'bg-amber-500' },
            { id: 'preparing', label: 'In Kitchen', count: orderStore.preparingCount, color: 'bg-indigo-600' },
            { id: 'ready', label: 'Ready to Serve', count: orderStore.readyCount, color: 'bg-emerald-500' },
            { id: 'completed', label: 'Completed', count: orderStore.completedCount }
          ]" 
          :key="tab.id"
          @click="orderStore.activeStatusTab = tab.id"
          class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
          :class="orderStore.activeStatusTab === tab.id 
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md' 
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
        >
          <span>{{ tab.label }}</span>
          <span 
            v-if="tab.count !== undefined" 
            class="px-2 py-0.5 rounded-full text-[10px] text-white font-extrabold"
            :class="tab.color || 'bg-slate-600'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Live Sync Indicator & Manual Refresh Button -->
      <div class="flex items-center gap-2">
        <button 
          @click="orderStore.fetchOrders()" 
          class="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Now</span>
        </button>

        <div class="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/20">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>KDS Live Sync Active</span>
        </div>
      </div>
    </div>

    <!-- Kitchen Display Cards Grid -->
    <div 
      v-if="orderStore.filteredOrders.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <OrderStatusCard 
        v-for="order in orderStore.filteredOrders" 
        :key="order.id"
        :order="order"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="py-20 text-center text-slate-400 space-y-3 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
      <span class="material-symbols-outlined text-5xl text-amber-500">soup_kitchen</span>
      <p class="font-bold text-base text-slate-700 dark:text-slate-200">No active orders in this queue</p>
      <p class="text-xs text-slate-400">New customer and cashier orders will appear automatically in real-time.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import OrderStatusCard from '@/components/orders/OrderStatusCard.vue'

const orderStore = useOrderStore()
let pollTimer = null

onMounted(() => {
  orderStore.fetchOrders()
  // Poll backend every 3 seconds to auto-surface incoming customer orders
  pollTimer = setInterval(() => {
    orderStore.fetchOrders()
  }, 3000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
