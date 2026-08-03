<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
    <!-- Render Full Screen for Customer Views & Staff Login -->
    <template v-if="isFullScreen">
      <router-view />
    </template>

    <!-- Main Staff Layout with Sidebar & Header for Authenticated POS Views -->
    <template v-else>
      <AppSidebar />
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader />
        <main class="flex-1 overflow-y-auto">
          <router-view />
        </main>
      </div>
    </template>

    <!-- Global Order Details & Edit Order Modals -->
    <OrderDetailsModal />
    <EditOrderModal />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
import EditOrderModal from '@/components/orders/EditOrderModal.vue'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

const isFullScreen = computed(() => {
  return route.path === '/' || route.path === '/customer' || route.path === '/login'
})

onMounted(() => {
  themeStore.initTheme()
})
</script>
