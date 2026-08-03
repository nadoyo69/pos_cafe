<template>
  <div class="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h2 class="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-400 text-3xl">admin_panel_settings</span>
          Role & Access Control (Permissions Matrix)
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Configure security roles, module permissions, and staff access limits saved in PostgreSQL & Redis
        </p>
      </div>

      <button 
        @click="openAddModal"
        class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
      >
        <span class="material-symbols-outlined text-lg">add_circle</span>
        <span>Add Security Role</span>
      </button>
    </div>

    <!-- Role Access List Grid -->
    <div class="space-y-3">
      <div 
        v-for="role in settingsStore.roles" 
        :key="role.id"
        class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-indigo-500/50 transition-all duration-200"
      >
        <div class="space-y-1 max-w-sm">
          <div class="flex items-center gap-2">
            <h3 class="font-extrabold text-white text-base">{{ role.title }}</h3>
            <span class="px-2 py-0.5 rounded-md bg-slate-700 text-slate-400 font-mono text-[10px]">
              role-{{ role.role_key || role.id }}
            </span>
          </div>
          <p class="text-xs text-slate-400 line-clamp-2">{{ role.description }}</p>
        </div>

        <!-- Permission Badges Generated Dynamically from All Menus -->
        <div class="flex flex-wrap items-center gap-1.5 flex-1 md:justify-center">
          <span 
            v-for="permItem in availablePermissions" 
            :key="permItem.id"
            class="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-150 select-none flex items-center gap-1.5"
            :class="hasRolePermission(role, permItem.id) 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10' 
              : 'bg-slate-900/60 text-slate-600 border border-slate-800 line-through opacity-40'"
          >
            <span class="material-symbols-outlined text-xs">{{ permItem.icon }}</span>
            <span>{{ permItem.label }}</span>
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button 
            @click="openEditModal(role)"
            class="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-700/50 hover:bg-indigo-600 transition-all"
            title="Edit Role Access Permissions"
          >
            <span class="material-symbols-outlined text-lg">edit</span>
          </button>

          <button 
            v-if="role.role_key !== 'admin'"
            @click="handleDeleteRole(role)"
            class="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-700/30 hover:bg-rose-600/20 transition-all"
            title="Delete Role"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Role Edit Modal (Dynamic All Menus Grid) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 text-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <h3 class="text-lg font-extrabold text-white">
              {{ isEditing ? 'Edit Security Role Access' : 'Create New Security Role' }}
            </h3>
            <p class="text-xs text-slate-400">Updates permissions in PostgreSQL & Redis instantly for all configured menus</p>
          </div>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-slate-400 hover:text-white">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="saveRole" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Role Title</label>
            <input 
              type="text" 
              v-model="form.title"
              required
              placeholder="e.g. Senior Cashier"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
            <textarea 
              v-model="form.description"
              rows="2"
              placeholder="Describe access responsibilities..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <!-- All Menus Permission Grid -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block font-bold uppercase tracking-wider text-slate-400">GRANTED FEATURE ACCESS PERMISSIONS (ALL SYSTEM MENUS)</label>
              <button 
                type="button" 
                @click="toggleSelectAll"
                class="text-[11px] font-bold text-indigo-400 hover:underline"
              >
                {{ form.permissions.length === availablePermissions.length ? 'Deselect All' : 'Select All Menus' }}
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label 
                v-for="item in availablePermissions" 
                :key="item.id"
                class="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none"
                :class="form.permissions.includes(item.id) 
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'"
              >
                <div class="flex items-center gap-2.5">
                  <input 
                    type="checkbox" 
                    :value="item.id"
                    v-model="form.permissions"
                    class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <span class="font-bold text-xs">{{ item.label }}</span>
                </div>
                <span class="material-symbols-outlined text-sm opacity-60">{{ item.icon }}</span>
              </label>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-800 flex justify-end gap-2 sticky bottom-0 bg-slate-900 py-2">
            <button 
              type="button" 
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>

            <button 
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
            >
              Save Permissions Matrix
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useMenuStore } from '@/stores/menu'
import { showToast, showConfirm } from '@/utils/swal'

const settingsStore = useSettingsStore()
const menuStore = useMenuStore()

const isModalOpen = ref(false)
const isEditing = ref(false)

// Dynamically generate permissions list from ALL system sub-menus in database
const availablePermissions = computed(() => {
  if (menuStore.flatMenus.length === 0) {
    return [
      { id: 'pos', label: 'Cashier POS', icon: 'point_of_sale' },
      { id: 'tables', label: 'Table Map', icon: 'table_restaurant' },
      { id: 'orders', label: 'Kitchen KDS', icon: 'soup_kitchen' },
      { id: 'shifts', label: 'Shift Management', icon: 'schedule' },
      { id: 'categories', label: 'Categories', icon: 'category' },
      { id: 'products', label: 'Products & Items', icon: 'local_offer' },
      { id: 'discounts', label: 'Discounts & Promos', icon: 'sell' },
      { id: 'inventory', label: 'Inventory Stock', icon: 'inventory_2' },
      { id: 'reports_overview', label: 'Overview Analytics', icon: 'bar_chart' },
      { id: 'reports_financial', label: 'Financial Reports', icon: 'payments' },
      { id: 'reports_history', label: 'Order History', icon: 'receipt_long' },
      { id: 'settings_preferences', label: 'Store Preferences', icon: 'storefront' },
      { id: 'settings_users', label: 'User Management', icon: 'manage_accounts' },
      { id: 'settings_roles', label: 'Role & Access Control', icon: 'admin_panel_settings' },
      { id: 'settings_menus', label: 'Menu Management', icon: 'menu_book' },
      { id: 'settings_tables', label: 'Table Setup', icon: 'tune' },
      { id: 'settings_logs', label: 'Process Audit Logs', icon: 'history' }
    ]
  }

  return menuStore.flatMenus
    .filter(m => m.parent_id !== null || (m.url_path && m.url_path !== '#' && m.url_path !== '-'))
    .map(m => ({
      id: m.permission_slug,
      label: m.title,
      icon: m.icon_class || 'extension'
    }))
})

const form = ref({
  id: '',
  role_key: '',
  title: '',
  description: '',
  permissions: []
})

function hasRolePermission(role, permId) {
  if (role.role_key === 'admin') return true
  const perms = role.permissions || []
  return perms.includes(permId)
}

function toggleSelectAll() {
  if (form.value.permissions.length === availablePermissions.value.length) {
    form.value.permissions = []
  } else {
    form.value.permissions = availablePermissions.value.map(p => p.id)
  }
}

function openAddModal() {
  isEditing.value = false
  form.value = {
    id: '',
    role_key: '',
    title: '',
    description: '',
    permissions: ['pos', 'tables', 'orders']
  }
  isModalOpen.value = true
}

function openEditModal(role) {
  isEditing.value = true
  form.value = {
    id: role.id,
    role_key: role.role_key,
    title: role.title,
    description: role.description,
    permissions: [...(role.permissions || [])]
  }
  isModalOpen.value = true
}

async function saveRole() {
  if (isEditing.value) {
    await settingsStore.updateRole(form.value)
    showToast('Role permissions updated & saved to Redis!', 'success')
  } else {
    await settingsStore.addRole(form.value)
    showToast('New role created successfully', 'success')
  }
  isModalOpen.value = false
}

async function handleDeleteRole(role) {
  const result = await showConfirm(
    'Delete Role?',
    `Security role "${role.title}" will be deleted.`
  )
  if (result.isConfirmed) {
    await settingsStore.deleteRole(role.id)
    showToast('Role deleted successfully', 'success')
  }
}
</script>
