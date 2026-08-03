<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Menu Category Management</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Add, edit, or delete cafe product categories for customer and cashier catalogs
        </p>
      </div>

      <button 
        @click="openAddModal"
        class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
      >
        <span class="material-symbols-outlined text-lg">add_circle</span>
        <span>Add New Category</span>
      </button>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="menuStore.categories"
      :columns="columns"
      :search-keys="['name', 'id']"
      search-placeholder="Search categories by name or ID..."
      :default-per-page="10"
    >
      <template #row="{ row: cat }">
        <td class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">{{ cat.icon }}</span>
            </div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ cat.name }}</h4>
              <p class="text-[11px] font-mono text-slate-400">{{ cat.id }}</p>
            </div>
          </div>
        </td>
        <td class="p-4 font-mono font-semibold text-slate-500">{{ cat.icon }}</td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono">
            {{ menuStore.getItemCountForCategory(cat.id) }} Items
          </span>
        </td>
        <td class="p-4 text-right">
          <div v-if="cat.id !== 'all'" class="flex items-center justify-end gap-1">
            <button 
              @click="openEditModal(cat)"
              class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              title="Edit Category"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            
            <button 
              @click="handleDeleteCategory(cat)"
              class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Category"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
          <span v-else class="text-xs text-slate-400 italic">System default</span>
        </td>
      </template>
    </DataTable>

    <!-- Category Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">
            {{ isEditing ? 'Edit Category' : 'Add New Category' }}
          </h3>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="saveCategory" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Category Name</label>
            <input 
              type="text" 
              v-model="form.name"
              required
              placeholder="e.g., Signature Drinks, Breakfast"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Select Material Symbol Icon</label>
            <div class="grid grid-cols-5 gap-2 my-2">
              <button 
                type="button"
                v-for="ic in availableIcons" 
                :key="ic"
                @click="form.icon = ic"
                class="h-10 rounded-xl border flex items-center justify-center transition-all"
                :class="form.icon === ic 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-600/30' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'"
              >
                <span class="material-symbols-outlined text-xl">{{ ic }}</span>
              </button>
            </div>
          </div>

          <!-- Custom Icon text input -->
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Or Type Icon Symbol Name</label>
            <input 
              type="text" 
              v-model="form.icon"
              placeholder="local_cafe, bakery_dining, icecream, etc."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Submit Actions -->
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button 
              type="button" 
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
            >
              Cancel
            </button>

            <button 
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30"
            >
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { showToast, showConfirm } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const menuStore = useMenuStore()

const isModalOpen = ref(false)
const isEditing = ref(false)

const columns = [
  { key: 'name', label: 'Category' },
  { key: 'icon', label: 'Icon Symbol' },
  { key: 'itemCount', label: 'Registered Products', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false, align: 'right' }
]

const availableIcons = [
  'local_cafe', 'emoji_food_beverage', 'bakery_dining', 'icecream', 'shopping_bag',
  'flatware', 'local_bar', 'set_meal', 'breakfast_dining', 'liquor'
]

const form = ref({
  id: '',
  name: '',
  icon: 'local_cafe'
})

function openAddModal() {
  isEditing.value = false
  form.value = { id: '', name: '', icon: 'local_cafe' }
  isModalOpen.value = true
}

function openEditModal(cat) {
  isEditing.value = true
  form.value = { ...cat }
  isModalOpen.value = true
}

function saveCategory() {
  if (isEditing.value) {
    menuStore.updateCategory(form.value)
    showToast('Category updated successfully', 'success')
  } else {
    menuStore.addCategory(form.value)
    showToast('New category added successfully', 'success')
  }
  isModalOpen.value = false
}

async function handleDeleteCategory(cat) {
  const result = await showConfirm(
    'Delete Category?',
    `Category "${cat.name}" will be removed from the menu.`
  )
  if (result.isConfirmed) {
    menuStore.deleteCategory(cat.id)
    showToast('Category deleted successfully', 'success')
  }
}
</script>
