<template>
  <div class="p-6 space-y-6 bg-slate-900 text-slate-100 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header & Breadcrumbs -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h2 class="text-2xl font-extrabold text-white uppercase tracking-wider">MENU MANAGEMENT</h2>
        <p class="text-xs text-slate-400 mt-0.5">Configure application navigation structure & role permission slugs</p>
      </div>

      <div class="text-xs text-slate-400 font-medium">
        <span class="text-slate-500">Monitoring</span> / <span class="text-indigo-400 font-bold">Menus</span>
      </div>
    </div>

    <!-- Main Grid Layout (2 Panels) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Panel: Create / Edit Form -->
      <div class="lg:col-span-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 p-5 space-y-4 h-fit">
        <h3 class="text-sm font-extrabold text-white tracking-wide uppercase">
          {{ isEditing ? 'Edit Menu Item' : 'Create New Menu' }}
        </h3>

        <form @submit.prevent="handleSaveMenu" class="space-y-3.5 text-xs">
          <!-- Parent Menu Dropdown -->
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Parent Menu</label>
            <select 
              v-model="form.parent_id"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:ring-2 focus:ring-indigo-500"
            >
              <option :value="null">None (Top Level)</option>
              <option 
                v-for="parent in topLevelParents" 
                :key="parent.id" 
                :value="parent.id"
              >
                {{ parent.title }}
              </option>
            </select>
          </div>

          <!-- Title Input -->
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Title</label>
            <input 
              type="text" 
              v-model="form.title"
              required
              placeholder="e.g. Cashier POS, Inventory"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- URL Path Input -->
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">URL Path</label>
            <input 
              type="text" 
              v-model="form.url_path"
              required
              placeholder="e.g. pos, settings/users"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Icon Class Input -->
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Icon Class (Material Icons)</label>
            <input 
              type="text" 
              v-model="form.icon_class"
              placeholder="e.g. point_of_sale, table_restaurant"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Permission Slug Input -->
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Permission Slug</label>
            <input 
              type="text" 
              v-model="form.permission_slug"
              required
              placeholder="e.g. pos, settings_users"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Sort Order Input -->
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Sort Order</label>
            <input 
              type="number" 
              v-model.number="form.sort_order"
              required
              min="1"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Submit Action Buttons -->
          <div class="pt-3 flex items-center gap-2">
            <button 
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/30 text-xs transition-all"
            >
              {{ isEditing ? 'Update Menu' : 'Create Menu' }}
            </button>

            <button 
              v-if="isEditing"
              type="button" 
              @click="resetForm"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Right Panel: Menu Structure Table -->
      <div class="lg:col-span-8 bg-slate-800/60 rounded-2xl border border-slate-700/60 p-5 space-y-4">
        <h3 class="text-sm font-extrabold text-white tracking-wide uppercase">Menu Structure</h3>

        <div class="overflow-x-auto rounded-xl border border-slate-700/60">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/60 text-slate-400 uppercase font-extrabold text-[11px] border-b border-slate-700/60">
              <tr>
                <th class="p-3.5">Menu Item</th>
                <th class="p-3.5">URL</th>
                <th class="p-3.5">Slug</th>
                <th class="p-3.5 text-center">Order</th>
                <th class="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
              <template v-for="parent in menuStore.treeMenus" :key="parent.id">
                <!-- Parent Row -->
                <tr class="bg-slate-800/40 hover:bg-slate-800/80 transition-colors font-bold">
                  <td class="p-3.5 flex items-center gap-2 text-white">
                    <span class="material-symbols-outlined text-indigo-400 text-lg">{{ parent.icon_class || 'extension' }}</span>
                    <span>{{ parent.title }}</span>
                  </td>
                  <td class="p-3.5 font-mono text-rose-400">{{ parent.url_path }}</td>
                  <td class="p-3.5 font-mono text-indigo-400">{{ parent.permission_slug }}</td>
                  <td class="p-3.5 text-center font-bold text-slate-300">{{ parent.sort_order }}</td>
                  <td class="p-3.5 text-right space-x-2">
                    <button 
                      @click="editMenuItem(parent)"
                      class="text-emerald-400 hover:text-emerald-300 p-1"
                      title="Edit"
                    >
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button 
                      @click="deleteMenuItem(parent)"
                      class="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete"
                    >
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </td>
                </tr>

                <!-- Child Sub-menu Rows -->
                <tr 
                  v-for="child in parent.children" 
                  :key="child.id"
                  class="bg-slate-900/40 hover:bg-slate-800/50 transition-colors text-slate-300"
                >
                  <td class="p-3.5 pl-8 flex items-center gap-2">
                    <span class="text-slate-500 font-mono text-sm">↳</span>
                    <span class="material-symbols-outlined text-slate-400 text-base">{{ child.icon_class || 'radio_button_unchecked' }}</span>
                    <span>{{ child.title }}</span>
                  </td>
                  <td class="p-3.5 font-mono text-rose-400/90">{{ child.url_path }}</td>
                  <td class="p-3.5 font-mono text-indigo-400/90">{{ child.permission_slug }}</td>
                  <td class="p-3.5 text-center font-semibold text-slate-400">{{ child.sort_order }}</td>
                  <td class="p-3.5 text-right space-x-2">
                    <button 
                      @click="editMenuItem(child)"
                      class="text-emerald-400 hover:text-emerald-300 p-1"
                      title="Edit"
                    >
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button 
                      @click="deleteMenuItem(child)"
                      class="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete"
                    >
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </td>
                </tr>
              </template>

              <tr v-if="menuStore.treeMenus.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500 font-semibold">
                  No menus configured. Click "Create New Menu" on the left to add one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { showToast, showConfirm } from '@/utils/swal'

const menuStore = useMenuStore()

const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  parent_id: null,
  title: '',
  url_path: '',
  icon_class: 'extension',
  permission_slug: '',
  sort_order: 1
})

const topLevelParents = computed(() => {
  return menuStore.flatMenus.filter(m => !m.parent_id)
})

function resetForm() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    parent_id: null,
    title: '',
    url_path: '',
    icon_class: 'extension',
    permission_slug: '',
    sort_order: 1
  }
}

function editMenuItem(menu) {
  isEditing.value = true
  editingId.value = menu.id
  form.value = {
    parent_id: menu.parent_id || null,
    title: menu.title,
    url_path: menu.url_path,
    icon_class: menu.icon_class || 'extension',
    permission_slug: menu.permission_slug,
    sort_order: menu.sort_order || 1
  }
}

async function handleSaveMenu() {
  if (isEditing.value && editingId.value) {
    const res = await menuStore.updateMenu(editingId.value, form.value)
    if (res.success) {
      showToast('Menu updated successfully!', 'success')
      resetForm()
    }
  } else {
    const res = await menuStore.addMenu(form.value)
    if (res.success) {
      showToast('New menu created successfully!', 'success')
      resetForm()
    }
  }
}

async function deleteMenuItem(menu) {
  const confirm = await showConfirm(
    'Delete Menu Item?',
    `Are you sure you want to delete "${menu.title}"? Sub-menus under it will also be removed.`
  )
  if (confirm.isConfirmed) {
    const res = await menuStore.deleteMenu(menu.id)
    if (res.success) {
      showToast('Menu deleted successfully', 'success')
    }
  }
}
</script>
