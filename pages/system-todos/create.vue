<script setup lang="ts">
definePageMeta({
  ssr: false,
  middleware: "require-management",
});

import { ref } from "vue";
import { useRouter } from "vue-router";

import { messageStorage } from "@/utils/messageHandler";
import { errorHandler } from "@/utils/errorHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";

import type { SystemTodoCreateRequest } from "@/types/request";
import type { CommonResponse, TodoTopicQueryResponse } from "@/types/response";

const router = useRouter();
const form = ref<SystemTodoCreateRequest>({
  systemName: "",
  title: "",
  detail: "",
  status: 0,
  deadline: "",
  urgency: 0,
  createdName: "seaotterms",
});

const deadlineDate = ref<string>("");

const { data, error } = await useFetch<CommonResponse<TodoTopicQueryResponse[]>, CommonResponse>("todo-topics/system", {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

const todoTopics = computed(() => (data.value?.data ?? []) as TodoTopicQueryResponse[]);

if (import.meta.client && error.value) {
  if (error.value.statusCode === 500) {
    messageStorage(error.value.statusCode, error.value.errMsg);
    router.push("/message");
  } else {
    messageStorage();
    router.push("/message");
  }
}

const urgencyOptions = [
  { title: "普通", value: 0 },
  { title: "高優先度", value: 1 },
  { title: "緊急", value: 2 },
];

const loading = ref(false);
const formRef = ref();
const titleRules = [(v: string) => !!v || "此欄不能為空"];
const systemNameRules = [(v: string) => !!v || "此欄不能為空"];

const handleSubmit = async () => {
  if (loading.value) {
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) {
    return;
  }
  if (deadlineDate.value) {
    const dateStr = deadlineDate.value + "T00:00:00Z";
    const timestamp = Date.parse(dateStr);

    if (isNaN(timestamp)) {
      alert("日期格式錯誤");
      return;
    }
    form.value.deadline = dateStr;
  } else {
    form.value.deadline = null;
  }

  loading.value = true;
  try {
    const response = await $fetch<CommonResponse>("system-todos", {
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
</script>

<template>
  <v-container class="main-block">
    <h1 class="page-title mb-6">建立系統代辦</h1>
    <MotionReveal>
      <v-card class="form-card" color="background">
      <v-card-text class="pa-8">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" md="4" class="mb-4">
              <v-select
                v-model="form.systemName"
                :items="todoTopics"
                item-title="topicName"
                item-value="topicName"
                label="選擇站台"
                placeholder="選擇站台"
                prepend-inner-icon="mdi-office-building"
                variant="outlined"
                density="comfortable"
                required
                :rules="systemNameRules"
              />
            </v-col>
            <v-col cols="12" md="8" class="mb-4">
              <v-text-field
                v-model="form.title"
                label="標題"
                prepend-inner-icon="mdi-format-title"
                variant="outlined"
                required
                density="comfortable"
                :rules="titleRules"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="form.detail"
            label="詳細資訊"
            prepend-inner-icon="mdi-text-box"
            variant="outlined"
            density="comfortable"
            rows="5"
            class="mb-4"
            auto-grow
          />

          <v-row>
            <v-col cols="12" md="3" class="mb-4">
              <v-select
                v-model="form.urgency"
                :items="urgencyOptions"
                item-title="title"
                item-value="value"
                label="選擇急迫度"
                prepend-inner-icon="mdi-priority-high"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="7" class="mb-4">
              <v-text-field
                v-model="deadlineDate"
                label="截止日期"
                type="date"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="2" class="mb-4 d-flex align-center">
              <v-btn color="primary" variant="elevated" size="large" :loading="loading" type="submit" block>
                建立
                <v-icon end>mdi-send</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
