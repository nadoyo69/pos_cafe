<template>
  <div v-if="cartStore.isReceiptModalOpen && receipt" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Receipt Printable Container -->
      <div id="receipt-print-area" class="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-4 overflow-y-auto">
        <!-- Receipt Header -->
        <div class="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
          <h2 class="font-extrabold text-base tracking-wider font-sans uppercase">{{ reportsStore.systemSettings?.cafeName || 'LUMIÈRE ARTISANAL CAFE' }}</h2>
          <p class="text-[10px] text-slate-500">{{ reportsStore.systemSettings?.tagline || 'Specialty Coffee & European Bakery' }}</p>
          <p class="text-[10px] text-slate-500">{{ reportsStore.systemSettings?.address || 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta' }}</p>
          <p class="text-[10px] text-slate-500">Tel: {{ reportsStore.systemSettings?.phone || '+62 811-9876-5432' }}</p>
        </div>

        <!-- Meta Details -->
        <div class="space-y-1 text-[11px]">
          <div class="flex justify-between">
            <span class="text-slate-500">Invoice:</span>
            <span class="font-bold">{{ receipt.receiptNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Date/Time:</span>
            <span>{{ receipt.timestamp }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Table:</span>
            <span class="font-bold">{{ receipt.table }} ({{ receipt.orderType }})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Cashier:</span>
            <span>{{ receipt.cashierName }}</span>
          </div>
        </div>

        <!-- Items Table -->
        <div class="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-3 space-y-2">
          <div 
            v-for="item in receipt.items" 
            :key="item.id || item.name" 
            class="space-y-0.5"
          >
            <div class="flex justify-between font-bold">
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <span>Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}</span>
            </div>
            <div v-if="item.size || item.milk || item.sugar" class="text-[10px] text-slate-400 pl-4">
              <span v-if="item.size">Size: {{ item.size.name || item.size }} </span>
              <span v-if="item.milk">Milk: {{ item.milk }} </span>
              <span v-if="item.sugar">Sugar: {{ item.sugar }}</span>
            </div>
          </div>
        </div>

        <!-- Financial Breakdown -->
        <div class="space-y-1 text-right text-[11px]">
          <div class="flex justify-between">
            <span class="text-slate-500">Subtotal:</span>
            <span>Rp {{ Number(receipt.subtotal).toLocaleString('id-ID') }}</span>
          </div>
          
          <div v-if="receipt.discountAmount > 0" class="flex justify-between text-emerald-600 font-bold">
            <span>Discount Promo:</span>
            <span>-Rp {{ Number(receipt.discountAmount).toLocaleString('id-ID') }}</span>
          </div>

          <div class="flex justify-between text-slate-500">
            <span>Tax (PB1 {{ reportsStore.systemSettings?.taxRate || 10 }}%):</span>
            <span>Rp {{ Number(receipt.taxAmount).toLocaleString('id-ID') }}</span>
          </div>

          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-300 dark:border-slate-700">
            <span>TOTAL:</span>
            <span>Rp {{ Number(receipt.total).toLocaleString('id-ID') }}</span>
          </div>

          <div class="flex justify-between pt-1">
            <span class="text-slate-500">Paid ({{ receipt.paymentMethod }}):</span>
            <span>Rp {{ Number(receipt.amountPaid).toLocaleString('id-ID') }}</span>
          </div>

          <div class="flex justify-between font-bold">
            <span class="text-slate-500">Change Due:</span>
            <span class="text-indigo-600 dark:text-indigo-400">Rp {{ Number(receipt.changeDue).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <!-- Footer Greeting -->
        <div class="text-center pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-slate-500">
          <p class="font-bold">Thank you for visiting {{ reportsStore.systemSettings?.cafeName || 'Lumière Cafe' }}!</p>
          <p>Please come again.</p>
        </div>
      </div>

      <!-- Receipt Actions -->
      <div class="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          @click="printReceipt"
          class="flex-1 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span class="material-symbols-outlined text-base">print</span>
          <span>Print Receipt</span>
        </button>
        
        <button 
          @click="cartStore.isReceiptModalOpen = false"
          class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span class="material-symbols-outlined text-base">done</span>
          <span>Next Order</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useReportsStore } from '@/stores/reports'

const cartStore = useCartStore()
const reportsStore = useReportsStore()

onMounted(() => {
  reportsStore.fetchSettings()
})

const receipt = computed(() => cartStore.lastPaidReceipt)

function printReceipt() {
  window.print()
}
</script>
