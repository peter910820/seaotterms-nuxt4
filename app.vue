<script setup lang="ts">
import { onMounted } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useLoginModal } from "@/stores/useLoginModal";

const siteUrl = useRuntimeConfig().public.siteUrl as string;
const route = useRoute();
const usesHomeShell = computed(
  () =>
    route.path === "/" ||
    route.path === "/self/galgame" ||
    route.path === "/todos" ||
    route.path === "/user-maintain" ||
    route.path === "/system-todos" ||
    route.path.startsWith("/system-todos/") ||
    route.path.startsWith("/articles/"),
);
const isSmallScreen = useMediaQuery("(max-width: 1440px)");
const { showLoginModal } = useLoginModal();

useSeoMeta({
  ogImage: () => `${siteUrl}background.png`,
  ogUrl: () => siteUrl,
});

onMounted(async () => {
  const bar = document.getElementById("loader");
  if (bar) {
    setTimeout(() => {
      bar.classList.add("loading-hidden");
    }, 100);
  }
});
</script>

<template>
  <v-app>
    <div id="loader">
      <div class="loader"></div>
    </div>
    <NavBar v-if="!usesHomeShell || isSmallScreen" />
    <LoginModal v-model="showLoginModal" />
    <AppSnackbar />
    <AppConfirmDialog />
    <v-main>
      <v-container fluid class="page-container">
        <v-row class="page-row">
          <v-col cols="1"></v-col>
          <v-col cols="10" class="page-content">
            <HomeShell v-if="usesHomeShell"><NuxtPage /></HomeShell>
            <NuxtPage v-else />
          </v-col>
          <v-col cols="1"></v-col>
        </v-row>
      </v-container>
    </v-main>
    <!-- <MainFooter /> -->
  </v-app>
</template>

<style lang="scss">
html,
body {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
  background-size: 400% 400%;
}

.main-block {
  padding: 40px;
}

.loading-hidden {
  display: none !important;
}

.page-container {
  min-height: 100vh;
}

.page-row {
  min-height: 100%;
}

.page-content {
  min-height: 100vh;
}
</style>
