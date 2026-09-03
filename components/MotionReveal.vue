<script setup lang="ts">
import { motion } from "motion-v";
</script>

<template>
  <motion.div
    class="motion-reveal"
    :initial="{ opacity: 0, y: 8 }"
    :while-in-view="{ opacity: 1, y: 0 }"
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
