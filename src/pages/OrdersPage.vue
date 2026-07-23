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
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" keep-alive animated>
        <q-tab-panel name="vehicle" class="q-pa-md">
          <OrdersTable ownership="regular" />
        </q-tab-panel>
        <q-tab-panel name="partner" class="q-pa-md">
          <OrdersTable ownership="partner" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OrdersTable from '@/components/OrdersTable.vue'

const { t } = useI18n()
const tab = ref<'vehicle' | 'partner'>('vehicle')
</script>
