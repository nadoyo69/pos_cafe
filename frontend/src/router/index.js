import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customer'

import CustomerWelcomeView from '@/views/CustomerWelcomeView.vue'
import CustomerMenuView from '@/views/CustomerMenuView.vue'
import LoginView from '@/views/LoginView.vue'
import PosView from '@/views/PosView.vue'
import TableMapView from '@/views/TableMapView.vue'
import RealTimeOrdersView from '@/views/RealTimeOrdersView.vue'
import ShiftManagementView from '@/views/ShiftManagementView.vue'
import CategoriesManagementView from '@/views/CategoriesManagementView.vue'
import MenuManagementView from '@/views/MenuManagementView.vue'
import MenuItemFormView from '@/views/MenuItemFormView.vue'
import DiscountManagementView from '@/views/DiscountManagementView.vue'
import InventoryView from '@/views/InventoryView.vue'
import ReportsView from '@/views/ReportsView.vue'
import FinancialReportsView from '@/views/FinancialReportsView.vue'
import OrderHistoryView from '@/views/OrderHistoryView.vue'
import SettingsView from '@/views/SettingsView.vue'
import UserManagementView from '@/views/UserManagementView.vue'
import RoleManagementView from '@/views/RoleManagementView.vue'
import MenuSystemManagementView from '@/views/MenuSystemManagementView.vue'
import ProcessLogsView from '@/views/ProcessLogsView.vue'
import TableManagementView from '@/views/TableManagementView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    name: 'customer-welcome',
    component: CustomerWelcomeView,
    meta: { customerPublic: true }
  },
  {
    path: '/customer',
    name: 'customer-menu',
    component: CustomerMenuView,
    meta: { customerPublic: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/admin',
    redirect: '/login'
  },
  // Main Operations
  {
    path: '/pos',
    name: 'pos',
    component: PosView,
    meta: { permission: 'pos' }
  },
  {
    path: '/tables',
    name: 'tables',
    component: TableMapView,
    meta: { permission: 'tables' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: RealTimeOrdersView,
    meta: { permission: 'orders' }
  },
  {
    path: '/shifts',
    name: 'shifts',
    component: ShiftManagementView,
    meta: { permission: 'shifts' }
  },
  {
    path: '/shift',
    redirect: '/shifts'
  },
  // Menu & Catalog
  {
    path: '/categories',
    name: 'categories',
    component: CategoriesManagementView,
    meta: { permission: 'categories' }
  },
  {
    path: '/products',
    name: 'products',
    component: MenuManagementView,
    meta: { permission: 'products' }
  },
  {
    path: '/menu',
    name: 'menu',
    component: MenuManagementView,
    meta: { permission: 'products' }
  },
  {
    path: '/menu/new',
    name: 'menu-new',
    component: MenuItemFormView,
    meta: { permission: 'products' }
  },
  {
    path: '/menu/edit/:id',
    name: 'menu-edit',
    component: MenuItemFormView,
    meta: { permission: 'products' }
  },
  {
    path: '/discounts',
    name: 'discounts',
    component: DiscountManagementView,
    meta: { permission: 'discounts' }
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryView,
    meta: { permission: 'inventory' }
  },
  // Reports & Analytics
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    meta: { permission: 'reports_overview' }
  },
  {
    path: '/reports/overview',
    name: 'reports-overview',
    component: ReportsView,
    meta: { permission: 'reports_overview' }
  },
  {
    path: '/reports/financial',
    name: 'reports-financial',
    component: FinancialReportsView,
    meta: { permission: 'reports_financial' }
  },
  {
    path: '/reports/history',
    name: 'reports-history',
    component: OrderHistoryView,
    meta: { permission: 'reports_history' }
  },
  {
    path: '/reports/orders',
    redirect: '/reports/history'
  },
  // System Settings
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { permission: 'settings_preferences' }
  },
  {
    path: '/settings/preferences',
    name: 'settings-preferences',
    component: SettingsView,
    meta: { permission: 'settings_preferences' }
  },
  {
    path: '/settings/users',
    name: 'settings-users',
    component: UserManagementView,
    meta: { permission: 'settings_users' }
  },
  {
    path: '/settings/roles',
    name: 'settings-roles',
    component: RoleManagementView,
    meta: { permission: 'settings_roles' }
  },
  {
    path: '/settings/menus',
    name: 'settings-menus',
    component: MenuSystemManagementView,
    meta: { permission: 'settings_menus' }
  },
  {
    path: '/settings/tables',
    name: 'settings-tables',
    component: TableManagementView,
    meta: { permission: 'settings_tables' }
  },
  {
    path: '/settings/logs',
    name: 'settings-logs',
    component: ProcessLogsView,
    meta: { permission: 'settings_logs' }
  },
  // Catch-all Stitch 404 Route
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const customerStore = useCustomerStore()

  // Staff routes authentication guard
  if (!to.meta.customerPublic && !to.meta.public && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    const fallbackRoute = authStore.hasPermission('pos') ? '/pos' : (authStore.hasPermission('tables') ? '/tables' : '/orders')
    return next(fallbackRoute)
  }

  if (to.path === '/customer' && !customerStore.customerInfo) {
    customerStore.customerInfo = { name: 'Guest Customer', tableNo: 'T-01', phone: '' }
  }

  // Permission Guard for Direct URL Navigation
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    const fallbackRoute = authStore.hasPermission('pos') ? '/pos' : (authStore.hasPermission('tables') ? '/tables' : '/orders')
    alert(`⛔ Access Denied: Your role (${authStore.user?.roleLabel || authStore.user?.role}) is forbidden from accessing "${to.path}". Redirected to ${fallbackRoute}.`)
    return next(fallbackRoute)
  }

  next()
})

export default router
