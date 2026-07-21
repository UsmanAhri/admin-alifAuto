<template>
  <div class="category-node">
    <div
      class="drop-strip"
      :class="{ active: hoverZone === 'before' }"
      @dragover.prevent="hoverZone = 'before'"
      @dragleave="hoverZone = null"
      @drop="onDrop('before', $event)"
    />

    <div
      class="node-row row items-center q-py-xs q-px-sm"
      :class="{ 'bg-blue-1': hoverZone === 'into' }"
      draggable="true"
      @dragstart="onDragStart"
      @dragover.prevent="hoverZone = 'into'"
      @dragleave="hoverZone = null"
      @drop="onDrop('into', $event)"
    >
      <q-icon name="drag_indicator" class="q-mr-sm text-grey-5" />
      <q-icon :name="node.children.length ? 'folder' : 'label'" class="q-mr-sm" />
      <div class="col">
        <span class="text-weight-medium">{{ label(node.title) }}</span>
        <span class="text-grey-6 q-ml-sm">/{{ node.slug }}</span>
        <q-badge v-if="!node.isActive" color="grey" class="q-ml-sm">off</q-badge>
        <q-badge color="blue-grey" class="q-ml-sm">{{ node.vehiclesCount }} {{ t('menu.vehicles') }}</q-badge>
      </div>
      <q-btn dense flat icon="add" size="sm" @click="$emit('add-child', node)">
        <q-tooltip>{{ t('menu.addChild') }}</q-tooltip>
      </q-btn>
      <q-btn dense flat icon="edit" size="sm" @click="$emit('edit', node)" />
      <q-btn dense flat icon="delete" size="sm" color="negative" @click="$emit('delete', node)" />
    </div>

    <div
      class="drop-strip"
      :class="{ active: hoverZone === 'after' }"
      @dragover.prevent="hoverZone = 'after'"
      @dragleave="hoverZone = null"
      @drop="onDrop('after', $event)"
    />

    <div v-if="node.children.length" class="q-pl-lg">
      <CategoryTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminCategory, Translations } from '@/types'

defineOptions({ name: 'CategoryTreeNode' })

const props = defineProps<{ node: AdminCategory }>()
const emit = defineEmits<{
  'add-child': [AdminCategory]
  edit: [AdminCategory]
  delete: [AdminCategory]
  move: [{ draggedId: number; parentId: number | null; position: number }]
}>()

const { locale, t } = useI18n()
const hoverZone = ref<'before' | 'into' | 'after' | null>(null)

function label(title: Translations) {
  return title[locale.value as keyof Translations] ?? title.ru ?? title.en ?? Object.values(title)[0] ?? ''
}

function onDragStart(event: DragEvent) {
  event.dataTransfer?.setData('text/plain', String(props.node.id))
  event.dataTransfer!.effectAllowed = 'move'
}

function onDrop(zone: 'before' | 'into' | 'after', event: DragEvent) {
  hoverZone.value = null
  const draggedId = Number(event.dataTransfer?.getData('text/plain'))
  if (!draggedId || draggedId === props.node.id) return

  if (zone === 'into') {
    emit('move', { draggedId, parentId: props.node.id, position: props.node.children.length })
  } else if (zone === 'before') {
    emit('move', { draggedId, parentId: props.node.parentId, position: props.node.position })
  } else {
    emit('move', { draggedId, parentId: props.node.parentId, position: props.node.position + 1 })
  }
}
</script>

<style scoped>
.node-row {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin: 2px 0;
  cursor: grab;
}
.drop-strip {
  height: 6px;
}
.drop-strip.active {
  background: #1976d2;
  border-radius: 3px;
}
</style>
