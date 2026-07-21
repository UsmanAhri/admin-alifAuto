<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>{{ t('app.title') }}</q-toolbar-title>

        <q-btn-dropdown flat dense :label="locale.toUpperCase()" class="q-mr-sm">
          <q-list>
            <q-item v-for="l in locales" :key="l" clickable v-close-popup @click="setLocale(l)">
              <q-item-section>{{ l.toUpperCase() }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn flat dense :label="auth.user?.name" icon-right="expand_more">
          <q-menu>
            <q-list style="min-width: 160px">
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>{{ t('nav.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item
          v-for="item in visibleItems"
          :key="item.name"
          clickable
          :to="{ name: item.name }"
          active-class="text-primary bg-blue-1"
        >
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>{{ t(item.label) }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { persistLocale, type AppLocale } from '@/i18n'
import type { Role } from '@/types'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const drawerOpen = ref(true)
const locales: AppLocale[] = ['en', 'ru', 'zh']

const menuItems: { name: string; label: string; icon: string; roles: Role[] }[] = [
  { name: 'vehicles', label: 'nav.vehicles', icon: 'directions_car', roles: ['administrator', 'manager', 'partner'] },
  { name: 'orders', label: 'nav.orders', icon: 'assignment', roles: ['administrator', 'manager', 'partner'] },
  { name: 'menu', label: 'nav.menu', icon: 'account_tree', roles: ['administrator', 'manager'] },
  { name: 'characteristics', label: 'nav.characteristics', icon: 'tune', roles: ['administrator', 'manager'] },
  { name: 'news', label: 'nav.news', icon: 'article', roles: ['administrator', 'manager'] },
  { name: 'export', label: 'nav.export', icon: 'download', roles: ['administrator', 'manager'] },
  { name: 'import', label: 'nav.import', icon: 'upload', roles: ['administrator'] },
  { name: 'users', label: 'nav.users', icon: 'group', roles: ['administrator'] },
  { name: 'logs', label: 'nav.logs', icon: 'history', roles: ['administrator'] },
]

const visibleItems = computed(() => menuItems.filter((item) => auth.role && item.roles.includes(auth.role)))

function setLocale(l: AppLocale) {
  locale.value = l
  persistLocale(l)
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>
