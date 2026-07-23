<template>
  <div>
    <div class="row items-center q-mb-md q-col-gutter-sm">
      <div class="col-12 col-md-4">
        <q-input v-model="filters.search" :label="t('common.search')" dense outlined clearable debounce="350" @update:model-value="reload">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
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
      class="app-table"
      @request="onRequest"
    >
      <template #no-data>
        <div class="state-block full-width">
          <q-icon name="inbox" size="42px" />
          <div class="q-mt-sm">{{ t('orders.empty') }}</div>
        </div>
      </template>

      <template #body-cell-vehicle="props">
        <q-td :props="props">
          <span v-if="props.row.vehicle">{{ props.row.vehicle.brand }} {{ props.row.vehicle.model }}</span>
          <span v-else class="text-muted">—</span>
        </q-td>
      </template>

      <template v-if="ownership === 'partner'" #body-cell-partner="props">
        <q-td :props="props">
          <span v-if="props.row.vehicle?.creatorName">{{ props.row.vehicle.creatorName }}</span>
          <span v-else class="text-muted">—</span>
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-select
            :model-value="props.row.status"
            :options="statusOptions"
            dense
            borderless
            options-dense
            emit-value
            map-options
            @update:model-value="(val) => updateStatus(props.row, val)"
          >
            <template #selected>
              <q-badge :color="statusColor(props.row.status)" :label="statusLabelFor(props.row.status)" />
            </template>
          </q-select>
        </q-td>
      </template>

      <template #body-cell-createdAt="props">
        <q-td :props="props">{{ new Date(props.row.createdAt).toLocaleString() }}</q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { api } from '@/boot/api'
import { usePolling } from '@/composables/usePolling'
import type { AdminOrder, OrderStatus } from '@/types'

const props = defineProps<{ ownership: 'regular' | 'partner' | 'partnership' }>()

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

const baseColumns = [
  { name: 'createdAt', label: t('common.createdAt'), field: 'createdAt', align: 'left' as const },
  { name: 'name', label: t('orders.name'), field: 'name', align: 'left' as const },
  { name: 'phone', label: t('orders.phone'), field: 'phone', align: 'left' as const },
]
const vehicleColumn = { name: 'vehicle', label: t('orders.vehicle'), field: 'vehicle', align: 'left' as const }
const emailColumn = { name: 'email', label: t('orders.email'), field: 'email', align: 'left' as const }
const partnerColumn = { name: 'partner', label: t('orders.partner'), field: 'partner', align: 'left' as const }
const tailColumns = [
  { name: 'message', label: t('orders.message'), field: 'message', align: 'left' as const },
  { name: 'status', label: t('common.status'), field: 'status', align: 'left' as const },
]
// Partnership applications carry no vehicle, so show the contact email instead.
const columns =
  props.ownership === 'partnership'
    ? [...baseColumns, emailColumn, ...tailColumns]
    : props.ownership === 'partner'
      ? [...baseColumns, vehicleColumn, partnerColumn, ...tailColumns]
      : [...baseColumns, vehicleColumn, ...tailColumns]

function statusColor(status: string) {
  return { new: 'primary', in_progress: 'warning', processed: 'positive', declined: 'grey' }[status] ?? 'grey'
}
function statusLabelFor(status: string) {
  return statusOptions.find((o) => o.value === status)?.label ?? status
}

async function load({ silent = false }: { silent?: boolean } = {}) {
  if (!silent) loading.value = true
  try {
    const { data } = await api.get('/admin/orders', {
      params: {
        ownership: props.ownership,
        search: filters.search || undefined,
        status: filters.status || undefined,
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
      },
    })
    orders.value = data.data
    pagination.value.rowsNumber = data.meta.total
  } finally {
    if (!silent) loading.value = false
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

onMounted(() => load())

// Keep the list in sync with orders/status changes made elsewhere (client site,
// partner panel) without forcing a manual reload.
usePolling(() => load({ silent: true }))
</script>
