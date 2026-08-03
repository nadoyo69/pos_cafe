<template>
  <div class="min-h-screen w-full relative flex items-center justify-center p-4 bg-slate-950 text-white font-sans overflow-hidden">
    <!-- Glassmorphic Background -->
    <div class="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=80" 
        alt="Background"
        class="w-full h-full object-cover opacity-25 scale-105 filter blur-xs"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40"></div>
    </div>

    <!-- Top Right Links -->
    <div class="absolute top-6 right-6 z-20 flex items-center gap-3">
      <router-link 
        to="/"
        class="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
      >
        <span class="material-symbols-outlined text-base">storefront</span>
        <span>Customer Entrance</span>
      </router-link>

      <button 
        @click="themeStore.toggleTheme()"
        class="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all"
      >
        <span class="material-symbols-outlined text-xl">
          {{ themeStore.isDark ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl border border-white/20 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Header with Dynamic Logo & Store Title -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30 overflow-hidden p-1">
          <img v-if="reportsStore.systemSettings?.logo" :src="reportsStore.systemSettings.logo" alt="Logo" class="w-full h-full object-contain" />
          <span v-else class="material-symbols-outlined text-3xl">admin_panel_settings</span>
        </div>
        <h1 class="text-2xl font-extrabold tracking-wide uppercase">{{ (reportsStore.systemSettings?.cafeName || 'LUMIÈRE') }} POS</h1>
        <p class="text-xs text-amber-400 font-semibold uppercase tracking-wider">Cashier & Admin Management Portal</p>
        <p class="text-xs text-slate-300">Please enter your Username and Password credentials</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Username Field -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Username</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">person</span>
            <input 
              type="text" 
              v-model="username"
              required
              placeholder="Enter username..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Password</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">lock</span>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password"
              required
              placeholder="Enter password..."
              class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
            >
              <span class="material-symbols-outlined text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <span v-if="isLoading" class="animate-spin material-symbols-outlined text-lg">progress_activity</span>
          <span v-else class="material-symbols-outlined text-lg">login</span>
          <span>{{ isLoading ? 'VERIFYING...' : 'LOGIN TO POS TERMINAL' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useReportsStore } from '@/stores/reports'
import { showToast } from '@/utils/swal'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const reportsStore = useReportsStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

onMounted(() => {
  reportsStore.fetchSettings()
})

async function handleLogin() {
  if (!username.value || !password.value) {
    showToast('Please enter both username and password', 'warning')
    return
  }

  isLoading.value = true
  const success = await authStore.login(username.value, password.value)
  isLoading.value = false

  if (success) {
    showToast(`Welcome back, ${authStore.user?.name || username.value}!`, 'success')
    router.push('/pos')
  } else {
    showToast(authStore.authError || 'Invalid username or password credentials', 'error')
  }
}
</script>
