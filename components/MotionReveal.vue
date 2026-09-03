<script setup lang="ts">
import { motion } from "motion-v";

const reveal = ref<HTMLElement | null>(null);
const isReady = ref(false);
const isInitiallyVisible = ref(false);
defineProps<{
  hoverable?: boolean;
}>();

onMounted(() => {
  const rect = reveal.value?.getBoundingClientRect();

  isInitiallyVisible.value = Boolean(rect && rect.top < window.innerHeight && rect.bottom > 0);
  isReady.value = true;
});
</script>

<template>
  <div v-if="!isReady" ref="reveal" class="motion-reveal">
    <slot />
  </div>
  <motion.div
    v-else
    class="motion-reveal"
    :initial="isInitiallyVisible ? { opacity: 0, scale: 0.96 } : { opacity: 0, x: -100 }"
    :animate="isInitiallyVisible ? { opacity: 1, scale: 1 } : undefined"
    :while-in-view="isInitiallyVisible ? undefined : { opacity: 1, x: 0 }"
    :while-hover="hoverable ? { scale: 1.02 } : undefined"
    :viewport="{ once: true, amount: 0.1 }"
    :transition="{ duration: 0.18, ease: 'easeOut' }"
  >
    <slot />
  </motion.div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .motion-reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
