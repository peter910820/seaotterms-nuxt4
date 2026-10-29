<script setup lang="ts">
type TypedInstance = { destroy: () => void };
type TypedConstructor = new (
  element: HTMLElement,
  options: {
    strings: string[];
    typeSpeed: number;
    backSpeed: number;
    backDelay: number;
    loop: boolean;
    showCursor: boolean;
    smartBackspace: boolean;
  },
) => TypedInstance;

const bannerText = ref<HTMLElement | null>(null);
let typed: TypedInstance | undefined;
let script: HTMLScriptElement | null = null;

const startTyping = () => {
  const Typed = (window as Window & { Typed?: TypedConstructor }).Typed;
  if (!Typed || !bannerText.value || typed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  bannerText.value.textContent = "";
  typed = new Typed(bannerText.value, {
    strings: ["正在嘗試進步，", "學很多怪技術跟做很多小東西。"],
    typeSpeed: 80,
    backSpeed: 40,
    backDelay: 1500,
    loop: true,
    showCursor: false,
    smartBackspace: false,
  });
};

onMounted(() => {
  startTyping();
  if (!typed) {
    script = document.querySelector<HTMLScriptElement>('script[src*="typed.js@2.0.12"]');
    script?.addEventListener("load", startTyping);
  }
});

onBeforeUnmount(() => {
  script?.removeEventListener("load", startTyping);
  typed?.destroy();
});
</script>

<template>
  <div class="main-block">
    <v-row align="stretch">
      <v-col cols="12" class="banner-column">
        <v-card class="banner-card" elevation="0" :style="{ backgroundImage: 'var(--v-banner-image)' }">
          <div class="banner-overlay">
            <div>
              <span class="text-primary text-caption font-weight-bold">SEAOTTERMS / PERSONAL BLOG</span>
              <p ref="bannerText" class="banner-text"></p>
              <p class="banner-subtitle text-body-2">個人部落格以及個人工具使用</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" class="navigation-column">
        <SiteNavigation class="h-100" />
      </v-col>
    </v-row>

    <v-row class="mt-12" align="start">
      <v-col cols="12" md="9">
        <slot />
      </v-col>
      <v-col cols="12" md="3" tag="aside" aria-labelledby="profile-heading">
        <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
          <h2 id="profile-heading" class="text-h6 font-weight-bold">個人資料</h2>
          <span class="text-caption text-text-tertiary">PROFILE</span>
        </div>
        <ClientOnly><Profile /></ClientOnly>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.main-block {
  padding: 40px;
}

.navigation-column {
  display: none;
}

@media (min-width: 1441px) {
  .banner-column {
    flex: 0 0 75%;
    max-width: 75%;
  }

  .navigation-column {
    display: block;
    flex: 0 0 25%;
    max-width: 25%;
  }
}

@media (max-width: 600px) {
  .main-block {
    padding: 20px 8px;
  }
}

.banner-card {
  min-height: 250px;
  height: 100%;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 12px;
  background-size: cover;
  background-position: 50% 20%;
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background-color: var(--v-banner-overlay);
  display: flex;
  align-items: flex-start;
  padding: 40px;
}

.banner-text {
  font-family: "ChenYuluoyan-Thin";
  margin: 12px 0;
  font-size: clamp(36px, 4vw, 56px);
  line-height: 1.2;
  min-height: 1.2em;
  word-wrap: break-word;
}

.banner-subtitle {
  margin-top: 0;
}

@media (max-width: 900px) {
  .banner-text {
    min-height: 2.4em;
  }
}
</style>
