<template>
  <q-page class="q-pa-lg">
    <div class="q-mb-md">
      <div class="page-title">{{ t('nav.orders') }}</div>
      <div class="page-subtitle">{{ t('orders.subtitle') }}</div>
    </div>

    <div class="app-card">
      <q-tabs
        v-model="tab"
        align="left"
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        no-caps
        inline-label
      >
        <q-tab name="vehicle" icon="directions_car" :label="t('orders.tabVehicle')" />
        <q-tab name="partner" icon="handshake" :label="t('orders.tabPartner')" />
        <q-tab v-if="showPartnership" name="partnership" icon="business_center" :label="t('orders.tabPartnership')" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" keep-alive animated>
        <q-tab-panel name="vehicle" class="q-pa-md">
          <OrdersTable ownership="regular" />
        </q-tab-panel>
        <q-tab-panel name="partner" class="q-pa-md">
          <OrdersTable ownership="partner" />
        </q-tab-panel>
        <q-tab-panel v-if="showPartnership" name="partnership" class="q-pa-md">
          <OrdersTable ownership="partnership" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OrdersTable from '@/components/OrdersTable.vue'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
// Partnership applications are a staff-facing queue; partners don't triage them.
const showPartnership = computed(() => auth.role !== 'partner')
const tab = ref<'vehicle' | 'partner' | 'partnership'>('vehicle')
</script>
