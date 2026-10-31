<script setup lang="ts">
definePageMeta({
  ssr: false,
  middleware: "require-management",
});

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { messageStorage } from "@/utils/messageHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";
import { errorHandler } from "@/utils/errorHandler";

import type { ArticleCreateRequest } from "@/types/request";
import type { CommonResponse, TagQueryResponse } from "@/types/response";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // Code highlight styles

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const router = useRouter();

const form = ref<ArticleCreateRequest>({
  title: "",
  username: user.value?.username,
  tags: [],
  content: "",
});

const loading = ref(false);
const previewOpen = ref(false);
const formRef = ref();
const titleRules = [(v: string) => !!v?.trim() || "標題不得為空"];

const { data, error } = await useFetch<CommonResponse<TagQueryResponse[]>, CommonResponse>("tags", {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

if (import.meta.client && error.value) {
  if (error.value.statusCode === 500) {
    messageStorage(error.value.statusCode, error.value.errMsg);
    router.push("/message");
  } else {
    messageStorage();
    router.push("/message");
  }
}

const choiceTag = computed(() => data.value?.data ?? []);

const handleSubmit = async () => {
  if (loading.value) {
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const response = await $fetch<CommonResponse>("articles", {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "POST",
      body: form.value,
      credentials: "include",
    });
    userInfoHandler(response.userInfo);
    messageStorage(response.statusCode, response.infoMsg);
    router.push("/message");
  } catch (error) {
    errorHandler(error);
  } finally {
    loading.value = false;
  }
};

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
const renderedMarkdown = computed(() => renderMarkdown(form.value.content));
</script>

<template>
  <section aria-labelledby="create-article-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="create-article-heading" class="text-h6 font-weight-bold">建立文章</h1>
      <span class="text-caption text-text-tertiary">NEW ARTICLE</span>
    </div>
    <MotionReveal>
      <v-card color="surface" elevation="0" rounded="lg" class="border pa-4 pa-sm-6">
        <div class="d-flex align-center ga-3 mb-6">
          <v-avatar color="primary" variant="tonal" rounded="lg" size="48">
            <v-icon icon="mdi-text-box-edit-outline" />
          </v-avatar>
          <div>
            <h2 class="text-subtitle-1 font-weight-bold">撰寫新文章</h2>
            <p class="text-body-2 text-text-tertiary">填寫文章資訊，使用 Markdown 編輯內容。</p>
          </div>
        </div>
        <v-divider class="mb-6" />
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <h3 class="text-subtitle-2 font-weight-bold mb-3">文章資訊</h3>
          <v-text-field
            v-model="form.title"
            label="標題"
            prepend-inner-icon="mdi-format-title"
            variant="outlined"
            required
            class="mb-4"
            density="comfortable"
            :rules="titleRules"
            hide-details="auto"
          />

          <v-row>
            <v-col cols="12" sm="5">
              <v-text-field
                v-model="form.username"
                label="使用者名稱"
                prepend-inner-icon="mdi-account-circle"
                variant="outlined"
                disabled
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="7">
              <v-select
                v-model="form.tags"
                :items="choiceTag"
                item-title="name"
                item-value="name"
                label="文章標籤"
                placeholder="選擇標籤"
                prepend-inner-icon="mdi-tag-multiple"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <div class="d-flex align-center justify-space-between flex-wrap ga-2 mt-6 mb-3">
            <h3 class="text-subtitle-2 font-weight-bold">文章內容</h3>
            <v-btn
              type="button"
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-eye-outline"
              @click="previewOpen = true"
            >
              預覽文章
            </v-btn>
          </div>
          <v-textarea
            v-model="form.content"
            label="Markdown 內容"
            placeholder="開始撰寫文章…"
            prepend-inner-icon="mdi-pencil"
            variant="outlined"
            density="comfortable"
            rows="10"
            class="text-insert"
            auto-grow
            hide-details="auto"
          />

          <v-divider class="my-6" />
          <div class="d-flex justify-end flex-wrap ga-3">
            <v-btn to="/" variant="text">返回首頁</v-btn>
            <v-btn color="primary" :loading="loading" type="submit" prepend-icon="mdi-send">建立文章</v-btn>
          </div>
        </v-form>
      </v-card>
    </MotionReveal>
    <v-dialog v-model="previewOpen" max-width="900" scrollable aria-labelledby="preview-title">
      <v-card color="surface" rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between ga-3">
          <span id="preview-title" class="text-h6">文章預覽</span>
          <v-btn icon="mdi-close" variant="text" aria-label="關閉預覽" @click="previewOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div v-if="form.content.trim()" class="markdown-preview" v-html="renderedMarkdown"></div>
          <div v-else class="markdown-preview text-body-2 text-text-tertiary"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="previewOpen = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<style lang="scss" scoped>
.text-insert {
  :deep(.v-field__input) {
    max-height: 400px;
    overflow-y: auto;
  }
}

.markdown-preview {
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 8px;
  padding: 16px;
  min-height: 200px;
  background-color: rgb(var(--v-theme-background));
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-wrap: anywhere;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
  }

  :deep(p) {
    margin-bottom: 1em;
  }

  :deep(code) {
    background-color: var(--v-theme-shadow-light);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: "Courier New", monospace;
  }

  :deep(pre) {
    background-color: rgb(var(--v-theme-code-bg));
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1em;
  }

  :deep(pre code) {
    background-color: transparent;
    padding: 0;
  }

  :deep(ul),
  :deep(ol) {
    margin-left: 1.5em;
    margin-bottom: 1em;
  }

  :deep(blockquote) {
    border-left: 4px solid rgb(var(--v-theme-primary));
    padding-left: 1em;
    margin-left: 0;
    color: rgb(var(--v-theme-text-tertiary));
  }
}
</style>
