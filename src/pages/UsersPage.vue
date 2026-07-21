<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6 col">{{ t('nav.users') }}</div>
      <q-btn color="primary" icon="add" :label="t('common.add')" @click="openCreate" />
    </div>

    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template #body-cell-isActive="props">
        <q-td :props="props">
          <q-badge :color="props.row.isActive ? 'positive' : 'grey'">
            {{ props.row.isActive ? t('common.yes') : t('common.no') }}
          </q-badge>
        </q-td>
      </template>
      <template #body-cell-role="props">
        <q-td :props="props">{{ roleLabel(props.row.role) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense flat icon="edit" @click="openEdit(props.row)" />
          <q-btn
            dense
            flat
            :icon="props.row.isActive ? 'block' : 'check_circle'"
            @click="toggleActive(props.row)"
          />
          <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 480px">
        <q-card-section class="text-h6">{{ editing ? t('users.editTitle') : t('users.addTitle') }}</q-card-section>
        <q-form @submit.prevent="save">
          <q-card-section class="q-gutter-md">
            <q-input v-model="form.name" :label="t('users.name')" outlined dense required />
            <q-input v-model="form.email" :label="t('users.email')" type="email" outlined dense required />
            <q-input v-model="form.username" :label="t('users.username')" outlined dense />
            <q-select
              v-model="form.role"
              :options="roleOptions"
              emit-value
              map-options
              :label="t('users.role')"
              outlined
              dense
            />
            <q-toggle v-model="form.isActive" :label="t('users.active')" />
            <q-input
              v-model="form.password"
              :label="t('users.password')"
              type="password"
              outlined
              dense
              :hint="editing ? t('users.passwordHint') : ''"
            />
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
import type { Role, User } from '@/types'

const { t } = useI18n()
const $q = useQuasar()

const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const editing = ref<User | null>(null)

const form = reactive({
  name: '',
  email: '',
  username: '',
  role: 'manager' as Role,
  isActive: true,
  password: '',
})

const roleOptions = [
  { label: t('users.roleAdministrator'), value: 'administrator' },
  { label: t('users.roleManager'), value: 'manager' },
  { label: t('users.rolePartner'), value: 'partner' },
]

function roleLabel(role: Role) {
  return roleOptions.find((o) => o.value === role)?.label ?? role
}

const columns = [
  { name: 'name', label: t('users.name'), field: 'name', align: 'left' as const },
  { name: 'email', label: t('users.email'), field: 'email', align: 'left' as const },
  { name: 'username', label: t('users.username'), field: 'username', align: 'left' as const },
  { name: 'role', label: t('users.role'), field: 'role', align: 'left' as const },
  { name: 'isActive', label: t('users.active'), field: 'isActive', align: 'center' as const },
  { name: 'actions', label: t('common.actions'), field: 'id', align: 'right' as const },
]

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/users')
    users.value = data.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  Object.assign(form, { name: '', email: '', username: '', role: 'manager', isActive: true, password: '' })
  dialogOpen.value = true
}

function openEdit(user: User) {
  editing.value = user
  Object.assign(form, {
    name: user.name,
    email: user.email,
    username: user.username ?? '',
    role: user.role,
    isActive: user.isActive,
    password: '',
  })
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      name: form.name,
      email: form.email,
      username: form.username || null,
      role: form.role,
      isActive: form.isActive,
      ...(form.password ? { password: form.password } : {}),
    }
    if (editing.value) {
      await api.put(`/admin/users/${editing.value.id}`, payload)
    } else {
      await api.post('/admin/users', payload)
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

async function toggleActive(user: User) {
  await api.patch(`/admin/users/${user.id}/toggle-active`)
  await load()
}

function confirmDelete(user: User) {
  $q.dialog({
    title: t('common.confirmDeleteTitle'),
    message: t('common.confirmDeleteMessage'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await api.delete(`/admin/users/${user.id}`)
    $q.notify({ type: 'positive', message: t('common.deleted') })
    await load()
  })
}

onMounted(load)
</script>
