<template>
  <div v-if="table" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
    <div class="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-lg shadow-indigo-600/30">
            {{ table.tableNo || table.id }}
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-white">{{ table.name || table.tableNo || table.id }}</h2>
            <p class="text-xs text-slate-400">
              Capacity: {{ table.capacity }} Guests • {{ (table.zone || 'floor-1').toUpperCase() }}
            </p>
          </div>
        </div>

        <button @click="$emit('close')" class="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="my-5 space-y-4 text-xs">
        <!-- Status switcher buttons -->
        <div>
          <label class="block font-bold uppercase tracking-wider text-slate-400 mb-2">Change Table Status</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button 
              v-for="st in ['available', 'occupied', 'reserved', 'cleaning']" 
              :key="st"
              @click="handleStatusChange(st)"
              class="py-2.5 px-3 rounded-2xl border font-bold capitalize transition-all"
              :class="currentStatus === st 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30' 
                : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white'"
            >
              {{ st }}
            </button>
          </div>
        </div>

        <!-- Occupancy Input Form -->
        <div class="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Customer / Party Name</label>
            <input 
              type="text" 
              v-model="inputName" 
              @input="saveNameChange"
              placeholder="e.g. Budi Santoso (Party of 4)"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div v-if="table.currentBillTotal > 0" class="flex justify-between items-center pt-2 border-t border-slate-700/60">
            <span class="font-semibold text-slate-400">Active Order Bill:</span>
            <span class="font-mono font-extrabold text-base text-indigo-400">
              Rp {{ table.currentBillTotal.toLocaleString('id-ID') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-4 border-t border-slate-800 flex gap-3">
        <button 
          @click="openPOSForTable"
          class="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">point_of_sale</span>
          <span>Open POS Order for {{ table.tableNo || table.id }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTableStore } from '@/stores/table'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  table: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const tableStore = useTableStore()
const cartStore = useCartStore()

const inputName = ref('')
const currentStatus = ref('available')

watch(() => props.table, (t) => {
  if (t) {
    inputName.value = t.currentCustomerName || t.customerName || ''
    currentStatus.value = t.status || 'available'
  }
}, { immediate: true })

async function handleStatusChange(status) {
  currentStatus.value = status
  await tableStore.updateTableStatus(props.table.id || props.table.tableNo, status, inputName.value)
}

async function saveNameChange() {
  await tableStore.updateTableStatus(props.table.id || props.table.tableNo, currentStatus.value, inputName.value)
}

async function openPOSForTable() {
  const tableId = props.table.tableNo || props.table.id
  await tableStore.updateTableStatus(tableId, 'occupied', inputName.value || 'Walk-in Customer')
  cartStore.activeTable = tableId
  if (inputName.value) {
    cartStore.customerName = inputName.value
  }
  emit('close')
  router.push('/pos')
}
</script>
