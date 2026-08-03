<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Discounts & Promotions Management</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Create promo codes, set percentage or fixed discounts, validity periods, and live usage tracking
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="discountStore.fetchPromos()"
          class="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Promos</span>
        </button>

        <button 
          @click="openAddModal"
          class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <span class="material-symbols-outlined text-lg">add_circle</span>
          <span>Create New Promo</span>
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Promos</span>
        <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{{ discountStore.promos.length }}</h3>
      </div>
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Promos</span>
        <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{{ discountStore.activePromos.length }}</h3>
      </div>
      <div class="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired / Inactive</span>
        <h3 class="text-2xl font-extrabold text-slate-500 font-mono">{{ discountStore.expiredPromos.length }}</h3>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="discountStore.promos"
      :columns="columns"
      :search-keys="['code', 'name', 'description']"
      search-placeholder="Search by promo code, name, or description..."
      :default-per-page="10"
    >
      <template #row="{ row: promo }">
        <td class="p-4">
          <div>
            <h4 class="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm font-mono tracking-wider">{{ promo.code }}</h4>
            <p class="text-[11px] text-slate-400">{{ promo.name }}</p>
          </div>
        </td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase" :class="promo.type === 'percentage' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'">
            {{ promo.type === 'percentage' ? promo.value + '%' : 'Rp ' + promo.value.toLocaleString('id-ID') }}
          </span>
        </td>
        <td class="p-4 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
          Rp {{ promo.minPurchase.toLocaleString('id-ID') }}
        </td>
        <td class="p-4 text-[11px] text-slate-500 whitespace-nowrap font-mono">
          {{ promo.validFrom || 'Immediate' }} <br/> to {{ promo.validTo || 'Unlimited' }}
        </td>
        <td class="p-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div class="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all" 
                  :class="promo.usageCount >= promo.usageLimit ? 'bg-rose-500' : 'bg-indigo-500'"
                  :style="{ width: Math.min(100, (promo.usageCount / promo.usageLimit) * 100) + '%' }"
                ></div>
              </div>
              <span class="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">{{ promo.usageCount }}/{{ promo.usageLimit }}</span>
            </div>
            <p class="text-[10px] text-slate-400 font-mono">
              Remaining: <span class="font-extrabold text-amber-500">{{ Math.max(0, promo.usageLimit - promo.usageCount) }} uses</span>
            </p>
          </div>
        </td>
        <td class="p-4">
          <span 
            class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5"
            :class="{
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30': promo.status === 'active' && promo.usageCount < promo.usageLimit,
              'bg-rose-500/10 text-rose-500 border border-rose-500/30': promo.status === 'expired' || promo.usageCount >= promo.usageLimit,
              'bg-slate-500/10 text-slate-500 border border-slate-500/30': promo.status === 'inactive'
            }"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="{ 'bg-emerald-500': promo.status === 'active' && promo.usageCount < promo.usageLimit, 'bg-rose-500': promo.status === 'expired' || promo.usageCount >= promo.usageLimit, 'bg-slate-400': promo.status === 'inactive' }"></span>
            {{ promo.usageCount >= promo.usageLimit ? 'LIMIT REACHED' : promo.status }}
          </span>
        </td>
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-1">
            <button @click="openEditModal(promo)" class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors" title="Edit Promo">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button @click="handleDelete(promo)" class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors" title="Delete Promo">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Promo Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">{{ isEditing ? 'Edit Promotion' : 'Create New Promotion' }}</h3>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="savePromo" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Promo Code</label>
              <input type="text" v-model="form.code" required placeholder="e.g. SUMMER25" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Promo Name</label>
              <input type="text" v-model="form.name" required placeholder="e.g. Summer Sale" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
            <input type="text" v-model="form.description" placeholder="Brief description of the promotion" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Discount Type</label>
              <select v-model="form.type" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rp)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">{{ form.type === 'percentage' ? 'Discount %' : 'Discount Amount' }}</label>
              <input type="number" v-model.number="form.value" min="1" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Min Purchase (Rp)</label>
              <input type="number" v-model.number="form.minPurchase" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Usage Limit</label>
              <input type="number" v-model.number="form.usageLimit" min="1" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30">Save Promotion</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDiscountStore } from '@/stores/discount'
import { showToast, showConfirm } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const discountStore = useDiscountStore()
const isModalOpen = ref(false)
const isEditing = ref(false)

const columns = [
  { key: 'code', label: 'Promo Code' },
  { key: 'value', label: 'Discount' },
  { key: 'minPurchase', label: 'Min Purchase' },
  { key: 'validFrom', label: 'Valid Period' },
  { key: 'usageCount', label: 'Usage / Limit' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', sortable: false, align: 'right' }
]

const defaultForm = { code: '', name: '', description: '', type: 'percentage', value: 10, minPurchase: 50000, maxDiscount: 50000, validFrom: '', validTo: '', usageLimit: 100 }
const form = ref({ ...defaultForm })

onMounted(() => {
  discountStore.fetchPromos()
})

function openAddModal() {
  isEditing.value = false
  form.value = { ...defaultForm }
  isModalOpen.value = true
}

function openEditModal(promo) {
  isEditing.value = true
  form.value = { ...promo }
  isModalOpen.value = true
}

async function savePromo() {
  if (isEditing.value) {
    await discountStore.updatePromo(form.value)
    showToast('Promotion updated successfully', 'success')
  } else {
    await discountStore.addPromo(form.value)
    showToast('New promotion created successfully', 'success')
  }
  isModalOpen.value = false
}

async function handleDelete(promo) {
  const result = await showConfirm('Delete Promotion?', `Promo code "${promo.code}" will be permanently removed.`)
  if (result.isConfirmed) {
    await discountStore.deletePromo(promo.id)
    showToast('Promotion deleted successfully', 'success')
  }
}
</script>
