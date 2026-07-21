<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ t('exportPage.title') }}</div>

    <q-card flat bordered class="q-pa-md" style="max-width: 480px">
      <div class="text-subtitle1 q-mb-md">{{ t('exportPage.vehiclesEntity') }}</div>
      <q-select
        v-model="status"
        :options="statusOptions"
        :label="t('vehicles.status')"
        outlined
        dense
        clearable
        emit-value
        map-options
        class="q-mb-md"
      />
      <q-select
        v-model="format"
        :options="['csv', 'xlsx']"
        label="Format"
        outlined
        dense
        class="q-mb-md"
      />
      <q-btn color="primary" icon="download" :label="t('exportPage.run')" :loading="loading" @click="run" />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/boot/api'

const { t } = useI18n()
const status = ref<string | null>(null)
const format = ref<'csv' | 'xlsx'>('csv')
const loading = ref(false)

const statusOptions = [
  { label: t('vehicles.statusActive'), value: 'active' },
  { label: t('vehicles.statusSold'), value: 'sold' },
  { label: t('vehicles.statusDraft'), value: 'draft' },
]

async function run() {
  loading.value = true
  try {
    const response = await api.get('/admin/export/vehicles', {
      params: { status: status.value || undefined, format: format.value },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data as Blob)
    const link = document.createElement('a')
    const disposition = response.headers['content-disposition'] as string | undefined
    const match = disposition?.match(/filename="(.+)"/)
    link.href = url
    link.download = match?.[1] ?? `vehicles.${format.value}`
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    loading.value = false
  }
}
</script>
