<template>
  <div v-if="product" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-opacity">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
      
      <!-- Modal Header Banner -->
      <div class="relative h-44 sm:h-52 shrink-0 overflow-hidden bg-slate-800">
        <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        
        <!-- Close Button -->
        <button 
          @click="$emit('close')"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>

        <!-- Title overlay -->
        <div class="absolute bottom-4 left-6 right-6 text-white">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
              {{ product.category }}
            </span>
            <span class="text-xs font-mono text-slate-300">{{ product.sku }}</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">{{ product.name }}</h2>
          <p class="text-xs text-amber-400 font-mono font-bold">
            Base Price: Rp {{ Number(product.price).toLocaleString('id-ID') }}
          </p>
        </div>
      </div>

      <!-- Customization Options Scrollable Body -->
      <div class="p-6 overflow-y-auto space-y-5 flex-1">
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {{ product.description || 'Artisanal beverage crafted with premium ingredients.' }}
        </p>

        <!-- Dynamic Addon Option Groups -->
        <div v-for="(group, gIdx) in activeAddonGroups" :key="gIdx" class="space-y-2">
          <label class="block font-bold uppercase tracking-wider text-slate-400 text-xs">{{ group.title }}</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button 
              v-for="(opt, oIdx) in group.options" 
              :key="oIdx"
              type="button"
              @click="selectedAddons[gIdx] = opt"
              class="p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center text-xs"
              :class="selectedAddons[gIdx]?.name === opt.name 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm ring-2 ring-indigo-600/30' 
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'"
            >
              <span class="font-semibold">{{ opt.name }}</span>
              <span v-if="opt.price > 0" class="text-[10px] text-indigo-500 font-mono mt-0.5">+Rp {{ Number(opt.price).toLocaleString('id-ID') }}</span>
              <span v-else class="text-[10px] text-slate-400 font-mono mt-0.5">Included</span>
            </button>
          </div>
        </div>

        <!-- Custom Special Request Notes -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Item Special Request / Kitchen Notes
          </label>
          <input 
            type="text" 
            v-model="itemNotes"
            placeholder="e.g. Extra hot, serve with ice glass..."
            class="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 font-semibold"
          />
        </div>
      </div>

      <!-- Footer Controls -->
      <div class="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <!-- Quantity Stepper -->
        <div class="flex items-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-1">
          <button 
            @click="quantity = Math.max(1, quantity - 1)"
            class="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">remove</span>
          </button>
          <span class="w-8 text-center font-extrabold text-sm">{{ quantity }}</span>
          <button 
            @click="quantity++"
            class="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">add</span>
          </button>
        </div>

        <!-- Add to Cart Button -->
        <button 
          @click="handleAdd"
          class="flex-1 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-between"
        >
          <span>ADD TO CASHIER CART</span>
          <span class="font-mono text-amber-300">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'add-to-cart'])

const selectedAddons = ref({})
const itemNotes = ref('')
const quantity = ref(1)

const activeAddonGroups = computed(() => {
  if (!props.product) return []
  if (props.product.addons && Array.isArray(props.product.addons) && props.product.addons.length > 0) {
    return props.product.addons
  }
  return getDefaultAddons(props.product)
})

function getDefaultAddons(prod) {
  const cat = (prod.category || prod.categoryName || '').toLowerCase()
  if (cat.includes('food') || cat.includes('pastry') || cat.includes('bakery')) {
    return [
      {
        title: 'Serving Preference',
        options: [
          { name: 'Warm / Toasted', price: 0 },
          { name: 'Room Temperature', price: 0 }
        ]
      },
      {
        title: 'Extra Dip Sauce',
        options: [
          { name: 'No Extra Dip', price: 0 },
          { name: 'Extra Melted Cheese', price: 5000 },
          { name: 'Extra Chocolate Dip', price: 5000 }
        ]
      }
    ]
  }

  return [
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
}

watch(() => props.product, (newProd) => {
  if (newProd) {
    quantity.value = 1
    itemNotes.value = ''
    selectedAddons.value = {}

    const groups = activeAddonGroups.value
    groups.forEach((g, gIdx) => {
      if (g.options && g.options.length > 0) {
        selectedAddons.value[gIdx] = g.options[0]
      }
    })
  }
}, { immediate: true })

const totalPrice = computed(() => {
  if (!props.product) return 0
  let unit = Number(props.product.price) || 0
  Object.values(selectedAddons.value).forEach(opt => {
    if (opt && opt.price) {
      unit += Number(opt.price)
    }
  })
  return unit * quantity.value
})

function handleAdd() {
  const details = Object.values(selectedAddons.value)
    .map(o => o ? o.name : '')
    .filter(Boolean)
    .join(' • ')

  emit('add-to-cart', props.product, {
    size: details || 'Standard',
    addons: Object.values(selectedAddons.value),
    notes: itemNotes.value,
    quantity: quantity.value,
    unitPrice: totalPrice.value / quantity.value
  })
  emit('close')
}
</script>
