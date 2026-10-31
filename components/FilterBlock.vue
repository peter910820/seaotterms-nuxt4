<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { messageStorage } from "@/utils/messageHandler";

import { useTodoTopicStore } from "@/stores/useTodoStore";

import type { CommonResponse, TodoTopicQueryResponse } from "@/types/response";

const router = useRouter();
const todoTopicStore = useTodoTopicStore();
const filterText = defineModel<string | null>("text", { default: "" });
const filterValue = defineModel<string | null>("site", { default: null });
const filterStatus = defineModel<string | null>("status", { default: null });

const { data, error } = await useFetch<CommonResponse<TodoTopicQueryResponse[]>, CommonResponse>(`todo-topics/system`, {
  baseURL: useRuntimeConfig().public.apiUrl,
  credentials: "include",
});

const { todoTopic: todoTopics } = storeToRefs(todoTopicStore);
todoTopicStore.set((data.value?.data ?? []) as TodoTopicQueryResponse[]);

const statusOptions = [
  { label: "未開始", value: "0" },
  { label: "進行中", value: "1" },
  { label: "擱置中", value: "2" },
  { label: "已完成", value: "3" },
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
</script>

<template>
  <MotionReveal>
    <v-card class="filter-block mb-4">
      <v-card-text class="pa-4">
        <v-row align="center" no-gutters>
          <v-col cols="12" class="mb-3">
            <span class="filter-label">篩選器</span>
          </v-col>
          <v-col cols="12" md="4" class="mb-2 mb-md-0 px-1">
            <v-text-field
              v-model="filterText"
              label="搜尋標題、站台或備註"
              prepend-inner-icon="mdi-text-box"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" class="mb-2 mb-md-0 px-1">
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
          <v-col cols="12" sm="6" md="4" class="mb-2 mb-md-0 px-1">
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
        </v-row>
      </v-card-text>
    </v-card>
  </MotionReveal>
</template>

<style lang="scss" scoped>
.filter-block {
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 12px;
  background-color: rgb(var(--v-theme-surface));
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

@media (max-width: 600px) {
  .filter-block {
    :deep(.v-card-text) {
      padding: 16px;
    }
  }
}
</style>
