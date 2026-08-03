<template>
  <header class="h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors font-sans">
    <!-- Title, Subtitle & Mobile Menu Toggle Button -->
    <div class="flex items-center gap-3 min-w-0">
      <!-- Mobile Sidebar Toggle Hamburger Button -->
      <button 
        @click="themeStore.toggleMobileSidebar()"
        class="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 shrink-0"
        title="Open Navigation Menu"
      >
        <span class="material-symbols-outlined text-xl">menu</span>
      </button>

      <!-- Desktop Collapse Button -->
      <button 
        @click="themeStore.toggleSidebar()"
        class="hidden lg:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 shrink-0"
        :title="themeStore.isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        <span class="material-symbols-outlined text-xl">
          {{ themeStore.isSidebarCollapsed ? 'side_navigation' : 'menu_open' }}
        </span>
      </button>

      <div class="min-w-0">
        <h2 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
          {{ title }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Right Tools / Info Center -->
    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
      <!-- Quick Search Bar (for POS & Menu) -->
      <div v-if="showSearch" class="relative hidden sm:block w-48 md:w-72">
        <span class="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-base">search</span>
        <input 
          type="text" 
          v-model="menuStore.searchQuery" 
          placeholder="Search products or SKU..." 
          class="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          v-if="menuStore.searchQuery" 
          @click="menuStore.searchQuery = ''"
          class="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <!-- Active Table Badge -->
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
        <span class="material-symbols-outlined text-base">table_restaurant</span>
        <span>Table: {{ cartStore.activeTable || 'Takeaway' }}</span>
      </div>

      <!-- Theme Switcher Button -->
      <button 
        @click="themeStore.toggleTheme()"
        class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition-colors"
        :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <span class="material-symbols-outlined text-xl">
          {{ themeStore.isDark ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </div>
  </header>

  <!-- Click-outside overlay to close notification dropdown -->
  <div 
    v-if="notificationStore.isOpen"
    @click="notificationStore.close()"
    class="fixed inset-0 z-10"
  ></div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'
import { useReportsStore } from '@/stores/reports'

const route = useRoute()
const menuStore = useMenuStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()
const reportsStore = useReportsStore()

onMounted(() => {
  reportsStore.fetchSettings()
})

const title = computed(() => {
  const storeName = reportsStore.systemSettings?.cafeName || 'Lumière Cafe'
  switch (route.path) {
    case '/pos': return 'Cashier POS Ordering'
    case '/tables': return 'Floor Plan & Table Occupancy'
    case '/orders': return 'Real-Time Kitchen Orders (KDS)'
    case '/categories': return 'Menu Category Management'
    case '/menu': return 'Product Item Catalog'
    case '/menu/new': return 'Add New Product Item'
    case '/discounts': return 'Discounts & Promotions'
    case '/inventory': return 'Inventory & Stock Management'
    case '/reports': return 'Overview Sales & Performance Analytics'
    case '/reports/financial': return 'Financial & Profit Statements'
    case '/reports/history': return 'Order History & Transaction Log'
    case '/settings': return 'Store Profile & Preferences'
    case '/settings/tables': return 'Table & Seating Management'
    case '/settings/users': return 'User Management (CRUD Staff)'
    case '/settings/roles': return 'Role & Access Control'
    case '/settings/logs': return 'System Process Logs'
    default: return `${storeName} Management`
  }
})

const subtitle = computed(() => {
  const tagline = reportsStore.systemSettings?.tagline || 'Specialty Coffee & POS System'
  switch (route.path) {
    case '/pos': return 'Select items, customize options & complete cashier checkout'
    case '/tables': return 'Manage table occupancy, active bills & staff assignments'
    case '/orders': return 'Monitor kitchen prep status and order fulfillment timers'
    case '/categories': return 'Organize menu categories, icons & product counts'
    case '/menu': return 'Manage product item catalog, prices & stock availability'
    case '/menu/new': return 'Create a new coffee beverage or food menu item'
    case '/discounts': return 'Create promo codes, set discount rules, and validity periods'
    case '/inventory': return 'Track ingredients, supplies, and low-stock alerts'
    case '/reports': return 'Revenue overview, cashier speed & top-selling items'
    case '/reports/financial': return 'P&L income statement, cost of goods, and margin metrics'
    case '/reports/history': return 'View past orders, receipts, refund records & payment details'
    case '/settings': return 'Store profile, tax PB1 rate, and receipt layout'
    case '/settings/tables': return 'Add new tables, edit seat capacities & floor zones'
    case '/settings/users': return 'Manage staff user accounts, usernames, and roles'
    case '/settings/roles': return 'Configure security role permissions and module access'
    case '/settings/logs': return 'Track system activity, cashier checkouts, and audit events'
    default: return tagline
  }
})

const showSearch = computed(() => {
  return route.path === '/pos' || route.path === '/menu'
})
</script>
