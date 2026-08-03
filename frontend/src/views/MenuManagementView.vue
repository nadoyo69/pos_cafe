<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Products & Items Catalog</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Manage cafe food and beverage items, pricing, inventory stock, and availability
        </p>
      </div>

      <router-link 
        to="/menu/new"
        class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
      >
        <span class="material-symbols-outlined text-lg">add_circle</span>
        <span>Create New Product</span>
      </router-link>
    </div>

    <!-- Category Filters -->
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      <button 
        v-for="cat in menuStore.categories" 
        :key="cat.id"
        @click="menuStore.selectedCategory = cat.id"
        class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200"
        :class="menuStore.selectedCategory === cat.id 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200/80 dark:border-slate-800'"
      >
        {{ cat.name }} ({{ menuStore.getItemCountForCategory(cat.id) }})
      </button>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="menuStore.filteredProducts"
      :columns="columns"
      :search-keys="['name', 'sku', 'categoryName', 'description']"
      search-placeholder="Search products by name, SKU, category..."
      :default-per-page="10"
    >
      <template #row="{ row: product }">
        <!-- Item Info -->
        <td class="p-4">
          <div class="flex items-center gap-3">
            <img 
              :src="product.image" 
              :alt="product.name" 
              class="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
            />
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ product.name }}</h4>
              <p class="text-xs text-slate-400 line-clamp-1 max-w-xs">{{ product.description }}</p>
            </div>
          </div>
        </td>

        <!-- Category -->
        <td class="p-4 font-semibold text-slate-600 dark:text-slate-300 text-xs">
          {{ product.categoryName || product.category }}
        </td>

        <!-- SKU -->
        <td class="p-4 font-mono font-bold text-slate-400 text-xs">
          {{ product.sku }}
        </td>

        <!-- Price -->
        <td class="p-4 font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
          Rp {{ product.price.toLocaleString('id-ID') }}
        </td>

        <!-- Stock Toggle -->
        <td class="p-4">
          <button 
            @click="menuStore.toggleProductStock(product.id)"
            class="px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 transition-all"
            :class="product.inStock 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="product.inStock ? 'bg-emerald-500' : 'bg-rose-500'"></span>
            <span>{{ product.inStock ? 'In Stock (' + product.stockCount + ')' : 'Sold Out' }}</span>
          </button>
        </td>

        <!-- Rating -->
        <td class="p-4">
          <span class="font-bold text-amber-500 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm fill-1">star</span>
            <span>{{ product.rating }}</span>
          </span>
        </td>

        <!-- Action buttons -->
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-1">
            <router-link 
              :to="'/menu/edit/' + product.id"
              class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              title="Edit Item"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </router-link>

            <button 
              @click="handleDeleteProduct(product)"
              class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Item"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </td>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { useMenuStore } from '@/stores/menu'
import { showToast, showConfirm } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const menuStore = useMenuStore()

const columns = [
  { key: 'name', label: 'Item Details' },
  { key: 'category', label: 'Category' },
  { key: 'sku', label: 'SKU' },
  { key: 'price', label: 'Price' },
  { key: 'inStock', label: 'Stock Status' },
  { key: 'rating', label: 'Rating' },
  { key: 'actions', label: 'Actions', sortable: false, align: 'right' }
]

async function handleDeleteProduct(product) {
  const result = await showConfirm(
    'Delete Product?',
    `Product "${product.name}" will be permanently removed from catalog.`
  )
  if (result.isConfirmed) {
    const res = await menuStore.deleteProduct(product.id)
    if (res.success !== false) {
      showToast('Product deleted successfully', 'success')
    }
  }
}
</script>
