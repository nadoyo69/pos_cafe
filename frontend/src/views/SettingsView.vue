<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">System Settings & Store Preferences</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Configure cafe store profile, brand logo, tax rules, thermal printer setup, and alerts
      </p>
    </div>

    <!-- Cafe Profile Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6 text-slate-800 dark:text-slate-100">
      <h3 class="text-base font-extrabold flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
        <span class="material-symbols-outlined text-indigo-500">storefront</span>
        <span>Cafe Store Profile & Branding</span>
      </h3>

      <!-- Logo Upload & Basic Info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <!-- Cafe Logo Upload Box -->
        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">Cafe Brand Logo</label>
          <div 
            @click="triggerLogoInput"
            class="relative w-full h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700/60 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 transition-all cursor-pointer flex flex-col items-center justify-center group"
          >
            <img v-if="settings.logo" :src="settings.logo" alt="Cafe Logo" class="w-full h-full object-contain p-2" />
            <div v-else class="text-center p-4 text-slate-400 space-y-1.5">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
                <span class="material-symbols-outlined text-2xl">local_cafe</span>
              </div>
              <p class="text-[11px] font-bold text-slate-700 dark:text-slate-200">Click to upload logo</p>
              <p class="text-[9px] text-slate-400">PNG, JPG, SVG formats</p>
            </div>

            <!-- Hover overlay when logo present -->
            <div v-if="settings.logo" class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" @click.stop="triggerLogoInput" class="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1 shadow-md">
                <span class="material-symbols-outlined text-base">file_upload</span>
                <span>Change</span>
              </button>
              <button type="button" @click.stop="removeLogo" class="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-md hover:bg-rose-700">
                <span class="material-symbols-outlined text-base">delete</span>
                <span>Remove</span>
              </button>
            </div>
          </div>

          <input 
            type="file" 
            ref="logoInput"
            accept="image/*"
            class="hidden"
            @change="onLogoSelected"
          />
        </div>

        <!-- Inputs Grid -->
        <div class="md:col-span-2 space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-400 mb-1">Cafe Name</label>
              <input 
                type="text" 
                v-model="settings.cafeName"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-400 mb-1">Tagline</label>
              <input 
                type="text" 
                v-model="settings.tagline"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-400 mb-1">Store Address (Appears on Receipts)</label>
            <input 
              type="text" 
              v-model="settings.address"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold text-slate-400 mb-1">Phone Number</label>
              <input 
                type="text" 
                v-model="settings.phone"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-400 mb-1">Tax Rate (PB1 %)</label>
              <input 
                type="number" 
                v-model.number="settings.taxRatePercent"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hardware & POS Preferences Card -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4 text-slate-800 dark:text-slate-100">
      <h3 class="text-base font-extrabold flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
        <span class="material-symbols-outlined text-amber-500">print</span>
        <span>Receipt Printer & Kitchen Display System</span>
      </h3>

      <div class="space-y-3 text-xs">
        <label class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
          <div>
            <p class="font-bold">Auto-Print Thermal Receipt on Payment Completion</p>
            <p class="text-[11px] text-slate-400">Triggers thermal receipt popup right after order is marked paid.</p>
          </div>
          <input 
            type="checkbox" 
            v-model="settings.autoPrintReceipt" 
            class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
        </label>

        <label class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
          <div>
            <p class="font-bold">Kitchen Display Sound Alert for New Orders</p>
            <p class="text-[11px] text-slate-400">Play subtle chime when cashier submits a new ticket to kitchen.</p>
          </div>
          <input 
            type="checkbox" 
            v-model="settings.soundAlerts" 
            class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
        </label>
      </div>

      <div class="pt-2 flex justify-end">
        <button 
          @click="saveSettings"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-lg">save</span>
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReportsStore } from '@/stores/reports'
import { showToast } from '@/utils/swal'

const reportsStore = useReportsStore()
const logoInput = ref(null)

const settings = ref({ ...reportsStore.systemSettings })

function triggerLogoInput() {
  if (logoInput.value) {
    logoInput.value.click()
  }
}

function onLogoSelected(e) {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (evt) => {
      settings.value.logo = evt.target.result
    }
    reader.readAsDataURL(file)
  }
}

function removeLogo() {
  settings.value.logo = ''
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

function saveSettings() {
  reportsStore.updateSettings(settings.value)
  showToast('Store preferences & logo saved successfully!', 'success')
}
</script>
