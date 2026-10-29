<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import dayjs from "dayjs";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // highlight-styles

import type { CommonResponse, ArticleQueryResponse } from "@/types/response";

const router = useRouter();
const route = useRoute();

const { data, error, pending } = await useFetch<CommonResponse<ArticleQueryResponse[]>, CommonResponse>(
  () => `articles/${encodeURIComponent(String(route.params.id))}`,
  {
    baseURL: useRuntimeConfig().public.apiUrl,
    credentials: "include",
  },
);

const article = computed(() => data.value?.data?.[0]);

if (import.meta.client && error.value) {
  if (error.value.statusCode === 500) {
    messageStorage(error.value.statusCode, error.value.errMsg);
    router.push("/message");
  } else {
    messageStorage();
    router.push("/message");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const md: any = MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (error) {
        console.log(error);
      }
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + "</code></pre>";
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderMarkdown = (content: any) => {
  return md.render(content);
};

const renderedMarkdown = computed(() => renderMarkdown(article.value?.content ?? ""));

const formatDateTime = (date: string | Date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};
</script>

<template>
  <article aria-labelledby="article-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="article-heading" class="text-h6 font-weight-bold">文章內容</h1>
      <span class="text-caption text-text-tertiary">ARTICLE</span>
    </div>
    <v-card v-if="pending" color="surface" elevation="0" rounded="lg" class="border pa-8 text-center" role="status">
      <v-progress-circular indeterminate color="primary" size="24" class="mr-2" />正在載入文章…
    </v-card>
    <v-alert v-else-if="error" type="error" variant="tonal" rounded="lg">目前無法取得文章，請稍後再試。</v-alert>
    <v-alert v-else-if="!article" type="info" variant="tonal" rounded="lg">找不到這篇文章。</v-alert>
    <template v-else>
      <v-card color="surface" elevation="0" rounded="lg" class="border pa-6 mb-4">
        <v-btn to="/" variant="text" size="small" prepend-icon="mdi-arrow-left" class="mb-4">返回文章列表</v-btn>
        <h2 class="article-title text-h4 font-weight-bold mb-4">{{ article.title }}</h2>
        <div class="d-flex align-center flex-wrap ga-4 text-body-2 text-text-tertiary">
          <span><v-icon size="small" class="mr-1">mdi-account-circle-outline</v-icon>SeaotterMS</span>
          <span
            ><v-icon size="small" class="mr-1">mdi-calendar-plus</v-icon>發表
            {{ formatDateTime(article.createdAt) }}</span
          >
          <span
            ><v-icon size="small" class="mr-1">mdi-pencil-outline</v-icon>更新
            {{ formatDateTime(article.updatedAt) }}</span
          >
        </div>
        <div class="d-flex flex-wrap ga-2 mt-4">
          <v-chip
            v-for="tag in article.tags"
            :key="tag.name"
            color="primary"
            variant="outlined"
            size="small"
            :to="`/tags/${encodeURIComponent(tag.name)}`"
            >{{ tag.name }}</v-chip
          >
        </div>
      </v-card>
      <v-card color="surface" elevation="0" rounded="lg" class="border pa-6">
        <div class="markdown-preview" v-html="renderedMarkdown"></div>
      </v-card>
    </template>
  </article>
</template>

<style lang="scss" scoped>
.article-title {
  font-family: "Cubic_11_1.100_R", sans-serif;
  overflow-wrap: anywhere;
}

.markdown-preview {
  font-family: "jf-openhuninn-2.1", sans-serif;
  line-height: 1.8;
  overflow-wrap: anywhere;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(pre) {
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
