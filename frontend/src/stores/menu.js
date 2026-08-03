import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useMenuStore = defineStore('menu', () => {
  // ---------------------------------------------------------------------------
  // 1. FOOD & BEVERAGE MENU CATALOG (FOR POS & CUSTOMER DIGITAL MENU)
  // ---------------------------------------------------------------------------
  const categories = ref([
    { id: 'all', name: 'All Menu Items', icon: 'grid_view' },
    { id: 'coffee', name: 'Artisan Coffee', icon: 'local_cafe' },
    { id: 'non-coffee', name: 'Non-Coffee & Teas', icon: 'emoji_food_beverage' },
    { id: 'food', name: 'Food & Pastries', icon: 'bakery_dining' },
    { id: 'desserts', name: 'Desserts & Sweets', icon: 'icecream' },
    { id: 'beans', name: 'Coffee Beans & Merch', icon: 'shopping_bag' }
  ])

  const products = ref([])
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  const selectedProduct = ref(null)
  const isProductModalOpen = ref(false)

  async function fetchCategories() {
    const res = await apiFetch('/categories')
    if (res.success && res.data && res.data.length > 0) {
      const dbCats = res.data.map(c => ({
        id: c.slug,
        dbId: c.id,
        slug: c.slug,
        name: c.name,
        icon: c.icon || 'local_cafe',
        description: c.description
      }))
      categories.value = [{ id: 'all', name: 'All Menu Items', icon: 'grid_view' }, ...dbCats]
    }
  }

  async function fetchProducts() {
    const res = await apiFetch('/products')
    if (res.success && res.data && res.data.length > 0) {
      products.value = res.data.map(p => {
        let addonsArr = []
        if (p.addons && Array.isArray(p.addons)) addonsArr = p.addons
        else if (p.addons_json) {
          addonsArr = typeof p.addons_json === 'string' ? JSON.parse(p.addons_json) : p.addons_json
        }
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category ? (typeof p.category === 'object' ? p.category.slug : p.category) : 'coffee',
          categoryName: p.category ? (typeof p.category === 'object' ? p.category.name : p.category) : 'Artisan Coffee',
          description: p.description,
          price: Number(p.price),
          rating: Number(p.rating) || 4.9,
          inStock: p.in_stock,
          stockCount: p.stock_count || 50,
          image: p.image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
          addons: Array.isArray(addonsArr) ? addonsArr : [],
          tags: [p.category ? (typeof p.category === 'object' ? p.category.slug : p.category) : 'coffee']
        }
      })
    }
  }

  function getItemCountForCategory(catIdOrSlug) {
    if (!catIdOrSlug || catIdOrSlug === 'all') return products.value.length
    return products.value.filter(p => p.category === catIdOrSlug || p.categoryName === catIdOrSlug).length
  }

  const filteredProducts = computed(() => {
    return products.value.filter(product => {
      const matchesCategory = selectedCategory.value === 'all' || product.category === selectedCategory.value
      const matchesSearch = searchQuery.value === '' ||
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
      return matchesCategory && matchesSearch
    })
  })

  function openProductDetail(product) {
    selectedProduct.value = product
    isProductModalOpen.value = true
  }

  function closeProductDetail() {
    isProductModalOpen.value = false
    selectedProduct.value = null
  }

  async function toggleProductStock(productId) {
    const res = await apiFetch(`/products/${productId}/toggle-stock`, { method: 'PATCH' })
    if (res.success) {
      await fetchProducts()
    } else {
      const product = products.value.find(p => p.id === productId)
      if (product) product.inStock = !product.inStock
    }
  }

  async function addProduct(data) {
    const res = await apiFetch('/products', {
      method: 'POST',
      body: {
        category_id: data.category || 1,
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        stock_count: data.stockCount,
        image: data.image,
        addons: data.addons || []
      }
    })
    if (res.success) await fetchProducts()
    return res
  }

  async function updateProduct(data) {
    const res = await apiFetch(`/products/${data.id}`, {
      method: 'PUT',
      body: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock_count: data.stockCount,
        image: data.image,
        addons: data.addons || []
      }
    })
    if (res.success) await fetchProducts()
    return res
  }

  async function deleteProduct(id) {
    const res = await apiFetch(`/products/${id}`, { method: 'DELETE' })
    if (res.success) {
      products.value = products.value.filter(p => p.id !== id)
    }
    return res
  }

  async function addCategory(data) {
    const res = await apiFetch('/categories', {
      method: 'POST',
      body: data
    })
    if (res.success) await fetchCategories()
    return res
  }

  async function updateCategory(id, data) {
    const res = await apiFetch(`/categories/${id}`, {
      method: 'PUT',
      body: data
    })
    if (res.success) await fetchCategories()
    return res
  }

  async function deleteCategory(id) {
    const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' })
    if (res.success) await fetchCategories()
    return res
  }

  // ---------------------------------------------------------------------------
  // 2. SYSTEM DYNAMIC NAVIGATION MENUS (FOR SIDEBAR & MENU MANAGEMENT CRUD)
  // ---------------------------------------------------------------------------
  const flatMenus = ref([])
  const treeMenus = ref([])

  async function fetchMenus() {
    const res = await apiFetch('/settings/menus')
    if (res.success && res.data) {
      flatMenus.value = res.data.flat || []
      treeMenus.value = res.data.tree || []
    }
  }

  async function addMenu(menuData) {
    const res = await apiFetch('/settings/menus', {
      method: 'POST',
      body: menuData
    })
    if (res.success) await fetchMenus()
    return res
  }

  async function updateMenu(id, menuData) {
    const res = await apiFetch(`/settings/menus/${id}`, {
      method: 'PUT',
      body: menuData
    })
    if (res.success) await fetchMenus()
    return res
  }

  async function deleteMenu(id) {
    const res = await apiFetch(`/settings/menus/${id}`, { method: 'DELETE' })
    if (res.success) await fetchMenus()
    return res
  }

  // Initialize all datasets on store creation
  onMounted(() => {
    fetchCategories()
    fetchProducts()
    fetchMenus()
  })

  return {
    // Food & Drink Catalog
    categories,
    products,
    selectedCategory,
    searchQuery,
    selectedProduct,
    isProductModalOpen,
    filteredProducts,
    getItemCountForCategory,
    fetchCategories,
    fetchProducts,
    openProductDetail,
    closeProductDetail,
    toggleProductStock,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,

    // System Navigation Menus
    flatMenus,
    treeMenus,
    fetchMenus,
    addMenu,
    updateMenu,
    deleteMenu
  }
})
