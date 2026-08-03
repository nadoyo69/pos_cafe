<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Table & Floor Management (CRUD Tables)</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Add new dining tables, edit seat capacity, assign floor zones, or delete obsolete seating
        </p>
      </div>

      <div class="flex items-center gap-3">
        <router-link 
          to="/tables"
          class="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">grid_view</span>
          <span>View Table Map Floor Plan</span>
        </router-link>

        <button 
          @click="openAddModal"
          class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">add_circle</span>
          <span>Add New Table</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dining Tables</span>
        <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {{ tableStore.stats.total }} Tables
        </h3>
      </div>

      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Currently Occupied</span>
        <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
          {{ tableStore.stats.occupied }} Active ({{ tableStore.stats.occupancyRate }}%)
        </h3>
      </div>

      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Guest Capacity</span>
        <h3 class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
          {{ totalCapacity }} Seats
        </h3>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="tableStore.tables"
      :columns="columns"
      :search-keys="['id', 'name', 'zone', 'status', 'shape']"
      search-placeholder="Search tables by name, zone or status..."
      :default-per-page="10"
    >
      <template #row="{ row: t }">
        <td class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-sm font-mono">
              {{ t.id }}
            </div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ t.name }}</h4>
              <p class="text-[11px] text-slate-400">ID Code: {{ t.id }}</p>
            </div>
          </div>
        </td>

        <td class="p-4">
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {{ getZoneName(t.zone) }}
          </span>
        </td>

        <td class="p-4 font-mono font-extrabold text-slate-800 dark:text-slate-200">
          <span class="material-symbols-outlined text-sm align-middle text-slate-400 mr-1">group</span>
          <span>{{ t.capacity }} Guests</span>
        </td>

        <td class="p-4 capitalize font-semibold text-slate-600 dark:text-slate-300">
          {{ t.shape.replace('-', ' ') }}
        </td>

        <td class="p-4">
          <span 
            class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
            :class="{
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30': t.status === 'available',
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30': t.status === 'occupied',
              'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30': t.status === 'reserved',
              'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/30': t.status === 'cleaning'
            }"
          >
            {{ t.status }}
          </span>
        </td>

        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-1">
            <button 
              @click="openEditModal(t)"
              class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              title="Edit Table"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>

            <button 
              @click="handleDeleteTable(t)"
              class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Table"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Table Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">
            {{ isEditing ? 'Edit Dining Table' : 'Add New Dining Table' }}
          </h3>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="saveTable" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Table ID / Number Code</label>
            <input 
              type="text" 
              v-model="form.id"
              :disabled="isEditing"
              required
              placeholder="e.g., T-09 or V-02"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Table Display Name</label>
            <input 
              type="text" 
              v-model="form.name"
              required
              placeholder="e.g., Table 09 or VIP Suite 02"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Floor Zone / Location</label>
            <select 
              v-model="form.zone"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="floor-1">Main Hall (Floor 1)</option>
              <option value="terrace">Outdoor Garden Terrace</option>
              <option value="floor-2">VIP & Lounge (Floor 2)</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Guest Seats</label>
              <input 
                type="number" 
                v-model.number="form.capacity"
                min="1"
                max="20"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Table Shape</label>
              <select 
                v-model="form.shape"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="round">Round Table</option>
                <option value="rectangle">Square / Rectangle</option>
                <option value="large-rect">Large Executive</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button 
              type="button" 
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>

            <button 
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30"
            >
              Save Table
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTableStore } from '@/stores/table'
import { showToast, showConfirm } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const tableStore = useTableStore()

const isModalOpen = ref(false)
const isEditing = ref(false)

const columns = [
  { key: 'name', label: 'Table Number' },
  { key: 'zone', label: 'Floor Zone / Location' },
  { key: 'capacity', label: 'Seat Capacity' },
  { key: 'shape', label: 'Table Shape' },
  { key: 'status', label: 'Current Status' },
  { key: 'actions', label: 'Actions', sortable: false, align: 'right' }
]

const form = ref({
  id: '',
  name: '',
  zone: 'floor-1',
  capacity: 4,
  shape: 'rectangle'
})

const totalCapacity = computed(() => {
  return tableStore.tables.reduce((sum, t) => sum + t.capacity, 0)
})

function getZoneName(zId) {
  const z = tableStore.zones.find(z => z.id === zId)
  return z ? z.name : zId
}

function openAddModal() {
  isEditing.value = false
  const nextId = 'T-' + String(tableStore.tables.length + 1).padStart(2, '0')
  form.value = { id: nextId, name: `Table ${nextId}`, zone: 'floor-1', capacity: 4, shape: 'rectangle' }
  isModalOpen.value = true
}

function openEditModal(t) {
  isEditing.value = true
  form.value = { ...t }
  isModalOpen.value = true
}

function saveTable() {
  if (isEditing.value) {
    tableStore.updateTable(form.value)
    showToast('Table details updated successfully', 'success')
  } else {
    tableStore.addTable(form.value)
    showToast('New table added to layout', 'success')
  }
  isModalOpen.value = false
}

async function handleDeleteTable(table) {
  const result = await showConfirm(
    'Delete Table?',
    `Table "${table.name}" (${table.id}) will be removed from floor plan.`
  )
  if (result.isConfirmed) {
    tableStore.deleteTable(table.id)
    showToast('Table deleted successfully', 'success')
  }
}
</script>
