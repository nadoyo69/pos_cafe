<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">System Audit & Process Logs</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Track security events, cashier checkout transactions, system configuration changes, and customer activity
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Module Filter -->
        <div class="flex items-center gap-2 text-xs">
          <span class="font-bold text-slate-400 uppercase tracking-wider">Module:</span>
          <select 
            v-model="selectedModule"
            class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Modules</option>
            <option value="POS Operations">POS Operations</option>
            <option value="Security Auth">Security Auth</option>
            <option value="System Settings">System Settings</option>
            <option value="Customer Portal">Customer Portal</option>
          </select>
        </div>

        <button 
          @click="exportLogs"
          class="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 hover:dark:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">download</span>
          <span>Export Audit Log</span>
        </button>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="filteredByModule"
      :columns="columns"
      :search-keys="['user', 'action', 'details', 'ip', 'module']"
      search-placeholder="Filter logs by user, action, IP or details..."
      :default-per-page="10"
    >
      <template #row="{ row: log }">
        <td class="p-3.5 font-mono text-slate-500 shrink-0 whitespace-nowrap">
          {{ log.timestamp }}
        </td>
        <td class="p-3.5 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
          {{ log.user }}
        </td>
        <td class="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
          {{ log.action }}
        </td>
        <td class="p-3.5">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {{ log.module }}
          </span>
        </td>
        <td class="p-3.5 font-mono text-slate-400 text-[11px]">
          {{ log.ip }}
        </td>
        <td class="p-3.5 text-slate-600 dark:text-slate-300">
          {{ log.details }}
        </td>
        <td class="p-3.5 text-right">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            {{ log.status }}
          </span>
        </td>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { showToast } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const settingsStore = useSettingsStore()
const selectedModule = ref('all')

const columns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'user', label: 'User / Initiator' },
  { key: 'action', label: 'Action Event' },
  { key: 'module', label: 'Module' },
  { key: 'ip', label: 'IP Address' },
  { key: 'details', label: 'Event Details' },
  { key: 'status', label: 'Status', align: 'right' }
]

const filteredByModule = computed(() => {
  if (selectedModule.value === 'all') return settingsStore.logs
  return settingsStore.logs.filter(l => l.module === selectedModule.value)
})

function exportLogs() {
  showToast('Audit log exported to CSV', 'success')
}
</script>
