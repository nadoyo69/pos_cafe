<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">
          {{ isEdit ? 'Edit Cafe Menu Item' : 'Add New Cafe Menu Item' }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Upload item image, select category, base price, stock, and custom per-product addons
        </p>
      </div>

      <router-link 
        to="/menu" 
        class="px-4 py-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
        <span>Back to Catalog</span>
      </router-link>
    </div>

    <!-- Main Form Card -->
    <form @submit.prevent="saveProduct" class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6 text-slate-800 dark:text-slate-100">
      
      <!-- Top Section: Image Upload & Essential Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Image Upload Field -->
        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">Product Image (File Upload)</label>
          <div 
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            class="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700/60 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center group"
            :class="isDragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'"
          >
            <img v-if="form.image" :src="form.image" alt="Preview" class="w-full h-full object-cover" />
            <div v-else class="text-center p-4 text-slate-400 space-y-2">
              <div class="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-700 dark:text-slate-200">Click to upload image</p>
                <p class="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP formats</p>
              </div>
            </div>

            <!-- Hover overlay when image present -->
            <div v-if="form.image" class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" @click.stop="triggerFileInput" class="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-base">file_upload</span>
                <span>Change</span>
              </button>
              <button type="button" @click.stop="removeImage" class="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-md hover:bg-rose-700">
                <span class="material-symbols-outlined text-base">delete</span>
                <span>Remove</span>
              </button>
            </div>
          </div>

          <input 
            type="file" 
            ref="fileInput"
            accept="image/*"
            class="hidden"
            @change="onFileSelected"
          />
        </div>

        <!-- Inputs Grid -->
        <div class="md:col-span-2 space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product Title</label>
            <input 
              type="text" 
              v-model="form.name"
              required
              placeholder="e.g. Vanilla Bean Cold Foam Latte" 
              class="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Category Selection -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <select 
                v-model="form.category"
                required
                class="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>-- Select Category --</option>
                <option 
                  v-for="cat in availableCategories" 
                  :key="cat.id" 
                  :value="cat.name || cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Auto-generated System SKU Code -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">SKU Code</label>
                <button type="button" @click="form.sku = generateSystemSku()" class="text-[10px] text-indigo-500 hover:underline font-semibold">Auto-Generate</button>
              </div>
              <input 
                type="text" 
                v-model="form.sku"
                readonly
                placeholder="SKU-AUTO-GEN" 
                class="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Base Price (Rp)</label>
              <input 
                type="number" 
                v-model.number="form.price"
                required
                placeholder="35000" 
                class="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Stock Units</label>
              <input 
                type="number" 
                v-model.number="form.stockCount"
                placeholder="50" 
                class="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description & Ingredients</label>
        <textarea 
          v-model="form.description"
          rows="2"
          placeholder="Brief description for cashier and customer popup..."
          class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <!-- Addons & Custom Options Configuration per Product -->
      <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-extrabold flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-500">tune</span>
              <span>Product Custom Addons & Options</span>
            </h3>
            <p class="text-[11px] text-slate-400">Configure custom option groups specific to this product (e.g. Size, Milk, Topping, Temperature, Crust)</p>
          </div>
          <button 
            type="button" 
            @click="addAddonGroup" 
            class="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <span class="material-symbols-outlined text-sm">add_circle</span>
            <span>Add Option Group</span>
          </button>
        </div>

        <div v-if="!form.addons || form.addons.length === 0" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
          No custom option groups configured. Click "Add Option Group" above to create custom choices for this product.
        </div>

        <div v-for="(group, gIdx) in form.addons" :key="gIdx" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1">
              <label class="block font-bold text-slate-400 text-[10px] uppercase mb-0.5">Group Title</label>
              <input 
                type="text" 
                v-model="group.title" 
                placeholder="e.g. Cup Size / Milk Choice / Extra Toppings" 
                class="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs" 
              />
            </div>
            <button 
              type="button" 
              @click="removeAddonGroup(gIdx)" 
              class="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 mt-4" 
              title="Delete Option Group"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>

          <!-- Options List inside Group -->
          <div class="space-y-2 pl-3 border-l-2 border-indigo-500/40">
            <div v-for="(opt, oIdx) in group.options" :key="oIdx" class="flex items-center gap-2">
              <input 
                type="text" 
                v-model="opt.name" 
                placeholder="Option Choice (e.g. Oat Milk / Extra Espresso)" 
                class="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold" 
              />
              <div class="w-36 flex items-center gap-1">
                <span class="text-slate-400 font-mono text-[11px]">+Rp</span>
                <input 
                  type="number" 
                  v-model.number="opt.price" 
                  placeholder="0" 
                  class="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs" 
                />
              </div>
              <button 
                type="button" 
                @click="removeOption(gIdx, oIdx)" 
                class="p-1 text-slate-400 hover:text-rose-500"
              >
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <button 
              type="button" 
              @click="addOption(gIdx)" 
              class="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 pt-1"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Add Option Choice</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Footer -->
      <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
        <router-link 
          to="/menu" 
          class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
        >
          Cancel
        </router-link>

        <button 
          type="submit"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-lg">save</span>
          <span>Save Item</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { showAlert, showToast } from '@/utils/swal'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

const fileInput = ref(null)
const isDragging = ref(false)
const isEdit = computed(() => !!route.params.id)

function generateSystemSku() {
  return 'SKU-' + Math.floor(1000 + Math.random() * 9000)
}

const form = ref({
  id: '',
  name: '',
  category: '',
  sku: generateSystemSku(),
  price: 35000,
  stockCount: 50,
  inStock: true,
  image: '',
  description: '',
  addons: [
    {
      title: 'Cup Size',
      options: [
        { name: 'Standard (12oz)', price: 0 },
        { name: 'Large (16oz)', price: 5000 },
        { name: 'Grand (20oz)', price: 8000 }
      ]
    },
    {
      title: 'Milk Choice',
      options: [
        { name: 'Fresh Milk', price: 0 },
        { name: 'Oat Milk', price: 5000 },
        { name: 'Almond Milk', price: 5000 }
      ]
    },
    {
      title: 'Sugar Level',
      options: [
        { name: '100% Normal', price: 0 },
        { name: '50% Less', price: 0 },
        { name: '25% Slight', price: 0 },
        { name: '0% No Sugar', price: 0 }
      ]
    }
  ]
})

const availableCategories = computed(() => {
  return menuStore.categories.filter(c => c.id !== 'all')
})

function addAddonGroup() {
  if (!form.value.addons) form.value.addons = []
  form.value.addons.push({
    title: 'Custom Option Group',
    options: [
      { name: 'Option 1', price: 0 }
    ]
  })
}

function removeAddonGroup(gIdx) {
  form.value.addons.splice(gIdx, 1)
}

function addOption(gIdx) {
  form.value.addons[gIdx].options.push({ name: '', price: 0 })
}

function removeOption(gIdx, oIdx) {
  form.value.addons[gIdx].options.splice(oIdx, 1)
}

onMounted(async () => {
  if (menuStore.categories.length <= 1) {
    await menuStore.fetchCategories()
  }

  if (availableCategories.value.length > 0 && !form.value.category) {
    form.value.category = availableCategories.value[0].name
  }

  if (isEdit.value) {
    const existing = menuStore.products.find(p => String(p.id) === String(route.params.id))
    if (existing) {
      const copy = JSON.parse(JSON.stringify(existing))
      if (!copy.addons || copy.addons.length === 0) {
        copy.addons = form.value.addons
      }
      form.value = copy
    }
  }
})

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function processFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.image = e.target.result
  }
  reader.readAsDataURL(file)
}

function onFileSelected(e) {
  const file = e.target.files[0]
  processFile(file)
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  processFile(file)
}

function removeImage() {
  form.value.image = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function saveProduct() {
  if (!form.value.name) {
    showAlert('Validation Error', 'Product title is required.', 'error')
    return
  }

  let res
  if (isEdit.value) {
    res = await menuStore.updateProduct(form.value)
  } else {
    res = await menuStore.addProduct(form.value)
  }

  showToast('Product saved with custom addons successfully!', 'success')
  router.push('/menu')
}
</script>
