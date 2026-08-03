<template>
  <div class="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">User Management (CRUD Staff)</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Manage staff accounts, assign cashier/admin roles, and toggle access permissions
        </p>
      </div>
      <button 
        @click="openAddModal"
        class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
      >
        <span class="material-symbols-outlined text-lg">person_add</span>
        <span>Add New Staff User</span>
      </button>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="settingsStore.users"
      :columns="columns"
      :search-keys="['name', 'username', 'role', 'id']"
      search-placeholder="Search by name, username or role..."
      :default-per-page="10"
    >
      <template #row="{ row: user }">
        <td class="p-4">
          <div class="flex items-center gap-3">
            <img :src="user.avatar" :alt="user.name" class="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{{ user.name }}</h4>
              <p class="text-[11px] font-mono text-slate-400">ID: {{ user.id }}</p>
            </div>
          </div>
        </td>
        <td class="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
          {{ user.username }}
        </td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800">
            {{ user.role }}
          </span>
        </td>
        <td class="p-4">
          <button 
            @click="settingsStore.toggleUserStatus(user.id)"
            class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            :class="user.status === 'active' 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
            <span>{{ user.status }}</span>
          </button>
        </td>
        <td class="p-4 text-slate-500 font-mono">{{ user.lastLogin }}</td>
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-1">
            <button @click="openEditModal(user)" class="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors" title="Edit User">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button @click="handleDeleteUser(user)" class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors" title="Delete User">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- User Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-extrabold">{{ isEditing ? 'Edit Staff User Account' : 'Add New Staff User' }}</h3>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <form @submit.prevent="saveUser" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
            <input type="text" v-model="form.name" required placeholder="e.g. Sarah Jenkins" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Login Username</label>
            <input type="text" v-model="form.username" required placeholder="e.g. kasir or sarah.jenkins" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
            <input type="password" v-model="form.password" :required="!isEditing" placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block font-bold uppercase tracking-wider text-slate-400 mb-1">Select Role</label>
            <select v-model="form.role" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500">
              <option value="General Manager">General Manager & Admin</option>
              <option value="Senior Cashier">Senior Cashier</option>
              <option value="Junior Cashier">Junior Cashier</option>
              <option value="Head Barista">Head Barista / Kitchen</option>
            </select>
          </div>
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30">Save Account</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { showToast, showConfirm } from '@/utils/swal'
import DataTable from '@/components/common/DataTable.vue'

const settingsStore = useSettingsStore()
const isModalOpen = ref(false)
const isEditing = ref(false)
const form = ref({ id: '', name: '', username: '', password: '', role: 'Senior Cashier' })

const columns = [
  { key: 'name', label: 'Staff Member' },
  { key: 'username', label: 'Username' },
  { key: 'role', label: 'Assigned Role' },
  { key: 'status', label: 'Account Status' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'actions', label: 'Actions', sortable: false, align: 'right' }
]

function openAddModal() {
  isEditing.value = false
  form.value = { id: '', name: '', username: '', password: '', role: 'Senior Cashier' }
  isModalOpen.value = true
}
function openEditModal(u) {
  isEditing.value = true
  form.value = { ...u, password: '' }
  isModalOpen.value = true
}
function saveUser() {
  if (isEditing.value) {
    settingsStore.updateUser(form.value)
    showToast('User account updated successfully', 'success')
  } else {
    settingsStore.addUser(form.value)
    showToast('New staff account created successfully', 'success')
  }
  isModalOpen.value = false
}
async function handleDeleteUser(user) {
  const result = await showConfirm('Delete User Account?', `Account "${user.name}" (${user.username}) will be removed.`)
  if (result.isConfirmed) {
    settingsStore.deleteUser(user.id)
    showToast('User deleted successfully', 'success')
  }
}
</script>
