<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { userInfoHandler } from "@/utils/userInfoHandler";
import { messageStorage } from "@/utils/messageHandler";
import { errorHandler } from "@/utils/errorHandler";

import { useTodoTopicStore, useSystemTodoStore } from "@/stores/useTodoStore";

import type { CommonResponse, TodoTopicQueryResponse, SystemTodoQueryResponse } from "@/types/response";

const router = useRouter();
const todoTopicStore = useTodoTopicStore();
const systemTodoStore = useSystemTodoStore();
const filterText = ref<string>("");
const filterValue = ref<string>("");
const filterStatus = ref<string>("");

const { data, error } = await useFetch<CommonResponse<TodoTopicQueryResponse[]>, CommonResponse>(`todo-topics/system`, {
  baseURL: useRuntimeConfig().public.apiUrl,
});

const todoTopics = computed(() => (data.value?.data ?? []) as TodoTopicQueryResponse[]);
todoTopicStore.set(todoTopics.value);

const statusOptions = [
  { label: "未開始", value: "0" },
  { label: "進行中", value: "1" },
  { label: "擱置中", value: "2" },
  { label: "已完成", value: "3" },
];

const startFilter = async () => {
  try {
    const response = await $fetch<CommonResponse<SystemTodoQueryResponse[]>>(
      `system-todos?system_name=${filterValue.value}&status=${filterStatus.value}`,
      {
        baseURL: useRuntimeConfig().public.apiUrl,
        method: "GET",
        credentials: "include",
      },
    );
    userInfoHandler(response.userInfo);
    systemTodoStore.set(response.data);
  } catch (error) {
    errorHandler(error);
  }
};

if (import.meta.client && error.value) {
  if (error.value.statusCode === 500) {
    messageStorage(error.value.statusCode, error.value.errMsg);
    router.push("/message");
  } else {
    messageStorage();
    router.push("/message");
  }
}
</script>

<template>
  <!-- 嵌入其他頁面，所以不用寫main-block -->
  <MotionReveal>
    <v-card class="filter-block mb-4">
      <v-card-text class="pa-4">
        <v-row align="center" no-gutters>
        <v-col cols="12" sm="1" class="text-center text-sm-left mb-2 mb-sm-0">
          <span class="filter-label">篩選器</span>
        </v-col>
        <v-col cols="12" sm="3" class="mb-2 mb-sm-0 px-1">
          <v-text-field
            v-model="filterText"
            label="篩選文字"
            prepend-inner-icon="mdi-text-box"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="3" class="mb-2 mb-sm-0 px-1">
          <v-select
            v-model="filterValue"
            :items="todoTopics"
            item-title="topicName"
            item-value="topicName"
            label="站點篩選"
            placeholder="請選擇站點"
            prepend-inner-icon="mdi-office-building"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" sm="3" class="mb-2 mb-sm-0 px-1">
          <v-select
            v-model="filterStatus"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="狀態篩選"
            placeholder="選擇狀態"
            prepend-inner-icon="mdi-signal-cellular-3"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" sm="2" class="text-center px-1">
          <v-btn color="primary" variant="elevated" @click="startFilter" block>
            篩選
            <v-icon end>mdi-send</v-icon>
          </v-btn>
        </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </MotionReveal>
</template>

<style lang="scss" scoped>
.filter-block {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
  background-color: rgb(var(--v-theme-background));
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 16px var(--v-theme-shadow-medium);
  }
}

.filter-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-text-secondary));
}

:deep(.v-text-field),
:deep(.v-select) {
  font-size: 0.875rem;
}

:deep(.v-text-field .v-field),
:deep(.v-select .v-field) {
  min-height: 40px;
  height: 40px;
}

:deep(.v-text-field .v-field__input),
:deep(.v-select .v-field__input) {
  min-height: 40px;
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.v-text-field .v-field__field),
:deep(.v-select .v-field__field) {
  min-height: 40px;
}

:deep(.v-btn--variant-elevated) {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

@media (max-width: 600px) {
  .filter-block {
    :deep(.v-card-text) {
      padding: 16px;
    }
  }
}
</style>
