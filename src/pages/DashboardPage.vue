<template>
  <q-page class="q-pa-lg">
    <!-- Heading -->
    <div class="q-mb-lg">
      <div class="page-title">{{ t('dashboard.greeting', { name: firstName }) }}</div>
      <div class="page-subtitle">{{ todayLabel }}</div>
    </div>

    <q-inner-loading :showing="loading" />

    <template v-if="data">
      <!-- Summary cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Orders (always first) -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card--link q-pa-md" @click="go('orders')">
            <div class="row items-center no-wrap">
              <div class="stat-card__icon" style="background: #eef2ff">
                <q-icon name="assignment" size="24px" color="primary" />
              </div>
              <div class="q-ml-md">
                <div class="stat-card__label">{{ t('nav.orders') }}</div>
                <div class="stat-card__value">{{ data.orders.total }}</div>
              </div>
            </div>
            <div class="row q-gutter-sm q-mt-sm">
              <span class="pill pill--new">{{ data.orders.new }} {{ t('orders.statusNew').toLowerCase() }}</span>
              <span class="pill pill--progress">{{ data.orders.inProgress }} {{ t('orders.statusInProgress').toLowerCase() }}</span>
            </div>
          </div>
        </div>

        <!-- Vehicles -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card--link q-pa-md" @click="go('vehicles')">
            <div class="row items-center no-wrap">
              <div class="stat-card__icon" style="background: #ecfdf5">
                <q-icon name="directions_car" size="24px" color="positive" />
              </div>
              <div class="q-ml-md">
                <div class="stat-card__label">{{ t('nav.vehicles') }}</div>
                <div class="stat-card__value">{{ data.vehicles.total }}</div>
              </div>
            </div>
            <div class="text-caption text-muted q-mt-sm">
              {{ data.vehicles.active }} {{ t('vehicles.statusActive').toLowerCase() }} ·
              {{ data.vehicles.draft }} {{ t('vehicles.statusDraft').toLowerCase() }}
            </div>
          </div>
        </div>

        <!-- Users (staff only) -->
        <div v-if="data.users !== null" class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card--link q-pa-md" @click="go('users')">
            <div class="row items-center no-wrap">
              <div class="stat-card__icon" style="background: #eff6ff">
                <q-icon name="group" size="24px" color="info" />
              </div>
              <div class="q-ml-md">
                <div class="stat-card__label">{{ t('nav.users') }}</div>
                <div class="stat-card__value">{{ data.users }}</div>
              </div>
            </div>
            <div class="text-caption text-muted q-mt-sm">{{ t('dashboard.registeredAccounts') }}</div>
          </div>
        </div>

        <!-- News (staff only) -->
        <div v-if="data.news !== null" class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card--link q-pa-md" @click="go('news')">
            <div class="row items-center no-wrap">
              <div class="stat-card__icon" style="background: #fef3c7">
                <q-icon name="article" size="24px" color="warning" />
              </div>
              <div class="q-ml-md">
                <div class="stat-card__label">{{ t('nav.news') }}</div>
                <div class="stat-card__value">{{ data.news.published }}</div>
              </div>
            </div>
            <div class="text-caption text-muted q-mt-sm">
              {{ t('dashboard.publishedOfTotal', { total: data.news.total }) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Widgets -->
      <div class="row q-col-gutter-md">
        <!-- Orders over time -->
        <div class="col-12 col-md-7">
          <div class="app-card q-pa-md fit">
            <div class="row items-center q-mb-md">
              <div class="text-subtitle1 text-weight-bold col">{{ t('dashboard.ordersOverTime') }}</div>
              <div class="text-caption text-muted">{{ t('dashboard.last14Days') }}</div>
            </div>
            <div v-if="maxDayCount === 0" class="state-block">
              <q-icon name="bar_chart" size="40px" />
              <div class="q-mt-sm">{{ t('dashboard.noOrdersYet') }}</div>
            </div>
            <div v-else class="chart-row">
              <div v-for="d in data.ordersByDay" :key="d.date" class="chart-col">
                <div class="chart-bar-track">
                  <div
                    class="chart-bar"
                    :style="{ height: barHeight(d.count) }"
                    :title="`${d.date}: ${d.count}`"
                  />
                </div>
                <div class="chart-tick">{{ dayTick(d.date) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Latest orders -->
        <div class="col-12 col-md-5">
          <div class="app-card q-pa-md fit">
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle1 text-weight-bold col">{{ t('dashboard.latestOrders') }}</div>
              <q-btn flat dense no-caps size="sm" color="primary" :label="t('dashboard.viewAll')" @click="go('orders')" />
            </div>
            <div v-if="!data.latestOrders.length" class="state-block">
              <q-icon name="inbox" size="40px" />
              <div class="q-mt-sm">{{ t('common.noData') }}</div>
            </div>
            <q-list v-else separator>
              <q-item v-for="o in data.latestOrders" :key="o.id" class="q-px-none">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ o.name }}</q-item-label>
                  <q-item-label caption>{{ o.vehicle ?? '—' }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="orderStatusColor(o.status)" :label="orderStatusLabel(o.status)" />
                  <span class="text-caption text-muted q-mt-xs">{{ shortDate(o.createdAt) }}</span>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Latest vehicles -->
        <div class="col-12">
          <div class="app-card q-pa-md">
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle1 text-weight-bold col">{{ t('dashboard.latestVehicles') }}</div>
              <q-btn flat dense no-caps size="sm" color="primary" :label="t('dashboard.viewAll')" @click="go('vehicles')" />
            </div>
            <div v-if="!data.latestVehicles.length" class="state-block">
              <q-icon name="directions_car" size="40px" />
              <div class="q-mt-sm">{{ t('common.noData') }}</div>
            </div>
            <q-list v-else separator>
              <q-item v-for="v in data.latestVehicles" :key="v.id" class="q-px-none">
                <q-item-section avatar>
                  <q-avatar square size="36px" color="grey-2" text-color="grey-7" icon="directions_car" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ v.title }}</q-item-label>
                  <q-item-label caption>{{ v.year }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <span class="text-weight-medium text-grey-9">{{ formatPrice(v.price, v.currency) }}</span>
                </q-item-section>
                <q-item-section side style="min-width: 84px">
                  <q-badge :color="vehicleStatusColor(v.status)" :label="vehicleStatusLabel(v.status)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { api } from '@/boot/api'
import { usePolling } from '@/composables/usePolling'
import { useAuthStore } from '@/stores/auth'
import type { DashboardData, OrderStatus, VehicleStatus } from '@/types'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const data = ref<DashboardData | null>(null)
const loading = ref(false)

const firstName = computed(() => (auth.user?.name ?? '').split(/\s+/)[0] ?? '')
const todayLabel = computed(() => new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const maxDayCount = computed(() => Math.max(0, ...(data.value?.ordersByDay.map((d) => d.count) ?? [])))

function barHeight(count: number) {
  if (maxDayCount.value === 0) return '2px'
  return `${Math.max(4, Math.round((count / maxDayCount.value) * 100))}%`
}

function dayTick(date: string) {
  const d = new Date(date)
  return d.getDate() % 3 === 0 ? String(d.getDate()) : ''
}

function go(name: string) {
  router.push({ name })
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatPrice(price: number, currency: string) {
  return `${Math.round(price).toLocaleString()} ${currency}`
}

const orderStatusMap: Record<OrderStatus, { color: string; key: string }> = {
  new: { color: 'primary', key: 'orders.statusNew' },
  in_progress: { color: 'warning', key: 'orders.statusInProgress' },
  processed: { color: 'positive', key: 'orders.statusProcessed' },
  declined: { color: 'grey', key: 'orders.statusDeclined' },
}
function orderStatusColor(s: OrderStatus) {
  return orderStatusMap[s]?.color ?? 'grey'
}
function orderStatusLabel(s: OrderStatus) {
  return t(orderStatusMap[s]?.key ?? s)
}

const vehicleStatusMap: Record<VehicleStatus, { color: string; key: string }> = {
  active: { color: 'positive', key: 'vehicles.statusActive' },
  sold: { color: 'grey', key: 'vehicles.statusSold' },
  draft: { color: 'orange', key: 'vehicles.statusDraft' },
}
function vehicleStatusColor(s: VehicleStatus) {
  return vehicleStatusMap[s]?.color ?? 'grey'
}
function vehicleStatusLabel(s: VehicleStatus) {
  return t(vehicleStatusMap[s]?.key ?? s)
}

async function load({ silent = false }: { silent?: boolean } = {}) {
  if (!silent) loading.value = true
  try {
    const { data: res } = await api.get('/admin/dashboard')
    data.value = res.data
  } finally {
    if (!silent) loading.value = false
  }
}

onMounted(() => load())

// Keep the summary counts and latest lists fresh as activity comes in elsewhere.
usePolling(() => load({ silent: true }))
</script>

<style scoped>
.pill {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
}
.pill--new { background: #eef2ff; color: #4f46e5; }
.pill--progress { background: #fef3c7; color: #b45309; }

.chart-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 180px;
}
.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.chart-bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.chart-bar {
  width: 70%;
  max-width: 26px;
  background: linear-gradient(180deg, #6366f1, #4f46e5);
  border-radius: 6px 6px 2px 2px;
  transition: height 0.3s ease;
}
.chart-tick {
  font-size: 10px;
  color: var(--c-gray-400);
  margin-top: 6px;
  height: 12px;
}
</style>
