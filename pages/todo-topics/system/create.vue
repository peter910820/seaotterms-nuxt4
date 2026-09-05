<script setup lang="ts">
definePageMeta({
  ssr: false,
  middleware: "require-management",
});

import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { messageStorage } from "@/utils/messageHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";

import type { TodoTopicCreateRequest } from "@/types/request";
import type { CommonResponse } from "@/types/response";
import { errorHandler } from "@/utils/errorHandler";

const router = useRouter();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const form = ref<TodoTopicCreateRequest>({
  topicName: "",
  topicOwner: "system",
  updatedAt: new Date(),
  updateName: user.value.username,
});

const loading = ref(false);
const formRef = ref();
const titleRules = [(v: string) => !!v?.trim() || "標題不得為空"];

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const response = await $fetch<CommonResponse>("todo-topics", {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "POST",
      body: form.value,
      credentials: "include",
    });
    userInfoHandler(response.userInfo);
    messageStorage(response.statusCode, "資料創建成功");
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
    <h1 class="page-title mb-6">建立系統站台</h1>
    <v-card class="form-card" color="background">
      <v-card-text class="pa-8">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.topicName"
            label="Title"
            prepend-inner-icon="mdi-format-title"
            variant="outlined"
            required
            class="mb-6"
            density="comfortable"
            :rules="titleRules"
          />
          <v-btn color="primary" variant="elevated" size="large" :loading="loading" type="submit" block>
            建立系統站台
            <v-icon end>mdi-send</v-icon>
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
