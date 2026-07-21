<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md q-col-gutter-sm">
      <div class="text-h6 col-12 col-md-auto">{{ t('nav.orders') }}</div>
      <div class="col-12 col-md-3">
        <q-input v-model="filters.search" :label="t('common.search')" dense outlined clearable @update:model-value="reload" />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          :label="t('common.status')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="reload"
        />
      </div>
    </div>

    <q-table
      :rows="orders"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      flat
      bordered
      @request="onRequest"
    >
      <template #body-cell-vehicle="props">
        <q-td :props="props">
          <span v-if="props.row.vehicle">{{ props.row.vehicle.brand }} {{ props.row.vehicle.model }}</span>
          <span v-else class="text-grey-6">—</span>
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-select
            :model-value="props.row.status"
            :options="statusOptions"
            dense
            borderless
            emit-value
            map-options
            @update:model-value="(val) => updateStatus(props.row, val)"
          />
        </q-td>
      </template>
      <template #body-cell-createdAt="props">
        <q-td :props="props">{{ new Date(props.row.createdAt).toLocaleString() }}</q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { api } from '@/boot/api'
import type { AdminOrder, OrderStatus } from '@/types'

const { t } = useI18n()
const $q = useQuasar()

const orders = ref<AdminOrder[]>([])
const loading = ref(false)
const filters = reactive({ search: '', status: null as OrderStatus | null })
const pagination = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 })

const statusOptions = [
  { label: t('orders.statusNew'), value: 'new' },
  { label: t('orders.statusInProgress'), value: 'in_progress' },
  { label: t('orders.statusProcessed'), value: 'processed' },
  { label: t('orders.statusDeclined'), value: 'declined' },
]

const columns = [
  { name: 'createdAt', label: t('common.createdAt'), field: 'createdAt', align: 'left' as const },
  { name: 'name', label: t('orders.name'), field: 'name', align: 'left' as const },
  { name: 'phone', label: t('orders.phone'), field: 'phone', align: 'left' as const },
  { name: 'vehicle', label: t('orders.vehicle'), field: 'vehicle', align: 'left' as const },
  { name: 'message', label: t('orders.message'), field: 'message', align: 'left' as const },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' as const },
]

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/orders', {
      params: {
        search: filters.search || undefined,
        status: filters.status || undefined,
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
      },
    })
    orders.value = data.data
    pagination.value.rowsNumber = data.meta.total
  } finally {
    loading.value = false
  }
}

function reload() {
  pagination.value.page = 1
  load()
}

function onRequest(requestProps: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = requestProps.pagination.page
  pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage
  load()
}

async function updateStatus(order: AdminOrder, status: OrderStatus) {
  await api.patch(`/admin/orders/${order.id}`, { status })
  $q.notify({ type: 'positive', message: t('common.saved') })
  await load()
}

onMounted(load)
</script>
