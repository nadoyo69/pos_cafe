<template>
  <div class="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden font-sans">
    <!-- Main Catalog Container -->
    <div class="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-y-auto p-4 sm:p-6 space-y-5">
      
      <!-- Category Tabs Slider -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full shrink-0">
        <button 
          v-for="cat in menuStore.categories" 
          :key="cat.id"
          @click="menuStore.selectedCategory = cat.id"
          class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0"
          :class="menuStore.selectedCategory === cat.id 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700/50'"
        >
          <span class="material-symbols-outlined text-lg">{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>

      <!-- Active Category Header & Count -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white capitalize">
            {{ menuStore.selectedCategory === 'all' ? 'All Cafe Items' : menuStore.selectedCategory }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Showing {{ menuStore.filteredProducts.length }} items available for cashier order
          </p>
        </div>

        <!-- Mobile Cart Toggle Button -->
        <button 
          @click="isMobileCartOpen = !isMobileCartOpen"
          class="lg:hidden px-3.5 py-2 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
        >
          <span class="material-symbols-outlined text-lg">shopping_bag</span>
          <span>Cart ({{ cartStore.items.length }})</span>
        </button>
      </div>

      <!-- Products Grid -->
      <div 
        v-if="menuStore.filteredProducts.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <ProductCard 
          v-for="product in menuStore.filteredProducts" 
          :key="product.id"
          :product="product"
          @select="menuStore.openProductDetail"
          @quick-add="handleQuickAdd"
        />
      </div>

      <!-- Empty Filter Results Placeholder -->
      <div v-else class="py-16 text-center text-slate-400 space-y-3">
        <span class="material-symbols-outlined text-5xl">search_off</span>
        <p class="font-bold text-base text-slate-700 dark:text-slate-200">No items match your filter</p>
        <p class="text-xs text-slate-400">Try changing category or clearing your search term.</p>
        <button 
          @click="clearFilters" 
          class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Right Side Cart Drawer (Desktop fixed, Mobile modal drawer) -->
    <div 
      class="transition-all duration-300 z-30"
      :class="[
        'hidden lg:block',
        isMobileCartOpen ? '!block fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex justify-end' : ''
      ]"
    >
      <CartDrawer @close-mobile="isMobileCartOpen = false" />
    </div>

    <!-- Product Customization Detail Modal -->
    <ProductDetailModal 
      :product="menuStore.selectedProduct"
      @close="menuStore.closeProductDetail"
      @add-to-cart="cartStore.addToCart"
    />

    <!-- Checkout Modal -->
    <CheckoutModal />

    <!-- Receipt Print Modal -->
    <ReceiptModal />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'

import ProductCard from '@/components/pos/ProductCard.vue'
import ProductDetailModal from '@/components/pos/ProductDetailModal.vue'
import CartDrawer from '@/components/pos/CartDrawer.vue'
import CheckoutModal from '@/components/pos/CheckoutModal.vue'
import ReceiptModal from '@/components/pos/ReceiptModal.vue'

const menuStore = useMenuStore()
const cartStore = useCartStore()

const isMobileCartOpen = ref(false)

function handleQuickAdd(product) {
  menuStore.openProductDetail(product)
}

function clearFilters() {
  menuStore.selectedCategory = 'all'
  menuStore.searchQuery = ''
}
</script>
