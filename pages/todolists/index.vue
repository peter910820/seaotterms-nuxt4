<script setup lang="ts">
definePageMeta({
  ssr: false,
  middleware: "require-auth",
});

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { errorHandler } from "@/utils/errorHandler";
import { messageStorage } from "@/utils/messageHandler";

import type { TodoCreateRequest } from "@/types/request";
import type { CommonResponse, TodoQueryResponse, TodoTopicQueryResponse } from "@/types/response";

const router = useRouter();
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

const todos = computed(() => todo.value);
const todoTopics = computed(() => todoTopic.value);

const todoTopicItems = computed(() => {
  return todoTopics.value.map((topic) => ({
    title: topic.topicName,
    value: `${topic.topicName}/${form.value.owner}`,
  }));
});

// Get todo topics
const { data: todoTopicsData, error: todoTopicsError } = await useFetch<CommonResponse<TodoTopicQueryResponse[]>>(
  `todo-topics/${user.value.username}`,
  {
    baseURL: useRuntimeConfig().public.apiUrl,
    credentials: "include",
  },
);

if (todoTopicsData.value) {
  todoTopicStore.set(todoTopicsData.value.data);
} else if (import.meta.client && todoTopicsError.value) {
  messageStorage();
  router.push("/message");
}

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
  if (deadlineDate.value) {
    form.value.deadline = new Date(deadlineDate.value);
  } else {
    form.value.deadline = null;
  }

  // Validate topic and title (must not be empty or only whitespace)
  const topicTrimmed = form.value.topic.trim();
  const titleTrimmed = form.value.title.trim();
  
  if (!topicTrimmed || topicTrimmed === "") {
    alert("請確保主題有正確填寫");
    return;
  }
  
  if (!titleTrimmed || titleTrimmed === "") {
    alert("請確保標題有正確填寫");
    return;
  }

  if (!confirm("確定新增?")) {
    return;
  }

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
  if (confirm(`確定調整狀態為${statusText}?`)) {
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
  if (confirm("確定刪除?")) {
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
  <v-container class="main-block">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1>待辦清單</h1>
    </div>

    <div class="hint mb-4">*按鈕切換狀態>> N: 未開始 P: 進行中 S: 擱置中 C: 已完成 D: 刪除</div>

    <MotionReveal>
      <v-card class="add-block mb-4">
        <v-card-text class="pa-4">
        <v-row align="start" no-gutters>
          <v-col cols="12" sm="2" class="mb-2 mb-sm-0 px-1">
            <v-select
              v-model="form.topic"
              :items="todoTopicItems"
              item-title="title"
              item-value="value"
              label="選擇主題"
              placeholder="選擇主題"
              prepend-inner-icon="mdi-folder"
              variant="outlined"
              density="compact"
              :rules="[(v) => (v && v.trim() !== '') || '此欄不能為空']"
              required
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="5" class="mb-2 mb-sm-0 px-1">
            <v-text-field
              v-model="form.title"
              label="標題"
              prepend-inner-icon="mdi-format-title"
              variant="outlined"
              density="compact"
              :rules="[(v) => (v && v.trim() !== '') || '此欄不能為空']"
              required
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="3" class="mb-2 mb-sm-0 px-1">
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
          <v-col cols="12" sm="2" class="text-center px-1">
            <v-btn
              color="primary"
              variant="elevated"
              :loading="loading"
              @click="handleSubmit"
              block
              class="button-submit"
            >
              新增
              <v-icon end>mdi-send</v-icon>
            </v-btn>
          </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </MotionReveal>

    <MotionReveal v-for="todo in todos" :key="todo.id">
      <v-card class="todo-card mb-3 floatup-div">
        <v-card-text class="d-flex align-center pa-3">
        <v-row no-gutters align="center">
          <!-- Title with deadline -->
          <v-col cols="8" sm="6" class="todo-title-wrapper">
            <div class="todo-title">
              <div class="todo-title-text">[{{ todo.topic }}]{{ todo.title }}</div>
              <div
                v-if="todo.deadline"
                :class="[
                  'todo-deadline-text',
                  {
                    'deadline-expired': getDeadlineStatus(todo.deadline) === 'expired',
                    'deadline-urgent': getDeadlineStatus(todo.deadline) === 'urgent',
                  },
                ]"
              >
                截止: {{ new Date(todo.deadline).toISOString().split("T")[0] }}
              </div>
            </div>
          </v-col>

          <!-- Status Buttons -->
          <v-col cols="2" sm="2" class="todo-button">
            <div class="d-flex gap-1">
              <v-btn
                :class="['button-status', todo.status == 0 ? 'background-n' : '']"
                size="small"
                variant="flat"
                @click="changeStatus(todo.id, 0)"
              >
                N
              </v-btn>
              <v-btn
                :class="['button-status', todo.status == 1 ? 'background-p' : '']"
                size="small"
                variant="flat"
                @click="changeStatus(todo.id, 1)"
              >
                P
              </v-btn>
              <v-btn
                :class="['button-status', todo.status == 2 ? 'background-s' : '']"
                size="small"
                variant="flat"
                @click="changeStatus(todo.id, 2)"
              >
                S
              </v-btn>
              <v-btn
                :class="['button-status', todo.status == 3 ? 'background-c' : '']"
                size="small"
                variant="flat"
                @click="changeStatus(todo.id, 3)"
              >
                C
              </v-btn>
              <v-btn class="button-status background-d" size="small" variant="flat" @click="deleteTodo(todo.id)">
                D
              </v-btn>
            </div>
          </v-col>

          <!-- Status Display -->
          <v-col cols="2" sm="4" class="todo-status text-right">
            <v-chip v-if="todo.status === 0" color="error" size="default" variant="flat">未開始</v-chip>
            <v-chip v-else-if="todo.status === 1" color="info" size="default" variant="flat">進行中</v-chip>
            <v-chip v-else-if="todo.status === 2" color="tagColor" size="default" variant="flat">擱置中</v-chip>
            <v-chip v-else-if="todo.status === 3" color="success" size="default" variant="flat">已完成</v-chip>
            <v-chip v-else size="default" variant="flat">?</v-chip>
          </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>
</template>

<style lang="scss" scoped>
.main-block {
  padding: 40px;
}

h1 {
  font-family: "Cubic_11_1.100_R", sans-serif;
  font-size: 2rem;
  font-weight: bold;
  color: rgb(var(--v-theme-tagColor));
}

.hint {
  color: rgb(var(--v-theme-error));
  font-size: 1rem;
}

.add-block {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
  background-color: rgb(var(--v-theme-background));

  :deep(.v-field__details) {
    min-height: 20px;
  }

  :deep(.v-messages) {
    min-height: 20px;
  }
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
}

.todo-title-wrapper {
  position: relative;
}

.todo-title {
  text-align: left;

  .todo-title-text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 24px;
    line-height: 1.2;
  }

  .todo-deadline-text {
    font-size: 0.75rem;
    color: rgb(var(--v-theme-text-olive));
    margin-top: 2px;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    &.deadline-urgent {
      color: rgb(var(--v-theme-text-red-rgb));
      font-weight: 600;
    }

    &.deadline-expired {
      color: #000000;
      font-weight: 600;
    }
  }
}

.todo-button {
  padding: 0;
  text-align: left;
  padding-right: 4px;

  .d-flex {
    gap: 2px;
  }
}

.todo-status {
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-left: 4px;

  :deep(.v-chip) {
    font-size: 1rem;
    height: 32px;
    padding: 0 12px;
  }
}

.button-status {
  min-width: 40px;
  width: 40px;
  height: 40px;
  padding: 0;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-button-inactive-start)) 0%,
    rgb(var(--v-theme-button-inactive-end)) 100%
  );

  &:hover {
    transform: scale(1.1);
  }
}

@media (max-width: 960px) {
  .button-status {
    min-width: 32px;
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
}

.background-n {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-status-n-start)) 0%,
    rgb(var(--v-theme-status-n-end)) 100%
  );
}

.background-p {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-status-p-start)) 0%,
    rgb(var(--v-theme-status-p-end)) 100%
  );
}

.background-s {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-status-s-start)) 0%,
    rgb(var(--v-theme-status-s-end)) 100%
  );
}

.background-c {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-status-c-start)) 0%,
    rgb(var(--v-theme-status-c-end)) 100%
  );
}

.background-d {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-status-d-start)) 0%,
    rgb(var(--v-theme-status-d-end)) 100%
  );

  &:hover {
    background: linear-gradient(
      135deg,
      rgb(var(--v-theme-status-d-hover-start)) 0%,
      rgb(var(--v-theme-status-d-hover-end)) 100%
    );
  }
}

:deep(.v-btn--variant-elevated.button-submit) {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

@media (max-width: 960px) {
  .todo-title .todo-title-text {
    font-size: 18px;
  }

  .todo-title .todo-deadline-text {
    font-size: 0.7rem;
  }

  .todo-status {
    padding-left: 2px;
  }

  .todo-status :deep(.v-chip) {
    font-size: 0.9rem;
    height: 28px;
    padding: 0 10px;
  }

  .todo-button {
    padding-right: 2px;
  }

  .todo-button .d-flex {
    gap: 2px;
  }
}

@media (max-width: 768px) {
  .todo-card {
    font-size: 18px;
  }

  .todo-title .todo-title-text {
    font-size: 16px;
  }

  .todo-title .todo-deadline-text {
    font-size: 0.65rem;
  }

  .todo-status {
    font-size: 14px;
    padding-left: 2px;
  }

  .todo-status :deep(.v-chip) {
    font-size: 0.8rem;
    height: 24px;
    padding: 0 8px;
  }

  .button-status {
    min-width: 28px;
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .todo-button {
    padding-right: 2px;
  }

  .todo-button .d-flex {
    gap: 1px;
  }

  .hint {
    font-size: 0.875rem;
  }
}
</style>
