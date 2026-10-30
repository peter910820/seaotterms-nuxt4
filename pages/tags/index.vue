<script setup lang="ts">
import { useRouter } from "vue-router";

import type { CommonResponse, TagQueryResponse } from "@/types/response";

const router = useRouter();

const { data, error } = await useFetch<CommonResponse<TagQueryResponse[]>, CommonResponse>("tags", {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

const tags = computed(() => (data.value?.data ?? []) as TagQueryResponse[]);

if (import.meta.client && error.value) {
  if (error.value.statusCode === 500) {
    messageStorage(error.value.statusCode, error.value.errMsg);
    router.push("/message");
  } else {
    messageStorage();
    router.push("/message");
  }
}
</script>

<template>
  <section aria-labelledby="tags-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="tags-heading" class="text-h6 font-weight-bold">標籤一覽</h1>
      <span class="text-caption text-text-tertiary">TAGS</span>
    </div>
    <v-card color="surface" elevation="0" rounded="lg" class="tag-intro border pa-6 mb-5">
      <div class="d-flex align-center flex-wrap ga-4">
        <v-avatar color="primary" variant="tonal" rounded="lg" size="48"
          ><v-icon icon="mdi-tag-multiple-outline"
        /></v-avatar>
        <div class="flex-grow-1">
          <h2 class="text-h6 font-weight-bold">探索文章標籤</h2>
          <p class="text-body-2 text-text-tertiary">選擇感興趣的主題，瀏覽相關文章。</p>
        </div>
        <v-chip color="primary" variant="tonal" size="small">{{ tags.length }} 個標籤</v-chip>
      </div>
    </v-card>
    <v-card
      v-if="!tags.length && !error"
      color="surface"
      elevation="0"
      rounded="lg"
      class="border pa-8 text-center text-text-tertiary"
    >
      目前沒有標籤。
    </v-card>
    <v-row v-else>
      <v-col v-for="tag in tags" :key="tag.name" cols="12" sm="6" lg="4">
        <v-card
          :to="`/tags/${encodeURIComponent(tag.name)}`"
          color="surface"
          elevation="0"
          rounded="lg"
          class="tag-card border pa-5 h-100"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" rounded="lg" size="40"
              ><v-icon icon="mdi-pound" size="20"
            /></v-avatar>
            <span class="tag-name font-weight-bold text-text-primary">{{ tag.name }}</span>
            <v-spacer />
            <v-icon icon="mdi-arrow-top-right" color="primary" size="20" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style lang="scss" scoped>
.tag-card {
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-color: rgb(var(--v-theme-primary)) !important;
    box-shadow: 0 8px 20px var(--v-theme-shadow-light) !important;
  }
}

.tag-name {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (prefers-reduced-motion: reduce) {
  .tag-card {
    transition: none;
  }
}
</style>
