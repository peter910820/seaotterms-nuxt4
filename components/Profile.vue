<script setup lang="ts">
import { storeToRefs } from "pinia";

const { user } = storeToRefs(useUserStore());
</script>

<template>
  <div class="profile">
    <img class="profile-avatar" :src="user.avatar || '/headshot.png'" :alt="user.username || '預設頭像'" />
    <h3 class="profile-name">{{ user.username || "使用者未登入" }}</h3>
    <p class="profile-about">一個不知道在幹嘛，每天一直假裝自己有在做事的人。</p>
    <a
      class="profile-project"
      href="https://github.com/peter910820/seaotterms-nuxt4"
      target="_blank"
      rel="noopener noreferrer"
    >
      <v-icon start>mdi-github</v-icon>這是專案本身:pepega:
    </a>
    <div class="profile-social">
      <a href="https://github.com/peter910820" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
        ><v-icon size="28">mdi-github</v-icon></a
      >
      <a href="https://x.com/seaotterMS" target="_blank" rel="noopener noreferrer" aria-label="Twitter"
        ><v-icon size="28">mdi-twitter</v-icon></a
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 28px 24px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  text-align: center;
}
.profile-avatar {
  width: min(160px, 100%);
  aspect-ratio: 1;
  object-fit: cover;
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
}
.profile-name {
  margin: 0;
  color: rgb(var(--v-theme-text-primary));
  font-size: 22px;
  overflow-wrap: anywhere;
}
.profile-about {
  margin: 0;
  color: rgb(var(--v-theme-text-tertiary));
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.profile-project {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-surface));
  text-decoration: none;
}
.profile-social {
  display: flex;
  justify-content: center;
  gap: 24px;
}
.profile-social a {
  color: rgb(var(--v-theme-text-secondary));
}
.profile-social a:last-child {
  color: rgb(var(--v-theme-info));
}
</style>
