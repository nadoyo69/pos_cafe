<template>
  <div class="min-h-screen w-full relative flex items-center justify-center p-4 bg-slate-950 text-white font-sans overflow-hidden">
    <!-- Hero Background Image -->
    <div class="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2000&q=80" 
        alt="Cafe Interior"
        class="w-full h-full object-cover opacity-30 scale-105 filter blur-xs"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40"></div>
    </div>

    <!-- Staff Login Link Top Right -->
    <router-link 
      to="/login"
      class="absolute top-6 right-6 z-20 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-2 text-white transition-all shadow-lg"
    >
      <span class="material-symbols-outlined text-base">point_of_sale</span>
      <span>Cashier / Staff Portal</span>
    </router-link>

    <!-- Welcome Card -->
    <div class="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel shadow-2xl border border-white/20 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Header with Dynamic Logo & Cafe Name -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30 overflow-hidden p-1">
          <img v-if="reportsStore.systemSettings?.logo" :src="reportsStore.systemSettings.logo" alt="Logo" class="w-full h-full object-contain" />
          <span v-else class="material-symbols-outlined text-3xl">local_cafe</span>
        </div>
        <h1 class="text-2xl font-extrabold tracking-wide uppercase">{{ reportsStore.systemSettings?.cafeName || 'LUMIÈRE CAFE' }}</h1>
        <p class="text-xs text-amber-400 font-semibold tracking-wider uppercase">{{ reportsStore.systemSettings?.tagline || 'Digital Self-Service Menu' }}</p>
        <p class="text-xs text-slate-300">Please enter your name, phone number, and table selection to begin ordering.</p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleStartOrdering" class="space-y-4">
        <!-- Customer Name -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Full Name</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">person</span>
            <input 
              type="text" 
              v-model="name"
              required
              placeholder="e.g., John Doe"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <!-- Phone Number -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Mobile / WhatsApp Number</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">call</span>
            <input 
              type="tel" 
              v-model="phone"
              required
              placeholder="e.g., +62 812-3456-7890"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <!-- Table Selection (Filtered ONLY for Available / Empty Tables) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Select Available Table</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">table_restaurant</span>
            <select 
              v-model="selectedTable"
              required
              class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 appearance-none"
            >
              <option value="" disabled>Select an available table...</option>
              <option 
                v-for="t in availableTables" 
                :key="t.id || t.tableNo" 
                :value="t.tableNo"
              >
                {{ t.tableNo }} (Capacity {{ t.capacity }} Guests)
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-lg pointer-events-none">expand_more</span>
          </div>

          <p v-if="availableTables.length === 0" class="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">info</span> All tables are currently occupied. Please ask staff for assistance.
          </p>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="availableTables.length === 0"
          class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>BROWSE MENU & ORDER NOW</span>
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customer'
import { useTableStore } from '@/stores/table'
import { useReportsStore } from '@/stores/reports'
import { showToast } from '@/utils/swal'

const router = useRouter()
const customerStore = useCustomerStore()
const tableStore = useTableStore()
const reportsStore = useReportsStore()

const name = ref(customerStore.customerInfo.name || '')
const phone = ref(customerStore.customerInfo.phone || '')
const selectedTable = ref('')

const availableTables = computed(() => {
  if (!tableStore.tables || !Array.isArray(tableStore.tables)) return []
  return tableStore.tables.filter(t => t.status === 'available' || t.status === 'empty')
})

onMounted(async () => {
  reportsStore.fetchSettings()
  await tableStore.fetchTables()
  if (availableTables.value.length > 0) {
    selectedTable.value = availableTables.value[0].tableNo
  }
})

function handleStartOrdering() {
  if (!name.value.trim() || !phone.value.trim() || !selectedTable.value) {
    showToast('Please fill in all fields to start ordering', 'warning')
    return
  }

  customerStore.setCustomerSession({
    name: name.value,
    phone: phone.value,
    tableNo: selectedTable.value
  })

  showToast(`Welcome ${name.value}! Table ${selectedTable.value} selected.`, 'success')
  router.push('/customer')
}
</script>
