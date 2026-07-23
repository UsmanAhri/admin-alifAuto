<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="app-header" height-hint="60">
      <q-toolbar class="q-px-md" style="min-height: 60px">
        <q-btn flat dense round icon="menu" color="grey-8" @click="drawerOpen = !drawerOpen" />

        <div class="row items-center no-wrap q-ml-sm gt-xs">
          <q-avatar size="30px" square class="brand-mark">
            <q-icon name="directions_car" size="18px" color="white" />
          </q-avatar>
          <span class="q-ml-sm text-weight-bold text-grey-9">Alif Auto</span>
        </div>

        <q-space />

        <q-btn
          flat
          dense
          round
          color="grey-8"
          class="q-mr-xs"
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :title="$q.dark.isActive ? t('nav.themeLight') : t('nav.themeDark')"
          :aria-label="$q.dark.isActive ? t('nav.themeLight') : t('nav.themeDark')"
          @click="toggleTheme"
        />

        <q-btn-dropdown flat dense no-caps class="q-mr-xs text-grey-8" :label="locale.toUpperCase()" icon="language">
          <q-list style="min-width: 140px">
            <q-item v-for="l in locales" :key="l" clickable v-close-popup :active="locale === l" @click="setLocale(l)">
              <q-item-section avatar style="min-width: 34px">
                <FlagIcon :code="l" />
              </q-item-section>
              <q-item-section>{{ localeName(l) }}</q-item-section>
              <q-item-section side v-if="locale === l"><q-icon name="check" color="primary" size="18px" /></q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn flat dense no-caps class="q-ml-xs">
          <div class="row items-center no-wrap">
            <q-avatar size="30px" color="primary" text-color="white" class="text-weight-bold">
              {{ userInitials }}
            </q-avatar>
            <div class="column items-start q-ml-sm gt-xs" style="line-height: 1.15">
              <span class="text-weight-medium text-grey-9" style="font-size: 13px">{{ auth.user?.name }}</span>
              <span class="role-badge" style="margin-top: 1px">{{ roleLabel }}</span>
            </div>
            <q-icon name="expand_more" size="18px" class="q-ml-xs text-grey-6" />
          </div>
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item class="q-pb-none">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ auth.user?.name }}</q-item-label>
                  <q-item-label caption>{{ auth.user?.email }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section class="text-negative">{{ t('nav.logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above bordered :width="256" class="app-drawer">
      <q-scroll-area class="fit">
        <div v-for="section in visibleSections" :key="section.label">
          <div class="nav-section-label">{{ t(section.label) }}</div>
          <q-list>
            <q-item
              v-for="item in section.items"
              :key="item.name"
              clickable
              :to="{ name: item.name }"
              class="nav-item"
              active-class="nav-item--active"
            >
              <q-item-section avatar style="min-width: 40px">
                <q-icon :name="item.icon" size="20px" />
              </q-item-section>
              <q-item-section>{{ t(item.label) }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { persistLocale, type AppLocale } from '@/i18n'
import { applyTheme, persistTheme } from '@/composables/useTheme'
import FlagIcon from '@/components/FlagIcon.vue'
import type { Role } from '@/types'

const { t, locale } = useI18n()
const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const drawerOpen = ref(true)
const locales: AppLocale[] = ['en', 'ru', 'zh']

interface NavItem { name: string; label: string; icon: string; roles: Role[] }
interface NavSection { label: string; items: NavItem[] }

const sections: NavSection[] = [
  {
    label: 'nav.sectionOverview',
    items: [
      { name: 'dashboard', label: 'nav.dashboard', icon: 'space_dashboard', roles: ['administrator', 'manager', 'partner'] },
    ],
  },
  {
    label: 'nav.sectionCatalog',
    items: [
      { name: 'vehicles', label: 'nav.vehicles', icon: 'directions_car', roles: ['administrator', 'manager', 'partner'] },
      { name: 'orders', label: 'nav.orders', icon: 'assignment', roles: ['administrator', 'manager', 'partner'] },
      { name: 'characteristics', label: 'nav.characteristics', icon: 'tune', roles: ['administrator', 'manager'] },
      { name: 'menu', label: 'nav.menu', icon: 'account_tree', roles: ['administrator', 'manager'] },
      { name: 'news', label: 'nav.news', icon: 'article', roles: ['administrator', 'manager'] },
    ],
  },
  {
    label: 'nav.sectionData',
    items: [
      { name: 'export', label: 'nav.export', icon: 'download', roles: ['administrator', 'manager'] },
      { name: 'import', label: 'nav.import', icon: 'upload', roles: ['administrator'] },
    ],
  },
  {
    label: 'nav.sectionAdmin',
    items: [
      { name: 'users', label: 'nav.users', icon: 'group', roles: ['administrator'] },
      { name: 'logs', label: 'nav.logs', icon: 'history', roles: ['administrator'] },
    ],
  },
]

const visibleSections = computed(() =>
  sections
    .map((s) => ({ ...s, items: s.items.filter((i) => auth.role && i.roles.includes(auth.role)) }))
    .filter((s) => s.items.length > 0),
)

const userInitials = computed(() => {
  const name = auth.user?.name ?? ''
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
})

const roleLabel = computed(() => (auth.role ? t(`users.role${capitalize(auth.role)}`) : ''))

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function localeName(l: AppLocale) {
  return { en: 'English', ru: 'Русский', zh: '中文' }[l]
}

function setLocale(l: AppLocale) {
  locale.value = l
  persistLocale(l)
}

function toggleTheme() {
  const next = $q.dark.isActive ? 'light' : 'dark'
  applyTheme(next)
  persistTheme(next)
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.brand-mark {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 8px;
}
</style>
