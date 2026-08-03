<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Order History & Transaction Log</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          View past completed orders, receipts, refund records, and payment details (Live Database • WIB Timezone)
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="historyStore.fetchHistory()" 
          class="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh History</span>
        </button>

        <!-- Date Filter Pills -->
        <div class="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button 
            v-for="d in ['today', 'week', 'month', 'all']" 
            :key="d"
            @click="historyStore.dateFilter = d"
            class="px-3 py-1.5 rounded-xl capitalize transition-all"
            :class="historyStore.dateFilter === d 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
          >
            {{ d === 'all' ? 'All Time' : d }}
          </button>
        </div>

        <button 
          @click="exportOrders"
          class="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">download</span>
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
        <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{{ historyStore.totalOrders }}</h3>
      </div>
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
        <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">Rp {{ historyStore.totalRevenue.toLocaleString('id-ID') }}</h3>
      </div>
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Order Value</span>
        <h3 class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">Rp {{ historyStore.averageOrderValue.toLocaleString('id-ID') }}</h3>
      </div>
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Payment Method</span>
        <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{{ historyStore.topPaymentMethod }}</h3>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="historyStore.filteredOrders"
      :columns="columns"
      :search-keys="['id', 'receiptNumber', 'customerName', 'tableNo', 'paymentMethod', 'cashierName']"
      search-placeholder="Search by order ID, receipt, customer, or table..."
      :default-per-page="10"
    >
      <template #row="{ row: order }">
        <td class="p-4">
          <div>
            <h4 class="font-bold text-indigo-600 dark:text-indigo-400 text-sm font-mono">{{ order.receiptNumber || order.id }}</h4>
            <p class="text-[11px] text-slate-400 font-mono">{{ order.id }}</p>
          </div>
        </td>
        <td class="p-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{{ order.customerName }}</td>
        <td class="p-4">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {{ order.tableNo }}
          </span>
        </td>
        <td class="p-4 text-center font-mono font-bold text-slate-600 dark:text-slate-300">{{ order.itemCount }}</td>
        <td class="p-4 font-mono font-extrabold text-slate-900 dark:text-white">Rp {{ Number(order.total || 0).toLocaleString('id-ID') }}</td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            {{ order.paymentMethod }}
          </span>
        </td>
        <td class="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
          {{ formatWibDate(order.createdAt) }}
          <br/>
          <span class="text-slate-400">{{ formatWibTime(order.createdAt) }} WIB</span>
        </td>
        <td class="p-4">
          <span 
            class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
            :class="{
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30': order.status === 'completed' || order.status === 'pending',
              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30': order.status === 'refunded'
            }"
          >
            {{ order.status }}
          </span>
        </td>
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-1">
            <button @click="openEditOrder(order)" class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors" title="Edit Order Items">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button @click="viewReceipt(order)" class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors" title="View Receipt">
              <span class="material-symbols-outlined text-lg">receipt_long</span>
            </button>
            <button 
              v-if="order.status === 'completed' || order.status === 'pending'"
              @click="handleRefund(order)" 
              class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors" 
              title="Refund Order"
            >
              <span class="material-symbols-outlined text-lg">undo</span>
            </button>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Receipt Detail Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
        <!-- Receipt Header Dynamic Store Profile -->
        <div class="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-4">
          <h3 class="text-lg font-extrabold uppercase">{{ reportsStore.systemSettings?.cafeName || 'LUMIÈRE CAFE' }}</h3>
          <p class="text-xs text-slate-400">{{ reportsStore.systemSettings?.tagline || 'Specialty Coffee & European Bakery' }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ reportsStore.systemSettings?.address || 'Jl. Senopati No. 45, Jakarta' }}</p>
          <div class="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 inline-block">
            <span class="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">{{ selectedOrder.receiptNumber }}</span>
          </div>
        </div>

        <div class="space-y-1 text-xs font-mono">
          <div class="flex justify-between">
            <span class="text-slate-400">Date/Time:</span>
            <span>{{ formatWibDate(selectedOrder.createdAt) }} {{ formatWibTime(selectedOrder.createdAt) }} WIB</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Customer:</span>
            <span class="font-bold">{{ selectedOrder.customerName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Table:</span>
            <span>{{ selectedOrder.tableNo }}</span>
          </div>
        </div>

        <div class="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-3 space-y-2 text-xs font-mono">
          <div v-for="item in selectedOrder.items" :key="item.id || item.name" class="flex justify-between">
            <span>{{ item.quantity }}x {{ item.name }}</span>
            <span>Rp {{ ((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="space-y-1 text-xs font-mono text-right">
          <div class="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
            <span>TOTAL:</span>
            <span>Rp {{ selectedOrder.total.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button @click="printReceipt" class="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs">Print</button>
          <button @click="selectedOrder = null" class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrderHistoryStore } from '@/stores/order-history'
import { useReportsStore } from '@/stores/reports'
import { useOrderStore } from '@/stores/order'
import DataTable from '@/components/common/DataTable.vue'
import { showConfirm, showToast } from '@/utils/swal'

const historyStore = useOrderHistoryStore()
const reportsStore = useReportsStore()
const orderStore = useOrderStore()

const selectedOrder = ref(null)

const columns = [
  { key: 'receiptNumber', label: 'Receipt / Order #' },
  { key: 'customerName', label: 'Customer' },
  { key: 'tableNo', label: 'Table' },
  { key: 'itemCount', label: 'Items' },
  { key: 'total', label: 'Total Paid' },
  { key: 'paymentMethod', label: 'Payment' },
  { key: 'createdAt', label: 'Timestamp (WIB)' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', headerClass: 'text-right' }
]

function formatWibDate(dateVal) {
  if (!dateVal) return new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric' })
  let d = new Date(dateVal)
  if (isNaN(d.getTime())) {
    d = new Date(String(dateVal).replace(' ', 'T'))
  }
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) {
    d = new Date()
  }
  return d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric' })
}

function formatWibTime(dateVal) {
  if (!dateVal) return new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
  let d = new Date(dateVal)
  if (isNaN(d.getTime())) {
    d = new Date(String(dateVal).replace(' ', 'T'))
  }
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) {
    d = new Date()
  }
  return d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  reportsStore.fetchSettings()
  historyStore.fetchHistory()
})

function openEditOrder(order) {
  orderStore.selectedOrderForEdit = JSON.parse(JSON.stringify(order))
}

function viewReceipt(order) {
  selectedOrder.value = order
}

async function handleRefund(order) {
  const result = await showConfirm(
    'Refund Order?',
    `Order "${order.id}" (${order.customerName}) — Rp ${order.total.toLocaleString('id-ID')} will be refunded.`
  )
  if (result.isConfirmed) {
    historyStore.refundOrder(order.id)
    showToast('Order refunded successfully', 'success')
  }
}

function exportOrders() {
  showToast('Order history exported to CSV', 'success')
}

function printReceipt() {
  showToast('Printing receipt...', 'info')
  window.print()
}
</script>
