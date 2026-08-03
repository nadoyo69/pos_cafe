<template>
  <div>
    <!-- Mobile Backdrop -->
    <div 
      v-if="themeStore.isMobileSidebarOpen"
      @click="themeStore.closeMobileSidebar()"
      class="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 lg:static flex flex-col justify-between bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 select-none shrink-0 min-h-screen font-sans"
      :class="[
        themeStore.isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
        themeStore.isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div>
        <!-- Brand Header & Collapse Toggle Button -->
        <div class="p-4 flex items-center justify-between border-b border-slate-800 h-16">
          <div class="flex items-center gap-3 min-w-0 overflow-hidden">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0 overflow-hidden p-0.5">
              <img v-if="reportsStore.systemSettings?.logo" :src="reportsStore.systemSettings.logo" alt="Logo" class="w-full h-full object-contain" />
              <span v-else class="material-symbols-outlined text-2xl">local_cafe</span>
            </div>
            <div v-show="!themeStore.isSidebarCollapsed || themeStore.isMobileSidebarOpen" class="min-w-0">
              <h1 class="font-extrabold text-slate-100 text-base tracking-wide leading-none truncate uppercase">{{ reportsStore.systemSettings?.cafeName || 'LUMIÈRE' }}</h1>
              <p class="text-[10px] text-amber-400 font-semibold tracking-wider uppercase mt-0.5 truncate">{{ reportsStore.systemSettings?.tagline || 'Artisanal POS' }}</p>
            </div>
          </div>

          <!-- Desktop Collapse / Expand Toggle Button -->
          <button 
            @click="themeStore.toggleSidebar()"
            class="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            :title="themeStore.isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
          >
            <span class="material-symbols-outlined text-xl">
              {{ themeStore.isSidebarCollapsed ? 'side_navigation' : 'menu_open' }}
            </span>
          </button>

          <!-- Mobile Close Button -->
          <button 
            @click="themeStore.closeMobileSidebar()"
            class="lg:hidden p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Navigation Menu Items (Grouped by Category) -->
        <nav class="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-9rem)] no-scrollbar">
          <div v-for="group in displayTreeMenus" :key="group.id" class="space-y-1">
            <!-- Group Section Header -->
            <div 
              v-show="!themeStore.isSidebarCollapsed || themeStore.isMobileSidebarOpen"
              class="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest py-1"
            >
              {{ group.title }}
            </div>

            <!-- Group Child Nav Links -->
            <div class="space-y-1">
              <template v-for="item in group.children" :key="item.id">
                <router-link
                  v-if="canAccess(item.permission_slug)"
                  :to="getRoutePath(item.url_path)"
                  @click="themeStore.closeMobileSidebar()"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group relative"
                  :class="[
                    $route.path === getRoutePath(item.url_path)
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  ]"
                >
                  <span class="material-symbols-outlined text-xl shrink-0 transition-transform group-hover:scale-110">
                    {{ item.icon_class || 'folder' }}
                  </span>
                  
                  <span 
                    v-show="!themeStore.isSidebarCollapsed || themeStore.isMobileSidebarOpen" 
                    class="truncate"
                  >
                    {{ item.title }}
                  </span>

                  <!-- Hover Tooltip when Sidebar Collapsed -->
                  <div 
                    v-if="themeStore.isSidebarCollapsed && !themeStore.isMobileSidebarOpen"
                    class="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans border border-slate-800"
                  >
                    {{ item.title }}
                  </div>
                </router-link>
              </template>
            </div>
          </div>
        </nav>
      </div>

      <!-- User Profile & Quick Logout Footer -->
      <div class="p-3 border-t border-slate-800 bg-slate-900/50">
        <div class="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div class="flex items-center gap-2.5 min-w-0">
            <img 
              :src="authStore.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'" 
              alt="User Avatar" 
              class="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div v-show="!themeStore.isSidebarCollapsed || themeStore.isMobileSidebarOpen" class="min-w-0">
              <p class="text-xs font-bold text-slate-100 truncate leading-tight">{{ authStore.user?.name || 'Administrator' }}</p>
              <p class="text-[10px] text-indigo-400 capitalize truncate">{{ authStore.user?.role || 'GM & Admin' }}</p>
            </div>
          </div>

          <button 
            v-show="!themeStore.isSidebarCollapsed || themeStore.isMobileSidebarOpen"
            @click="handleLogout"
            class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            title="Logout System"
          >
            <span class="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import { useOrderStore } from '@/stores/order'
import { useMenuStore } from '@/stores/menu'
import { useReportsStore } from '@/stores/reports'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const tableStore = useTableStore()
const orderStore = useOrderStore()
const menuStore = useMenuStore()
const reportsStore = useReportsStore()
const themeStore = useThemeStore()

onMounted(() => {
  reportsStore.fetchSettings()
})

const isAdmin = computed(() => (authStore.user?.role || '').toLowerCase() === 'admin')

function canAccess(slug) {
  if (isAdmin.value) return true
  return authStore.hasPermission(slug)
}

function getRoutePath(url) {
  if (!url || url === '#') return '#'
  return '/' + (url.startsWith('/') ? url.slice(1) : url)
}

// Display tree menus dynamically sorted by sort_order
const displayTreeMenus = computed(() => {
  if (!menuStore.treeMenus || menuStore.treeMenus.length === 0) {
    return [
      {
        id: 1,
        title: 'Main Operations',
        children: [
          { id: 11, title: 'Cashier POS', url_path: 'pos', permission_slug: 'pos', icon_class: 'point_of_sale' },
          { id: 12, title: 'Table Map', url_path: 'tables', permission_slug: 'tables', icon_class: 'table_restaurant' },
          { id: 13, title: 'Kitchen KDS', url_path: 'orders', permission_slug: 'orders', icon_class: 'soup_kitchen' }
        ]
      },
      {
        id: 2,
        title: 'Menu & Catalog',
        children: [
          { id: 21, title: 'Categories', url_path: 'categories', permission_slug: 'categories', icon_class: 'category' },
          { id: 22, title: 'Products & Items', url_path: 'products', permission_slug: 'products', icon_class: 'local_offer' },
          { id: 23, title: 'Discounts & Promos', url_path: 'discounts', permission_slug: 'discounts', icon_class: 'sell' },
          { id: 24, title: 'Inventory Stock', url_path: 'inventory', permission_slug: 'inventory', icon_class: 'inventory_2' }
        ]
      },
      {
        id: 3,
        title: 'Reports & Analytics',
        children: [
          { id: 31, title: 'Overview Analytics', url_path: 'reports/overview', permission_slug: 'reports_overview', icon_class: 'bar_chart' },
          { id: 32, title: 'Financial Reports', url_path: 'reports/financial', permission_slug: 'reports_financial', icon_class: 'payments' },
          { id: 33, title: 'Order History', url_path: 'reports/history', permission_slug: 'reports_history', icon_class: 'receipt_long' }
        ]
      },
      {
        id: 4,
        title: 'Administrator',
        children: [
          { id: 41, title: 'Store Preferences', url_path: 'settings/preferences', permission_slug: 'settings_preferences', icon_class: 'storefront' },
          { id: 42, title: 'Users', url_path: 'settings/users', permission_slug: 'settings_users', icon_class: 'manage_accounts' },
          { id: 43, title: 'Roles Access', url_path: 'settings/roles', permission_slug: 'settings_roles', icon_class: 'admin_panel_settings' },
          { id: 44, title: 'Menu Management', url_path: 'settings/menus', permission_slug: 'settings_menus', icon_class: 'menu_book' },
          { id: 45, title: 'Table Setup', url_path: 'settings/tables', permission_slug: 'settings_tables', icon_class: 'tune' },
          { id: 46, title: 'Process Audit Logs', url_path: 'settings/logs', permission_slug: 'settings_logs', icon_class: 'history' }
        ]
      }
    ]
  }

  // Sort top levels and children by sort_order
  return [...menuStore.treeMenus]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(parent => ({
      ...parent,
      children: [...(parent.children || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }))
})

async function handleLogout() {
  await authStore.logout()
  window.location.href = '/login'
}
</script>
