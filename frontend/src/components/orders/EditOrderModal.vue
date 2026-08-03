<template>
  <div v-if="orderStore.selectedOrderForEdit" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 class="text-base font-extrabold flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-500">edit_note</span>
            <span>Edit Order #{{ orderStore.selectedOrderForEdit.id }}</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modify quantity, remove items, or add new products to this active order
          </p>
        </div>

        <button 
          @click="orderStore.selectedOrderForEdit = null" 
          class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- Add Product Item to Order Dropdown -->
      <div class="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs">
        <label class="block font-extrabold text-indigo-900 dark:text-indigo-300">Add New Product to Order</label>
        <div class="flex items-center gap-2">
          <select 
            v-model="selectedProductToAdd"
            class="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="" disabled>Select product to add...</option>
            <option 
              v-for="prod in menuStore.products" 
              :key="prod.id" 
              :value="prod"
            >
              {{ prod.name }} (Rp {{ Number(prod.price).toLocaleString('id-ID') }})
            </option>
          </select>

          <button 
            type="button"
            @click="addProductToOrder"
            :disabled="!selectedProductToAdd"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <!-- Items List Editor -->
      <div class="space-y-3">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</label>
        <div class="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
          <div 
            v-for="(item, idx) in orderStore.selectedOrderForEdit.items" 
            :key="idx"
            class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
          >
            <div class="min-w-0 flex-1 space-y-0.5">
              <h5 class="font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</h5>
              <p class="text-[10px] text-slate-400 font-mono">
                Rp {{ Number(item.unitPrice || item.price || 0).toLocaleString('id-ID') }} / unit
              </p>
            </div>

            <!-- Stepper Quantity & Delete Controls -->
            <div class="flex items-center gap-2 shrink-0">
              <button 
                type="button"
                @click="updateItemQty(idx, -1)" 
                class="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
              >
                <span class="material-symbols-outlined text-sm">remove</span>
              </button>
              <span class="font-mono font-bold text-xs w-5 text-center">{{ item.quantity }}</span>
              <button 
                type="button"
                @click="updateItemQty(idx, 1)" 
                class="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
              >
                <span class="material-symbols-outlined text-sm">add</span>
              </button>

              <button 
                type="button"
                @click="removeItem(idx)" 
                class="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                title="Remove Item"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>

          <p v-if="orderStore.selectedOrderForEdit.items.length === 0" class="text-xs text-rose-500 font-semibold text-center py-4">
            Order must contain at least 1 item.
          </p>
        </div>
      </div>

      <!-- Financial Total Calculation Breakdown -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
        <div class="flex justify-between text-slate-500">
          <span>Subtotal:</span>
          <span>Rp {{ calculatedSubtotal.toLocaleString('id-ID') }}</span>
        </div>

        <div v-if="orderStore.selectedOrderForEdit.discountAmount > 0" class="flex justify-between text-emerald-500 font-bold">
          <span>Discount Voucher:</span>
          <span>-Rp {{ Number(orderStore.selectedOrderForEdit.discountAmount).toLocaleString('id-ID') }}</span>
        </div>

        <div class="flex justify-between text-slate-500">
          <span>Tax (PB1 10%):</span>
          <span>Rp {{ calculatedTax.toLocaleString('id-ID') }}</span>
        </div>

        <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
          <span>RECALCULATED TOTAL:</span>
          <span class="text-amber-500">Rp {{ calculatedTotal.toLocaleString('id-ID') }}</span>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
        <button 
          type="button"
          @click="orderStore.selectedOrderForEdit = null" 
          class="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
        >
          Cancel
        </button>

        <button 
          type="button"
          @click="saveOrderModifications" 
          :disabled="isSaving || orderStore.selectedOrderForEdit.items.length === 0"
          class="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <span v-if="isSaving" class="animate-spin material-symbols-outlined text-base">progress_activity</span>
          <span v-else class="material-symbols-outlined text-base">save</span>
          <span>{{ isSaving ? 'SAVING...' : 'SAVE ORDER CHANGES' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useMenuStore } from '@/stores/menu'
import { showToast } from '@/utils/swal'

const orderStore = useOrderStore()
const menuStore = useMenuStore()

const selectedProductToAdd = ref('')
const isSaving = ref(false)

const calculatedSubtotal = computed(() => {
  if (!orderStore.selectedOrderForEdit || !orderStore.selectedOrderForEdit.items) return 0
  return orderStore.selectedOrderForEdit.items.reduce((sum, i) => sum + (Number(i.unitPrice || i.price || 0) * Number(i.quantity || 1)), 0)
})

const calculatedTax = computed(() => {
  const discount = orderStore.selectedOrderForEdit?.discountAmount || 0
  return Math.round(Math.max(0, calculatedSubtotal.value - discount) * 0.1)
})

const calculatedTotal = computed(() => {
  const discount = orderStore.selectedOrderForEdit?.discountAmount || 0
  return Math.max(0, calculatedSubtotal.value - discount + calculatedTax.value)
})

function addProductToOrder() {
  if (!selectedProductToAdd.value) return
  const prod = selectedProductToAdd.value

  const existing = orderStore.selectedOrderForEdit.items.find(i => i.name === prod.name)
  if (existing) {
    existing.quantity += 1
  } else {
    orderStore.selectedOrderForEdit.items.push({
      name: prod.name,
      quantity: 1,
      unitPrice: Number(prod.price),
      price: Number(prod.price),
      size: 'Standard',
      isReady: false
    })
  }

  showToast(`Added ${prod.name} to order`, 'success')
  selectedProductToAdd.value = ''
}

function updateItemQty(idx, delta) {
  const items = orderStore.selectedOrderForEdit.items
  items[idx].quantity += delta
  if (items[idx].quantity <= 0) {
    items.splice(idx, 1)
  }
}

function removeItem(idx) {
  orderStore.selectedOrderForEdit.items.splice(idx, 1)
}

async function saveOrderModifications() {
  if (orderStore.selectedOrderForEdit.items.length === 0) {
    showToast('Order must contain at least 1 item', 'warning')
    return
  }

  isSaving.value = true
  const success = await orderStore.updateOrderItems(
    orderStore.selectedOrderForEdit.id,
    orderStore.selectedOrderForEdit.items
  )
  isSaving.value = false
}
</script>
