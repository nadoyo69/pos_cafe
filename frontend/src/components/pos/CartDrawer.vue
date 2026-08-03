<template>
  <div class="w-80 md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-4rem)] shrink-0 z-10 transition-colors">
    <!-- Cart Header -->
    <div class="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">shopping_bag</span>
          <span>Current Order</span>
        </h2>
        <button 
          v-if="cartStore.items.length > 0"
          @click="cartStore.clearCart"
          class="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-sm">delete</span>
          <span>Clear All</span>
        </button>
      </div>

      <!-- Order Type Selector (Dine-In / Takeaway / Delivery) -->
      <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
        <button 
          v-for="type in ['Dine-In', 'Takeaway', 'Delivery']" 
          :key="type"
          @click="cartStore.orderType = type"
          class="py-1.5 rounded-lg transition-all text-center"
          :class="cartStore.orderType === type 
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
        >
          {{ type }}
        </button>
      </div>

      <!-- Table & Customer Info Row -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assigned Table</label>
          <select 
            v-model="cartStore.activeTable"
            class="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="t in tableStore.tables" :key="t.id" :value="t.id">
              {{ t.name }} ({{ t.capacity }}p)
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer Name</label>
          <input 
            type="text" 
            v-model="cartStore.customerName" 
            placeholder="e.g. John"
            class="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- Items List Body -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <!-- Empty Cart Placeholder -->
      <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-3xl">storefront</span>
        </div>
        <p class="font-bold text-sm text-slate-600 dark:text-slate-300">Your cart is empty</p>
        <p class="text-xs text-slate-400 mt-1 max-w-[200px]">Click any product from the catalog on the left to start ordering.</p>
      </div>

      <!-- Line Items -->
      <div 
        v-for="(item, idx) in cartStore.items" 
        :key="item.itemKey"
        class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50 flex gap-3 text-slate-800 dark:text-slate-100"
      >
        <img :src="item.image" :alt="item.name" class="w-12 h-12 rounded-xl object-cover shrink-0" />
        
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-1">
            <h4 class="font-bold text-xs truncate">{{ item.name }}</h4>
            <button @click="cartStore.removeFromCart(idx)" class="text-slate-400 hover:text-rose-500">
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <!-- Modifiers Summary -->
          <div class="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 mt-0.5">
            <p v-if="item.size"><span class="font-semibold">Size:</span> {{ item.size.name }}</p>
            <p v-if="item.milk"><span class="font-semibold">Milk:</span> {{ item.milk }}</p>
            <p v-if="item.sugar || item.ice">
              <span v-if="item.sugar">{{ item.sugar }}</span>
              <span v-if="item.ice"> • {{ item.ice }}</span>
            </p>
            <p v-if="item.addons && item.addons.length" class="text-indigo-600 dark:text-indigo-400 font-medium">
              + {{ item.addons.map(a => a.name).join(', ') }}
            </p>
            <p v-if="item.notes" class="italic text-amber-600 dark:text-amber-400">"{{ item.notes }}"</p>
          </div>

          <!-- Price & Stepper -->
          <div class="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/40">
            <span class="font-extrabold text-xs">
              Rp {{ (item.unitPrice * item.quantity).toLocaleString('id-ID') }}
            </span>

            <div class="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
              <button 
                @click="cartStore.updateQuantity(idx, -1)"
                class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 rounded-l-lg text-xs"
              >
                -
              </button>
              <span class="w-6 text-center font-bold text-xs">{{ item.quantity }}</span>
              <button 
                @click="cartStore.updateQuantity(idx, 1)"
                class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 rounded-r-lg text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voucher & Summary Footer -->
    <div class="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
      <!-- Voucher Input -->
      <div class="flex gap-2">
        <input 
          type="text" 
          v-model="voucherCode" 
          placeholder="Voucher Code (CAFE10 / VIP20)"
          class="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase font-semibold focus:ring-1 focus:ring-indigo-500"
        />
        <button 
          @click="handleVoucher"
          class="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
        >
          Apply
        </button>
      </div>

      <div v-if="voucherFeedback" class="text-[11px] font-medium" :class="voucherSuccess ? 'text-emerald-500' : 'text-rose-500'">
        {{ voucherFeedback }}
      </div>

      <!-- Financial Totals -->
      <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span class="font-mono">Rp {{ cartStore.subtotal.toLocaleString('id-ID') }}</span>
        </div>
        <div v-if="cartStore.discountAmount > 0" class="flex justify-between text-emerald-600 dark:text-emerald-400">
          <span>Discount ({{ cartStore.discountPercent }}%)</span>
          <span class="font-mono">-Rp {{ cartStore.discountAmount.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between">
          <span>Tax (PB1 10%)</span>
          <span class="font-mono">Rp {{ cartStore.taxAmount.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
          <span>Total Payable</span>
          <span class="text-indigo-600 dark:text-indigo-400 font-mono">
            Rp {{ cartStore.total.toLocaleString('id-ID') }}
          </span>
        </div>
      </div>

      <!-- Checkout Button -->
      <button 
        @click="cartStore.isCheckoutModalOpen = true"
        :disabled="cartStore.items.length === 0"
        class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        <span class="material-symbols-outlined text-lg">payments</span>
        <span>Proceed to Payment</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useTableStore } from '@/stores/table'

const cartStore = useCartStore()
const tableStore = useTableStore()

const voucherCode = ref('')
const voucherFeedback = ref('')
const voucherSuccess = ref(false)

function handleVoucher() {
  if (!voucherCode.value) return
  const res = cartStore.applyDiscountCode(voucherCode.value)
  voucherFeedback.value = res.message
  voucherSuccess.value = res.success
}
</script>
