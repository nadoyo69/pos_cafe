<template>
  <div class="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-28 font-sans">
    
    <!-- Customer Top Header Bar -->
    <header class="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <!-- Brand & Customer Info -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shrink-0 overflow-hidden p-0.5">
            <img v-if="reportsStore.systemSettings?.logo" :src="reportsStore.systemSettings.logo" alt="Logo" class="w-full h-full object-contain" />
            <span v-else class="material-symbols-outlined text-xl">local_cafe</span>
          </div>
          <div class="min-w-0">
            <h1 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate uppercase">
              {{ reportsStore.systemSettings?.cafeName || 'LUMIÈRE CAFE' }}
            </h1>
            <p class="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 truncate">
              <span class="material-symbols-outlined text-xs shrink-0">table_restaurant</span>
              <span>Table: {{ customerStore.customerInfo?.tableNo || 'T-01' }}</span>
              <span class="text-slate-400 dark:text-slate-500 truncate">• {{ customerStore.customerInfo?.name }}</span>
            </p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Change Table / Exit Session Button -->
          <button 
            @click="handleExitToWelcome"
            class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            title="Change Table or Exit Session"
          >
            <span class="material-symbols-outlined text-base">logout</span>
            <span class="hidden sm:inline">Exit Session</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Search Bar & Sticky Category Filter Pills -->
    <div class="sticky top-16 z-20 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3">
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <!-- Search Input Bar -->
        <div class="relative max-w-md mx-auto">
          <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">search</span>
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Search coffee, tea, pastries, breakfast..."
            class="w-full pl-10 pr-9 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''"
            class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <!-- Scrollable Horizontal Category Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button 
            @click="selectedCategory = 'all'"
            class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
            :class="selectedCategory === 'all' 
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-105' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'"
          >
            <span class="material-symbols-outlined text-base">restaurant_menu</span>
            <span>All Items</span>
          </button>

          <button 
            v-for="cat in availableCategories" 
            :key="cat.id || cat.slug"
            @click="selectedCategory = cat.slug || cat.id || cat.name"
            class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
            :class="(selectedCategory === (cat.slug || cat.id || cat.name)) 
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-105' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'"
          >
            <span class="material-symbols-outlined text-base">{{ cat.icon || 'local_cafe' }}</span>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Product Menu Grid -->
    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          @click="openCustomizationModal(product)"
          class="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <!-- Product Image & Badges -->
          <div class="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
            <img 
              :src="product.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'" 
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md text-[10px] font-extrabold text-amber-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs fill-1">star</span>
              <span>{{ product.rating || '4.9' }}</span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
            <div>
              <h3 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                {{ product.name }}
              </h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5">
                {{ product.description || 'Artisanal cafe creation crafted with premium ingredients.' }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span class="font-extrabold font-mono text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                Rp {{ Number(product.price).toLocaleString('id-ID') }}
              </span>

              <button 
                class="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30 transition-transform active:scale-95"
                title="Add to Cart"
              >
                <span class="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Products Found Placeholder -->
      <div v-else class="text-center py-16 space-y-3">
        <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-3xl">search_off</span>
        </div>
        <h3 class="text-base font-bold text-slate-700 dark:text-slate-300">No products found</h3>
        <p class="text-xs text-slate-400">Try adjusting your search terms or select another category.</p>
        <button 
          @click="selectedCategory = 'all'"
          class="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20"
        >
          View All Products
        </button>
      </div>
    </main>

    <!-- Floating Sticky Cart Summary Bar at Bottom -->
    <div v-if="cartItemsCount > 0" class="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
      <div class="bg-slate-900 text-white p-3.5 px-5 rounded-3xl shadow-2xl border border-slate-700/80 backdrop-blur-xl flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/40">
              <span class="material-symbols-outlined text-xl">shopping_bag</span>
            </div>
            <span class="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-sm">
              {{ cartItemsCount }}
            </span>
          </div>

          <div>
            <p class="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Cart Total</p>
            <p class="font-extrabold font-mono text-sm text-amber-400">
              Rp {{ cartTotalAmount.toLocaleString('id-ID') }}
            </p>
          </div>
        </div>

        <button 
          @click="isCartDrawerOpen = true"
          class="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <span>VIEW CART & CHECKOUT</span>
          <span class="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>

    <!-- Product Dynamic Customization Modal -->
    <div v-if="customizingProduct" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-extrabold">{{ customizingProduct.name }}</h3>
            <p class="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
              Base Price: Rp {{ Number(customizingProduct.price).toLocaleString('id-ID') }}
            </p>
          </div>
          <button @click="customizingProduct = null" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <!-- Render Dynamic Addon Groups -->
        <div class="space-y-4 text-xs">
          <div v-for="(group, gIdx) in activeAddonGroups" :key="gIdx" class="space-y-2">
            <label class="block font-bold uppercase tracking-wider text-slate-400 text-xs">{{ group.title }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button 
                v-for="(opt, oIdx) in group.options" 
                :key="oIdx"
                type="button"
                @click="selectedAddons[gIdx] = opt"
                class="p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center text-xs"
                :class="selectedAddons[gIdx]?.name === opt.name 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
              >
                <span class="font-semibold">{{ opt.name }}</span>
                <span v-if="opt.price > 0" class="text-[10px] text-slate-400 font-mono mt-0.5">+Rp {{ Number(opt.price).toLocaleString('id-ID') }}</span>
              </button>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span class="font-bold text-slate-400 uppercase tracking-wider">Quantity</span>
            <div class="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button @click="quantity > 1 && quantity--" class="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold shadow-xs">
                <span class="material-symbols-outlined text-base">remove</span>
              </button>
              <span class="font-mono font-extrabold text-sm px-2">{{ quantity }}</span>
              <button @click="quantity++" class="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold shadow-xs">
                <span class="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Add to Cart Modal Action -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] text-slate-400 uppercase font-bold">Total Unit Price</p>
            <p class="font-extrabold font-mono text-base text-amber-600 dark:text-amber-400">
              Rp {{ (calculatedUnitPrice * quantity).toLocaleString('id-ID') }}
            </p>
          </div>

          <button 
            @click="confirmAddToCart"
            class="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <span class="material-symbols-outlined text-lg">add_shopping_cart</span>
            <span>ADD TO ORDER</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Cart & Checkout Slide Drawer -->
    <div v-if="isCartDrawerOpen" class="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-md">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <!-- Drawer Header -->
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-2xl">receipt_long</span>
              <h3 class="text-base font-extrabold">Your Order Summary</h3>
            </div>
            <button @click="isCartDrawerOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <!-- Customer & Table Badge Info -->
          <div class="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
            <div>
              <p class="font-extrabold text-amber-900 dark:text-amber-200">{{ customerStore.customerInfo?.name }}</p>
              <p class="text-[11px] text-amber-700 dark:text-amber-400 font-mono">{{ customerStore.customerInfo?.phone }}</p>
            </div>
            <span class="px-3 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-xs">
              Table {{ customerStore.customerInfo?.tableNo || 'T-01' }}
            </span>
          </div>

          <!-- Cart Items List -->
          <div class="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
            <div 
              v-for="(item, idx) in customerCart" 
              :key="idx"
              class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
            >
              <div class="min-w-0 flex-1 space-y-0.5">
                <h4 class="font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</h4>
                <p class="text-[10px] text-slate-400 font-mono">
                  {{ item.addonDetails || 'Standard' }}
                </p>
                <p class="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                  Rp {{ (item.unitPrice * item.quantity).toLocaleString('id-ID') }}
                </p>
              </div>

              <!-- Item Quantity Stepper -->
              <div class="flex items-center gap-2">
                <button @click="updateCartItemQty(idx, -1)" class="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                  <span class="material-symbols-outlined text-sm">remove</span>
                </button>
                <span class="font-mono font-bold text-xs">{{ item.quantity }}</span>
                <button @click="updateCartItemQty(idx, 1)" class="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                  <span class="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Promo Voucher & Payment Checkout -->
        <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <!-- Voucher Code Input -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Promo Voucher Code</label>
            <div class="flex items-center gap-2">
              <input 
                type="text" 
                v-model="voucherCode"
                placeholder="e.g. CAFE10 or VIP20"
                class="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold uppercase text-xs focus:ring-2 focus:ring-amber-500"
              />
              <button 
                @click="applyVoucher"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Apply
              </button>
            </div>
            <p v-if="appliedVoucher" class="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">verified</span>
              <span>Applied {{ appliedVoucher.name }} (-{{ appliedVoucher.value }}%)</span>
            </p>
          </div>

          <!-- Total Calculation Breakdown -->
          <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp {{ cartSubtotalAmount.toLocaleString('id-ID') }}</span>
            </div>
            <div v-if="discountAmount > 0" class="flex justify-between text-emerald-500 font-bold">
              <span>Discount Voucher:</span>
              <span>-Rp {{ discountAmount.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>TOTAL PAYABLE:</span>
              <span class="text-amber-500">Rp {{ cartFinalTotal.toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <!-- Payment Method Selector -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Payment Method</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button 
                @click="paymentMethod = 'CASHIER'"
                class="p-2.5 rounded-xl border text-center font-bold transition-all"
                :class="paymentMethod === 'CASHIER' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'"
              >
                Pay at Cashier Desk
              </button>
              <button 
                @click="paymentMethod = 'QRIS'"
                class="p-2.5 rounded-xl border text-center font-bold transition-all"
                :class="paymentMethod === 'QRIS' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'"
              >
                QRIS / E-Wallet
              </button>
            </div>
          </div>

          <!-- Submit Order Button -->
          <button 
            @click="submitCustomerOrder"
            :disabled="isSubmitting || customerCart.length === 0"
            class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span v-if="isSubmitting" class="animate-spin material-symbols-outlined text-lg">progress_activity</span>
            <span v-else class="material-symbols-outlined text-lg">send</span>
            <span>{{ isSubmitting ? 'SUBMITTING ORDER...' : 'SUBMIT ORDER NOW' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useCustomerStore } from '@/stores/customer'
import { useReportsStore } from '@/stores/reports'
import { apiFetch } from '@/services/api'
import { showToast } from '@/utils/swal'

const router = useRouter()
const menuStore = useMenuStore()
const customerStore = useCustomerStore()
const reportsStore = useReportsStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const customizingProduct = ref(null)
const selectedAddons = ref({})
const quantity = ref(1)

const isCartDrawerOpen = ref(false)
const customerCart = ref([])
const voucherCode = ref('')
const appliedVoucher = ref(null)
const paymentMethod = ref('CASHIER')
const isSubmitting = ref(false)

const availableCategories = computed(() => {
  return menuStore.categories.filter(c => c.id !== 'all')
})

onMounted(async () => {
  reportsStore.fetchSettings()
  if (menuStore.products.length === 0) {
    await menuStore.fetchProducts()
  }
  if (menuStore.categories.length === 0) {
    await menuStore.fetchCategories()
  }
})

const filteredProducts = computed(() => {
  return menuStore.products.filter(p => {
    const matchesSearch = !searchQuery.value || p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const targetCat = (selectedCategory.value || '').toLowerCase()
    if (targetCat === 'all') return matchesSearch

    const pCat = (p.category || '').toLowerCase()
    const pCatSlug = (p.categorySlug || '').toLowerCase()
    const pCatName = (p.categoryName || '').toLowerCase()

    const matchesCat = (
      pCat === targetCat ||
      pCatSlug === targetCat ||
      pCatName === targetCat ||
      pCat.includes(targetCat) ||
      targetCat.includes(pCat)
    )

    return matchesSearch && matchesCat
  })
})

const activeAddonGroups = computed(() => {
  if (!customizingProduct.value) return []
  if (customizingProduct.value.addons && Array.isArray(customizingProduct.value.addons) && customizingProduct.value.addons.length > 0) {
    return customizingProduct.value.addons
  }
  return getDefaultAddons(customizingProduct.value)
})

function getDefaultAddons(product) {
  const cat = (product.category || product.categoryName || '').toLowerCase()
  if (cat.includes('food') || cat.includes('pastry') || cat.includes('bakery')) {
    return [
      {
        title: 'Serving Preference',
        options: [
          { name: 'Warm / Toasted', price: 0 },
          { name: 'Room Temperature', price: 0 }
        ]
      },
      {
        title: 'Extra Sauce & Dip',
        options: [
          { name: 'No Extra Dip', price: 0 },
          { name: 'Extra Melted Cheese', price: 5000 },
          { name: 'Extra Dark Chocolate Dip', price: 5000 }
        ]
      }
    ]
  }

  return [
    {
      title: 'Cup Size',
      options: [
        { name: 'Standard (12oz)', price: 0 },
        { name: 'Large (16oz)', price: 5000 },
        { name: 'Grand (20oz)', price: 8000 }
      ]
    },
    {
      title: 'Milk Choice',
      options: [
        { name: 'Fresh Milk', price: 0 },
        { name: 'Oat Milk', price: 5000 },
        { name: 'Almond Milk', price: 5000 }
      ]
    },
    {
      title: 'Sugar Level',
      options: [
        { name: '100% Normal', price: 0 },
        { name: '50% Less', price: 0 },
        { name: '25% Slight', price: 0 },
        { name: '0% No Sugar', price: 0 }
      ]
    }
  ]
}

const calculatedUnitPrice = computed(() => {
  if (!customizingProduct.value) return 0
  let price = Number(customizingProduct.value.price) || 0
  Object.values(selectedAddons.value).forEach(opt => {
    if (opt && opt.price) {
      price += Number(opt.price)
    }
  })
  return price
})

function openCustomizationModal(product) {
  customizingProduct.value = product
  quantity.value = 1
  selectedAddons.value = {}

  const groups = activeAddonGroups.value
  groups.forEach((g, gIdx) => {
    if (g.options && g.options.length > 0) {
      selectedAddons.value[gIdx] = g.options[0]
    }
  })
}

function confirmAddToCart() {
  const details = Object.values(selectedAddons.value)
    .map(o => o ? o.name : '')
    .filter(Boolean)
    .join(' • ')

  customerCart.value.push({
    productId: customizingProduct.value.id,
    name: customizingProduct.value.name,
    unitPrice: calculatedUnitPrice.value,
    addonDetails: details || 'Standard',
    quantity: quantity.value
  })
  showToast(`Added ${quantity.value}x ${customizingProduct.value.name} to order`, 'success')
  customizingProduct.value = null
}

function updateCartItemQty(idx, delta) {
  customerCart.value[idx].quantity += delta
  if (customerCart.value[idx].quantity <= 0) {
    customerCart.value.splice(idx, 1)
  }
}

const cartItemsCount = computed(() => customerCart.value.reduce((sum, i) => sum + i.quantity, 0))
const cartSubtotalAmount = computed(() => customerCart.value.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0))
const discountAmount = computed(() => {
  if (!appliedVoucher.value) return 0
  return Math.round((cartSubtotalAmount.value * appliedVoucher.value.value) / 100)
})
const cartTotalAmount = computed(() => Math.max(0, cartSubtotalAmount.value - discountAmount.value))
const cartFinalTotal = computed(() => cartTotalAmount.value)

async function applyVoucher() {
  if (!voucherCode.value.trim()) return
  const res = await apiFetch('/discounts/validate', {
    method: 'POST',
    body: { code: voucherCode.value.trim() }
  })
  if (res.success && res.data) {
    appliedVoucher.value = res.data
    showToast(`Voucher ${res.data.code} applied!`, 'success')
  } else {
    showToast(res.message || 'Invalid or limit reached voucher code', 'error')
  }
}

async function submitCustomerOrder() {
  if (customerCart.value.length === 0) return

  isSubmitting.value = true
  const payload = {
    customerName: customerStore.customerInfo?.name || 'Guest Customer',
    tableNo: customerStore.customerInfo?.tableNo || 'T-01',
    orderType: 'Dine-In',
    paymentMethod: paymentMethod.value,
    subtotal: cartSubtotalAmount.value,
    discountAmount: discountAmount.value,
    totalAmount: cartFinalTotal.value,
    voucherCode: appliedVoucher.value?.code || '',
    items: customerCart.value.map(i => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      size: i.addonDetails || 'Standard'
    }))
  }

  const res = await apiFetch('/orders', {
    method: 'POST',
    body: payload
  })

  isSubmitting.value = false

  if (res.success) {
    showToast('Your order has been submitted to the kitchen!', 'success')
    customerCart.value = []
    isCartDrawerOpen.value = false
    router.push('/')
  } else {
    showToast(res.message || 'Failed to submit order', 'error')
  }
}

function handleExitToWelcome() {
  customerStore.clearCustomerSession()
  router.push('/')
}
</script>
