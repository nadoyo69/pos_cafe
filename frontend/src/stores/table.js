import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '@/services/api'

export const useTableStore = defineStore('table', () => {
  const zones = ref([
    { id: 'all', name: 'All Zones' },
    { id: 'floor-1', name: 'Main Hall (Floor 1)' },
    { id: 'terrace', name: 'Outdoor Garden Terrace' },
    { id: 'floor-2', name: 'VIP & Lounge (Floor 2)' }
  ])

  const tables = ref([])
  const activeZone = ref('all')
  const activeStatusFilter = ref('all')
  const selectedTable = ref(null)

  async function fetchTables() {
    const res = await apiFetch('/tables')
    if (res.success && res.data && res.data.length > 0) {
      tables.value = res.data.map(t => ({
        id: t.table_no,
        dbId: t.id,
        tableNo: t.table_no,
        name: t.table_no,
        zone: t.zone || 'floor-1',
        capacity: Number(t.capacity) || 4,
        shape: 'rectangle',
        status: t.status || 'available',
        customerName: t.current_customer_name || '',
        currentCustomerName: t.current_customer_name || '',
        currentTotal: Number(t.current_bill_total || 0),
        currentBillTotal: Number(t.current_bill_total || 0),
        seatedTime: '15m ago',
        occupiedSince: t.occupied_since || null
      }))
    } else if (tables.value.length === 0) {
      tables.value = [
        { id: 'T-01', dbId: 1, tableNo: 'T-01', name: 'Table T-01', zone: 'floor-1', capacity: 2, shape: 'round', status: 'available', customerName: '', currentCustomerName: '', currentTotal: 0, currentBillTotal: 0 },
        { id: 'T-02', dbId: 2, tableNo: 'T-02', name: 'Table T-02', zone: 'floor-1', capacity: 4, shape: 'rectangle', status: 'available', customerName: '', currentCustomerName: '', currentTotal: 0, currentBillTotal: 0 },
        { id: 'T-03', dbId: 3, tableNo: 'T-03', name: 'Table T-03', zone: 'floor-1', capacity: 2, shape: 'round', status: 'occupied', customerName: 'Budi Santoso', currentCustomerName: 'Budi Santoso', currentTotal: 86000, currentBillTotal: 86000, seatedTime: '25m ago' },
        { id: 'T-04', dbId: 4, tableNo: 'T-04', name: 'Table T-04', zone: 'floor-1', capacity: 6, shape: 'large-rect', status: 'available', customerName: '', currentCustomerName: '', currentTotal: 0, currentBillTotal: 0 },
        { id: 'Terrace 01', dbId: 5, tableNo: 'Terrace 01', name: 'Terrace 01', zone: 'terrace', capacity: 4, shape: 'round', status: 'occupied', customerName: 'Maya & Dina', currentCustomerName: 'Maya & Dina', currentTotal: 92000, currentBillTotal: 92000, seatedTime: '40m ago' },
        { id: 'Terrace 02', dbId: 6, tableNo: 'Terrace 02', name: 'Terrace 02', zone: 'terrace', capacity: 2, shape: 'round', status: 'available', customerName: '', currentCustomerName: '', currentTotal: 0, currentBillTotal: 0 },
        { id: 'VIP-1', dbId: 7, tableNo: 'VIP-1', name: 'VIP-1', zone: 'floor-2', capacity: 8, shape: 'large-rect', status: 'reserved', customerName: 'Corporate Group', currentCustomerName: 'Corporate Group', currentTotal: 0, currentBillTotal: 0 },
        { id: 'VIP-2', dbId: 8, tableNo: 'VIP-2', name: 'VIP-2', zone: 'floor-2', capacity: 10, shape: 'large-rect', status: 'available', customerName: '', currentCustomerName: '', currentTotal: 0, currentBillTotal: 0 }
      ]
    }
  }

  onMounted(() => {
    fetchTables()
  })

  const availableTables = computed(() => tables.value.filter(t => t.status === 'available' || t.status === 'empty'))

  const stats = computed(() => {
    const total = tables.value.length
    const occupied = tables.value.filter(t => t.status === 'occupied').length
    const available = tables.value.filter(t => t.status === 'available').length
    const reserved = tables.value.filter(t => t.status === 'reserved').length
    const cleaning = tables.value.filter(t => t.status === 'cleaning').length
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
    return { total, occupied, available, reserved, cleaning, occupancyRate }
  })

  const filteredTables = computed(() => {
    return tables.value.filter(t => {
      const matchZone = (!activeZone.value || activeZone.value === 'all') ? true : (t.zone === activeZone.value)
      const matchStatus = activeStatusFilter.value === 'all' ? true : t.status === activeStatusFilter.value
      return matchZone && matchStatus
    })
  })

  function selectTable(table) {
    selectedTable.value = table
  }

  async function updateTableStatus(arg1, arg2, arg3, arg4) {
    let tableId, status, customerName, billTotal
    if (typeof arg1 === 'object' && arg1 !== null) {
      ({ tableId, status, customerName, billTotal } = arg1)
    } else {
      tableId = arg1
      status = arg2
      customerName = arg3
      billTotal = arg4
    }

    const table = tables.value.find(t => t.id === tableId || t.dbId === tableId || t.tableNo === tableId)
    if (table) {
      table.status = status || table.status
      if (customerName !== undefined) {
        table.customerName = customerName
        table.currentCustomerName = customerName
      }
      if (billTotal !== undefined) {
        table.currentTotal = Number(billTotal)
        table.currentBillTotal = Number(billTotal)
      }
      await updateTable(table)
    }
  }

  async function addTable(data) {
    const tableNo = data.id || data.name || ('T-' + (tables.value.length + 1))
    const res = await apiFetch('/tables', {
      method: 'POST',
      body: {
        table_no: tableNo,
        zone: data.zone || 'floor-1',
        capacity: Number(data.capacity) || 4
      }
    })

    if (res.success) {
      await fetchTables()
    }
  }

  async function updateTable(data) {
    const tableNo = data.id || data.name || data.tableNo
    const targetId = data.dbId || data.id || tableNo
    const res = await apiFetch(`/tables/${targetId}`, {
      method: 'PUT',
      body: {
        table_no: tableNo,
        zone: data.zone,
        capacity: Number(data.capacity),
        status: data.status,
        current_customer_name: data.customerName || data.currentCustomerName || '',
        current_bill_total: Number(data.currentTotal || data.currentBillTotal || 0)
      }
    })

    if (res.success) {
      await fetchTables()
    }
  }

  async function deleteTable(id) {
    const table = tables.value.find(t => t.id === id || t.dbId === id || t.tableNo === id)
    const targetId = (table && table.dbId) ? table.dbId : (table ? table.tableNo : id)
    const res = await apiFetch(`/tables/${targetId}`, { method: 'DELETE' })
    if (res.success !== false) {
      await fetchTables()
    }
  }

  return {
    zones,
    tables,
    activeZone,
    activeStatusFilter,
    selectedTable,
    availableTables,
    filteredTables,
    stats,
    selectTable,
    updateTableStatus,
    fetchTables,
    addTable,
    updateTable,
    deleteTable
  }
})
