<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Inventory & Raw Materials Stock</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Track raw ingredients linked to Cafe Products with custom recipe dosages (Takaran per Porsi)
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="inventoryStore.fetchInventory()"
          class="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Stock</span>
        </button>

        <button 
          @click="openAddModal"
          class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">add_box</span>
          <span>Add New Stock Item</span>
        </button>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tracked Items</span>
        <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{{ inventoryStore.items.length }}</h3>
      </div>
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">In Stock & Healthy</span>
        <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{{ inventoryStore.inStockCount }}</h3>
      </div>
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
        <h3 class="text-2xl font-extrabold text-rose-500 font-mono">{{ inventoryStore.lowStockCount }}</h3>
      </div>
    </div>

    <!-- Low Stock Banner Alert -->
    <div v-if="inventoryStore.lowStockCount > 0" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-700 dark:text-amber-300">
      <div class="flex items-center gap-2 text-xs font-bold">
        <span class="material-symbols-outlined text-lg">warning</span>
        <span>Warning: {{ inventoryStore.lowStockCount }} inventory item(s) are below safety threshold!</span>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="inventoryStore.items"
      :columns="columns"
      :search-keys="['code', 'name', 'category', 'productName', 'unit']"
      search-placeholder="Search by code, item name, linked product, or category..."
      :default-per-page="10"
    >
      <template #row="{ row: item }">
        <td class="p-4">
          <div>
            <h4 class="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{{ item.name }}</h4>
            <p class="text-[11px] font-mono text-slate-400">{{ item.code }}</p>
          </div>
        </td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {{ item.category }}
          </span>
        </td>
        <td class="p-4">
          <div>
            <span class="font-bold text-xs text-indigo-600 dark:text-indigo-400 block truncate">{{ item.productName || 'All Products' }}</span>
            <span class="text-[10px] text-slate-400 font-mono">Takaran: {{ item.portionQty }} {{ item.unit }} / order</span>
          </div>
        </td>
        <td class="p-4 font-mono font-extrabold text-slate-900 dark:text-white text-sm">
          {{ item.currentQty }} <span class="text-xs text-slate-400 font-normal">{{ item.unit }}</span>
        </td>
        <td class="p-4 font-mono text-slate-500 text-xs">
          {{ item.minThreshold }} {{ item.unit }}
        </td>
        <td class="p-4">
          <span 
            class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5"
            :class="{
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30': item.currentQty > item.minThreshold,
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30': item.currentQty > 0 && item.currentQty <= item.minThreshold,
              'bg-rose-500/10 text-rose-500 border border-rose-500/30': item.currentQty <= 0
            }"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="{ 'bg-emerald-500': item.currentQty > item.minThreshold, 'bg-amber-500': item.currentQty > 0 && item.currentQty <= item.minThreshold, 'bg-rose-500': item.currentQty <= 0 }"></span>
            {{ item.currentQty <= 0 ? 'Out of Stock' : (item.currentQty <= item.minThreshold ? 'Low Stock' : 'In Stock') }}
          </span>
        </td>
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-1">
            <button @click="handleStockIn(item)" class="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 transition-colors" title="Stock In">
              <span class="material-symbols-outlined text-base">add</span>
              <span>In</span>
            </button>
            <button @click="handleStockOut(item)" class="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 transition-colors" title="Stock Out">
              <span class="material-symbols-outlined text-base">remove</span>
              <span>Out</span>
            </button>
            <button @click="openEditModal(item)" class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors" title="Edit Item">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button @click="handleDelete(item)" class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors" title="Delete Item">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Modal Form: Add / Edit Item with Product Link & Recipe Dosage -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">{{ isEditing ? 'Edit Stock Item' : 'Add New Inventory Item' }}</h3>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="saveItem" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Inventory Item Name</label>
            <input type="text" v-model="form.name" required placeholder="e.g. Whole Bean Arabica Coffee" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Product Link Selection -->
          <div class="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
            <label class="block font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 text-[11px]">
              Link to Menu Product (Automated Stock Deduction)
            </label>
            <select 
              v-model="form.productName"
              class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- All Products / General Stock --</option>
              <option v-for="prod in menuStore.products" :key="prod.id" :value="prod.name">
                {{ prod.name }} ({{ prod.category }})
              </option>
            </select>
            <p class="text-[10px] text-slate-500">Selecting a product will automatically deduct this raw inventory when customers order that product.</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <select v-model="form.category" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Unit of Measurement</label>
              <input type="text" v-model="form.unit" required placeholder="kg, L, pack, pcs" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Takaran / Order</label>
              <input type="number" step="0.001" v-model.number="form.portionQty" min="0.001" required class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-amber-600 focus:ring-2 focus:ring-indigo-500" placeholder="1.0" />
              <span class="text-[9px] text-slate-400 block mt-0.5">e.g. 0.018 kg</span>
            </div>

            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Initial Qty</label>
              <input type="number" step="0.001" v-model.number="form.currentQty" min="0" required class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Min Threshold</label>
              <input type="number" step="0.001" v-model.number="form.minThreshold" min="0.1" required class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30">Save Item</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stock In/Out Modal -->
    <div v-if="isStockModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">{{ stockAction === 'in' ? 'Stock In' : 'Stock Out' }}</h3>
          <button @click="isStockModal = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div class="text-xs space-y-1">
          <p class="font-bold text-slate-800 dark:text-slate-100">{{ stockItem?.name }}</p>
          <p class="text-slate-400">Current: <span class="font-mono font-bold">{{ stockItem?.currentQty }} {{ stockItem?.unit }}</span></p>
        </div>

        <form @submit.prevent="handleStockAction" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Quantity ({{ stockItem?.unit }})</label>
            <input type="number" step="0.001" v-model.number="stockQty" min="0.001" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="isStockModal = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl font-bold shadow-md flex items-center gap-1.5" :class="stockAction === 'in' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'">
              <span class="material-symbols-outlined text-base">{{ stockAction === 'in' ? 'add_box' : 'indeterminate_check_box' }}</span>
              {{ stockAction === 'in' ? 'Add Stock' : 'Remove Stock' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useMenuStore } from '@/stores/menu'
import { showToast, showConfirm } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const inventoryStore = useInventoryStore()
const menuStore = useMenuStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const isStockModal = ref(false)
const stockAction = ref('in')
const stockItem = ref(null)
const stockQty = ref(1)

const categories = ['Coffee', 'Dairy', 'Syrup', 'Powder', 'Baking', 'Protein', 'Produce', 'Packaging']

const columns = [
  { key: 'name', label: 'Item Name' },
  { key: 'category', label: 'Category' },
  { key: 'productName', label: 'Linked Product / Recipe' },
  { key: 'currentQty', label: 'Current Qty' },
  { key: 'minThreshold', label: 'Min Threshold' },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false, align: 'right' }
]

const defaultForm = { name: '', category: 'Coffee', unit: 'kg', currentQty: 10, minThreshold: 5, productName: '', portionQty: 1.000 }
const form = ref({ ...defaultForm })

onMounted(async () => {
  if (menuStore.products.length === 0) {
    await menuStore.fetchProducts()
  }
  inventoryStore.fetchInventory()
})

function openAddModal() {
  isEditing.value = false
  form.value = { ...defaultForm }
  isModalOpen.value = true
}

function openEditModal(item) {
  isEditing.value = true
  form.value = { ...item }
  isModalOpen.value = true
}

async function saveItem() {
  if (isEditing.value) {
    await inventoryStore.updateItem(form.value)
    showToast('Inventory item updated', 'success')
  } else {
    await inventoryStore.addItem(form.value)
    showToast('New inventory item added', 'success')
  }
  isModalOpen.value = false
}

function handleStockIn(item) {
  stockAction.value = 'in'
  stockItem.value = item
  stockQty.value = 1
  isStockModal.value = true
}

function handleStockOut(item) {
  stockAction.value = 'out'
  stockItem.value = item
  stockQty.value = 1
  isStockModal.value = true
}

async function handleStockAction() {
  if (stockAction.value === 'in') {
    await inventoryStore.stockIn(stockItem.value.id, stockQty.value)
    showToast(`Added ${stockQty.value} ${stockItem.value.unit} to ${stockItem.value.name}`, 'success')
  } else {
    await inventoryStore.stockOut(stockItem.value.id, stockQty.value)
    showToast(`Removed ${stockQty.value} ${stockItem.value.unit} from ${stockItem.value.name}`, 'success')
  }
  isStockModal.value = false
}

async function handleDelete(item) {
  const result = await showConfirm('Delete Inventory Item?', `"${item.name}" will be removed from tracking.`)
  if (result.isConfirmed) {
    await inventoryStore.deleteItem(item.id)
    showToast('Item deleted from inventory', 'success')
  }
}
</script>
