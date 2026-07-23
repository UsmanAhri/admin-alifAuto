<template>
  <span class="flag-icon">
    <!-- Russia -->
    <svg v-if="code === 'ru'" viewBox="0 0 24 24" preserveAspectRatio="none" aria-hidden="true">
      <rect width="24" height="24" fill="#fff" />
      <rect y="8" width="24" height="8" fill="#0039a6" />
      <rect y="16" width="24" height="8" fill="#d52b1e" />
    </svg>

    <!-- China -->
    <svg v-else-if="code === 'zh'" viewBox="0 0 24 24" preserveAspectRatio="none" aria-hidden="true">
      <rect width="24" height="24" fill="#de2910" />
      <g fill="#ffde00" font-family="Arial, sans-serif" text-anchor="middle" dominant-baseline="central">
        <text x="6" y="8" font-size="8">★</text>
        <text x="12.5" y="3.5" font-size="3">★</text>
        <text x="15" y="7" font-size="3">★</text>
        <text x="15" y="11" font-size="3">★</text>
        <text x="12.5" y="14.5" font-size="3">★</text>
      </g>
    </svg>

    <!-- United Kingdom (English) -->
    <svg v-else viewBox="0 0 24 24" preserveAspectRatio="none" aria-hidden="true">
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0l24 24M24 0L0 24" stroke="#fff" stroke-width="4" />
      <path d="M0 0l24 24M24 0L0 24" stroke="#c8102e" stroke-width="2" />
      <path d="M12 0v24M0 12h24" stroke="#fff" stroke-width="6" />
      <path d="M12 0v24M0 12h24" stroke="#c8102e" stroke-width="3.5" />
    </svg>
  </span>
</template>

<script setup lang="ts">
defineProps<{ code: string }>()
</script>

<style scoped>
.flag-icon {
  display: inline-flex;
  width: 22px;
  height: 16px;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
}
.flag-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
