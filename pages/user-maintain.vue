<script setup lang="ts">
definePageMeta({
  ssr: false,
  middleware: "require-auth",
});

import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { messageStorage } from "@/utils/messageHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";
import { errorHandler } from "@/utils/errorHandler";
import { useAppConfirm } from "@/stores/useAppConfirm";

import type { CommonResponse, UserQueryResponse } from "@/types/response";
import type { UserUpdateRequest } from "@/types/request";

const router = useRouter();
const { confirm } = useAppConfirm();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const form = ref<UserUpdateRequest>({
  id: user.value.id,
  username: user.value.username,
  email: user.value.email,
  exp: user.value.exp,
  management: user.value.management,
  created_at: user.value.created_at,
  updated_at: user.value.updated_at,
  update_name: user.value.update_name,
  avatar: user.value.avatar,
});
const allUserData = ref<UserQueryResponse[]>([]);

const dialog = ref(false);
const usersLoading = ref(false);
const usersLoadError = ref(false);

const changeStatus = async () => {
  usersLoading.value = true;
  usersLoadError.value = false;
  try {
    const response = await $fetch<CommonResponse<UserQueryResponse[]>>(`users`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "GET",
      credentials: "include",
    });
    allUserData.value = (response.data as UserQueryResponse[]).filter((val) => val.username !== user.value.username);
    userInfoHandler(response.userInfo);
  } catch (error) {
    usersLoadError.value = true;
    console.log(error);
    errorHandler(error);
  } finally {
    usersLoading.value = false;
  }
};

const loading = ref(false);
const formRef = ref();
const avatarRules = [(v: string) => !!v?.trim() || "個人圖片URL不得為空"];

const handleSubmit = async () => {
  if (loading.value) {
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const response = await $fetch<CommonResponse>(`users/${form.value.id}`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "PATCH",
      body: form.value,
      credentials: "include",
    });
    messageStorage(response.statusCode, response.infoMsg);
    userInfoHandler(response.userInfo);
    router.push("/message");
  } catch (error) {
    errorHandler(error);
  } finally {
    loading.value = false;
  }
};

const changeManagementStatus = async (userId: number) => {
  if (await confirm({ title: "修改權限", message: "確定修改權限?", confirmColor: "warning" })) {
    const myUser = allUserData.value.find((item) => item.id === userId);
    if (myUser) {
      try {
        const response = await $fetch<CommonResponse<UserQueryResponse[]>>(`users/${userId}`, {
          baseURL: useRuntimeConfig().public.apiUrl,
          method: "PATCH",
          body: { ...myUser, management: !myUser.management, updateName: user.value.update_name },
          credentials: "include",
        });
        allUserData.value = (response.data as UserQueryResponse[]).filter(
          (val) => val.username !== user.value.username,
        );
        userInfoHandler(response.userInfo);
      } catch (error) {
        errorHandler(error);
      }
    } else {
      errorHandler(null);
    }
  }
};
</script>

<template>
  <section aria-labelledby="account-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="account-heading" class="text-h6 font-weight-bold">使用者帳號維護</h1>
      <span class="text-caption text-text-tertiary">ACCOUNT</span>
    </div>

    <MotionReveal>
      <v-card color="surface" elevation="0" rounded="lg" class="border pa-6">
        <div class="d-flex align-center flex-wrap ga-4 mb-6">
          <v-avatar color="primary" variant="tonal" size="48" icon="mdi-account-outline" />
          <div class="account-name">
            <div class="text-caption text-text-tertiary">使用者名稱</div>
            <h2 class="text-h6 font-weight-bold">{{ form.username }}</h2>
          </div>
          <v-chip :color="form.management ? 'primary' : 'secondary'" size="small" variant="tonal">
            {{ form.management ? "管理員" : "一般用戶" }}
          </v-chip>
          <v-spacer />
          <v-btn
            v-if="form.management"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-account-cog"
            @click="
              changeStatus();
              dialog = true;
            "
          >
            變更使用者權限
          </v-btn>
        </div>

        <v-divider class="mb-6" />
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <h2 class="text-subtitle-1 font-weight-bold mb-1">個人圖片</h2>
          <p class="text-body-2 text-text-tertiary mb-4">輸入圖片網址並預覽顯示效果。</p>
          <v-text-field
            v-model="form.avatar"
            label="個人圖片 URL"
            prepend-inner-icon="mdi-image-outline"
            variant="outlined"
            required
            density="comfortable"
            :rules="avatarRules"
          />
          <div class="d-flex flex-column align-center ga-3 my-4">
            <span class="text-caption text-text-tertiary">圖片預覽</span>
            <v-avatar size="160" class="avatar-preview">
              <v-img :src="form.avatar || '/headshot.png'" :alt="form.username || '個人圖片預覽'" cover />
            </v-avatar>
          </div>
          <v-btn color="primary" :loading="loading" type="submit" prepend-icon="mdi-content-save-outline" block>
            確定修改
          </v-btn>
        </v-form>
      </v-card>
    </MotionReveal>
  </section>

  <v-dialog v-model="dialog" max-width="680" scrollable>
    <v-card color="surface" rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between ga-3">
        <span class="text-h6">使用者管理</span>
        <v-btn icon="mdi-close" variant="text" aria-label="關閉" @click="dialog = false" />
      </v-card-title>
      <v-card-text>
        <div v-if="usersLoading" class="text-center pa-4" role="status">
          <v-progress-circular indeterminate color="primary" size="24" /> 載入使用者資料中…
        </div>
        <p v-else-if="usersLoadError" class="text-body-2 text-error">無法取得使用者資料，請稍後再試。</p>
        <p v-else-if="!allUserData.length" class="text-body-2 text-text-tertiary">目前沒有其他使用者資料。</p>
        <div
          v-for="userItem in usersLoading || usersLoadError ? [] : allUserData"
          :key="userItem.id"
          class="d-flex align-center justify-space-between flex-wrap ga-3 pa-3 mb-2 border rounded-lg"
        >
          <span class="font-weight-bold account-name">{{ userItem.username }}</span>
          <v-btn
            :color="userItem.management ? 'primary' : 'secondary'"
            variant="tonal"
            size="small"
            :disabled="userItem.username === 'root'"
            @click="changeManagementStatus(userItem.id)"
          >
            {{ userItem.management ? "管理員" : "使用者" }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.account-name {
  min-width: 0;
  overflow-wrap: anywhere;
}

.avatar-preview {
  max-width: 100%;
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>
