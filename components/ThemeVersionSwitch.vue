<script setup lang="ts">
const { currentTheme, setTheme } = useAppTheme();
</script>

<template>
  <div class="theme-versions" role="group" aria-label="經典主題">
    <button
      type="button"
      :class="{ active: currentTheme === 'v2-theme' }"
      :aria-pressed="currentTheme === 'v2-theme'"
      aria-label="切換到 V2 主題"
      @click="setTheme('v2-theme')"
    >
      V2
    </button>
    <span class="divider" aria-hidden="true"></span>
    <button
      type="button"
      :class="{ active: currentTheme === 'v1-theme' }"
      :aria-pressed="currentTheme === 'v1-theme'"
      aria-label="切換到 V1 主題"
      @click="setTheme('v1-theme')"
    >
      V1
    </button>
  </div>
</template>

<style lang="scss" scoped>
.theme-versions {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 999px;
  background: rgb(var(--v-theme-surface));
}

button {
  padding: 8px 10px;
  border: 0;
  background: transparent;
  color: rgb(var(--v-theme-text-secondary));
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;

  &.active {
    color: rgb(var(--v-theme-primary));
    font-weight: 700;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -3px;
  }
}

.divider {
  width: 1px;
  height: 20px;
  background: rgb(var(--v-theme-border));
  transform: rotate(20deg);
}
</style>
