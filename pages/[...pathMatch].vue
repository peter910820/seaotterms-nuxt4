<template>
  <section aria-labelledby="not-found-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="not-found-heading" class="text-h6 font-weight-bold">找不到頁面</h1>
      <span class="text-caption text-text-tertiary">PAGE NOT FOUND</span>
    </div>

    <MotionReveal>
      <v-card color="surface" elevation="0" rounded="lg" class="not-found-card border pa-6 pa-sm-8">
        <div class="d-flex align-center flex-wrap ga-5">
          <v-avatar color="primary" variant="tonal" rounded="lg" size="64">
            <v-icon icon="mdi-map-marker-question-outline" size="32" />
          </v-avatar>
          <div class="not-found-content">
            <div class="not-found-code text-primary font-weight-bold">404</div>
            <h2 class="text-h6 font-weight-bold mb-2">這個頁面不在這裡</h2>
            <p class="text-body-2 text-text-tertiary">請確認網址是否正確，或回到首頁繼續瀏覽。</p>
          </div>
        </div>
        <v-divider class="my-6" />
        <v-btn to="/" color="primary" variant="tonal" prepend-icon="mdi-home-outline">回到首頁</v-btn>
      </v-card>
    </MotionReveal>
  </section>
</template>

<style lang="scss" scoped>
.not-found-content {
  flex: 1 1 200px;
  min-width: 0;
}

.not-found-code {
  font-size: clamp(3rem, 6vw, 5rem);
  line-height: 1;
}
</style>
