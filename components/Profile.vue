<script setup lang="ts">
import { storeToRefs } from "pinia";

const { user } = storeToRefs(useUserStore());
</script>

<template>
  <v-card color="surface" rounded="lg" elevation="0" class="profile border pa-6 text-center">
    <div class="profile-accent" aria-hidden="true"></div>
    <div class="d-flex flex-column align-center ga-4 position-relative">
      <v-avatar size="144" class="profile-avatar">
        <v-img :src="user.avatar || '/headshot.png'" :alt="user.username || '預設頭像'" cover />
      </v-avatar>
      <h3 class="text-h6 font-weight-bold text-text-primary profile-name">{{ user.username || "使用者未登入" }}</h3>
      <p class="text-body-2 text-text-tertiary profile-about">一個不知道在幹嘛，每天一直假裝自己有在做事的人。</p>
      <v-btn
        href="https://github.com/peter910820/seaotterms-nuxt4"
        target="_blank"
        rel="noopener noreferrer"
        color="primary"
        variant="tonal"
        rounded="lg"
        block
        class="profile-project"
      >
        <v-icon icon="mdi-github" size="small" class="project-icon" />
        <span class="project-label">這是專案本身:pepega:</span>
      </v-btn>
      <div class="d-flex justify-center ga-3">
        <v-btn
          href="https://github.com/peter910820"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          icon="mdi-github"
          variant="text"
        />
        <v-btn
          href="https://x.com/seaotterMS"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          icon="mdi-twitter"
          variant="text"
          color="info"
        />
      </div>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.profile {
  overflow: hidden;
  transition: box-shadow 200ms ease;

  &:hover {
    box-shadow: 0 12px 30px var(--v-theme-shadow-light) !important;
  }
}

.profile-accent {
  position: absolute;
  inset: 0 0 auto;
  height: 90px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.2), transparent);
}

.profile-avatar {
  max-width: 100%;
  border: 3px solid rgb(var(--v-theme-surface));
  box-shadow:
    0 0 0 2px rgb(var(--v-theme-primary)),
    0 8px 20px var(--v-theme-shadow-light);
}

.profile-name {
  overflow-wrap: anywhere;
}

.profile-about {
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.profile-project {
  height: auto;
  min-height: 44px;
  padding: 10px;
  max-width: 100%;
  letter-spacing: normal;
  text-transform: none;

  :deep(.v-btn__content) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    max-width: 100%;
    white-space: normal;
  }
}

.project-icon {
  flex-shrink: 0;
}

.project-label {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.4;
}

@media (prefers-reduced-motion: reduce) {
  .profile {
    transition: none;
  }
}
</style>
