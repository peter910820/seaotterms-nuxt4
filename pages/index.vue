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
  <div class="main-block">
    <v-row align="stretch">
      <v-col cols="12" class="banner-column">
        <v-card class="banner-card" elevation="0" :style="{ backgroundImage: 'var(--v-banner-image)' }">
          <div class="banner-overlay">
            <div>
              <span class="text-primary text-caption font-weight-bold">SEAOTTERMS / PERSONAL BLOG</span>
              <p class="banner-text">正在嘗試進步，</p>
              <p class="text-body-2">學很多怪技術跟做很多小東西。</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" class="navigation-column">
        <SiteNavigation class="h-100" />
      </v-col>
    </v-row>

    <v-row class="mt-12" align="start">
      <v-col cols="12" md="9" tag="section" aria-labelledby="articles-heading">
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
      </v-col>
      <v-col cols="12" md="3" tag="aside" aria-labelledby="profile-heading">
        <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
          <h2 id="profile-heading" class="text-h6 font-weight-bold">個人資料</h2>
          <span class="text-caption text-text-tertiary">PROFILE</span>
        </div>
        <ClientOnly><Profile /></ClientOnly>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.main-block {
  padding: 40px;
}

.navigation-column {
  display: none;
}

@media (min-width: 1441px) {
  .banner-column {
    flex: 0 0 75%;
    max-width: 75%;
  }

  .navigation-column {
    display: block;
    flex: 0 0 25%;
    max-width: 25%;
  }
}

@media (max-width: 600px) {
  .main-block {
    padding: 20px 8px;
  }
}

.banner-card {
  min-height: 250px;
  height: 100%;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 12px;
  background-size: cover;
  background-position: 50% 20%;
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background-color: var(--v-banner-overlay);
  display: flex;
  align-items: center;
  padding: 40px;
}

.banner-text {
  font-family: "ChenYuluoyan-Thin";
  margin: 12px 0;
  font-size: clamp(36px, 4vw, 56px);
  word-wrap: break-word;
}

.article-link {
  color: rgb(var(--v-theme-text-primary));
  text-decoration: none;
  overflow-wrap: anywhere;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
