<script setup lang="ts">
definePageMeta({
  ssr: false,
  middleware: "require-management",
});

import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { messageStorage } from "@/utils/messageHandler";
import { errorHandler } from "@/utils/errorHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";

import type { SystemTodoUpdateRequest } from "@/types/request";
import type { CommonResponse, SystemTodoQueryResponse, TodoTopicQueryResponse } from "@/types/response";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const systemTodoId = route.params.id as string;

const { data, error } = await useFetch<CommonResponse<SystemTodoQueryResponse[]>, CommonResponse>(
  `system-todos?id=${systemTodoId}`,
  {
    baseURL: useRuntimeConfig().public.apiUrl,
    credentials: "include",
  },
);

const { data: data2, error: error2 } = await useFetch<CommonResponse<TodoTopicQueryResponse[]>, CommonResponse>(
  "todo-topics/system",
  {
    baseURL: useRuntimeConfig().public.apiUrl,
    credentials: "include",
  },
);

const systemTodo = data.value?.data as SystemTodoQueryResponse[] | undefined;
const systemTodoTopics = data2.value?.data as TodoTopicQueryResponse[] | undefined;

if (import.meta.client && (error.value || !systemTodo || systemTodo.length === 0)) {
  if (error.value?.statusCode === 500) {
    messageStorage(error.value.statusCode, error.value.errMsg);
  } else {
    messageStorage();
  }
  router.push("/message");
}

const deadlineDate = ref<string>(
  systemTodo?.[0]?.deadline ? new Date(systemTodo[0].deadline).toISOString().slice(0, 10) : "",
);

const form = ref<SystemTodoUpdateRequest>({
  id: systemTodo?.[0]?.id ?? 0,
  systemName: systemTodo?.[0]?.systemName ?? "",
  title: systemTodo?.[0]?.title ?? "",
  detail: systemTodo?.[0]?.detail ?? "",
  status: systemTodo?.[0]?.status ?? 0,
  deadline: null,
  urgency: systemTodo?.[0]?.urgency ?? 0,
  updatedName: user.value.username,
});

const urgencyOptions = [
  { title: "普通", value: 0 },
  { title: "高優先度", value: 1 },
  { title: "緊急", value: 2 },
];

const loading = ref(false);
const formRef = ref();
const titleRules = [(v: string) => !!v || "此欄不能為空"];
const systemNameRules = [(v: string) => !!v || "此欄不能為空"];
const deadlineDateRules = [(v: string) => !v || !isNaN(Date.parse(`${v}T00:00:00Z`)) || "日期格式錯誤"];

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
    form.value.deadline = dateStr;
  } else {
    form.value.deadline = null;
  }

  loading.value = true;
  try {
    const response = await $fetch<CommonResponse>(`system-todos/${form.value.id}`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "PATCH",
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
    <h1 class="page-title mb-6">更新系統代辦</h1>
    <MotionReveal>
      <v-card class="form-card" color="background">
      <v-card-text class="pa-8">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" md="4" class="mb-4">
              <v-select
                v-model="form.systemName"
                :items="systemTodoTopics ?? []"
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
                :rules="deadlineDateRules"
              />
            </v-col>
            <v-col cols="12" md="2" class="mb-4 d-flex align-center">
              <v-btn color="primary" variant="elevated" size="large" :loading="loading" type="submit" block>
                更新
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
