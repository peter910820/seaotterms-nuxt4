<script lang="ts" setup>
import type { CommonResponse, ArticleQueryResponse } from "@/types/response";
import { messageStorage } from "@/utils/messageHandler";
import { errorHandler } from "@/utils/errorHandler";
import dayjs from "dayjs";
import MarkdownIt from "markdown-it";

const router = useRouter();

const { data, error } = await useFetch<CommonResponse<ArticleQueryResponse[]>, CommonResponse>("articles", {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

const articles = computed(() => (data.value?.data ?? []) as ArticleQueryResponse[]);
const markdown = new MarkdownIt({ html: false });
const articleSummary = (content: string) => {
  const text = markdown
    .parse(content || "", {})
    .flatMap((token) =>
      (token.children ?? [])
        .filter((child) => child.type === "text" || child.type === "code_inline")
        .map((child) => child.content),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
};

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
  <section aria-labelledby="articles-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="articles-heading" class="text-h6 font-weight-bold">首頁 / 文章</h1>
      <span class="text-caption text-text-tertiary">LATEST POSTS</span>
    </div>
    <MotionReveal v-for="article in articles" :key="article.id">
      <v-card tag="article" color="surface" elevation="0" rounded="lg" class="pa-6 mb-3 border">
        <div class="d-flex align-center justify-space-between ga-3 mb-4">
          <span class="text-primary text-caption">文章</span>
          <time class="text-text-tertiary text-caption" :datetime="String(article.createdAt)">{{
            dayjs(article.createdAt).format("YYYY.MM.DD")
          }}</time>
        </div>
        <h2 class="text-h5 font-weight-bold mb-2 text-wrap">
          <NuxtLink class="article-link" :to="`/articles/${article.id}`">{{ article.title }}</NuxtLink>
        </h2>
        <p v-if="articleSummary(article.content)" class="text-body-2 text-text-tertiary text-wrap">
          {{ articleSummary(article.content) }}
        </p>
        <div class="d-flex align-center justify-space-between ga-3 mt-5 pt-4 border-t">
          <span class="text-caption text-text-secondary"><span class="text-primary">●</span> SeaotterMS</span>
          <div class="d-flex justify-end flex-wrap ga-2">
            <v-chip
              v-for="tag in article.tags"
              :key="tag.name"
              size="small"
              color="primary"
              variant="outlined"
              :to="`/tags/${encodeURIComponent(tag.name)}`"
              >{{ tag.name }}</v-chip
            >
          </div>
        </div>
      </v-card>
    </MotionReveal>
  </section>
</template>

<style lang="scss" scoped>
.article-link {
  color: rgb(var(--v-theme-text-primary));
  text-decoration: none;
  overflow-wrap: anywhere;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
