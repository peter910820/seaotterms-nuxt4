<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppTheme } from "@/composables/useAppTheme";
import { useLoginModal } from "@/stores/useLoginModal";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { isDark, nextThemeLabel, toggleTheme } = useAppTheme();
const { openLoginModal } = useLoginModal();
const route = useRoute();

const navigationItems: { to: string; icon: string; title: string; requiresAuthentication?: boolean }[] = [
  { to: "/", icon: "mdi-home", title: "首頁" },
  { to: "/system-todos", icon: "mdi-calendar-clock", title: "系統更新待辦" },
  { to: "/todos", icon: "mdi-format-list-checks", title: "TodoList" },
  { to: "/self/galgame", icon: "mdi-dice-multiple", title: "Galgame紀錄" },
  { to: "/articles/create", icon: "mdi-pencil", title: "建立文章" },
  { to: "/user-maintain", icon: "mdi-account-cog", title: "使用者帳號維護", requiresAuthentication: true },
];

const isAuthenticated = computed(() => user.value.id !== 0);
const visibleItems = computed(() =>
  navigationItems.filter((item) => !item.requiresAuthentication || isAuthenticated.value),
);
const isActive = (path: string) => route.path === path || (path !== "/" && route.path.startsWith(`${path}/`));

const logout = () => {
  const session = useCookie("blog-userinfo-session", {
    path: "/",
    maxAge: 0,
    sameSite: "none",
    domain: useRuntimeConfig().public.rootDomain,
    secure: true,
  });
  session.value = null;
  userStore.reset();
};
</script>

<template>
  <v-card tag="nav" aria-label="網站導覽" color="surface" elevation="0" rounded="lg" class="pa-4 border">
    <div class="d-flex align-center justify-space-between mb-3">
      <strong>網站導覽</strong>
      <span class="text-caption text-text-tertiary">MENU</span>
    </div>

    <v-row dense>
      <v-col v-for="item in visibleItems" :key="item.to" cols="6">
        <v-btn
          :to="item.to"
          :color="isActive(item.to) ? 'primary' : undefined"
          :variant="isActive(item.to) ? 'tonal' : 'text'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          block
          class="nav-link justify-start"
        >
          <v-icon size="18" class="mr-2">{{ item.icon }}</v-icon>
          <span class="nav-label">{{ item.title }}</span>
        </v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-3" />
    <div class="d-flex flex-wrap ga-2">
      <v-btn
        variant="outlined"
        icon
        size="small"
        :aria-label="`切換到${nextThemeLabel}`"
        :title="`切換到${nextThemeLabel}`"
        @click="toggleTheme"
      >
        <v-icon>{{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}</v-icon>
      </v-btn>
      <ThemeVersionSwitch />
      <v-btn v-if="!isAuthenticated" color="primary" class="flex-grow-1" @click="openLoginModal">登入</v-btn>
      <v-btn v-else color="primary" class="flex-grow-1" @click="logout">登出</v-btn>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.nav-link {
  height: auto;
  min-height: 40px;
  padding: 6px 8px;
  font-size: 0.75rem;
  letter-spacing: 0;
  text-transform: none;
  white-space: normal;

  :deep(.v-btn__content) {
    min-width: 0;
    width: 100%;
    justify-content: flex-start;
    white-space: normal;
  }
}

.nav-label {
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: left;
  line-height: 1.3;
}
</style>
