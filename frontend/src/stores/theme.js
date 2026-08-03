import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('cafe_theme') === 'dark')
  const isSidebarCollapsed = ref(localStorage.getItem('cafe_sidebar_collapsed') === 'true')
  const isMobileSidebarOpen = ref(false)

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('cafe_theme', isDark.value ? 'dark' : 'light')
  }

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    localStorage.setItem('cafe_sidebar_collapsed', isSidebarCollapsed.value)
  }

  function toggleMobileSidebar() {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  function closeMobileSidebar() {
    isMobileSidebarOpen.value = false
  }

  function initTheme() {
    const saved = localStorage.getItem('cafe_theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  watchEffect(() => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  })

  return {
    isDark,
    isSidebarCollapsed,
    isMobileSidebarOpen,
    toggleTheme,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    initTheme
  }
})
