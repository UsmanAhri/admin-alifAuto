<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6 col">{{ t('nav.news') }}</div>
      <q-input v-model="search" :label="t('common.search')" dense outlined class="q-mr-md" style="width: 240px" clearable @update:model-value="load" />
      <q-btn color="primary" icon="add" :label="t('common.add')" @click="openCreate" />
    </div>

    <q-table :rows="posts" :columns="columns" row-key="id" :loading="loading" flat bordered>
      <template #body-cell-cover="props">
        <q-td :props="props">
          <q-avatar v-if="props.row.coverUrl" square size="40px">
            <img :src="props.row.coverUrl" />
          </q-avatar>
        </q-td>
      </template>
      <template #body-cell-isPublished="props">
        <q-td :props="props">
          <q-badge :color="props.row.isPublished ? 'positive' : 'grey'">
            {{ props.row.isPublished ? t('common.yes') : t('common.no') }}
          </q-badge>
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
      <q-card style="width: 720px; max-width: 95vw">
        <q-card-section class="text-h6">{{ editing ? t('news.editTitle') : t('news.addTitle') }}</q-card-section>
        <q-form @submit.prevent="save">
          <q-card-section class="q-gutter-md">
            <q-input v-model="form.slug" :label="t('news.slug')" outlined dense required />

            <q-tabs v-model="activeLocale" dense class="text-primary">
              <q-tab name="ru" label="RU" />
              <q-tab name="en" label="EN" />
              <q-tab name="zh" label="ZH" />
            </q-tabs>
            <q-tab-panels v-model="activeLocale">
              <q-tab-panel v-for="l in (['ru', 'en', 'zh'] as const)" :key="l" :name="l" class="q-gutter-sm q-pa-none">
                <q-input v-model="form.title[l]" :label="t('news.title')" outlined dense />
                <q-input v-model="form.excerpt[l]" :label="t('news.excerpt')" type="textarea" outlined dense />
                <q-input v-model="form.body[l]" :label="`${t('news.body')} (HTML)`" type="textarea" outlined dense rows="6" />
              </q-tab-panel>
            </q-tab-panels>

            <q-input v-model="form.cover" :label="t('news.cover')" outlined dense />
            <q-input v-model="form.author" :label="t('news.author')" outlined dense />
            <div class="row items-center q-col-gutter-sm">
              <div class="col-auto"><q-toggle v-model="form.isPublished" :label="t('news.published')" /></div>
              <q-input
                v-if="form.isPublished"
                v-model="form.publishedAt"
                type="datetime-local"
                :label="t('news.publishedAt')"
                outlined
                dense
                class="col"
              />
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
import type { AdminNewsPost } from '@/types'

const { t } = useI18n()
const $q = useQuasar()

const posts = ref<AdminNewsPost[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const dialogOpen = ref(false)
const editing = ref<AdminNewsPost | null>(null)
const activeLocale = ref<'ru' | 'en' | 'zh'>('ru')

const form = reactive({
  slug: '',
  title: { ru: '', en: '', zh: '' },
  excerpt: { ru: '', en: '', zh: '' },
  body: { ru: '', en: '', zh: '' },
  cover: '',
  author: '',
  isPublished: false,
  publishedAt: '',
})

const columns = [
  { name: 'cover', label: t('news.cover'), field: 'cover', align: 'left' as const },
  { name: 'title', label: t('news.title'), field: (row: AdminNewsPost) => row.title.ru ?? row.title.en, align: 'left' as const },
  { name: 'isPublished', label: t('news.published'), field: 'isPublished', align: 'center' as const },
  { name: 'publishedAt', label: t('news.publishedAt'), field: 'publishedAt', align: 'left' as const },
  { name: 'actions', label: t('common.actions'), field: 'id', align: 'right' as const },
]

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/news', { params: { search: search.value || undefined, perPage: 100 } })
    posts.value = data.data
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    slug: '',
    title: { ru: '', en: '', zh: '' },
    excerpt: { ru: '', en: '', zh: '' },
    body: { ru: '', en: '', zh: '' },
    cover: '',
    author: '',
    isPublished: false,
    publishedAt: '',
  })
}

function openCreate() {
  editing.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(post: AdminNewsPost) {
  editing.value = post
  Object.assign(form, {
    slug: post.slug,
    title: { ru: post.title.ru ?? '', en: post.title.en ?? '', zh: post.title.zh ?? '' },
    excerpt: { ru: post.excerpt.ru ?? '', en: post.excerpt.en ?? '', zh: post.excerpt.zh ?? '' },
    body: { ru: post.body.ru ?? '', en: post.body.en ?? '', zh: post.body.zh ?? '' },
    cover: post.cover ?? '',
    author: post.author ?? '',
    isPublished: post.isPublished,
    publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : '',
  })
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
      cover: form.cover || null,
      author: form.author || null,
      isPublished: form.isPublished,
      publishedAt: form.publishedAt || null,
    }
    if (editing.value) {
      await api.put(`/admin/news/${editing.value.id}`, payload)
    } else {
      await api.post('/admin/news', payload)
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

function confirmDelete(post: AdminNewsPost) {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('common.confirmDeleteMessage'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await api.delete(`/admin/news/${post.id}`)
    $q.notify({ type: 'positive', message: t('common.deleted') })
    await load()
  })
}

onMounted(load)
</script>
