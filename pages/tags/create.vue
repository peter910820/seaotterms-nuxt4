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
  <v-container class="main-block">
    <h1 class="page-title mb-6">建立文章Tag</h1>
    <MotionReveal>
      <v-card class="form-card" color="background">
      <v-card-text class="pa-8">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.name"
            label="Name"
            prepend-inner-icon="mdi-format-title"
            variant="outlined"
            required
            class="mb-4"
            density="comfortable"
            :rules="nameRules"
          />

          <v-text-field
            v-model="form.iconName"
            label="Icon Name"
            prepend-inner-icon="mdi-tag"
            variant="outlined"
            class="mb-4"
            density="comfortable"
          />

          <v-btn color="primary" variant="elevated" size="large" :loading="loading" type="submit" block>
            建立文章Tag
            <v-icon end>mdi-send</v-icon>
          </v-btn>
        </v-form>
      </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
