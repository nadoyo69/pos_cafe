<template>
  <div class="space-y-4">
    <!-- Top Bar: Search + Per Page + Info -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-base">search</span>
        <input 
          type="text" 
          v-model="searchQuery"
          :placeholder="searchPlaceholder || 'Search records...'"
          class="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-medium"
        />
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div class="flex items-center gap-3 text-xs shrink-0">
        <!-- Per Page Selector -->
        <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <span>Show</span>
          <select 
            v-model.number="perPage"
            class="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="opt in [5, 10, 25, 50]" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <span>entries</span>
        </div>

        <!-- Info Badge -->
        <span class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
          {{ filteredData.length }} of {{ data.length }} records
        </span>
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th 
                v-for="col in columns" 
                :key="col.key"
                @click="col.sortable !== false && toggleSort(col.key)"
                class="p-4 select-none transition-colors"
                :class="[
                  col.sortable !== false ? 'cursor-pointer hover:text-indigo-500' : '',
                  col.align === 'right' ? 'text-right' : '',
                  col.align === 'center' ? 'text-center' : ''
                ]"
              >
                <div class="flex items-center gap-1" :class="{ 'justify-end': col.align === 'right', 'justify-center': col.align === 'center' }">
                  <span>{{ col.label }}</span>
                  <span v-if="col.sortable !== false" class="material-symbols-outlined text-xs">
                    {{ sortKey === col.key ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <tr 
              v-for="(row, idx) in paginatedData" 
              :key="idx"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <slot name="row" :row="row" :index="(currentPage - 1) * perPage + idx" />
            </tr>

            <!-- Empty State -->
            <tr v-if="paginatedData.length === 0">
              <td :colspan="columns.length" class="p-12 text-center text-slate-400">
                <div class="space-y-2">
                  <span class="material-symbols-outlined text-3xl">search_off</span>
                  <p class="font-bold text-sm">No matching records found</p>
                  <p class="text-xs">Try adjusting your search or filter criteria.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom Bar: Pagination -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <!-- Info Text -->
      <p class="text-slate-500 dark:text-slate-400 font-medium">
        Showing {{ startEntry }} to {{ endEntry }} of {{ filteredData.length }} entries
        <span v-if="filteredData.length !== data.length" class="text-slate-400">(filtered from {{ data.length }} total)</span>
      </p>

      <!-- Pagination Buttons -->
      <div class="flex items-center gap-1">
        <button 
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <span class="material-symbols-outlined text-sm">first_page</span>
        </button>

        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <span class="material-symbols-outlined text-sm">chevron_left</span>
        </button>

        <template v-for="page in visiblePages" :key="page">
          <button 
            v-if="page !== '...'"
            @click="currentPage = page"
            class="w-8 h-8 rounded-lg font-extrabold transition-all"
            :class="currentPage === page 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'"
          >
            {{ page }}
          </button>
          <span v-else class="px-1 text-slate-400">…</span>
        </template>

        <button 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <span class="material-symbols-outlined text-sm">chevron_right</span>
        </button>

        <button 
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <span class="material-symbols-outlined text-sm">last_page</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  searchKeys: { type: Array, default: () => [] },
  searchPlaceholder: { type: String, default: '' },
  defaultPerPage: { type: Number, default: 10 }
})

const searchQuery = ref('')
const perPage = ref(props.defaultPerPage)
const currentPage = ref(1)
const sortKey = ref('')
const sortOrder = ref('asc')

// Reset page on search or perPage change
watch([searchQuery, perPage], () => {
  currentPage.value = 1
})

// Filter by search
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return [...props.data]
  const q = searchQuery.value.toLowerCase()
  return props.data.filter(row => {
    if (props.searchKeys.length > 0) {
      return props.searchKeys.some(key => {
        const val = getNestedValue(row, key)
        return val != null && String(val).toLowerCase().includes(q)
      })
    }
    // fallback: search all string values
    return Object.values(row).some(v => v != null && String(v).toLowerCase().includes(q))
  })
})

// Sort
const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value
  return [...filteredData.value].sort((a, b) => {
    const aVal = getNestedValue(a, sortKey.value)
    const bVal = getNestedValue(b, sortKey.value)
    if (aVal == null) return 1
    if (bVal == null) return -1
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    }
    const cmp = String(aVal).localeCompare(String(bVal))
    return sortOrder.value === 'asc' ? cmp : -cmp
  })
})

// Paginate
const totalPages = computed(() => Math.max(1, Math.ceil(sortedData.value.length / perPage.value)))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedData.value.slice(start, start + perPage.value)
})

const startEntry = computed(() => sortedData.value.length === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1)
const endEntry = computed(() => Math.min(currentPage.value * perPage.value, sortedData.value.length))

// Visible page numbers (with ellipsis)
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

function toggleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), obj)
}
</script>
