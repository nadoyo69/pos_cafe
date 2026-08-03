<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    
    <!-- Floor Zones Header & Quick Action -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Floor Plan & Table Occupancy</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Real-time table seating map, guest bill tracking & active table assignments
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Manage Tables CRUD Button -->
        <router-link 
          to="/settings/tables"
          class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">tune</span>
          <span>Manage Tables (CRUD)</span>
        </router-link>
      </div>
    </div>

    <!-- Metrics Cards Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      <div 
        @click="tableStore.activeStatusFilter = 'all'"
        class="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs cursor-pointer transition-all hover:scale-102"
        :class="{ 'ring-2 ring-indigo-500': tableStore.activeStatusFilter === 'all' }"
      >
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tables</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{{ tableStore.stats.total }}</span>
          <span class="text-xs font-bold text-indigo-500">100%</span>
        </div>
      </div>

      <div 
        @click="tableStore.activeStatusFilter = 'occupied'"
        class="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs cursor-pointer transition-all hover:scale-102"
        :class="{ 'ring-2 ring-emerald-500': tableStore.activeStatusFilter === 'occupied' }"
      >
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Occupied</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{{ tableStore.stats.occupied }}</span>
          <span class="text-xs font-bold text-emerald-500">{{ tableStore.stats.occupancyRate }}%</span>
        </div>
      </div>

      <div 
        @click="tableStore.activeStatusFilter = 'available'"
        class="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs cursor-pointer transition-all hover:scale-102"
        :class="{ 'ring-2 ring-blue-500': tableStore.activeStatusFilter === 'available' }"
      >
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{{ tableStore.stats.available }}</span>
          <span class="text-xs font-bold text-blue-500">Ready</span>
        </div>
      </div>

      <div 
        @click="tableStore.activeStatusFilter = 'reserved'"
        class="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs cursor-pointer transition-all hover:scale-102"
        :class="{ 'ring-2 ring-amber-500': tableStore.activeStatusFilter === 'reserved' }"
      >
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reserved</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{{ tableStore.stats.reserved }}</span>
          <span class="text-xs font-bold text-amber-500">Booked</span>
        </div>
      </div>

      <div 
        @click="tableStore.activeStatusFilter = 'cleaning'"
        class="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs cursor-pointer transition-all hover:scale-102 col-span-2 sm:col-span-1"
        :class="{ 'ring-2 ring-slate-500': tableStore.activeStatusFilter === 'cleaning' }"
      >
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cleaning</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl font-extrabold text-slate-600 dark:text-slate-400 font-mono">{{ tableStore.stats.cleaning }}</span>
          <span class="text-xs font-bold text-slate-400">Dirty</span>
        </div>
      </div>
    </div>

    <!-- Zone Tabs & Legend Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <!-- Zone Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
        <button 
          v-for="zone in tableStore.zones" 
          :key="zone.id"
          @click="tableStore.activeZone = zone.id"
          class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all"
          :class="tableStore.activeZone === zone.id 
            ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-md' 
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'"
        >
          {{ zone.name }}
        </button>
      </div>

      <!-- Status Legend -->
      <div class="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Occupied</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span> Available</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500"></span> Reserved</span>
      </div>
    </div>

    <!-- Floor Plan Map Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <TableCard 
        v-for="table in tableStore.filteredTables" 
        :key="table.id"
        :table="table"
        @select="tableStore.selectTable"
      />
    </div>

    <!-- Table Action Drawer / Modal -->
    <TableDetailModal 
      :table="tableStore.selectedTable"
      @close="tableStore.selectedTable = null"
      @update-status="tableStore.updateTableStatus"
    />
  </div>
</template>

<script setup>
import { useTableStore } from '@/stores/table'
import TableCard from '@/components/tables/TableCard.vue'
import TableDetailModal from '@/components/tables/TableDetailModal.vue'

const tableStore = useTableStore()
</script>
