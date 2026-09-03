<script setup lang="ts">
import { computed, ref } from "vue";

import FilterBlock from "@/components/FilterBlock.vue";
import { userInfoHandler } from "@/utils/userInfoHandler";
import { useSystemTodoStore } from "@/stores/useTodoStore";
import type { CommonResponse, SystemTodoQueryResponse } from "@/types/response";

const router = useRouter();
const userStore = useUserStore();
const systemTodoStore = useSystemTodoStore();

const { user } = storeToRefs(userStore);
const { systemTodo, systemTodoSingle } = storeToRefs(systemTodoStore);

const modalVisible = ref(false);

const { data, error } = await useFetch<CommonResponse<SystemTodoQueryResponse[]>, CommonResponse>("system-todos", {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

systemTodoStore.set(data.value?.data as SystemTodoQueryResponse[]);

const systemTodos = computed(() => systemTodo.value);

if (import.meta.client && error.value) {
  if (error.value.statusCode === 500) {
    messageStorage(error.value.statusCode, error.value.errMsg);
    router.push("/message");
  } else {
    messageStorage();
    router.push("/message");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const openModal = async (id: number) => {
  // Refresh user data and check login status
  // refreshUserData();

  try {
    const response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos?id=${id}`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "GET",
      credentials: "include",
    });
    userInfoHandler(response.userInfo);
    systemTodoStore.setSingle(response.data);
  } catch (error) {
    errorHandler(error);
  }
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const changeStatus = async (id: number, status: number) => {
  let statusText = "";
  switch (status) {
    case 0:
      statusText = "未開始";
      break;
    case 1:
      statusText = "進行中";
      break;
    case 2:
      statusText = "擱置中";
      break;
    case 3:
      statusText = "已完成";
      break;
  }
  if (confirm(`確定調整狀態為${statusText}?`)) {
    await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos/quick/${id}`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "PATCH",
      credentials: "include",
      body: {
        status: status,
        updatedName: user.value.username,
      },
    });
    let response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos?id=${id}`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "GET",
    });
    systemTodoStore.setSingle(response.data);
    response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "GET",
      credentials: "include",
    });
    userInfoHandler(response.userInfo);
    systemTodoStore.set(response.data);
  }
};

const goToEditPage = async (id: number) => {
  router.push(`/system-todos/${id}/edit`);
  return;
};

const deleteTodo = async (id: number) => {
  if (confirm("確定刪除?")) {
    // 原本沒處理錯誤，之後再調整
    await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos/${id}`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "DELETE",
      credentials: "include",
    });
    let response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos?id=${id}`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "GET",
      credentials: "include",
    });
    systemTodoStore.setSingle(response.data);
    response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "GET",
      credentials: "include",
    });

    systemTodoStore.set(response.data);
  }
};
</script>

<template>
  <v-container class="main-block">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1>系統更新待辦</h1>
      <v-btn v-if="user?.management === true" :to="'/system-todos/create'" class="button-simple" variant="flat">
        點我新增
      </v-btn>
    </div>

    <FilterBlock />

    <MotionReveal
      v-for="systemTodo in systemTodos"
      :key="systemTodo.id"
    >
      <v-card
        class="todo-card mb-3 floatup-div"
        :class="{
          'urgency-high': systemTodo.urgency === 1,
          'urgency-urgent': systemTodo.urgency === 2,
        }"
      >
        <v-card-text class="pa-3">
          <v-row no-gutters align="center" class="todo-row">
          <!-- Title -->
          <v-col cols="6" class="todo-title"> [{{ systemTodo.systemName }}]{{ systemTodo.title }} </v-col>

          <!-- Deadline -->
          <v-col cols="3" class="todo-date text-center">
            <span v-if="systemTodo.deadline">{{ new Date(systemTodo.deadline).toISOString().slice(0, 10) }}</span>
          </v-col>

          <!-- Status -->
          <v-col cols="2" class="todo-status text-right">
            <v-chip v-if="systemTodo.status === 0" color="error" size="small" variant="flat"> 未開始 </v-chip>
            <v-chip v-else-if="systemTodo.status === 1" color="info" size="small" variant="flat"> 進行中 </v-chip>
            <v-chip v-else-if="systemTodo.status === 2" color="tagColor" size="small" variant="flat"> 擱置中 </v-chip>
            <v-chip v-else-if="systemTodo.status === 3" color="success" size="small" variant="flat"> 已完成 </v-chip>
            <v-chip v-else size="small" variant="flat">?</v-chip>
          </v-col>

          <!-- Open Modal Button -->
          <v-col cols="1" class="text-center button-col">
            <v-btn class="button-open-modal" size="small" variant="flat" @click="openModal(systemTodo.id)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>

  <!-- Vuetify Dialog -->
  <v-dialog v-model="modalVisible" max-width="75vw" scrollable>
    <v-card v-if="systemTodoSingle !== null" class="modal-content">
      <v-card-title class="text-h5">詳細資料</v-card-title>
      <v-card-text>
        <div class="mb-4">
          <h5 class="mb-2">備註</h5>
          <div class="modal-content-text">{{ systemTodoSingle.detail }}</div>
        </div>

        <div class="mb-4">
          <h5 class="mb-2">優先級</h5>
          <div class="modal-content-text" v-if="systemTodoSingle.urgency === 0">普通</div>
          <div class="modal-content-text orange-text" v-else-if="systemTodoSingle.urgency === 1">高優先度</div>
          <div class="modal-content-text red-text" v-else-if="systemTodoSingle.urgency === 2">緊急</div>
          <div class="modal-content-text" v-else>?</div>
        </div>

        <div v-if="user?.management">
          <h5 class="mb-2">管理員操作介面</h5>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              :class="['button-action', 'ma-1', systemTodoSingle.status == 0 ? 'button-active-n' : 'button-inactive']"
              size="default"
              variant="flat"
              @click="changeStatus(systemTodoSingle.id, 0)"
            >
              未開始
            </v-btn>
            <v-btn
              :class="['button-action', 'ma-1', systemTodoSingle.status == 1 ? 'button-active-p' : 'button-inactive']"
              size="default"
              variant="flat"
              @click="changeStatus(systemTodoSingle.id, 1)"
            >
              進行中
            </v-btn>
            <v-btn
              :class="['button-action', 'ma-1', systemTodoSingle.status == 2 ? 'button-active-s' : 'button-inactive']"
              size="default"
              variant="flat"
              @click="changeStatus(systemTodoSingle.id, 2)"
            >
              擱置中
            </v-btn>
            <v-btn
              :class="['button-action', 'ma-1', systemTodoSingle.status == 3 ? 'button-active-c' : 'button-inactive']"
              size="default"
              variant="flat"
              @click="changeStatus(systemTodoSingle.id, 3)"
            >
              已完成
            </v-btn>
            <v-btn
              class="button-action button-edit ma-1"
              size="default"
              variant="flat"
              prepend-icon="mdi-pencil"
              @click="goToEditPage(systemTodoSingle.id)"
            >
              編輯
            </v-btn>
            <v-btn
              class="button-action button-delete ma-1"
              size="default"
              variant="flat"
              prepend-icon="mdi-delete"
              @click="deleteTodo(systemTodoSingle.id)"
            >
              刪除
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="flat" @click="closeModal">關閉</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else class="modal-content">
      <v-card-text>
        <div class="text-error">查無資料，請聯繫管理員</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="flat" @click="closeModal">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.main-block {
  padding: 40px;
}

.todo-card {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
  background-color: rgb(var(--v-theme-background));
  font-size: 24px;
  min-height: 100px;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 16px var(--v-theme-shadow-medium);
  }

  &.urgency-high {
    .todo-title {
      color: rgb(var(--v-theme-text-orange-rgb));
    }
  }

  &.urgency-urgent {
    .todo-title {
      color: rgb(var(--v-theme-text-red-rgb));
    }
  }
}

.todo-row {
  :deep(.v-col) {
    flex-shrink: 0;
  }
}

.todo-title {
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: 500;
  font-size: 24px;
  min-width: 0;
}

.todo-date {
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: rgb(var(--v-theme-text-olive));
  font-size: 24px;
}

.todo-status {
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: visible;
  font-size: 24px;

  :deep(.v-chip) {
    font-size: 18px;
    height: auto;
    padding: 6px 12px;
  }
}

.modal-content {
  max-height: 75vh;
  background: rgb(var(--v-theme-background));
}

.modal-content-text {
  font-size: 1.6rem;
  line-height: 1.8;
  word-wrap: break-word;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

@media (max-width: 960px) {
  h1 {
    font-size: 1.75rem;
  }

  .todo-title,
  .todo-date,
  .todo-status {
    font-size: 20px;
  }

  .todo-status :deep(.v-chip) {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
  }

  .todo-title,
  .todo-date,
  .todo-status {
    font-size: 18px;
  }

  .todo-status :deep(.v-chip) {
    font-size: 14px;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 1.25rem;
  }

  .todo-title,
  .todo-date,
  .todo-status {
    font-size: 16px;
  }

  .todo-status :deep(.v-chip) {
    font-size: 12px;
  }
}

h5 {
  color: rgb(var(--v-theme-text-blue));
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.orange-text {
  color: rgb(var(--v-theme-text-orange-rgb));
}

.red-text {
  color: rgb(var(--v-theme-text-red-rgb));
}

.background-n {
  background: linear-gradient(to bottom right, rgb(var(--v-theme-status-n-start)), rgb(var(--v-theme-status-n-end)));
  color: white;
}

.background-p {
  background: linear-gradient(to bottom right, rgb(var(--v-theme-status-p-start)), rgb(var(--v-theme-status-p-end)));
  color: white;
}

.background-s {
  background: linear-gradient(to bottom right, rgb(var(--v-theme-status-s-start)), rgb(var(--v-theme-status-s-end)));
  color: white;
}

.background-c {
  background: linear-gradient(to bottom right, rgb(var(--v-theme-status-c-start)), rgb(var(--v-theme-status-c-end)));
  color: white;
}

.background-e {
  background: linear-gradient(to bottom right, rgb(var(--v-theme-status-e-start)), rgb(var(--v-theme-status-e-end)));
  color: white;
}

.background-d {
  background: linear-gradient(to bottom right, rgb(var(--v-theme-status-d-start)), rgb(var(--v-theme-status-d-end)));
  color: white;
}

/* Open Modal Button (+ button) */
.button-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-open-modal {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-info)) 100%);
  color: white;
  border-radius: 50%;
  min-width: 40px;
  width: 40px;
  height: 40px;
  padding: 0;
  box-shadow: 0 4px 12px var(--v-theme-shadow-medium);
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 6px 16px var(--v-theme-shadow-dark);
  }

  &:active {
    transform: scale(0.95);
  }

  :deep(.v-icon) {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .button-open-modal {
    min-width: 36px;
    width: 36px;
    height: 36px;

    :deep(.v-icon) {
      font-size: 20px;
    }
  }
}

/* Dialog Action Buttons */
.button-action {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--v-theme-shadow-light);
  min-width: 100px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--v-theme-shadow-dark);
  }

  &:active {
    transform: translateY(0);
  }
}

.button-inactive {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-button-inactive-start)) 0%,
    rgb(var(--v-theme-button-inactive-end)) 100%
  );
  color: rgb(var(--v-theme-button-inactive-text));
  border: 2px solid transparent;

  &:hover {
    background: linear-gradient(
      135deg,
      rgb(var(--v-theme-button-inactive-hover-start)) 0%,
      rgb(var(--v-theme-button-inactive-hover-end)) 100%
    );
    color: rgb(var(--v-theme-button-inactive-hover-text));
  }
}

.button-active-n {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-button-active-n-start)) 0%,
    rgb(var(--v-theme-button-active-n-end)) 100%
  );
  color: white;
  border: 2px solid transparent;
}

.button-active-p {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-button-active-p-start)) 0%,
    rgb(var(--v-theme-button-active-p-end)) 100%
  );
  color: white;
  border: 2px solid transparent;
}

.button-active-s {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-button-active-s-start)) 0%,
    rgb(var(--v-theme-button-active-s-end)) 100%
  );
  color: white;
  border: 2px solid transparent;
}

.button-active-c {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-button-active-c-start)) 0%,
    rgb(var(--v-theme-button-active-c-end)) 100%
  );
  color: white;
  border: 2px solid transparent;
}

.button-edit {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-button-active-e-start)) 0%,
    rgb(var(--v-theme-button-active-e-end)) 100%
  );
  color: white;
  border: 2px solid transparent;
}

.button-delete {
  background: linear-gradient(135deg, rgb(var(--v-theme-status-d-start)) 0%, rgb(var(--v-theme-status-d-end)) 100%);
  color: white;
  border: 2px solid transparent;

  &:hover {
    background: linear-gradient(
      135deg,
      rgb(var(--v-theme-status-d-hover-start)) 0%,
      rgb(var(--v-theme-status-d-hover-end)) 100%
    );
  }
}
</style>
