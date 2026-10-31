<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";

import type { ArticleQueryResponse, CommonResponse } from "@/types/response";

const route = useRoute();
const router = useRouter();

const tagName = computed(() => String(route.params.name));

const { data, error } = await useFetch<CommonResponse<ArticleQueryResponse[]>, CommonResponse>(
  () => `tags/${encodeURIComponent(tagName.value)}`,
  {
    baseURL: useRuntimeConfig().public.apiUrl,
    credentials: "include",
  },
);

const articles = computed(() => (data.value?.data ?? []) as ArticleQueryResponse[]);

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
  <section aria-labelledby="tag-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="tag-heading" class="text-h6 font-weight-bold">標籤文章</h1>
      <span class="text-caption text-text-tertiary">TAG / ARTICLES</span>
    </div>
    <v-card color="surface" elevation="0" rounded="lg" class="border pa-6 mb-5">
      <v-btn to="/tags" variant="text" size="small" prepend-icon="mdi-arrow-left" class="mb-4">返回標籤列表</v-btn>
      <div class="d-flex align-center flex-wrap ga-3">
        <v-avatar color="primary" variant="tonal" rounded="lg" size="48"><v-icon icon="mdi-pound" /></v-avatar>
        <div class="tag-heading">
          <div class="text-caption text-text-tertiary">目前標籤</div>
          <h2 class="text-h5 font-weight-bold">{{ tagName }}</h2>
        </div>
        <v-spacer />
        <v-chip color="primary" variant="tonal" size="small">{{ articles.length }} 篇文章</v-chip>
      </div>
    </v-card>
    <v-card
      v-if="!articles.length && !error"
      color="surface"
      elevation="0"
      rounded="lg"
      class="border pa-8 text-center text-text-tertiary"
    >
      這個標籤目前沒有文章。
    </v-card>
    <v-card
      v-for="article in articles"
      :key="article.id"
      :to="`/articles/${article.id}`"
      color="surface"
      elevation="0"
      rounded="lg"
      class="article-item border pa-5 mb-3"
    >
      <div class="d-flex align-center justify-space-between ga-3">
        <div class="article-details">
          <div class="text-caption text-text-tertiary mb-2">{{ dayjs(article.createdAt).format("YYYY.MM.DD") }}</div>
          <h3 class="text-subtitle-1 font-weight-bold text-text-primary">{{ article.title }}</h3>
        </div>
        <v-icon icon="mdi-arrow-right" color="primary" />
      </div>
    </v-card>
  </section>
</template>

<style lang="scss" scoped>
.article-item {
  &:hover {
    border-color: rgb(var(--v-theme-primary)) !important;
  }
}

.tag-heading,
.article-details {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
