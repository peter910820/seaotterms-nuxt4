<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { messageStorage } from "@/utils/messageHandler";
import { errorHandler } from "@/utils/errorHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";

import type { TagCreateRequest } from "@/types/request";
import type { CommonResponse } from "@/types/response";

const router = useRouter();
const form = ref<TagCreateRequest>({
  name: "",
  iconName: "",
});

const loading = ref(false);
const formRef = ref();
const nameRules = [(v: string) => !!v || "此欄不能為空"];

const handleSubmit = async () => {
  if (loading.value) {
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) {
    return;
  }

  loading.value = true;
  try {
    const response = await $fetch<CommonResponse>("tags", {
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
  <section aria-labelledby="create-tag-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="create-tag-heading" class="text-h6 font-weight-bold">建立文章標籤</h1>
      <span class="text-caption text-text-tertiary">NEW TAG</span>
    </div>
    <MotionReveal>
      <v-card color="surface" elevation="0" rounded="lg" class="border pa-6">
        <div class="d-flex align-center ga-3 mb-6">
          <v-avatar color="primary" variant="tonal" rounded="lg" size="48"
            ><v-icon icon="mdi-tag-plus-outline"
          /></v-avatar>
          <div>
            <h2 class="text-subtitle-1 font-weight-bold">新增標籤</h2>
            <p class="text-body-2 text-text-tertiary">建立標籤，讓文章更容易被找到。</p>
          </div>
        </div>
        <v-divider class="mb-6" />
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.name"
            label="標籤名稱"
            prepend-inner-icon="mdi-format-title"
            variant="outlined"
            required
            class="mb-4"
            density="comfortable"
            :rules="nameRules"
          />

          <v-text-field
            v-model="form.iconName"
            label="圖示名稱（選填）"
            prepend-inner-icon="mdi-tag"
            variant="outlined"
            class="mb-4"
            density="comfortable"
          />

          <v-btn color="primary" size="large" :loading="loading" type="submit" block prepend-icon="mdi-plus">
            建立標籤
          </v-btn>
        </v-form>
      </v-card>
    </MotionReveal>
  </section>
</template>
