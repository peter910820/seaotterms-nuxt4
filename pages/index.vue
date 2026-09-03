<script lang="ts" setup>
import type { CommonResponse, ArticleQueryResponse } from "@/types/response";
import { messageStorage } from "@/utils/messageHandler";
import { errorHandler } from "@/utils/errorHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Typed: any;

const router = useRouter();

const { data, error } = await useFetch<CommonResponse<ArticleQueryResponse[]>, CommonResponse>("articles", {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

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

const link = (mod: string, target: string) => {
  if (mod === "article") {
    router.push(`/articles/${target}`);
  } else {
    router.push(`./tags/${target}`);
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tagClick = (tag: string, event: any) => {
  event.stopPropagation();
  link("tag", tag);
};

onMounted(() => {
  // eslint-disable-next-line no-undef
  new Typed(".banner-text", {
    strings: ["正在嘗試進步，", "學很多怪技術跟做很多小東西。"],
    typeSpeed: 80,
    loop: true,
    showCursor: false,
  });
});
</script>

<template>
  <div class="main-block">
    <v-card class="banner-card mb-4" :style="{ backgroundImage: 'var(--v-banner-image)' }">
      <div class="banner-overlay">
        <div class="banner-text"></div>
      </div>
    </v-card>

    <h1 class="mb-4">首頁/文章</h1>

    <MotionReveal
      v-for="article in articles"
      :key="article.id"
    >
      <v-card class="article-card mb-4" @click="link('article', article.id.toString())">
        <v-card-title class="article-title">{{ article.title }}</v-card-title>

        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon size="small" class="mr-2">mdi-account</v-icon>
            <span>SeaotterMS</span>
          </div>

          <div class="d-flex align-center mb-2">
            <v-icon size="small" class="mr-2">mdi-pencil</v-icon>
            <span class="mr-4">{{ article.createdAt }}</span>
            <v-icon size="small" class="mr-2">mdi-update</v-icon>
            <span>{{ article.updatedAt }}</span>
          </div>

          <div class="d-flex align-end justify-end flex-wrap">
            <v-chip
              v-for="tag in article.tags"
              :key="tag.name"
              class="ma-1"
              size="small"
              @click.stop="tagClick(tag.name, $event)"
            >
              {{ tag.name }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </MotionReveal>
  </div>
</template>

<style lang="scss" scoped>
%basic-text-style {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.main-block {
  padding: 40px;
}

.banner-card {
  height: 250px;
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 100px;
  text-align: center;
  background-size: cover;
  background-position: 50% 20%;
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 100px;
  background-color: var(--v-banner-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  font-family: "ChenYuluoyan-Thin";
  margin: 50px;
  font-size: 60px;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-card {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
  cursor: pointer;
  background-color: var(--v-card-color-1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--v-theme-shadow-light);
  }
}

.article-title {
  @extend %basic-text-style;
  font-size: 30px;
  padding-bottom: 8px;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}
</style>
