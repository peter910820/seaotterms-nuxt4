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

import type { CommonResponse, UserQueryResponse } from "@/types/response";
import type { UserUpdateRequest } from "@/types/request";

const router = useRouter();
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

const changeStatus = async () => {
  try {
    const response = await $fetch<CommonResponse<UserQueryResponse[]>>(`users`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "GET",
      credentials: "include",
    });
    allUserData.value = (response.data as UserQueryResponse[]).filter((val) => val.username !== user.value.username);
    userInfoHandler(response.userInfo);
  } catch (error) {
    console.log(error);
    errorHandler(error);
  }
};

const loading = ref(false);

const handleSubmit = async () => {
  if (loading.value) {
    return;
  }

  if (form.value.avatar.trim() === "") {
    alert("個人圖片URL不得為空");
    return;
  }

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
  if (confirm("確定修改權限?")) {
    const myUser = allUserData.value.find((item) => item.id === userId);
    if (myUser) {
      try {
        myUser.management = !myUser.management;
        myUser.updateName = user.value.update_name;
        const response = await $fetch<CommonResponse<UserQueryResponse[]>>(`users/${userId}`, {
          baseURL: useRuntimeConfig().public.apiUrl,
          method: "PATCH",
          body: myUser,
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
  <v-container class="main-block">
    <h1 class="page-title mb-6">使用者帳號維護</h1>
    <MotionReveal>
      <v-card class="form-card" color="background">
      <v-card-text class="pa-8">
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <div class="user-info">
              <v-icon class="mr-2">mdi-account</v-icon>
              <span class="label">使用者名稱:</span>
              <span class="value">{{ form.username }}</span>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="user-info">
              <v-icon class="mr-2">mdi-shield-account</v-icon>
              <span class="label">身分:</span>
              <v-chip v-if="form.management" color="primary" size="small" variant="flat" class="ml-2"> 管理員 </v-chip>
              <v-chip v-else color="secondary" size="small" variant="flat" class="ml-2">一般用戶</v-chip>
              <v-btn
                v-if="form.management"
                class="button-management ml-4"
                variant="flat"
                @click="
                  () => {
                    changeStatus();
                    dialog = true;
                  }
                "
              >
                變更使用者權限
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.avatar"
            label="個人圖片URL"
            prepend-inner-icon="mdi-image"
            variant="outlined"
            required
            class="mb-4"
            density="comfortable"
            :rules="[(v) => !!v || '此欄不能為空']"
          />

          <div class="text-center mb-4">
            <div class="preview-label mb-2">
              <v-icon class="mr-2">mdi-eye</v-icon>
              圖片預覽
            </div>
            <div class="headShot">
              <img :src="form.avatar" :alt="form.username" />
            </div>
          </div>

          <v-btn color="primary" variant="elevated" size="large" :loading="loading" type="submit" block>
            確定修改
            <v-icon end>mdi-send</v-icon>
          </v-btn>
        </v-form>
      </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>

  <!-- Dialog -->
  <v-dialog v-model="dialog" max-width="90vw" scrollable @click:outside="dialog = false">
    <v-card class="modal-content" color="background">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5 modal-title">使用者管理</span>
        <v-btn color="primary" variant="flat" @click="dialog = false">關閉</v-btn>
      </v-card-title>

      <v-card-text>
        <v-row class="mb-2 text-h6">
          <v-col cols="6">使用者名稱</v-col>
          <v-col cols="6" class="text-right">權限</v-col>
        </v-row>

        <v-row v-for="userItem in allUserData" :key="userItem.id" class="user-content mb-2">
          <v-col cols="6" class="d-flex align-center">
            <span class="text-h6 font-weight-bold">{{ userItem.username }}</span>
          </v-col>
          <v-col cols="6" class="d-flex align-center justify-end">
            <v-btn
              class="button-simple"
              variant="flat"
              @click="changeManagementStatus(userItem.id)"
              :disabled="userItem.username === 'root'"
            >
              {{ userItem.management ? "管理員" : "使用者" }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>

.user-info {
  display: flex;
  align-items: center;
  font-size: 1.125rem;

  .label {
    font-weight: 600;
    margin-right: 8px;
  }

  .value {
    color: rgb(var(--v-theme-tagColor));
    font-weight: 500;
  }
}

.preview-label {
  font-weight: 600;
  color: rgb(var(--v-theme-tagColor));
  display: flex;
  align-items: center;
  justify-content: center;
}

.headShot {
  margin: 0 auto;
  max-height: 200px;
  max-width: 200px;
  height: 200px;
  width: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgb(var(--v-theme-primary));
  border-radius: 100%;
  background-color: rgb(var(--v-theme-surface));

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.modal-content {
  max-height: 75vh;
}

.modal-title {
  font-weight: bold;
}

.user-content {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
  padding: 8px 0;
  background-color: rgb(var(--v-theme-background));
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  .user-info {
    font-size: 1rem;
    flex-wrap: wrap;

    .button-management {
      margin-top: 8px;
      width: 100%;
    }
  }

  .headShot {
    max-height: 150px;
    max-width: 150px;
    height: 150px;
    width: 150px;
  }
}
</style>
