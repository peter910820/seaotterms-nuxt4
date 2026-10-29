<script setup lang="ts">
import { useLoginModal } from "@/stores/useLoginModal";
import { useAppTheme } from "@/composables/useAppTheme";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { openLoginModal } = useLoginModal();

const route = useRoute();
const { isDark, nextThemeLabel, toggleTheme } = useAppTheme();
const userData = computed(() => user.value);
const drawer = ref(false);
const accountMenu = ref(false);

interface NavigationItem {
  to: string;
  icon: string;
  title: string;
  requiresAuthentication?: boolean;
}

const primaryNavigationItems: NavigationItem[] = [
  { to: "/", icon: "mdi-home", title: "首頁" },
  { to: "/system-todos", icon: "mdi-calendar-clock", title: "系統更新待辦" },
  { to: "/todos", icon: "mdi-format-list-checks", title: "TodoList" },
  { to: "/self/galgame", icon: "mdi-dice-multiple", title: "Galgame紀錄" },
];

const otherNavigationItems: NavigationItem[] = [
  { to: "/articles/create", icon: "mdi-pencil", title: "建立文章" },
  { to: "/user-maintain", icon: "mdi-account-cog", title: "使用者帳號維護", requiresAuthentication: true },
];

const isAuthenticated = computed(() => userData.value.id !== 0);
const displayName = computed(() => userData.value.username || "個人資料");
const getVisibleNavigationItems = (items: NavigationItem[]) =>
  items.filter((item) => !item.requiresAuthentication || isAuthenticated.value);
const isItemActive = (to: string) => {
  if (to === "/") return route.path === "/";
  return route.path === to || route.path.startsWith(`${to}/`);
};
const drawerNavigationItems = computed(() => [
  ...primaryNavigationItems,
  ...getVisibleNavigationItems(otherNavigationItems),
]);

const handleLogout = () => {
  const session = useCookie("blog-userinfo-session", {
    path: "/",
    maxAge: 0,
    sameSite: "none",
    domain: useRuntimeConfig().public.rootDomain,
    secure: true,
  });
  session.value = null;
  userStore.reset();
  accountMenu.value = false;
  drawer.value = false;
};

watch(
  () => route.fullPath,
  () => {
    drawer.value = false;
    accountMenu.value = false;
  },
);
</script>

<template>
  <v-app-bar color="background" elevation="0" height="72" class="navbar" app>
    <div class="navbar-inner">
      <div class="navbar-start">
        <button
          type="button"
          class="icon-btn menu-btn"
          aria-label="開啟選單"
          :aria-expanded="drawer"
          @click="drawer = !drawer"
        >
          <v-icon size="20">{{ drawer ? "mdi-close" : "mdi-menu" }}</v-icon>
        </button>

        <NuxtLink to="/" class="brand">
          <img class="brand-mark" src="https://cdn.seaotterms.net/img-cdn/blog-icon.png" alt="" />
          <span class="brand-name">seaotterms.com</span>
        </NuxtLink>
      </div>

      <div class="navbar-end">
        <button
          type="button"
          class="icon-btn theme-button"
          :title="`切換到${nextThemeLabel}`"
          :aria-label="`切換到${nextThemeLabel}`"
          @click="toggleTheme"
        >
          <v-icon size="18">{{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}</v-icon>
        </button>
        <ThemeVersionSwitch />

        <button v-if="!isAuthenticated" type="button" class="login-btn" @click="openLoginModal">登入</button>

        <v-menu
          v-else
          v-model="accountMenu"
          location="bottom end"
          offset="10"
          transition="fade-transition"
          content-class="nav-menu-content"
        >
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="account-btn" :aria-expanded="accountMenu">
              <span class="account-avatar">
                <img v-if="userData.avatar" :src="userData.avatar" alt="" />
                <v-icon v-else size="16">mdi-account</v-icon>
              </span>
              <span class="account-name">{{ displayName }}</span>
              <v-icon size="16" class="chevron" :class="{ open: accountMenu }">mdi-chevron-down</v-icon>
            </button>
          </template>

          <div class="menu-panel">
            <button type="button" class="menu-item menu-item-danger" @click="handleLogout">
              <span class="menu-item-icon">
                <v-icon size="18">mdi-logout</v-icon>
              </span>
              <span>登出</span>
            </button>
          </div>
        </v-menu>
      </div>
    </div>

  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="left" width="320" color="background" class="mobile-drawer">
    <div class="drawer-body">
      <p class="drawer-label">瀏覽</p>
      <nav class="drawer-nav" aria-label="主要導覽">
        <NuxtLink
          v-for="item in drawerNavigationItems"
          :key="item.to"
          :to="item.to"
          class="drawer-link"
          :class="{ active: isItemActive(item.to) }"
        >
          <span class="menu-item-icon">
            <v-icon size="18">{{ item.icon }}</v-icon>
          </span>
          <span>{{ item.title }}</span>
        </NuxtLink>
      </nav>

      <p class="drawer-label">帳號</p>
      <div class="drawer-nav">
        <button v-if="!isAuthenticated" type="button" class="drawer-link" @click="openLoginModal(); drawer = false">
          <span class="menu-item-icon">
            <v-icon size="18">mdi-login</v-icon>
          </span>
          <span>登入</span>
        </button>
        <button v-else type="button" class="drawer-link drawer-link-danger" @click="handleLogout">
          <span class="menu-item-icon">
            <v-icon size="18">mdi-logout</v-icon>
          </span>
          <span>登出</span>
        </button>
      </div>

      <div class="drawer-footer">
        <button type="button" class="drawer-link" @click="toggleTheme">
          <span class="menu-item-icon">
            <v-icon size="18">{{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}</v-icon>
          </span>
          <span>切換到{{ nextThemeLabel }}</span>
        </button>
      </div>
    </div>
  </v-navigation-drawer>

</template>

<style lang="scss" scoped>
.navbar {
  background-color: rgb(var(--v-theme-background)) !important;
  border-bottom: 1px solid rgb(var(--v-theme-border)) !important;
  box-shadow: 0 8px 24px var(--v-theme-shadow-light) !important;

  :deep(.v-toolbar__content) {
    height: 72px !important;
    padding-inline: 20px;
    overflow: visible;
  }
}

.navbar-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.navbar-start,
.navbar-end,
.brand,
.account-btn,
.drawer-link,
.menu-item {
  display: flex;
  align-items: center;
}

.navbar-start {
  gap: 8px;
  min-width: 0;
}

.navbar-end {
  gap: 12px;
  margin-left: auto;
}

.brand {
  gap: 10px;
  min-width: 0;
  text-decoration: none;
  color: rgb(var(--v-theme-text-primary));
}

.brand-mark {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 10px;
  object-fit: cover;
}

.brand-name {
  font-family: "Cubic_11_1.100_R", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  transition: transform 160ms ease;

  &.open {
    transform: rotate(180deg);
  }
}

.icon-btn,
.login-btn,
.account-btn,
.drawer-link,
.menu-item {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.icon-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-text-primary)) 12%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 72%, transparent);
  color: rgb(var(--v-theme-text-secondary));
  transition:
    color 160ms ease,
    border-color 160ms ease;

  &:hover {
    color: rgb(var(--v-theme-text-primary));
    border-color: color-mix(in srgb, rgb(var(--v-theme-info)) 50%, transparent);
  }
}

.theme-button {
  border-radius: 50%;
}

.login-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgb(var(--v-theme-info));
  color: rgb(var(--v-theme-surface));
  font-weight: 650;
  transition: filter 160ms ease;

  &:hover {
    filter: brightness(1.06);
  }
}

.account-btn {
  height: 38px;
  max-width: 220px;
  gap: 8px;
  padding: 0 10px 0 6px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-text-primary)) 12%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 78%, transparent);
  color: rgb(var(--v-theme-text-primary));
}

.account-avatar {
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: color-mix(in srgb, rgb(var(--v-theme-info)) 16%, transparent);
  color: rgb(var(--v-theme-info));

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.account-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.92rem;
}

.menu-panel {
  min-width: 220px;
  padding: 6px;
  border-radius: 16px;
  background: rgb(var(--v-theme-background));
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-text-primary)) 10%, transparent);
  box-shadow: 0 16px 40px var(--v-theme-shadow-medium);
}

.menu-item {
  width: 100%;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: transparent;
  color: rgb(var(--v-theme-text-secondary));
  font-size: 0.92rem;
  text-align: left;
  text-decoration: none;

  &:hover,
  &.active {
    background: color-mix(in srgb, rgb(var(--v-theme-info)) 12%, transparent);
    color: rgb(var(--v-theme-text-primary));
  }
}

.menu-item-icon {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: color-mix(in srgb, rgb(var(--v-theme-info)) 14%, transparent);
  color: rgb(var(--v-theme-info));
}

.menu-item-danger {
  color: rgb(var(--v-theme-error));

  .menu-item-icon {
    color: rgb(var(--v-theme-error));
    background: color-mix(in srgb, rgb(var(--v-theme-error)) 12%, transparent);
  }

  &:hover {
    color: rgb(var(--v-theme-error));
    background: color-mix(in srgb, rgb(var(--v-theme-error)) 10%, transparent);
  }
}

.mobile-drawer {
  background-color: rgb(var(--v-theme-background)) !important;
  border-color: color-mix(in srgb, rgb(var(--v-theme-text-primary)) 12%, transparent) !important;
}

.drawer-body {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px 20px;
}

.drawer-label {
  margin: 8px 12px 4px;
  color: rgb(var(--v-theme-text-tertiary));
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-link {
  width: 100%;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  background: transparent;
  color: rgb(var(--v-theme-text-secondary));
  font-size: 0.95rem;
  text-align: left;
  text-decoration: none;

  &:hover,
  &.active {
    background: color-mix(in srgb, rgb(var(--v-theme-info)) 12%, transparent);
    color: rgb(var(--v-theme-text-primary));
  }

  &.active {
    color: rgb(var(--v-theme-info));
    font-weight: 650;
  }
}

.drawer-link-danger {
  color: rgb(var(--v-theme-error));

  .menu-item-icon {
    color: rgb(var(--v-theme-error));
    background: color-mix(in srgb, rgb(var(--v-theme-error)) 12%, transparent);
  }
}

.drawer-footer {
  margin-top: auto;
  padding-top: 12px;
}

:global(.nav-menu-content) {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px !important;
}

@media (prefers-reduced-motion: reduce) {
  .chevron,
  .icon-btn,
  .login-btn,
  .mobile-drawer {
    transition: none !important;
  }
}
</style>
