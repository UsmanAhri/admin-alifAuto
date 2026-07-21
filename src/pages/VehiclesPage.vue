<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md q-col-gutter-sm">
      <div class="text-h6 col-12 col-md-auto" style="min-width: 160px">{{ t('nav.vehicles') }}</div>
      <div class="col-12 col-md-3">
        <q-input v-model="filters.search" :label="t('common.search')" dense outlined clearable @update:model-value="reload" />
      </div>
      <div class="col-6 col-md-2">
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          :label="t('vehicles.status')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="reload"
        />
      </div>
      <div class="col-6 col-md-3">
        <q-select
          v-model="filters.categoryId"
          :options="categoryOptions"
          :label="t('vehicles.category')"
          dense
          outlined
          clearable
          emit-value
          map-options
          @update:model-value="reload"
        />
      </div>
      <q-space />
      <div class="col-12 col-md-auto">
        <q-btn color="primary" icon="add" :label="t('common.add')" @click="openCreate" />
      </div>
    </div>

    <q-table
      :rows="vehicles"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      flat
      bordered
      @request="onRequest"
    >
      <template #body-cell-photo="props">
        <q-td :props="props">
          <q-avatar v-if="props.row.photos[0]" square size="48px">
            <img :src="props.row.photos[0].thumbUrl" />
          </q-avatar>
        </q-td>
      </template>
      <template #body-cell-model="props">
        <q-td :props="props">{{ props.row.brand?.name }} {{ props.row.model }}</q-td>
      </template>
      <template #body-cell-price="props">
        <q-td :props="props">{{ formatPrice(props.row.price, props.row.currency) }}</q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="statusColor(props.row.status)">{{ statusLabel(props.row.status) }}</q-badge>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense flat icon="edit" @click="openEdit(props.row)" />
          <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 860px; max-width: 96vw">
        <q-card-section class="text-h6">{{ editing ? t('vehicles.editTitle') : t('vehicles.addTitle') }}</q-card-section>
        <q-form @submit.prevent="save">
          <q-card-section style="max-height: 65vh; overflow-y: auto" class="q-gutter-md">
            <div class="row q-col-gutter-sm">
              <q-select
                v-model="form.categoryId"
                :options="categoryOptions"
                :label="t('vehicles.category')"
                outlined
                dense
                emit-value
                map-options
                class="col-6"
                required
              />
              <q-select
                v-model="form.brandId"
                :options="brandOptions"
                :label="t('vehicles.brand')"
                outlined
                dense
                emit-value
                map-options
                class="col-6"
                required
              />
            </div>
            <div class="row q-col-gutter-sm">
              <q-input v-model="form.model" :label="t('vehicles.model')" outlined dense class="col-4" required />
              <q-input v-model="form.generation" :label="t('vehicles.generation')" outlined dense class="col-4" />
              <q-input v-model.number="form.year" type="number" :label="t('vehicles.year')" outlined dense class="col-4" required />
            </div>
            <div class="row q-col-gutter-sm">
              <q-input v-model.number="form.mileage" type="number" :label="t('vehicles.mileage')" outlined dense class="col-4" />
              <q-input v-model.number="form.price" type="number" :label="t('vehicles.price')" outlined dense class="col-4" required />
              <q-select
                v-model="form.currency"
                :options="['RUB', 'USD', 'TJS']"
                :label="t('vehicles.currency')"
                outlined
                dense
                class="col-4"
              />
            </div>
            <div class="row q-col-gutter-sm">
              <q-input v-model="form.bodyType" :label="t('vehicles.bodyType')" outlined dense class="col-4" />
              <q-select
                v-model="form.engineType"
                :options="engineTypeOptions"
                :label="t('vehicles.engineType')"
                outlined
                dense
                clearable
                emit-value
                map-options
                class="col-4"
              />
              <q-input v-model.number="form.engineVolume" type="number" step="0.1" :label="t('vehicles.engineVolume')" outlined dense class="col-4" />
            </div>
            <div class="row q-col-gutter-sm">
              <q-input v-model.number="form.power" type="number" :label="t('vehicles.power')" outlined dense class="col-4" />
              <q-select
                v-model="form.transmission"
                :options="transmissionOptions"
                :label="t('vehicles.transmission')"
                outlined
                dense
                clearable
                emit-value
                map-options
                class="col-4"
              />
              <q-select
                v-model="form.drive"
                :options="driveOptions"
                :label="t('vehicles.drive')"
                outlined
                dense
                clearable
                emit-value
                map-options
                class="col-4"
              />
            </div>
            <div class="row q-col-gutter-sm">
              <q-input v-model="form.color" :label="t('vehicles.color')" outlined dense class="col-6" />
              <q-input v-model="form.vin" :label="t('vehicles.vin')" outlined dense class="col-6" />
            </div>

            <q-tabs v-model="activeLocale" dense class="text-primary">
              <q-tab name="ru" label="RU" />
              <q-tab name="en" label="EN" />
              <q-tab name="zh" label="ZH" />
            </q-tabs>
            <q-tab-panels v-model="activeLocale">
              <q-tab-panel v-for="l in (['ru', 'en', 'zh'] as const)" :key="l" :name="l" class="q-pa-none">
                <q-input v-model="form.description[l]" type="textarea" :label="t('vehicles.description')" outlined dense rows="3" />
              </q-tab-panel>
            </q-tab-panels>

            <div class="row q-col-gutter-sm items-center">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                :label="t('vehicles.status')"
                outlined
                dense
                emit-value
                map-options
                class="col-3"
              />
              <q-toggle v-model="form.isNew" :label="t('vehicles.isNew')" class="col-auto" />
              <q-toggle v-model="form.isPopular" :label="t('vehicles.isPopular')" class="col-auto" />
              <q-toggle v-model="form.removedFromSale" :label="t('vehicles.removedFromSale')" class="col-auto" />
              <q-toggle v-model="form.onOrder" :label="t('vehicles.onOrder')" class="col-auto" />
              <q-toggle v-model="form.onOrderAbroad" :label="t('vehicles.onOrderAbroad')" class="col-auto" />
            </div>

            <div v-if="characteristicGroups.length">
              <div class="text-subtitle2 q-mt-md">{{ t('nav.characteristics') }}</div>
              <div v-for="group in characteristicGroups" :key="group.id">
                <div class="text-caption text-grey-7 q-mt-sm">{{ groupLabel(group) }}</div>
                <div class="row q-col-gutter-sm">
                  <q-select
                    v-for="attr in group.characteristics"
                    :key="attr.id"
                    v-model="characteristicValues[attr.id]"
                    :options="attr.values.map((v) => ({ label: v.label, value: v.id }))"
                    :label="attr.label"
                    outlined
                    dense
                    clearable
                    emit-value
                    map-options
                    class="col-4"
                  />
                </div>
              </div>
            </div>

            <div v-if="editing">
              <div class="text-subtitle2 q-mt-md">{{ t('vehicles.photos') }}</div>
              <div class="row q-col-gutter-sm q-mb-sm">
                <div v-for="photo in editing.photos" :key="photo.id" class="col-auto relative-position">
                  <q-img :src="photo.thumbUrl" style="width: 96px; height: 72px" />
                  <q-btn
                    round
                    dense
                    size="xs"
                    color="negative"
                    icon="close"
                    class="absolute-top-right"
                    @click="deletePhoto(photo.id)"
                  />
                </div>
              </div>
              <q-file v-model="newPhotos" multiple outlined dense accept="image/*" :label="t('vehicles.addPhoto')" @update:model-value="uploadPhotos" />
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat :label="t('common.cancel')" v-close-popup />
            <q-btn color="primary" type="submit" :label="t('common.save')" :loading="saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { api } from '@/boot/api'
import type { AdminVehicle, CharacteristicGroup, Translations } from '@/types'

const { t, locale } = useI18n()
const $q = useQuasar()

const vehicles = ref<AdminVehicle[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const editing = ref<AdminVehicle | null>(null)
const activeLocale = ref<'ru' | 'en' | 'zh'>('ru')
const newPhotos = ref<File[] | null>(null)

const categoryOptions = ref<{ label: string; value: number }[]>([])
const brandOptions = ref<{ label: string; value: number }[]>([])
const characteristicGroups = ref<CharacteristicGroup[]>([])
const characteristicValues = reactive<Record<number, number | null>>({})

const filters = reactive({ search: '', status: null as string | null, categoryId: null as number | null })
const pagination = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 })

const statusOptions = [
  { label: t('vehicles.statusActive'), value: 'active' },
  { label: t('vehicles.statusSold'), value: 'sold' },
  { label: t('vehicles.statusDraft'), value: 'draft' },
]
const engineTypeOptions = ['petrol', 'diesel', 'hybrid', 'electric', 'gas'].map((v) => ({ label: v, value: v }))
const transmissionOptions = ['manual', 'automatic', 'robot', 'variator'].map((v) => ({ label: v, value: v }))
const driveOptions = ['fwd', 'rwd', 'awd'].map((v) => ({ label: v, value: v }))

const columns = [
  { name: 'photo', label: '', field: 'id', align: 'left' as const },
  { name: 'model', label: t('vehicles.model'), field: 'model', align: 'left' as const },
  { name: 'year', label: t('vehicles.year'), field: 'year', align: 'left' as const },
  { name: 'price', label: t('vehicles.price'), field: 'price', align: 'left' as const },
  { name: 'status', label: t('vehicles.status'), field: 'status', align: 'center' as const },
  { name: 'actions', label: t('common.actions'), field: 'id', align: 'right' as const },
]

function label(value: Translations) {
  return value[locale.value as keyof Translations] ?? value.ru ?? value.en ?? Object.values(value)[0] ?? ''
}
function groupLabel(group: CharacteristicGroup) {
  return label(group.name)
}
function statusLabel(status: string) {
  return statusOptions.find((o) => o.value === status)?.label ?? status
}
function statusColor(status: string) {
  return status === 'active' ? 'positive' : status === 'sold' ? 'grey' : 'orange'
}
function formatPrice(price: number, currency: string) {
  return `${Math.round(price).toLocaleString()} ${currency}`
}

interface FlatCategory { id: number; slug: string; title: Translations; children: FlatCategory[] }

function flattenCategories(nodes: FlatCategory[], depth = 0): { label: string; value: number }[] {
  return nodes.flatMap((n) => [
    { label: `${'— '.repeat(depth)}${label(n.title)}`, value: n.id },
    ...flattenCategories(n.children ?? [], depth + 1),
  ])
}

async function loadCategories() {
  const { data } = await api.get('/categories', { params: { lang: locale.value } })
  const nodes: FlatCategory[] = data.data.map((c: { id: string; slug: string; title: string; subcategories: { id: string; slug: string; title: string }[] }) => ({
    id: Number(c.id),
    slug: c.slug,
    title: { ru: c.title, en: c.title, zh: c.title } as Translations,
    children: c.subcategories.map((s) => ({ id: Number(s.id), slug: s.slug, title: { ru: s.title, en: s.title, zh: s.title } as Translations, children: [] })),
  }))
  categoryOptions.value = flattenCategories(nodes)
}

async function loadBrands() {
  const { data } = await api.get('/admin/brands')
  brandOptions.value = data.data.map((b: { id: number; name: string }) => ({ label: b.name, value: b.id }))
}

async function loadCharacteristics() {
  const { data } = await api.get('/admin/characteristic-groups')
  characteristicGroups.value = data.data
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/vehicles', {
      params: {
        search: filters.search || undefined,
        status: filters.status || undefined,
        categoryId: filters.categoryId || undefined,
        page: pagination.value.page,
        perPage: pagination.value.rowsPerPage,
      },
    })
    vehicles.value = data.data
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

const emptyForm = () => ({
  categoryId: null as number | null,
  brandId: null as number | null,
  model: '',
  generation: '',
  year: new Date().getFullYear(),
  mileage: null as number | null,
  price: null as number | null,
  currency: 'RUB',
  bodyType: '',
  engineType: null as string | null,
  engineVolume: null as number | null,
  power: null as number | null,
  transmission: null as string | null,
  drive: null as string | null,
  color: '',
  vin: '',
  description: { ru: '', en: '', zh: '' },
  status: 'active',
  isNew: false,
  isPopular: false,
  removedFromSale: false,
  onOrder: false,
  onOrderAbroad: false,
})

const form = reactive(emptyForm())

function resetCharacteristicValues() {
  for (const key of Object.keys(characteristicValues)) delete characteristicValues[Number(key)]
}

function openCreate() {
  editing.value = null
  Object.assign(form, emptyForm())
  resetCharacteristicValues()
  dialogOpen.value = true
}

function openEdit(vehicle: AdminVehicle) {
  editing.value = vehicle
  Object.assign(form, {
    categoryId: vehicle.categoryId,
    brandId: vehicle.brandId,
    model: vehicle.model,
    generation: vehicle.generation ?? '',
    year: vehicle.year,
    mileage: vehicle.mileage,
    price: vehicle.price,
    currency: vehicle.currency,
    bodyType: vehicle.bodyType ?? '',
    engineType: vehicle.engineType,
    engineVolume: vehicle.engineVolume,
    power: vehicle.power,
    transmission: vehicle.transmission,
    drive: vehicle.drive,
    color: vehicle.color ?? '',
    vin: vehicle.vin ?? '',
    description: { ru: vehicle.description.ru ?? '', en: vehicle.description.en ?? '', zh: vehicle.description.zh ?? '' },
    status: vehicle.status,
    isNew: vehicle.isNew,
    isPopular: vehicle.isPopular,
    removedFromSale: vehicle.removedFromSale,
    onOrder: vehicle.onOrder,
    onOrderAbroad: vehicle.onOrderAbroad,
  })
  resetCharacteristicValues()
  for (const c of vehicle.characteristics) characteristicValues[c.characteristicId] = c.valueId
  dialogOpen.value = true
}

async function fetchFullVehicle(id: number) {
  const { data } = await api.get(`/admin/vehicles/${id}`)
  return data.data as AdminVehicle
}

async function save() {
  saving.value = true
  try {
    const payload = { ...form, characteristics: { ...characteristicValues } }
    let saved: AdminVehicle
    if (editing.value) {
      const { data } = await api.put(`/admin/vehicles/${editing.value.id}`, payload)
      saved = data.data
    } else {
      const { data } = await api.post('/admin/vehicles', payload)
      saved = data.data
    }
    $q.notify({ type: 'positive', message: t('common.saved') })
    // Stay open and switch into edit mode so photos can be attached right after creating.
    editing.value = await fetchFullVehicle(saved.id)
    await load()
  } catch {
    $q.notify({ type: 'negative', message: t('common.error') })
  } finally {
    saving.value = false
  }
}

async function uploadPhotos(files: File[] | null) {
  if (!files || !files.length || !editing.value) return
  const body = new FormData()
  for (const file of files) body.append('photos[]', file)
  await api.post(`/admin/vehicles/${editing.value.id}/photos`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  editing.value = await fetchFullVehicle(editing.value.id)
  newPhotos.value = null
  await load()
}

async function deletePhoto(photoId: number) {
  if (!editing.value) return
  await api.delete(`/admin/vehicles/${editing.value.id}/photos/${photoId}`)
  editing.value = await fetchFullVehicle(editing.value.id)
  await load()
}

function confirmDelete(vehicle: AdminVehicle) {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('common.confirmDeleteMessage'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await api.delete(`/admin/vehicles/${vehicle.id}`)
    $q.notify({ type: 'positive', message: t('common.deleted') })
    await load()
  })
}

onMounted(() => {
  loadCategories()
  loadBrands()
  loadCharacteristics()
  load()
})
</script>
