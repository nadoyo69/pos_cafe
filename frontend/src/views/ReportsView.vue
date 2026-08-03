<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)]">
    <!-- Header with Date Filter -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Admin Overview & Staff Reports</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Real-time PostgreSQL analytics for sales revenue, order velocity, peak table occupancy, and staff performance
        </p>
      </div>

      <!-- Refresh & Time Range Pills -->
      <div class="flex items-center gap-3">
        <button 
          @click="reportsStore.fetchOverview()" 
          class="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Live</span>
        </button>

        <div class="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button 
            v-for="t in ['today', 'week', 'month']" 
            :key="t"
            @click="reportsStore.timeRange = t"
            class="px-3.5 py-1.5 rounded-xl capitalize transition-all"
            :class="reportsStore.timeRange === t 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
          >
            {{ t }}
          </button>
        </div>
      </div>
    </div>

    <!-- Overview Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
          <span class="material-symbols-outlined text-indigo-500">payments</span>
        </div>
        <div class="flex items-baseline justify-between">
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            Rp {{ reportsStore.overviewMetrics.todayRevenue.toLocaleString('id-ID') }}
          </h3>
          <span class="text-xs font-bold text-emerald-500">Live DB</span>
        </div>
      </div>

      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Orders Processed</span>
          <span class="material-symbols-outlined text-amber-500">receipt_long</span>
        </div>
        <div class="flex items-baseline justify-between">
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {{ reportsStore.overviewMetrics.totalOrders }}
          </h3>
          <span class="text-xs font-bold text-emerald-500">Live DB</span>
        </div>
      </div>

      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Avg Ticket Size</span>
          <span class="material-symbols-outlined text-emerald-500">point_of_sale</span>
        </div>
        <div class="flex items-baseline justify-between">
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            Rp {{ reportsStore.overviewMetrics.avgTicketSize.toLocaleString('id-ID') }}
          </h3>
          <span class="text-xs font-bold text-emerald-500">Live DB</span>
        </div>
      </div>

      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Table Occupancy Rate</span>
          <span class="material-symbols-outlined text-rose-500">table_restaurant</span>
        </div>
        <div class="flex items-baseline justify-between">
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {{ reportsStore.overviewMetrics.tableOccupancy }}
          </h3>
          <span class="text-xs font-bold text-emerald-500">Live DB</span>
        </div>
      </div>
    </div>

    <!-- Staff Performance Leaderboard -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-500">emoji_events</span>
            <span>Staff Sales Leaderboard & Performance</span>
          </h3>
          <p class="text-xs text-slate-400">Cashier total sales volume, processed orders, and customer satisfaction rating</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="p-3.5">Staff Member</th>
              <th class="p-3.5">Role</th>
              <th class="p-3.5">Total Sales</th>
              <th class="p-3.5">Orders Processed</th>
              <th class="p-3.5">Avg Prep Speed</th>
              <th class="p-3.5">Customer Rating</th>
              <th class="p-3.5 text-right">Award Badge</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <tr v-for="staff in reportsStore.staffPerformance" :key="staff.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
              <td class="p-3.5">
                <div class="flex items-center gap-3">
                  <img :src="staff.avatar" :alt="staff.name" class="w-10 h-10 rounded-xl object-cover" />
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ staff.name }}</span>
                </div>
              </td>
              <td class="p-3.5 text-slate-500 font-medium">{{ staff.role }}</td>
              <td class="p-3.5 font-mono font-extrabold text-slate-900 dark:text-white">
                Rp {{ staff.totalSales.toLocaleString('id-ID') }}
              </td>
              <td class="p-3.5 font-mono font-bold">{{ staff.ordersProcessed }} orders</td>
              <td class="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{{ staff.avgSpeedSec }}s / order</td>
              <td class="p-3.5">
                <span class="font-bold text-amber-500 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm fill-1">star</span>
                  <span>{{ staff.customerRating }}</span>
                </span>
              </td>
              <td class="p-3.5 text-right">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {{ staff.badge }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top Selling Items Table -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 space-y-4">
      <h3 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-indigo-500">trending_up</span>
        <span>Top Selling Items (Real Database Sales)</span>
      </h3>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="p-3.5">Item Name</th>
              <th class="p-3.5">Category</th>
              <th class="p-3.5">Units Sold</th>
              <th class="p-3.5 text-right">Total Revenue Generated</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <tr v-for="item in reportsStore.topSellingItems" :key="item.name" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
              <td class="p-3.5 font-bold text-slate-800 dark:text-slate-100">{{ item.name }}</td>
              <td class="p-3.5 text-slate-500">{{ item.category }}</td>
              <td class="p-3.5 font-mono font-bold">{{ item.unitsSold }} units</td>
              <td class="p-3.5 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                Rp {{ item.revenue.toLocaleString('id-ID') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReportsStore } from '@/stores/reports'

const reportsStore = useReportsStore()

onMounted(() => {
  reportsStore.fetchOverview()
})
</script>
