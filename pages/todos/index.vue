<script setup lang="ts">
definePageMeta({
  ssr: false,
  middleware: "require-auth",
});

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { errorHandler } from "@/utils/errorHandler";
import { messageStorage } from "@/utils/messageHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";
import { useAppConfirm } from "@/stores/useAppConfirm";
import { useAppSnackbar } from "@/stores/useAppSnackbar";

import type { TodoCreateRequest, TodoTopicCreateRequest } from "@/types/request";
import type { CommonResponse, TodoQueryResponse, TodoTopicQueryResponse } from "@/types/response";

const router = useRouter();
const { confirm } = useAppConfirm();
const { openSnackbar } = useAppSnackbar();
const todoTopicStore = useTodoTopicStore();
const { todoTopic } = storeToRefs(todoTopicStore);
const todoStore = useTodoStore();
const { todo } = storeToRefs(todoStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const form = ref<TodoCreateRequest>({
  owner: user.value.username,
  topic: "",
  title: "",
  status: 0,
  deadline: null,
  createName: user.value.username,
  updateName: "",
});

const deadlineDate = ref<string>("");
const loading = ref(false);
const formRef = ref();
const topicRules = [(v: string) => !!v?.trim() || "請確保主題有正確填寫"];
const titleRules = [(v: string) => !!v?.trim() || "請確保標題有正確填寫"];
const topicNameRules = [(v: string) => !!v?.trim() || "標題不得為空"];
const createTopicModalVisible = ref(false);
const createTopicLoading = ref(false);
const createTopicFormRef = ref();
const createTopicForm = ref<TodoTopicCreateRequest>({
  topicName: "",
  topicOwner: user.value.username,
  updatedAt: new Date(),
  updateName: user.value.username,
});

const resetCreateTopicForm = () => {
  createTopicForm.value = {
    topicName: "",
    topicOwner: user.value.username,
    updatedAt: new Date(),
    updateName: user.value.username,
  };
};

const openCreateTopicModal = () => {
  resetCreateTopicForm();
  createTopicModalVisible.value = true;
};

const closeCreateTopicModal = () => {
  createTopicModalVisible.value = false;
  resetCreateTopicForm();
};

const handleCreateTopicSubmit = async () => {
  const { valid } = await createTopicFormRef.value.validate();
  if (!valid) return;

  createTopicLoading.value = true;
  try {
    const response = await $fetch<CommonResponse>("todo-topics", {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "POST",
      body: createTopicForm.value,
      credentials: "include",
    });
    userInfoHandler(response.userInfo);
    await refreshTopics();
    closeCreateTopicModal();
    openSnackbar("資料創建成功", "success");
  } catch (error) {
    errorHandler(error);
  } finally {
    createTopicLoading.value = false;
  }
};

const todos = computed(() => todo.value);
const todoTopics = computed(() => todoTopic.value);
const statuses = [
  { value: 0, label: "未開始", color: "error" },
  { value: 1, label: "進行中", color: "info" },
  { value: 2, label: "擱置中", color: "tagColor" },
  { value: 3, label: "已完成", color: "success" },
];

const todoTopicItems = computed(() => {
  return todoTopics.value.map((topic) => ({
    title: topic.topicName,
    value: `${topic.topicName}/${form.value.owner}`,
  }));
});

// Get todo topics
const {
  data: todoTopicsData,
  error: todoTopicsError,
  refresh: refreshTodoTopics,
} = await useFetch<CommonResponse<TodoTopicQueryResponse[]>>(`todo-topics/${user.value.username}`, {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

if (todoTopicsData.value) {
  todoTopicStore.set(todoTopicsData.value.data);
} else if (import.meta.client && todoTopicsError.value) {
  messageStorage();
  router.push("/message");
}

const refreshTopics = async () => {
  await refreshTodoTopics();
  if (todoTopicsData.value) todoTopicStore.set(todoTopicsData.value.data);
};

// Get todos
const { data: todosData, error: todosError } = await useFetch<CommonResponse<TodoQueryResponse[]>>(
  `todos/${user.value.username}`,
  {
    baseURL: useRuntimeConfig().public.apiUrl,
    credentials: "include",
  },
);

if (todosData.value) {
  todoStore.set(todosData.value.data);
} else if (import.meta.client && todosError.value) {
  messageStorage();
  router.push("/message");
}

// Check deadline status
const getDeadlineStatus = (deadline: Date | null | string) => {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineOnly = new Date(deadlineDate);
  deadlineOnly.setHours(0, 0, 0, 0);

  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);

  if (deadlineOnly < today) {
    return "expired";
  } else if (deadlineOnly <= threeDaysLater) {
    return "urgent";
  }
  return "normal";
};

// Create
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (deadlineDate.value) {
    form.value.deadline = new Date(deadlineDate.value);
  } else {
    form.value.deadline = null;
  }

  if (!(await confirm({ title: "確認新增", message: "確定新增?" }))) return;

  loading.value = true;
  try {
    const response = await $fetch<CommonResponse<TodoQueryResponse[]>>(`todos`, {
      baseURL: useRuntimeConfig().public.apiUrl,
      method: "POST",
      credentials: "include",
      body: form.value,
    });
    todoStore.set(response.data);
    // Reset form
    form.value.topic = "";
    form.value.title = "";
    deadlineDate.value = "";
    form.value.owner = user.value.username;
  } catch (error) {
    errorHandler(error);
  } finally {
    loading.value = false;
  }
};

// Update
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
      const response = await $fetch<CommonResponse<TodoQueryResponse[]>>(`todos/${id}`, {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "PATCH",
        credentials: "include",
        body: {
          status: status,
          updateName: user.value.username,
        },
      });
      todoStore.set(response.data);
    } catch (error) {
      errorHandler(error);
    }
  }
};

// Delete
const deleteTodo = async (id: number) => {
  if (await confirm({ title: "確認刪除", message: "確定刪除?", confirmColor: "error" })) {
    try {
      const response = await $fetch<CommonResponse<TodoQueryResponse[]>>(`todos/${id}`, {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "DELETE",
        credentials: "include",
      });
      todoStore.set(response.data);
    } catch (error) {
      errorHandler(error);
    }
  }
};
</script>

<template>
  <section aria-labelledby="todos-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="todos-heading" class="text-h6 font-weight-bold">待辦清單</h1>
      <span class="text-caption text-text-tertiary">TODO LIST</span>
    </div>

    <v-card color="surface" elevation="0" rounded="lg" class="border pa-5 mb-4">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <div>
          <h2 class="text-subtitle-1 font-weight-bold">新增待辦</h2>
          <p class="text-body-2 text-text-tertiary">選擇類別並填寫待辦事項。</p>
        </div>
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          prepend-icon="mdi-folder-plus-outline"
          @click="openCreateTopicModal"
        >
          建立 Todo 類別
        </v-btn>
      </div>
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-row dense>
          <v-col cols="12" sm="6" lg="3">
            <v-select
              v-model="form.topic"
              :items="todoTopicItems"
              item-title="title"
              item-value="value"
              label="選擇主題"
              prepend-inner-icon="mdi-folder-outline"
              variant="outlined"
              density="compact"
              :rules="topicRules"
              required
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="4">
            <v-text-field
              v-model="form.title"
              label="標題"
              prepend-inner-icon="mdi-format-title"
              variant="outlined"
              density="compact"
              :rules="titleRules"
              required
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-text-field
              v-model="deadlineDate"
              label="截止日期"
              type="date"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="6" lg="2">
            <v-btn color="primary" type="submit" :loading="loading" block prepend-icon="mdi-plus">新增</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <div class="d-flex align-center justify-space-between ga-3 mb-3">
      <h2 class="text-subtitle-1 font-weight-bold">我的待辦</h2>
      <span class="text-caption text-text-tertiary">共 {{ todos.length }} 項</span>
    </div>

    <v-card
      v-if="!todos.length"
      color="surface"
      elevation="0"
      rounded="lg"
      class="border pa-8 text-center text-text-tertiary"
    >
      目前沒有待辦事項，從上方新增第一項吧。
    </v-card>

    <MotionReveal v-for="todo in todos" :key="todo.id">
      <v-card tag="article" color="surface" elevation="0" rounded="lg" class="border pa-5 mb-3">
        <div class="d-flex align-start justify-space-between flex-wrap ga-3">
          <div class="todo-details">
            <div class="text-caption text-primary mb-1">{{ todo.topic }}</div>
            <h3 class="text-subtitle-1 font-weight-bold todo-title">{{ todo.title }}</h3>
            <div
              v-if="todo.deadline"
              class="text-caption mt-2"
              :class="getDeadlineStatus(todo.deadline) === 'normal' ? 'text-text-tertiary' : 'text-error'"
            >
              <v-icon icon="mdi-calendar-outline" size="small" class="mr-1" />
              截止：{{ new Date(todo.deadline).toISOString().split("T")[0] }}
              <span v-if="getDeadlineStatus(todo.deadline) === 'expired'">（已逾期）</span>
              <span v-else-if="getDeadlineStatus(todo.deadline) === 'urgent'">（即將到期）</span>
            </div>
          </div>
          <v-chip
            v-if="statuses.find((status) => status.value === todo.status)"
            :color="statuses.find((status) => status.value === todo.status)?.color"
            size="small"
            variant="tonal"
          >
            {{ statuses.find((status) => status.value === todo.status)?.label }}
          </v-chip>
          <v-chip v-else size="small" variant="tonal">未知狀態</v-chip>
        </div>
        <v-divider class="my-4" />
        <div class="d-flex align-center flex-wrap ga-2">
          <span class="text-caption text-text-tertiary mr-1">調整狀態</span>
          <v-btn
            v-for="status in statuses"
            :key="status.value"
            size="small"
            :color="status.color"
            :variant="todo.status === status.value ? 'tonal' : 'text'"
            :aria-pressed="todo.status === status.value"
            @click="changeStatus(todo.id, status.value)"
          >
            {{ status.label }}
          </v-btn>
          <v-spacer />
          <v-btn
            size="small"
            color="error"
            variant="text"
            prepend-icon="mdi-delete-outline"
            @click="deleteTodo(todo.id)"
            >刪除</v-btn
          >
        </div>
      </v-card>
    </MotionReveal>
  </section>

  <v-dialog v-model="createTopicModalVisible" max-width="600px">
    <v-card color="surface" rounded="lg">
      <v-card-title class="text-h6">建立 Todo 類別</v-card-title>
      <v-card-text>
        <v-form ref="createTopicFormRef" @submit.prevent="handleCreateTopicSubmit">
          <v-text-field
            v-model="createTopicForm.topicName"
            label="類別名稱"
            prepend-inner-icon="mdi-format-title"
            variant="outlined"
            required
            density="comfortable"
            :rules="topicNameRules"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeCreateTopicModal">取消</v-btn>
        <v-btn color="primary" variant="flat" :loading="createTopicLoading" @click="handleCreateTopicSubmit"
          >建立主題</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.todo-details {
  min-width: 0;
}

.todo-title {
  overflow-wrap: anywhere;
}
</style>
