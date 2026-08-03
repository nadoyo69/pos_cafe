<template>
  <div v-if="cartStore.isCheckoutModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
    <div class="bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-800 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-xl font-extrabold flex items-center gap-2 text-white">
            <span class="material-symbols-outlined text-indigo-400">payments</span>
            <span>Cashier POS Payment</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Table: {{ cartStore.activeTable || 'T-01' }} • {{ cartStore.orderType || 'Dine-In' }}
          </p>
        </div>
        <button 
          @click="cartStore.isCheckoutModalOpen = false"
          class="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Payment Method Tabs -->
      <div class="my-5 space-y-4">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">SELECT PAYMENT METHOD</label>
        <div class="grid grid-cols-3 gap-2.5">
          <button 
            v-for="m in methods" 
            :key="m.id"
            @click="selectedMethod = m.id"
            class="p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all select-none"
            :class="selectedMethod === m.id 
              ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10' 
              : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'"
          >
            <span class="material-symbols-outlined text-2xl">{{ m.icon }}</span>
            <span class="text-xs font-bold">{{ m.label }}</span>
          </button>
        </div>

        <!-- Cash Payment Calculator -->
        <div v-if="selectedMethod === 'cash'" class="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <label class="block text-xs font-bold text-slate-300">Amount Tendered (Cash Received)</label>
          <div class="relative">
            <span class="absolute left-3.5 top-2.5 font-bold text-sm text-slate-400">Rp</span>
            <input 
              type="number" 
              v-model.number="amountPaid"
              class="w-full pl-10 pr-4 py-2.5 text-lg font-mono font-extrabold rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Quick Tender Buttons -->
          <div class="grid grid-cols-4 gap-2">
            <button 
              @click="amountPaid = cartStore.total"
              class="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              Exact Cash
            </button>
            <button 
              v-for="preset in [50000, 100000, 200000]" 
              :key="preset"
              @click="amountPaid = preset"
              class="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors"
            >
              {{ (preset / 1000) }}k
            </button>
          </div>

          <!-- Change Due Calculation -->
          <div class="flex justify-between items-center pt-2 border-t border-slate-700/60 text-sm">
            <span class="font-semibold text-slate-400">Change Due:</span>
            <span 
              class="font-mono font-extrabold text-base"
              :class="changeDue >= 0 ? 'text-emerald-400' : 'text-rose-400'"
            >
              Rp {{ Math.max(0, changeDue).toLocaleString('id-ID') }}
            </span>
          </div>
        </div>

        <!-- QRIS Payment QR Mockup -->
        <div v-else-if="selectedMethod === 'qris'" class="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center space-y-3">
          <p class="text-xs font-semibold text-slate-300">Display QRIS code for customer scan (GoPay, OVO, ShopeePay, Mobile Banking)</p>
          <div class="w-44 h-44 bg-white p-3 rounded-2xl mx-auto border border-slate-700 shadow-md flex items-center justify-center">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=LUMIERE_POS_ORDER_8825" alt="QRIS Code" class="w-full h-full object-contain" />
          </div>
        </div>

        <!-- Card Terminal Mockup -->
        <div v-else-if="selectedMethod === 'card'" class="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center space-y-3">
          <span class="material-symbols-outlined text-4xl text-indigo-400">credit_card</span>
          <p class="text-xs font-semibold text-slate-300">Insert or tap Debit / Credit Card on Cashier EDC Terminal</p>
        </div>
      </div>

      <!-- Footer Totals & Action -->
      <div class="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
        <div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">TOTAL PAYABLE</p>
          <p class="text-xl font-extrabold text-indigo-400 font-mono">
            Rp {{ cartStore.total.toLocaleString('id-ID') }}
          </p>
        </div>

        <button 
          @click="handleCompletePayment"
          :disabled="selectedMethod === 'cash' && changeDue < 0"
          class="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">check_circle</span>
          <span>Complete Payment & Print</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useTableStore } from '@/stores/table'
import { showToast } from '@/utils/swal'

const cartStore = useCartStore()
const orderStore = useOrderStore()
const tableStore = useTableStore()

const selectedMethod = ref('cash')
const amountPaid = ref(0)

const methods = [
  { id: 'cash', label: 'Cash Payment', icon: 'payments' },
  { id: 'qris', label: 'QRIS / E-Wallet', icon: 'qr_code_2' },
  { id: 'card', label: 'Debit / Credit Card', icon: 'credit_card' }
]

watch(() => cartStore.isCheckoutModalOpen, (isOpen) => {
  if (isOpen) {
    amountPaid.value = cartStore.total
  }
})

const changeDue = computed(() => {
  return amountPaid.value - cartStore.total
})

async function handleCompletePayment() {
  const methodLabel = methods.find(m => m.id === selectedMethod.value)?.label || 'Cash'
  
  const receipt = cartStore.processCheckout({
    paymentMethod: methodLabel,
    amountPaid: selectedMethod.value === 'cash' ? amountPaid.value : cartStore.total,
    changeDue: selectedMethod.value === 'cash' ? Math.max(0, changeDue.value) : 0
  })

  // Submit to Backend REST API & Redis Cache
  await orderStore.createOrder({
    customerName: receipt.customerName || 'Walk-in Customer',
    tableNo: receipt.table || 'T-01',
    orderType: receipt.orderType || 'Dine-In',
    paymentMethod: methodLabel,
    totalAmount: receipt.total,
    amountPaid: selectedMethod.value === 'cash' ? amountPaid.value : receipt.total,
    items: receipt.items.map(i => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
      size: i.size ? (typeof i.size === 'object' ? i.size.name : i.size) : 'Standard'
    }))
  })

  await tableStore.updateTableStatus(receipt.table || 'T-01', 'occupied', receipt.customerName || 'Walk-in Customer', receipt.total)

  cartStore.isCheckoutModalOpen = false
  cartStore.isReceiptModalOpen = true

  showToast('Payment completed successfully!', 'success')
}
</script>
