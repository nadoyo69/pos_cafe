<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Shift & Cash Drawer Management</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Open/close cashier shifts, count cash drawers, and review shift reconciliation history
        </p>
      </div>

      <button 
        v-if="!shiftStore.isShiftOpen"
        @click="isOpenShiftModal = true"
        class="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
      >
        <span class="material-symbols-outlined text-lg">play_circle</span>
        <span>Open New Shift</span>
      </button>

      <button 
        v-else
        @click="isCloseShiftModal = true"
        class="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all animate-pulse"
      >
        <span class="material-symbols-outlined text-lg">stop_circle</span>
        <span>Close Current Shift</span>
      </button>
    </div>

    <!-- Active Shift Banner -->
    <div v-if="shiftStore.isShiftOpen" class="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/20 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <h3 class="font-extrabold text-lg">Active Shift — {{ shiftStore.currentShift.id }}</h3>
            <p class="text-sm text-indigo-200">{{ shiftStore.currentShift.cashierName }}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-extrabold font-mono">{{ shiftStore.shiftElapsed }}</div>
          <p class="text-xs text-indigo-200">Elapsed Time</p>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
          <span class="text-xs text-indigo-200">Starting Cash</span>
          <p class="font-extrabold font-mono text-lg">Rp {{ shiftStore.currentShift.startingCash.toLocaleString('id-ID') }}</p>
        </div>
        <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
          <span class="text-xs text-indigo-200">Total Sales</span>
          <p class="font-extrabold font-mono text-lg">Rp {{ shiftStore.currentShift.totalSales.toLocaleString('id-ID') }}</p>
        </div>
        <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
          <span class="text-xs text-indigo-200">Total Orders</span>
          <p class="font-extrabold font-mono text-lg">{{ shiftStore.currentShift.totalOrders }}</p>
        </div>
        <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
          <span class="text-xs text-indigo-200">Started At</span>
          <p class="font-extrabold font-mono text-sm">{{ new Date(shiftStore.currentShift.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}</p>
        </div>
      </div>
    </div>

    <!-- No Active Shift -->
    <div v-else class="p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
      <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">lock_clock</span>
      <h3 class="font-bold text-base text-slate-700 dark:text-slate-300">No Active Shift</h3>
      <p class="text-xs text-slate-400">Open a new shift to start accepting orders and tracking cash flow.</p>
    </div>

    <!-- Shift History DataTable -->
    <div class="space-y-3">
      <h3 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-indigo-500">history</span>
        Past Shift History
      </h3>

      <DataTable
        :data="shiftStore.shiftHistory"
        :columns="columns"
        :search-keys="['id', 'cashierName']"
        search-placeholder="Search by shift ID or cashier name..."
        :default-per-page="10"
      >
        <template #row="{ row: shift }">
          <td class="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ shift.id }}</td>
          <td class="p-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{{ shift.cashierName }}</td>
          <td class="p-4 text-[11px] text-slate-500 font-mono whitespace-nowrap">
            {{ new Date(shift.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
            {{ new Date(shift.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
            — {{ new Date(shift.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
          </td>
          <td class="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">{{ shift.duration }}</td>
          <td class="p-4 font-mono font-bold text-slate-600 dark:text-slate-300 text-center">{{ shift.totalOrders }}</td>
          <td class="p-4 font-mono font-extrabold text-slate-900 dark:text-white">Rp {{ shift.totalSales.toLocaleString('id-ID') }}</td>
          <td class="p-4 font-mono font-bold text-slate-600 dark:text-slate-300">Rp {{ shift.countedCash.toLocaleString('id-ID') }}</td>
          <td class="p-4">
            <span 
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono"
              :class="{
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30': shift.discrepancy === 0,
                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30': shift.discrepancy < 0,
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30': shift.discrepancy > 0
              }"
            >
              {{ shift.discrepancy === 0 ? 'Exact' : (shift.discrepancy > 0 ? '+' : '') + 'Rp ' + shift.discrepancy.toLocaleString('id-ID') }}
            </span>
          </td>
        </template>
      </DataTable>
    </div>

    <!-- Open Shift Modal -->
    <div v-if="isOpenShiftModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">Open New Shift</h3>
          <button @click="isOpenShiftModal = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="handleOpenShift" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Cashier Name</label>
            <input type="text" v-model="openForm.cashierName" required placeholder="e.g. Sarah Jenkins" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Starting Cash Amount (Rp)</label>
            <input type="number" v-model.number="openForm.startingCash" required min="0" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" @click="isOpenShiftModal = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">play_circle</span>
              Start Shift
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Close Shift Modal -->
    <div v-if="isCloseShiftModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">Close Shift & Cash Reconciliation</h3>
          <button @click="isCloseShiftModal = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <div class="flex justify-between"><span class="text-slate-400">Shift ID:</span><span class="font-bold font-mono">{{ shiftStore.currentShift?.id }}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Elapsed:</span><span class="font-bold font-mono">{{ shiftStore.shiftElapsed }}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Starting Cash:</span><span class="font-bold font-mono">Rp {{ shiftStore.currentShift?.startingCash.toLocaleString('id-ID') }}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Cash Sales:</span><span class="font-bold font-mono">Rp {{ shiftStore.currentShift?.totalCashSales.toLocaleString('id-ID') }}</span></div>
          <div class="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold"><span>Expected Cash:</span><span class="font-mono text-indigo-600 dark:text-indigo-400">Rp {{ expectedCash.toLocaleString('id-ID') }}</span></div>
        </div>

        <form @submit.prevent="handleCloseShift" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Counted Cash in Drawer (Rp)</label>
            <input type="number" v-model.number="closeForm.countedCash" required min="0" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div v-if="closeForm.countedCash > 0" class="p-3 rounded-xl text-xs font-bold" :class="discrepancy === 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : discrepancy > 0 ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'">
            Discrepancy: {{ discrepancy === 0 ? 'Exact Match ✓' : (discrepancy > 0 ? '+' : '') + 'Rp ' + discrepancy.toLocaleString('id-ID') }}
          </div>

          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" @click="isCloseShiftModal = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">stop_circle</span>
              Close Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useShiftStore } from '@/stores/shift'
import { showToast } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const shiftStore = useShiftStore()

const isOpenShiftModal = ref(false)
const isCloseShiftModal = ref(false)

const columns = [
  { key: 'id', label: 'Shift ID' },
  { key: 'cashierName', label: 'Cashier' },
  { key: 'startTime', label: 'Time Period' },
  { key: 'duration', label: 'Duration' },
  { key: 'totalOrders', label: 'Orders', align: 'center' },
  { key: 'totalSales', label: 'Total Sales' },
  { key: 'countedCash', label: 'Cash Counted' },
  { key: 'discrepancy', label: 'Discrepancy' }
]

const openForm = ref({ cashierName: '', startingCash: 500000 })
const closeForm = ref({ countedCash: 0 })

const expectedCash = computed(() => {
  if (!shiftStore.currentShift) return 0
  return shiftStore.currentShift.startingCash + shiftStore.currentShift.totalCashSales
})

const discrepancy = computed(() => {
  return closeForm.value.countedCash - expectedCash.value
})

function handleOpenShift() {
  shiftStore.openShift(openForm.value.cashierName, openForm.value.startingCash)
  showToast('Shift opened successfully — good luck today!', 'success')
  isOpenShiftModal.value = false
  openForm.value = { cashierName: '', startingCash: 500000 }
}

function handleCloseShift() {
  const result = shiftStore.closeShift(closeForm.value.countedCash)
  if (result) {
    const msg = result.discrepancy === 0 
      ? 'Shift closed — cash drawer balanced perfectly!' 
      : `Shift closed — discrepancy: Rp ${result.discrepancy.toLocaleString('id-ID')}`
    showToast(msg, result.discrepancy === 0 ? 'success' : 'warning')
  }
  isCloseShiftModal.value = false
  closeForm.value = { countedCash: 0 }
}
</script>
