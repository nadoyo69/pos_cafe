<template>
  <div v-if="orderStore.selectedOrderForDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
              {{ orderStore.selectedOrderForDetail.id }}
            </h3>
            <span 
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
              :class="{
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30': orderStore.selectedOrderForDetail.status === 'pending',
                'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30': orderStore.selectedOrderForDetail.status === 'preparing',
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30': orderStore.selectedOrderForDetail.status === 'ready' || orderStore.selectedOrderForDetail.status === 'completed'
              }"
            >
              {{ orderStore.selectedOrderForDetail.status }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Table: <strong class="text-slate-700 dark:text-slate-200">{{ orderStore.selectedOrderForDetail.tableNo }}</strong> • Customer: <strong class="text-slate-700 dark:text-slate-200">{{ orderStore.selectedOrderForDetail.customerName }}</strong>
          </p>
        </div>

        <button 
          @click="orderStore.selectedOrderForDetail = null" 
          class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- Items List -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items Checklist</h4>
        <div class="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
          <div 
            v-for="item in orderStore.selectedOrderForDetail.items" 
            :key="item.id || item.name"
            class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
          >
            <div class="min-w-0 flex-1 space-y-0.5">
              <h5 class="font-bold text-slate-900 dark:text-white truncate">
                {{ item.quantity }}x {{ item.name }}
              </h5>
              <p class="text-[10px] text-slate-400 font-mono">
                Size: {{ typeof item.size === 'object' ? item.size.name : (item.size || 'Standard') }}
                <span v-if="item.milk"> • {{ item.milk }}</span>
                <span v-if="item.sugar"> • {{ item.sugar }}</span>
              </p>
            </div>

            <span class="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
              Rp {{ ((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Financial Calculation -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
        <div class="flex justify-between text-slate-500">
          <span>Subtotal:</span>
          <span>Rp {{ Number(orderStore.selectedOrderForDetail.subtotal || orderStore.selectedOrderForDetail.totalAmount).toLocaleString('id-ID') }}</span>
        </div>

        <div v-if="orderStore.selectedOrderForDetail.discountAmount > 0" class="flex justify-between text-emerald-500 font-bold">
          <span>Discount Promo:</span>
          <span>-Rp {{ Number(orderStore.selectedOrderForDetail.discountAmount).toLocaleString('id-ID') }}</span>
        </div>

        <div class="flex justify-between text-slate-500">
          <span>Tax (PB1):</span>
          <span>Rp {{ Number(orderStore.selectedOrderForDetail.taxAmount || 0).toLocaleString('id-ID') }}</span>
        </div>

        <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
          <span>TOTAL PAYABLE:</span>
          <span class="text-amber-500">Rp {{ Number(orderStore.selectedOrderForDetail.totalAmount).toLocaleString('id-ID') }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <button 
          @click="openEditModal" 
          class="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span class="material-symbols-outlined text-base">edit</span>
          <span>Edit Order Items</span>
        </button>

        <button 
          @click="orderStore.selectedOrderForDetail = null" 
          class="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()

function openEditModal() {
  const current = orderStore.selectedOrderForDetail
  if (!current) return
  orderStore.selectedOrderForEdit = JSON.parse(JSON.stringify(current))
  orderStore.selectedOrderForDetail = null
}
</script>
