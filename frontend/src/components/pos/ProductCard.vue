<template>
  <div 
    @click="$emit('select', product)"
    class="group relative w-full min-w-0 bg-white dark:bg-slate-800/90 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    :class="{ 'opacity-60 cursor-not-allowed': !product.inStock }"
  >
    <!-- Product Thumbnail Image -->
    <div class="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 mb-3">
      <img 
        :src="product.image" 
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <!-- Rating Badge -->
      <div class="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-[11px] flex items-center gap-1 z-10">
        <span class="material-symbols-outlined text-xs fill-1">star</span>
        <span>{{ product.rating }}</span>
      </div>

      <!-- Out of Stock Overlay -->
      <div v-if="!product.inStock" class="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider z-10">
        Sold Out
      </div>
    </div>

    <!-- Product Text Content -->
    <div class="flex-1 flex flex-col justify-between min-w-0">
      <div>
        <div class="flex items-center justify-between gap-1 mb-1 min-w-0">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md truncate">
            {{ product.category }}
          </span>
          <span class="text-[10px] text-slate-400 font-mono shrink-0">{{ product.sku }}</span>
        </div>
        <h3 class="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {{ product.name }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-normal leading-snug break-words">
          {{ product.description }}
        </p>
      </div>

      <!-- Price and Quick Add Button -->
      <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 shrink-0">
        <span class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white font-mono">
          Rp {{ product.price.toLocaleString('id-ID') }}
        </span>
        
        <button 
          @click.stop="$emit('quick-add', product)"
          :disabled="!product.inStock"
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition-all shrink-0"
        >
          <span class="material-symbols-outlined text-lg sm:text-xl">add</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['select', 'quick-add'])
</script>
