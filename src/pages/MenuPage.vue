<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="page-title col">{{ t('nav.menu') }}</div>
      <q-btn color="primary" icon="add" :label="t('menu.addRoot')" @click="openCreate(null)" />
    </div>

    <q-inner-loading :showing="loading" />

    <div v-if="!loading">
      <CategoryTreeNode
        v-for="root in tree"
        :key="root.id"
        :node="root"
        @add-child="openCreate"
        @edit="openEdit"
        @delete="confirmDelete"
        @move="move"
      />
      <div
        class="root-drop-zone q-mt-sm q-pa-sm text-center text-grey-6"
        @dragover.prevent
        @drop="onDropRoot"
      >
        {{ t('menu.none') }}
      </div>
    </div>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 520px">
        <q-card-section class="text-h6">{{ editing ? t('menu.editTitle') : t('menu.addTitle') }}</q-card-section>
        <q-form @submit.prevent="save">
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="form.parentId"
              :options="parentOptions"
              :label="t('menu.parent')"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
            <div class="row q-col-gutter-sm">
              <q-input v-model="form.title.ru" label="RU" outlined dense class="col" />
              <q-input v-model="form.title.en" label="EN" outlined dense class="col" />
              <q-input v-model="form.title.zh" label="ZH" outlined dense class="col" />
            </div>
            <q-input v-model="form.slug" :label="t('menu.slug')" outlined dense required />
            <q-input v-model="form.illustration" :label="t('menu.illustration')" outlined dense />
            <q-toggle v-model="form.isActive" :label="t('common.status')" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { api } from '@/boot/api'
import type { AdminCategory } from '@/types'
import CategoryTreeNode from '@/components/CategoryTreeNode.vue'

const { t } = useI18n()
const $q = useQuasar()

const tree = ref<AdminCategory[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const editing = ref<AdminCategory | null>(null)

const form = reactive({
  parentId: null as number | null,
  title: { ru: '', en: '', zh: '' },
  slug: '',
  illustration: '',
  isActive: true,
})

function flatten(nodes: AdminCategory[], depth = 0): { label: string; value: number }[] {
  return nodes.flatMap((n) => [
    { label: `${'— '.repeat(depth)}${n.title.ru ?? n.title.en ?? n.slug}`, value: n.id },
    ...flatten(n.children, depth + 1),
  ])
}

const parentOptions = computed(() => flatten(tree.value))

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/categories')
    tree.value = data.data
  } finally {
    loading.value = false
  }
}

function openCreate(parent: AdminCategory | null) {
  editing.value = null
  Object.assign(form, {
    parentId: parent?.id ?? null,
    title: { ru: '', en: '', zh: '' },
    slug: '',
    illustration: '',
    isActive: true,
  })
  dialogOpen.value = true
}

function openEdit(category: AdminCategory) {
  editing.value = category
  Object.assign(form, {
    parentId: category.parentId,
    title: { ru: category.title.ru ?? '', en: category.title.en ?? '', zh: category.title.zh ?? '' },
    slug: category.slug,
    illustration: category.illustration ?? '',
    isActive: category.isActive,
  })
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      parentId: form.parentId,
      title: form.title,
      slug: form.slug,
      illustration: form.illustration || null,
      isActive: form.isActive,
    }
    if (editing.value) {
      await api.put(`/admin/categories/${editing.value.id}`, payload)
    } else {
      await api.post('/admin/categories', payload)
    }
    dialogOpen.value = false
    $q.notify({ type: 'positive', message: t('common.saved') })
    await load()
  } catch {
    $q.notify({ type: 'negative', message: t('common.error') })
  } finally {
    saving.value = false
  }
}

function confirmDelete(category: AdminCategory) {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('common.confirmDeleteMessage'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await api.delete(`/admin/categories/${category.id}`)
    $q.notify({ type: 'positive', message: t('common.deleted') })
    await load()
  })
}

async function move(payload: { draggedId: number; parentId: number | null; position: number }) {
  await api.patch(`/admin/categories/${payload.draggedId}/move`, {
    parentId: payload.parentId,
    position: payload.position,
  })
  await load()
}

function onDropRoot(event: DragEvent) {
  const draggedId = Number(event.dataTransfer?.getData('text/plain'))
  if (!draggedId) return
  move({ draggedId, parentId: null, position: tree.value.length })
}

onMounted(load)
</script>

<style scoped>
.root-drop-zone {
  border: 1px dashed #bdbdbd;
  border-radius: 4px;
}
</style>
