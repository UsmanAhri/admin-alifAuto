<template>
  <q-page class="q-pa-md">
    <div class="page-title q-mb-md">{{ t('importPage.title') }}</div>

    <q-tabs v-model="type" dense class="text-primary q-mb-md">
      <q-tab name="categories" :label="t('importPage.categories')" />
      <q-tab name="characteristics" :label="t('importPage.characteristics')" />
      <q-tab name="vehicles" :label="t('importPage.vehiclesEntity')" />
    </q-tabs>

    <q-card flat bordered class="q-pa-md" style="max-width: 640px">
      <div class="text-caption text-grey-7 q-mb-md">{{ hint }}</div>
      <q-file v-model="file" outlined dense :label="t('importPage.file')" accept=".csv,.txt,.xlsx" />
      <q-btn color="primary" class="q-mt-md" :label="t('importPage.run')" :loading="loading" :disable="!file" @click="run" />

      <q-banner v-if="result" class="q-mt-md" :class="result.errors.length ? 'bg-orange-1' : 'bg-green-1'">
        <div class="text-subtitle2 q-mb-xs">{{ t('importPage.result') }}</div>
        <div>created: {{ result.created }}, updated: {{ result.updated }}, skipped: {{ result.skipped }}</div>
        <ul v-if="result.errors.length">
          <li v-for="(err, i) in result.errors" :key="i" class="text-caption">{{ err }}</li>
        </ul>
      </q-banner>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { api } from '@/boot/api'

const { t } = useI18n()
const $q = useQuasar()

const type = ref<'categories' | 'characteristics' | 'vehicles'>('categories')
const file = ref<File | null>(null)
const loading = ref(false)
const result = ref<{ created: number; updated: number; skipped: number; errors: string[] } | null>(null)

const hints: Record<string, string> = {
  categories: 'Columns: slug, parent_slug, position, is_active, title_ru, title_en, title_zh',
  characteristics: 'Columns: group_ru, group_en, group_zh, name_ru, name_en, name_zh, use_in_filters, values_ru, values_en, values_zh (pipe-separated, aligned by position)',
  vehicles: 'Columns: slug, category_slug, brand, model, generation, year, mileage, price, currency, body_type, engine_type, engine_volume, power, transmission, drive, color, vin, status, is_new, is_popular, description_ru, description_en, description_zh, photo_urls (pipe-separated URLs)',
}
const hint = computed(() => hints[type.value])

async function run() {
  if (!file.value) return
  loading.value = true
  result.value = null
  try {
    const body = new FormData()
    body.append('file', file.value)
    const { data } = await api.post(`/admin/import/${type.value}`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    result.value = data.data
    $q.notify({ type: 'positive', message: t('common.saved') })
  } catch {
    $q.notify({ type: 'negative', message: t('common.error') })
  } finally {
    loading.value = false
  }
}
</script>
