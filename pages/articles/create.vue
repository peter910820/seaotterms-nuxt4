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
const titleRules = [(v: string) => !!v || "此欄不能為空"];

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

  if (form.value.title.trim() === "") {
    alert("標題不得為空");
    return;
  }

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
  <v-container class="main-block">
    <h1 class="page-title mb-6">建立文章</h1>
    <MotionReveal>
      <v-card class="form-card" color="background">
      <v-card-text class="pa-8">
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.title"
            label="標題"
            prepend-inner-icon="mdi-format-title"
            variant="outlined"
            required
            class="mb-4"
            density="comfortable"
            :rules="titleRules"
          />

          <v-row>
            <v-col cols="12" md="6" class="mb-4">
              <v-text-field
                v-model="form.username"
                label="使用者名稱"
                prepend-inner-icon="mdi-account-circle"
                variant="outlined"
                disabled
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6" class="mb-4">
              <v-select
                v-model="form.tags"
                :items="choiceTag"
                item-title="name"
                item-value="name"
                label="選擇Tag"
                placeholder="選擇Tag"
                prepend-inner-icon="mdi-tag-multiple"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6" class="mb-4">
              <v-textarea
                v-model="form.content"
                label="Content"
                prepend-inner-icon="mdi-pencil"
                variant="outlined"
                density="comfortable"
                rows="10"
                class="text-insert"
                auto-grow
              />
            </v-col>
            <v-col cols="12" md="6" class="mb-4">
              <div class="markdown-preview-label mb-2">
                <v-icon class="mr-2">mdi-eye</v-icon>
                Markdown 預覽
              </div>
              <div class="markdown-preview" v-html="renderedMarkdown"></div>
            </v-col>
          </v-row>

          <div class="hint mb-4">
            <v-icon size="small" class="mr-2">mdi-information</v-icon>
            本功能使用markdown支援(右邊會有markdown即時預覽)
          </div>

          <v-btn color="primary" variant="elevated" size="large" :loading="loading" type="submit" block>
            建立文章
            <v-icon end>mdi-send</v-icon>
          </v-btn>
        </v-form>
      </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>
</template>

<style lang="scss" scoped>
.form-card {
  border: 2px solid rgb(var(--v-theme-border));
}

.hint {
  color: rgb(var(--v-theme-error));
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.text-insert {
  :deep(.v-field__input) {
    max-height: 400px;
    overflow-y: auto;
  }
}

.markdown-preview-label {
  font-weight: 600;
  color: rgb(var(--v-theme-tagColor));
  display: flex;
  align-items: center;
}

.markdown-preview {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 8px;
  padding: 16px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  background-color: rgb(var(--v-theme-background));
  font-size: 0.875rem;
  line-height: 1.6;

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

@media (max-width: 768px) {
  .markdown-preview {
    max-height: 300px;
  }
}
</style>
