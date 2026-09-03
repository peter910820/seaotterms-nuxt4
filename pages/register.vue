<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { messageStorage } from "@/utils/messageHandler";
import { errorHandler } from "@/utils/errorHandler";
import type { CommonResponse } from "@/types/response";

const router = useRouter();
const form = ref({
  username: "",
  email: "example@gmail.com",
  password: "",
  checkPassword: "",
});

const err = ref("");
const loading = ref(false);

const usernameRules = [(v: string) => !!v || "此欄不能為空"];
const emailRules = [(v: string) => !!v || "此欄不能為空", (v: string) => /.+@.+\..+/.test(v) || "格式錯誤"];
const passwordRules = [(v: string) => !!v || "此欄不能為空"];
const checkPasswordRules = [
  (v: string) => !!v || "此欄不能為空",
  (v: string) => v === form.value.password || "密碼確認錯誤，請確定輸入相同密碼",
];

const handleRegisterSubmit = async () => {
  if (loading.value) {
    return;
  }

  if (form.value.password !== form.value.checkPassword) {
    err.value = "密碼確認錯誤，請確定輸入相同密碼";
    return;
  }

  err.value = "";
  loading.value = true;
  try {
    const response = await $fetch<CommonResponse>("users", {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "POST",
      body: form.value,
      credentials: "include",
    });
    messageStorage(response.statusCode, "帳號註冊成功");
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
    <h1 class="page-title mb-6">註冊</h1>
    <MotionReveal>
      <v-card class="form-card" color="background">
      <v-card-text class="pa-8">
        <v-form @submit.prevent="handleRegisterSubmit">
          <v-text-field
            v-model="form.username"
            label="使用者名稱"
            prepend-inner-icon="mdi-account-circle"
            variant="outlined"
            required
            class="mb-4"
            density="comfortable"
            :rules="usernameRules"
          />

          <v-text-field
            v-model="form.email"
            label="Email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            type="email"
            required
            class="mb-4"
            density="comfortable"
            :rules="emailRules"
          />

          <v-text-field
            v-model="form.password"
            label="密碼"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            type="password"
            required
            class="mb-4"
            density="comfortable"
            :rules="passwordRules"
          />

          <v-text-field
            v-model="form.checkPassword"
            label="確認密碼"
            prepend-inner-icon="mdi-lock-check"
            variant="outlined"
            type="password"
            required
            class="mb-4"
            density="comfortable"
            :rules="checkPasswordRules"
          />

          <div v-if="err" class="password-check mb-4">
            <v-icon size="small" class="mr-2">mdi-alert-circle</v-icon>
            {{ err }}
          </div>

          <v-btn color="primary" variant="elevated" size="large" :loading="loading" type="submit" block>
            註冊
            <v-icon end>mdi-send</v-icon>
          </v-btn>
        </v-form>
      </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>
</template>

<style lang="scss" scoped>
.password-check {
  color: rgb(var(--v-theme-error));
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}
</style>
