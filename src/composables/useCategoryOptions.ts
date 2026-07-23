import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/boot/api'
import type { Translations } from '@/types'

export interface CategoryOption {
  label: string
  value: number
  depth: number
}

interface RawCategory {
  id: number
  title: Translations
  children?: RawCategory[]
}

/**
 * Loads the admin category tree once and exposes it flattened into indented
 * `{ label, value }` options for selects. Shared by the characteristics editor
 * and the vehicle form so both speak the same category linkage.
 */
export function useCategoryOptions() {
  const { locale } = useI18n()
  const options = ref<CategoryOption[]>([])
  const loading = ref(false)

  function label(value: Translations): string {
    return (
      value[locale.value as keyof Translations] ??
      value.ru ??
      value.en ??
      Object.values(value)[0] ??
      ''
    )
  }

  function flatten(nodes: RawCategory[], depth = 0): CategoryOption[] {
    return nodes.flatMap((n) => [
      { label: `${'— '.repeat(depth)}${label(n.title)}`, value: Number(n.id), depth },
      ...flatten(n.children ?? [], depth + 1),
    ])
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data } = await api.get('/admin/categories')
      options.value = flatten(data.data as RawCategory[])
    } finally {
      loading.value = false
    }
  }

  return { options, loading, load }
}
