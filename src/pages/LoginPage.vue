<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
    <q-card style="width: 380px" class="q-pa-md">
      <q-card-section class="text-center">
        <div class="text-h6">Alif Auto Co</div>
        <div class="text-subtitle2 text-grey-7">{{ t('login.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submit">
          <q-input
            v-model="login"
            :label="t('login.login')"
            outlined
            dense
            class="q-mb-sm"
            autofocus
            :rules="[(v: string) => !!v || '']"
          />
          <q-input
            v-model="password"
            :label="t('login.password')"
            type="password"
            outlined
            dense
            class="q-mb-md"
            :rules="[(v: string) => !!v || '']"
          />

          <q-banner v-if="error" class="bg-red-1 text-red-9 q-mb-md" dense>{{ error }}</q-banner>

          <q-btn
            :label="t('login.submit')"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row justify-center q-gutter-sm">
          <q-btn
            v-for="l in locales"
            :key="l"
            :label="l.toUpperCase()"
            flat
            dense
            :color="locale === l ? 'primary' : 'grey'"
            @click="setLocale(l)"
          />
        </div>
      </q-card-section>
    </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { persistLocale, type AppLocale } from '@/i18n'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const login = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const locales: AppLocale[] = ['en', 'ru', 'zh']

function setLocale(l: AppLocale) {
  locale.value = l
  persistLocale(l)
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(login.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    error.value = status === 403 ? t('login.disabled') : t('login.error')
  } finally {
    loading.value = false
  }
}
</script>
