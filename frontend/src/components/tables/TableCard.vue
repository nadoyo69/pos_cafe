<template>
  <div 
    @click="$emit('select', table)"
    class="p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group"
    :class="[
      table.status === 'occupied' 
        ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-400/50 hover:border-amber-500 shadow-md shadow-amber-500/10' 
        : table.status === 'available'
        ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-400/50 hover:border-emerald-500 shadow-md shadow-emerald-500/10'
        : table.status === 'reserved'
        ? 'bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-400/50 hover:border-indigo-500 shadow-md shadow-indigo-500/10'
        : 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-400/50 hover:border-rose-500 shadow-md shadow-rose-500/10'
    ]"
  >
    <!-- Top Row: Table Name & Capacity -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div 
          class="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs"
          :class="[
            table.status === 'occupied' ? 'bg-amber-500 text-white' :
            table.status === 'available' ? 'bg-emerald-500 text-white' :
            table.status === 'reserved' ? 'bg-indigo-600 text-white' : 'bg-rose-500 text-white'
          ]"
        >
          {{ table.tableNo || table.id }}
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-800 dark:text-slate-100">{{ table.name || table.tableNo || table.id }}</h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ table.capacity }} Seats</p>
        </div>
      </div>

      <!-- Status Pill -->
      <span 
        class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
        :class="[
          table.status === 'occupied' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
          table.status === 'available' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
          table.status === 'reserved' ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30' :
          'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
        ]"
      >
        {{ table.status }}
      </span>
    </div>

    <!-- Middle: Occupancy details -->
    <div v-if="table.status === 'occupied'" class="my-2 space-y-1.5 text-xs border-t border-b border-amber-500/20 py-2.5">
      <div class="flex justify-between text-slate-600 dark:text-slate-300">
        <span class="font-medium">Guest:</span>
        <span class="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">{{ table.customerName || table.currentCustomerName || 'Guest' }}</span>
      </div>
      <div class="flex justify-between text-slate-600 dark:text-slate-300">
        <span class="font-medium">Seated Duration:</span>
        <span class="font-mono text-amber-600 dark:text-amber-400 font-bold">{{ table.seatedTime || 'Recently' }}</span>
      </div>
      <div class="flex justify-between text-slate-600 dark:text-slate-300">
        <span class="font-medium">Active Bill:</span>
        <span class="font-mono font-extrabold text-slate-900 dark:text-white">
          Rp {{ Number(table.currentTotal || table.currentBillTotal || 0).toLocaleString('id-ID') }}
        </span>
      </div>
    </div>

    <div v-else-if="table.status === 'reserved'" class="my-2 p-2 rounded-xl bg-indigo-500/10 text-xs text-indigo-700 dark:text-indigo-300">
      <p class="font-bold truncate">{{ table.customerName || table.currentCustomerName || 'Reserved Group' }}</p>
    </div>

    <div v-else-if="table.status === 'cleaning'" class="my-2 p-2 rounded-xl bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400 font-medium">
      Needs busser cleaning before re-assigning.
    </div>

    <div v-else class="my-4 text-center py-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
      Ready for new guests
    </div>

    <!-- Card Action Footer -->
    <div class="pt-2 flex items-center justify-between text-xs">
      <span class="text-[11px] text-slate-400 font-medium">
        Zone: {{ (table.zone || 'floor-1').toUpperCase() }}
      </span>
      <span class="material-symbols-outlined text-base text-slate-400 group-hover:translate-x-1 transition-transform">
        chevron_right
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  table: {
    type: Object,
    required: true
  }
})

defineEmits(['select'])
</script>
