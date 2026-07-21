<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6 col">{{ t('nav.characteristics') }}</div>
      <q-btn color="primary" icon="add" :label="t('characteristics.addGroup')" @click="openGroupDialog(null)" />
    </div>

    <q-inner-loading :showing="loading" />

    <q-card v-for="group in groups" :key="group.id" flat bordered class="q-mb-md">
      <q-expansion-item default-opened>
        <template #header>
          <q-item-section>
            <div class="row items-center full-width">
              <span class="text-subtitle1 col">{{ label(group.name) }}</span>
              <q-btn dense flat icon="add" size="sm" @click.stop="openAttributeDialog(group, null)">
                <q-tooltip>{{ t('characteristics.addAttribute') }}</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="edit" size="sm" @click.stop="openGroupDialog(group)" />
              <q-btn dense flat icon="delete" size="sm" color="negative" @click.stop="confirmDeleteGroup(group)" />
            </div>
          </q-item-section>
        </template>

        <q-list separator>
          <q-item v-for="attr in group.characteristics" :key="attr.id">
            <q-item-section>
              <div class="text-weight-medium">{{ label(attr.name) }}</div>
              <div class="text-grey-7 text-caption">
                {{ attr.values.map((v) => label(v.value)).join(', ') }}
              </div>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                :model-value="attr.useInFilters"
                :label="t('characteristics.useInFilters')"
                @update:model-value="(val) => toggleUseInFilters(attr, val)"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn dense flat icon="edit" @click="openAttributeDialog(group, attr)" />
              <q-btn dense flat icon="delete" color="negative" @click="confirmDeleteAttribute(attr)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-card>

    <!-- Group dialog -->
    <q-dialog v-model="groupDialogOpen">
      <q-card style="width: 480px">
        <q-card-section class="text-h6">
          {{ editingGroup ? t('characteristics.editGroup') : t('characteristics.addGroup') }}
        </q-card-section>
        <q-form @submit.prevent="saveGroup">
          <q-card-section class="row q-col-gutter-sm">
            <q-input v-model="groupForm.name.ru" label="RU" outlined dense class="col" />
            <q-input v-model="groupForm.name.en" label="EN" outlined dense class="col" />
            <q-input v-model="groupForm.name.zh" label="ZH" outlined dense class="col" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat :label="t('common.cancel')" v-close-popup />
            <q-btn color="primary" type="submit" :label="t('common.save')" :loading="saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Attribute dialog -->
    <q-dialog v-model="attributeDialogOpen">
      <q-card style="width: 560px">
        <q-card-section class="text-h6">
          {{ editingAttribute ? t('characteristics.editAttribute') : t('characteristics.addAttribute') }}
        </q-card-section>
        <q-form @submit.prevent="saveAttribute">
          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-sm">
              <q-input v-model="attributeForm.name.ru" label="RU" outlined dense class="col" />
              <q-input v-model="attributeForm.name.en" label="EN" outlined dense class="col" />
              <q-input v-model="attributeForm.name.zh" label="ZH" outlined dense class="col" />
            </div>
            <q-toggle v-model="attributeForm.useInFilters" :label="t('characteristics.useInFilters')" />

            <div class="text-subtitle2">{{ t('characteristics.values') }}</div>
            <div v-for="(value, index) in attributeForm.values" :key="index" class="row q-col-gutter-sm items-center">
              <q-input v-model="value.value.ru" label="RU" outlined dense class="col" />
              <q-input v-model="value.value.en" label="EN" outlined dense class="col" />
              <q-input v-model="value.value.zh" label="ZH" outlined dense class="col" />
              <q-btn dense flat icon="close" color="negative" @click="attributeForm.values.splice(index, 1)" />
            </div>
            <q-btn flat dense icon="add" :label="t('characteristics.addValue')" @click="addValueRow" />
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
import type { Characteristic, CharacteristicGroup, Translations } from '@/types'

const { t, locale } = useI18n()
const $q = useQuasar()

const groups = ref<CharacteristicGroup[]>([])
const loading = ref(false)
const saving = ref(false)

function label(value: Translations) {
  return value[locale.value as keyof Translations] ?? value.ru ?? value.en ?? Object.values(value)[0] ?? ''
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/characteristic-groups')
    groups.value = data.data
  } finally {
    loading.value = false
  }
}

// --- Group dialog ---
const groupDialogOpen = ref(false)
const editingGroup = ref<CharacteristicGroup | null>(null)
const groupForm = reactive({ name: { ru: '', en: '', zh: '' } })

function openGroupDialog(group: CharacteristicGroup | null) {
  editingGroup.value = group
  Object.assign(groupForm, { name: { ru: group?.name.ru ?? '', en: group?.name.en ?? '', zh: group?.name.zh ?? '' } })
  groupDialogOpen.value = true
}

async function saveGroup() {
  saving.value = true
  try {
    const payload = { name: groupForm.name, position: editingGroup.value?.position ?? groups.value.length }
    if (editingGroup.value) {
      await api.put(`/admin/characteristic-groups/${editingGroup.value.id}`, payload)
    } else {
      await api.post('/admin/characteristic-groups', payload)
    }
    groupDialogOpen.value = false
    $q.notify({ type: 'positive', message: t('common.saved') })
    await load()
  } catch {
    $q.notify({ type: 'negative', message: t('common.error') })
  } finally {
    saving.value = false
  }
}

function confirmDeleteGroup(group: CharacteristicGroup) {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('common.confirmDeleteMessage'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await api.delete(`/admin/characteristic-groups/${group.id}`)
    $q.notify({ type: 'positive', message: t('common.deleted') })
    await load()
  })
}

// --- Attribute dialog ---
const attributeDialogOpen = ref(false)
const editingAttribute = ref<Characteristic | null>(null)
const activeGroup = ref<CharacteristicGroup | null>(null)
const attributeForm = reactive({
  name: { ru: '', en: '', zh: '' },
  useInFilters: false,
  values: [] as { id?: number; value: { ru: string; en: string; zh: string } }[],
})

function openAttributeDialog(group: CharacteristicGroup, attribute: Characteristic | null) {
  activeGroup.value = group
  editingAttribute.value = attribute
  Object.assign(attributeForm, {
    name: { ru: attribute?.name.ru ?? '', en: attribute?.name.en ?? '', zh: attribute?.name.zh ?? '' },
    useInFilters: attribute?.useInFilters ?? false,
    values: (attribute?.values ?? []).map((v) => ({
      id: v.id,
      value: { ru: v.value.ru ?? '', en: v.value.en ?? '', zh: v.value.zh ?? '' },
    })),
  })
  attributeDialogOpen.value = true
}

function addValueRow() {
  attributeForm.values.push({ value: { ru: '', en: '', zh: '' } })
}

async function saveAttribute() {
  if (!activeGroup.value) return
  saving.value = true
  try {
    const payload = {
      groupId: activeGroup.value.id,
      name: attributeForm.name,
      useInFilters: attributeForm.useInFilters,
      position: editingAttribute.value?.position ?? activeGroup.value.characteristics.length,
      values: attributeForm.values.map((v, i) => ({ id: v.id, value: v.value, position: i })),
    }
    if (editingAttribute.value) {
      await api.put(`/admin/characteristics/${editingAttribute.value.id}`, payload)
    } else {
      await api.post('/admin/characteristics', payload)
    }
    attributeDialogOpen.value = false
    $q.notify({ type: 'positive', message: t('common.saved') })
    await load()
  } catch {
    $q.notify({ type: 'negative', message: t('common.error') })
  } finally {
    saving.value = false
  }
}

async function toggleUseInFilters(attr: Characteristic, value: boolean) {
  await api.put(`/admin/characteristics/${attr.id}`, {
    groupId: attr.groupId,
    name: attr.name,
    useInFilters: value,
    position: attr.position,
    values: attr.values.map((v, i) => ({ id: v.id, value: v.value, position: i })),
  })
  await load()
}

function confirmDeleteAttribute(attr: Characteristic) {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('common.confirmDeleteMessage'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await api.delete(`/admin/characteristics/${attr.id}`)
    $q.notify({ type: 'positive', message: t('common.deleted') })
    await load()
  })
}

onMounted(load)
</script>
