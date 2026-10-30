<script setup lang="ts">
import { computed, ref } from "vue";

import FilterBlock from "@/components/FilterBlock.vue";
import { userInfoHandler } from "@/utils/userInfoHandler";
import { useSystemTodoStore, useTodoTopicStore } from "@/stores/useTodoStore";
import { useAppConfirm } from "@/stores/useAppConfirm";
import { useAppSnackbar } from "@/stores/useAppSnackbar";
import type { TodoTopicCreateRequest } from "@/types/request";
import type { CommonResponse, SystemTodoQueryResponse, TodoTopicQueryResponse } from "@/types/response";

const router = useRouter();
const { confirm } = useAppConfirm();
const { openSnackbar } = useAppSnackbar();
const userStore = useUserStore();
const systemTodoStore = useSystemTodoStore();
const todoTopicStore = useTodoTopicStore();

const { user } = storeToRefs(userStore);
const { systemTodo, systemTodoSingle } = storeToRefs(systemTodoStore);

const modalVisible = ref(false);
const createSiteModalVisible = ref(false);
const createSiteLoading = ref(false);
const createSiteFormRef = ref();
const createSiteForm = ref<TodoTopicCreateRequest>({
  topicName: "",
  topicOwner: "system",
  updatedAt: new Date(),
  updateName: user.value.username,
});
const titleRules = [(v: string) => !!v?.trim() || "標題不得為空"];

const resetCreateSiteForm = () => {
  createSiteForm.value = {
    topicName: "",
    topicOwner: "system",
    updatedAt: new Date(),
    updateName: user.value.username,
  };
};

const openCreateSiteModal = () => {
  resetCreateSiteForm();
  createSiteModalVisible.value = true;
};

const closeCreateSiteModal = () => {
  createSiteModalVisible.value = false;
  resetCreateSiteForm();
};

const handleCreateSiteSubmit = async () => {
  const { valid } = await createSiteFormRef.value.validate();
  if (!valid) return;

  createSiteLoading.value = true;
  try {
    const response = await $fetch<CommonResponse>("todo-topics", {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "POST",
      body: createSiteForm.value,
      credentials: "include",
    });
    userInfoHandler(response.userInfo);
    try {
      const topics = await $fetch<CommonResponse<TodoTopicQueryResponse[]>>("todo-topics/system", {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "GET",
        credentials: "include",
      });
      userInfoHandler(topics.userInfo);
      todoTopicStore.set(topics.data ?? []);
      openSnackbar("資料創建成功", "success");
    } catch {
      openSnackbar("資料創建成功，但站台清單未更新", "warning");
    }
    closeCreateSiteModal();
  } catch (error) {
    errorHandler(error);
  } finally {
    createSiteLoading.value = false;
  }
};

const { data, error } = await useFetch<CommonResponse<SystemTodoQueryResponse[]>, CommonResponse>("system-todos", {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

systemTodoStore.set(data.value?.data ?? []);

const filterText = ref<string | null>("");
const filterSite = ref<string | null>(null);
const filterStatus = ref<string | null>(null);
const systemTodos = computed(() => {
  const query = (filterText.value ?? "").trim().toLocaleLowerCase();
  return systemTodo.value.filter((item) => {
    const matchesText =
      !query ||
      [item.title, item.systemName, item.detail].some((value) => (value ?? "").toLocaleLowerCase().includes(query));
    const matchesSite = !filterSite.value || item.systemName === filterSite.value;
    const matchesStatus =
      filterStatus.value == null || filterStatus.value === "" || String(item.status) === filterStatus.value;
    return matchesText && matchesSite && matchesStatus;
  });
});
const statuses = [
  { value: 0, label: "未開始", color: "error" },
  { value: 1, label: "進行中", color: "info" },
  { value: 2, label: "擱置中", color: "tagColor" },
  { value: 3, label: "已完成", color: "success" },
];

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
  if (await confirm({ title: "調整狀態", message: `確定調整狀態為${statusText}?` })) {
    try {
      await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos/quick/${id}`, {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "PATCH",
        credentials: "include",
        body: {
          status: status,
          updatedName: user.value.username,
        },
      });
      const detailResponse = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos?id=${id}`, {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "GET",
        credentials: "include",
      });
      systemTodoStore.setSingle(detailResponse.data);
      const response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos`, {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "GET",
        credentials: "include",
      });
      userInfoHandler(response.userInfo);
      systemTodoStore.set(response.data);
    } catch (error) {
      errorHandler(error);
    }
  }
};

const goToEditPage = async (id: number) => {
  router.push(`/system-todos/${id}/edit`);
  return;
};

const deleteTodo = async (id: number) => {
  if (await confirm({ title: "確認刪除", message: "確定刪除?", confirmColor: "error" })) {
    try {
      await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos/${id}`, {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "DELETE",
        credentials: "include",
      });
      const response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(`system-todos`, {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "GET",
        credentials: "include",
      });
      systemTodoStore.set(response.data);
      userInfoHandler(response.userInfo);
      closeModal();
    } catch (error) {
      errorHandler(error);
    }
  }
};
</script>

<template>
  <section aria-labelledby="system-todos-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="system-todos-heading" class="text-h6 font-weight-bold">系統更新待辦</h1>
      <span class="text-caption text-text-tertiary">SYSTEM UPDATES</span>
    </div>

    <div v-if="user?.management" class="d-flex flex-wrap ga-2 mb-4">
      <v-btn color="primary" variant="tonal" prepend-icon="mdi-folder-plus-outline" @click="openCreateSiteModal">
        建立系統站台
      </v-btn>
      <v-btn to="/system-todos/create" color="primary" prepend-icon="mdi-plus">新增待辦</v-btn>
    </div>

    <FilterBlock v-model:text="filterText" v-model:site="filterSite" v-model:status="filterStatus" />

    <div class="d-flex align-center justify-space-between ga-3 mb-3">
      <h2 class="text-subtitle-1 font-weight-bold">更新項目</h2>
      <span class="text-caption text-text-tertiary">共 {{ systemTodos.length }} 項</span>
    </div>

    <v-card
      v-if="!systemTodos.length"
      color="surface"
      elevation="0"
      rounded="lg"
      class="border pa-8 text-center text-text-tertiary"
    >
      目前沒有符合條件的更新待辦。
    </v-card>

    <MotionReveal v-for="systemTodo in systemTodos" :key="systemTodo.id">
      <v-card tag="article" color="surface" elevation="0" rounded="lg" class="border pa-5 mb-3">
        <div class="d-flex align-start justify-space-between flex-wrap ga-3">
          <div class="system-todo-details">
            <div class="text-caption text-primary mb-1">{{ systemTodo.systemName }}</div>
            <h3 class="text-subtitle-1 font-weight-bold system-todo-title">{{ systemTodo.title }}</h3>
            <div v-if="systemTodo.deadline" class="text-caption text-text-tertiary mt-2">
              <v-icon icon="mdi-calendar-outline" size="small" class="mr-1" />
              截止：{{ new Date(systemTodo.deadline).toISOString().slice(0, 10) }}
            </div>
          </div>
          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip v-if="systemTodo.urgency === 1" color="warning" size="small" variant="tonal">高優先度</v-chip>
            <v-chip v-else-if="systemTodo.urgency === 2" color="error" size="small" variant="tonal">緊急</v-chip>
            <v-chip
              v-if="statuses.find((status) => status.value === systemTodo.status)"
              :color="statuses.find((status) => status.value === systemTodo.status)?.color"
              size="small"
              variant="tonal"
            >
              {{ statuses.find((status) => status.value === systemTodo.status)?.label }}
            </v-chip>
            <v-chip v-else size="small" variant="tonal">未知狀態</v-chip>
          </div>
        </div>
        <v-divider class="my-4" />
        <div class="d-flex justify-end">
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            append-icon="mdi-arrow-right"
            @click="openModal(systemTodo.id)"
            >查看詳情</v-btn
          >
        </div>
      </v-card>
    </MotionReveal>
  </section>
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

  <v-dialog v-model="createSiteModalVisible" max-width="600px">
    <v-card class="modal-content">
      <v-card-title class="text-h5">建立系統站台</v-card-title>
      <v-card-text>
        <v-form ref="createSiteFormRef" @submit.prevent="handleCreateSiteSubmit">
          <v-text-field
            v-model="createSiteForm.topicName"
            label="Title"
            prepend-inner-icon="mdi-format-title"
            variant="outlined"
            required
            density="comfortable"
            :rules="titleRules"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeCreateSiteModal">取消</v-btn>
        <v-btn color="primary" variant="flat" :loading="createSiteLoading" @click="handleCreateSiteSubmit">
          建立系統站台
          <v-icon end>mdi-send</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.system-todo-details {
  min-width: 0;
}

.system-todo-title {
  overflow-wrap: anywhere;
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

@media (max-width: 960px) {
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
