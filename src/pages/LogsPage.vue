<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ t('nav.logs') }}</div>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-3">
        <q-input v-model="filters.search" :label="t('common.search')" outlined dense clearable @update:model-value="reload" />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.userId"
          :options="userOptions"
          :label="t('logs.filterUser')"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="reload"
        />
      </div>
      <div class="col-6 col-md-3">
        <q-input v-model="filters.dateFrom" type="date" :label="t('logs.filterFrom')" outlined dense clearable @update:model-value="reload" />
      </div>
      <div class="col-6 col-md-3">
        <q-input v-model="filters.dateTo" type="date" :label="t('logs.filterTo')" outlined dense clearable @update:model-value="reload" />
      </div>
    </div>

    <q-table
      :rows="logs"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      flat
      bordered
      @request="onRequest"
    >
      <template #body-cell-user="props">
        <q-td :props="props">{{ props.row.user?.name ?? '—' }}</q-td>
      </template>
      <template #body-cell-createdAt="props">
        <q-td :props="props">{{ formatDate(props.row.createdAt) }}</q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/boot/api'
import type { ActivityLog, User } from '@/types'

const { t } = useI18n()

const logs = ref<ActivityLog[]>([])
const loading = ref(false)
const userOptions = ref<{ label: string; value: number }[]>([])

const filters = reactive({
  search: '',
  userId: null as number | null,
  dateFrom: '',
  dateTo: '',
})

const pagination = ref({ page: 1, rowsPerPage: 25, rowsNumber: 0 })

const columns = [
  { name: 'createdAt', label: t('logs.date'), field: 'createdAt', align: 'left' as const },
  { name: 'user', label: t('logs.user'), field: 'user', align: 'left' as const },
  { name: 'action', label: t('logs.action'), field: 'action', align: 'left' as const },
  { name: 'description', label: t('logs.description'), field: 'description', align: 'left' as const },
  { name: 'ip', label: t('logs.ip'), field: 'ip', align: 'left' as const },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

async function fetchLogs() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/logs', {
      params: {
        search: filters.search || undefined,
        userId: filters.userId ?? undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
      },
    })
    logs.value = data.data
    pagination.value.rowsNumber = data.meta.total
  } finally {
    loading.value = false
  }
}

function reload() {
  pagination.value.page = 1
  fetchLogs()
}

function onRequest(requestProps: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = requestProps.pagination.page
  pagination.value.rowsPerPage = requestProps.pagination.rowsPerPage
  fetchLogs()
}

async function loadUsers() {
  const { data } = await api.get('/admin/users', { params: { perPage: 100 } })
  userOptions.value = data.data.map((u: User) => ({ label: `${u.name} (${u.email})`, value: u.id }))
}

onMounted(() => {
  loadUsers()
  fetchLogs()
})
</script>
