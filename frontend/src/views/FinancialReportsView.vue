<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Financial & Profit Statements</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Real PostgreSQL database P&L summary, revenue by payment channel, COGS, and operating margins
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="financialStore.fetchFinancials()" 
          class="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Financials</span>
        </button>

        <button 
          @click="printFinancialReport"
          class="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">print</span>
          <span>Print P&L Statement</span>
        </button>
      </div>
    </div>

    <!-- Financial KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Gross Revenue -->
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
        <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          Rp {{ financialStore.financialSummary.grossRevenue.toLocaleString('id-ID') }}
        </h3>
        <span class="text-xs font-bold text-emerald-500 flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">trending_up</span> Live PostgreSQL Sales
        </span>
      </div>

      <!-- COGS -->
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost of Goods Sold (COGS)</span>
        <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
          Rp {{ financialStore.financialSummary.costOfGoodsSold.toLocaleString('id-ID') }}
        </h3>
        <span class="text-xs text-slate-400 font-medium">~32% of total sales</span>
      </div>

      <!-- Operating Expenses -->
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Expenses (OpEx)</span>
        <h3 class="text-2xl font-extrabold text-rose-500 font-mono">
          Rp {{ financialStore.financialSummary.operatingExpenses.toLocaleString('id-ID') }}
        </h3>
        <span class="text-xs text-slate-400 font-medium">Rent, Salaries & Utilities</span>
      </div>

      <!-- Net Profit -->
      <div class="p-5 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 space-y-2">
        <span class="text-xs font-bold text-indigo-200 uppercase tracking-wider">Net Operating Profit</span>
        <h3 class="text-2xl font-extrabold font-mono">
          Rp {{ financialStore.netProfit.toLocaleString('id-ID') }}
        </h3>
        <span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md inline-block">
          Net Margin: {{ financialStore.financialSummary.netProfitMargin }}
        </span>
      </div>
    </div>

    <!-- Income Statement & Payment Breakdown Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Income Statement Table (2 Cols) -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 p-6 space-y-4 shadow-sm">
        <h3 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-500">article</span>
          <span>Income & Profit Statement (P&L Summary)</span>
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="p-3">Financial Line Item</th>
                <th class="p-3 text-right">Amount (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50 font-mono">
              <tr 
                v-for="row in financialStore.incomeStatementRows" 
                :key="row.item"
                :class="{
                  'bg-indigo-50/50 dark:bg-indigo-950/40 font-bold': row.type === 'subtotal',
                  'bg-indigo-600 text-white font-extrabold text-sm': row.type === 'highlight'
                }"
              >
                <td class="p-3 font-sans" :class="{ 'pl-6 text-slate-500': row.type === 'cost' || row.type === 'deduction' }">
                  {{ row.item }}
                </td>
                <td class="p-3 text-right font-extrabold">
                  {{ row.amount < 0 ? '-Rp ' + Math.abs(row.amount).toLocaleString('id-ID') : 'Rp ' + row.amount.toLocaleString('id-ID') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Method Breakdown -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 p-6 space-y-4 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-amber-500">pie_chart</span>
            <span>Revenue by Payment Method</span>
          </h3>

          <div class="space-y-3">
            <div 
              v-for="pm in financialStore.paymentBreakdown" 
              :key="pm.method"
              class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs font-bold">
                <span>{{ pm.method }}</span>
                <span class="text-indigo-600 dark:text-indigo-400 font-mono">{{ pm.share }}</span>
              </div>
              <div class="flex justify-between items-baseline text-xs">
                <span class="font-mono font-extrabold text-slate-900 dark:text-white">
                  Rp {{ pm.total.toLocaleString('id-ID') }}
                </span>
                <span class="text-[11px] text-slate-400 font-mono">{{ pm.transactions }} orders</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
          <p class="text-xs text-slate-400">Live payment channels calculated directly from PostgreSQL database.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFinancialStore } from '@/stores/financial'
import { showToast } from '@/utils/swal'

const financialStore = useFinancialStore()

onMounted(() => {
  financialStore.fetchFinancials()
})

function printFinancialReport() {
  showToast('Printing P&L Statement...', 'info')
  window.print()
}
</script>
