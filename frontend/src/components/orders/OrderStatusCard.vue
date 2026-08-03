<template>
  <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div @click="orderStore.selectedOrderForDetail = order" class="cursor-pointer">
        <div class="flex items-center gap-2">
          <span class="font-extrabold font-mono text-base text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{{ order.id }}</span>
          <span 
            class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
            :class="{
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30': order.status === 'pending',
              'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30': order.status === 'preparing',
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30': order.status === 'ready' || order.status === 'completed'
            }"
          >
            {{ order.status }}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Table: <strong class="text-slate-700 dark:text-slate-200">{{ order.tableNo }}</strong> • {{ order.customerName }}
        </p>
      </div>

      <!-- Action Buttons Top Right: Detail, Edit & Print Ticket -->
      <div class="flex items-center gap-1 shrink-0">
        <button 
          @click.stop="orderStore.selectedOrderForDetail = order"
          class="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200 font-bold text-xs flex items-center transition-colors"
          title="View Order Details Popup"
        >
          <span class="material-symbols-outlined text-base">visibility</span>
        </button>

        <button 
          @click.stop="orderStore.selectedOrderForEdit = JSON.parse(JSON.stringify(order))"
          class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center transition-colors"
          title="Edit Order Items & Quantities"
        >
          <span class="material-symbols-outlined text-base">edit</span>
        </button>

        <button 
          @click.stop="printOrderTicket(order)"
          class="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
          title="Print Order Ticket"
        >
          <span class="material-symbols-outlined text-base">print</span>
        </button>
      </div>
    </div>

    <!-- Items Checklist -->
    <div class="space-y-2 border-t border-b border-slate-100 dark:border-slate-700/60 py-3">
      <div 
        v-for="item in order.items" 
        :key="item.id || item.name"
        class="flex items-center justify-between gap-2 text-xs"
      >
        <label class="flex items-center gap-2 cursor-pointer min-w-0">
          <input 
            type="checkbox" 
            :checked="item.isReady"
            @change="orderStore.toggleItemReady(order.id, item.id)"
            class="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
          />
          <span :class="{ 'line-through text-slate-400': item.isReady }" class="font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ item.quantity }}x {{ item.name }}
          </span>
          <span v-if="item.size" class="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
            {{ typeof item.size === 'object' ? item.size.name : item.size }}
          </span>
        </label>

        <span class="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
          Rp {{ ((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID') }}
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between text-xs pt-1">
      <div>
        <span class="text-slate-400 text-[10px] block">Total Amount</span>
        <span class="font-extrabold font-mono text-slate-900 dark:text-white text-sm">
          Rp {{ (order.totalAmount || order.total || 0).toLocaleString('id-ID') }}
        </span>
        <span v-if="(order.discountAmount || order.discount_amount) > 0" class="text-[10px] text-emerald-500 font-bold block">
          Disc: -Rp {{ Number(order.discountAmount || order.discount_amount).toLocaleString('id-ID') }}
        </span>
      </div>

      <div>
        <button 
          v-if="order.status === 'pending'"
          @click="orderStore.updateOrderStatus(order.id, 'preparing')"
          class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
        >
          Start Prep
        </button>

        <button 
          v-else-if="order.status === 'preparing'"
          @click="orderStore.updateOrderStatus(order.id, 'ready')"
          class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          Mark Ready
        </button>

        <button 
          v-else-if="order.status === 'ready'"
          @click="orderStore.updateOrderStatus(order.id, 'completed')"
          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          Complete Order
        </button>

        <span v-else class="text-xs font-bold text-emerald-500 flex items-center gap-1">
          <span class="material-symbols-outlined text-base">check_circle</span> Delivered
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/order'
import { useReportsStore } from '@/stores/reports'

defineProps({
  order: {
    type: Object,
    required: true
  }
})

const orderStore = useOrderStore()
const reportsStore = useReportsStore()

function printOrderTicket(order) {
  const storeName = (reportsStore.systemSettings?.cafeName || 'LUMIÈRE CAFE').toUpperCase()
  const storeTagline = reportsStore.systemSettings?.tagline || 'Artisanal Coffee & Dining'
  const storeAddress = reportsStore.systemSettings?.address || 'Jl. Senopati No. 45, Jakarta'

  const printWin = window.open('', '_blank', 'width=400,height=600')
  const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })
  const subtotal = order.subtotal || order.totalAmount || order.total || 0
  const discount = order.discountAmount || order.discount_amount || 0
  const total = order.totalAmount || order.total || 0

  const itemsHtml = (order.items || []).map(i => `
    <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px;">
      <span>${i.quantity}x ${i.name} (${typeof i.size === 'object' ? i.size.name : (i.size || 'Std')})</span>
      <span>Rp ${((i.unitPrice || i.price || 0) * (i.quantity || 1)).toLocaleString('id-ID')}</span>
    </div>
  `).join('')

  const discountHtml = discount > 0 ? `
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #059669; margin-top: 4px;">
      <span>Diskon Voucher Promo</span>
      <span>-Rp ${Number(discount).toLocaleString('id-ID')}</span>
    </div>
  ` : ''

  printWin.document.write(`
    <html>
      <head>
        <title>Ticket ${order.id}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 15px; margin: 0; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .border { border-top: 1px dashed #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">${storeName}</div>
        <div class="center" style="font-size: 11px; margin-bottom: 2px;">${storeTagline}</div>
        <div class="center" style="font-size: 10px; margin-bottom: 8px;">${storeAddress}</div>
        <div class="border"></div>
        <div>Order #: ${order.id}</div>
        <div>Table #: ${order.tableNo}</div>
        <div>Customer: ${order.customerName}</div>
        <div>Time (WIB): ${dateStr}</div>
        <div class="border"></div>
        ${itemsHtml}
        <div class="border"></div>
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal</span>
          <span>Rp ${Number(subtotal).toLocaleString('id-ID')}</span>
        </div>
        ${discountHtml}
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 6px; font-size: 14px;">
          <span>TOTAL PAYABLE</span>
          <span>Rp ${Number(total).toLocaleString('id-ID')}</span>
        </div>
        <div style="margin-top: 10px; font-size: 11px;">Status: ${order.paymentStatus || 'Paid (Cashier)'}</div>
        <script>window.print(); setTimeout(() => window.close(), 500);<\/script>
      </body>
    </html>
  `)
  printWin.document.close()
}
</script>
