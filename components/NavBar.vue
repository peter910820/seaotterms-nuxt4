<script setup lang="ts">
import { useLoginModal } from "@/stores/useLoginModal";
import { useTheme } from "vuetify";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { showLoginModal, openLoginModal } = useLoginModal();

const theme = useTheme();
const userData = computed(() => user.value);
const drawer = ref(false);
const profileDrawer = ref(false);

const todoMenu = ref(false);
const galgameMenu = ref(false);
const otherMenu = ref(false);

interface NavigationItem {
  to: string;
  icon: string;
  title: string;
  requiresAuthentication?: boolean;
}

interface NavigationMenu {
  name: string;
  icon: string;
  items: NavigationItem[];
}

const primaryNavigationItems: NavigationItem[] = [
  { to: "/", icon: "mdi-home", title: "首頁" },
  { to: "/system-todos", icon: "mdi-calendar-clock", title: "系統更新待辦" },
];

const navigationMenus = {
  todo: {
    name: "Todo",
    icon: "mdi-check-circle",
    items: [
      { to: "/todolists", icon: "mdi-format-list-checks", title: "TodoList" },
      { to: "/todo-topics/create", icon: "mdi-tag-plus", title: "建立Todo類別" },
    ],
  },
  galgame: {
    name: "Galgame",
    icon: "mdi-dice-multiple",
    items: [{ to: "/self-galgames", icon: "mdi-dice-multiple", title: "Galgame紀錄" }],
  },
  other: {
    name: "其他功能",
    icon: "mdi-home-group",
    items: [
      { to: "/articles/create", icon: "mdi-pencil", title: "建立文章" },
      { to: "/todo-topics/system/create", icon: "mdi-server", title: "建立系統站台" },
      { to: "/user-maintain", icon: "mdi-account-cog", title: "使用者帳號維護", requiresAuthentication: true },
    ],
  },
} satisfies Record<string, NavigationMenu>;

const { todo: todoNavigationMenu, galgame: galgameNavigationMenu, other: otherNavigationMenu } = navigationMenus;
const isAuthenticated = computed(() => userData.value.id !== 0);
const getVisibleNavigationItems = (items: NavigationItem[]) =>
  items.filter((item) => !item.requiresAuthentication || isAuthenticated.value);
const mobileNavigationItems = computed(() => [
  ...primaryNavigationItems,
  ...Object.values(navigationMenus).flatMap((menu) => getVisibleNavigationItems(menu.items)),
]);

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === "darkness-theme" ? "v1-theme" : "darkness-theme";
};

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
  drawer.value = false;
};
</script>

<template>
  <v-app-bar color="background" elevation="2" class="navbar" app>
    <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>

    <v-app-bar-title>
      <NuxtLink to="/" class="brand-link">Home</NuxtLink>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Theme Toggle Button -->
    <v-btn
      icon
      variant="text"
      @click="toggleTheme"
      class="theme-toggle-btn"
      :title="theme.global.name.value === 'darkness-theme' ? '切換到淺色主題' : '切換到深色主題'"
    >
      <v-icon>{{ theme.global.name.value === "darkness-theme" ? "mdi-weather-sunny" : "mdi-weather-night" }}</v-icon>
    </v-btn>

    <!-- Desktop Navigation -->
    <div class="d-none d-md-flex align-center">
      <v-btn v-for="item in primaryNavigationItems" :key="item.to" variant="text" :to="item.to" :prepend-icon="item.icon">
        {{ item.title }}
      </v-btn>

      <v-menu v-model="todoMenu" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" :prepend-icon="todoNavigationMenu.icon" append-icon="mdi-menu-down">
            {{ todoNavigationMenu.name }}
          </v-btn>
        </template>
        <v-list color="background">
          <v-list-item
            v-for="item in getVisibleNavigationItems(todoNavigationMenu.items)"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-model="galgameMenu" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" :prepend-icon="galgameNavigationMenu.icon" append-icon="mdi-menu-down">
            {{ galgameNavigationMenu.name }}
          </v-btn>
        </template>
        <v-list color="background">
          <v-list-item
            v-for="item in getVisibleNavigationItems(galgameNavigationMenu.items)"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-model="otherMenu" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" :prepend-icon="otherNavigationMenu.icon" append-icon="mdi-menu-down">
            {{ otherNavigationMenu.name }}
          </v-btn>
        </template>
        <v-list color="background">
          <v-list-item
            v-for="item in getVisibleNavigationItems(otherNavigationMenu.items)"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        v-if="!isAuthenticated"
        variant="text"
        prepend-icon="mdi-login"
        @click.prevent="openLoginModal"
      >
        登入
      </v-btn>
      <template v-else>
        <v-btn variant="text" prepend-icon="mdi-account-circle" @click.prevent="profileDrawer = true"> 個人資料 </v-btn>
        <v-btn variant="text" prepend-icon="mdi-logout" @click.prevent="handleLogout">登出</v-btn>
      </template>
    </div>

    <LoginModal v-model="showLoginModal" />
  </v-app-bar>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" temporary location="left" class="mobile-drawer">
    <v-list>
      <v-list-item
        v-for="item in mobileNavigationItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        @click="drawer = false"
      ></v-list-item>
      <v-list-item
        v-if="isAuthenticated"
        prepend-icon="mdi-account-circle"
        title="個人資料"
        @click="
          profileDrawer = true;
          drawer = false;
        "
      ></v-list-item>
      <v-list-item
        v-if="!isAuthenticated"
        prepend-icon="mdi-login"
        title="登入"
        @click="
          openLoginModal();
          drawer = false;
        "
      ></v-list-item>
      <v-list-item v-else prepend-icon="mdi-logout" title="登出" @click="handleLogout"></v-list-item>
      <v-divider class="my-2"></v-divider>
      <v-list-item
        :prepend-icon="theme.global.name.value === 'darkness-theme' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        :title="theme.global.name.value === 'darkness-theme' ? '切換到淺色主題' : '切換到深色主題'"
        @click="toggleTheme"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Profile Drawer (from right) -->
  <v-navigation-drawer v-model="profileDrawer" temporary location="right" width="400" class="profile-drawer" touchable>
    <template v-slot:prepend>
      <v-toolbar color="transparent" density="compact">
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="profileDrawer = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
    </template>
    <ClientOnly>
      <MyProfile />
    </ClientOnly>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.navbar {
  background-color: rgb(var(--v-theme-background)) !important;
  border-bottom: 2px solid rgb(var(--v-theme-border));
}

.brand-link {
  text-decoration: none;
  color: rgb(var(--v-theme-text-primary));
  font-weight: 600;
  font-size: 1.25rem;

  &:hover {
    opacity: 0.8;
  }
}

.mobile-drawer {
  background-color: rgb(var(--v-theme-background)) !important;
}

.profile-drawer {
  background-color: rgb(var(--v-theme-background)) !important;

  // Hide scrollbar but keep scroll functionality
  :deep(.v-navigation-drawer__content) {
    overflow-y: auto;
    scrollbar-width: none; // Firefox
    -ms-overflow-style: none; // IE and Edge

    &::-webkit-scrollbar {
      display: none; // Chrome, Safari, Opera
    }
  }
}

:deep(.v-list-item) {
  color: rgb(var(--v-theme-text-secondary));
}

:deep(.v-overlay__scrim) {
  pointer-events: auto !important;
}

:deep(.v-menu .v-overlay__content) {
  background-color: rgb(var(--v-theme-background));
}

:deep(.v-menu .v-list) {
  background-color: rgb(var(--v-theme-background));
}

:deep(.v-menu .v-list-item) {
  background-color: rgb(var(--v-theme-background));
  
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
}
</style>
