<script setup lang="ts">
import { messageGet } from "@/utils/messageHandler";
import type { MessageData } from "@/types/common";

const message = ref<MessageData>();
const isSuccess = computed(() => message.value?.statusCode.toString().startsWith("2") ?? false);
const displayCode = computed(() => {
  if (!message.value || isSuccess.value || message.value.statusCode === 999) return "";
  return message.value.statusCode === 998 ? message.value.errCode : String(message.value.statusCode);
});

onMounted(() => {
  message.value = messageGet();
});
</script>

<template>
  <section aria-labelledby="message-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="message-heading" class="text-h6 font-weight-bold">訊息</h1>
      <span class="text-caption text-text-tertiary">MESSAGE</span>
    </div>

    <ClientOnly>
      <v-card color="surface" elevation="0" rounded="lg" class="border pa-6 pa-sm-8">
        <div class="d-flex align-start flex-wrap ga-4">
          <v-avatar :color="isSuccess ? 'success' : 'error'" variant="tonal" rounded="lg" size="48">
            <v-icon :icon="isSuccess ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" />
          </v-avatar>
          <div class="message-content">
            <p class="text-overline" :class="isSuccess ? 'text-success' : 'text-error'">
              {{ isSuccess ? "操作完成" : "發生錯誤" }}
            </p>
            <h2 v-if="displayCode" class="text-h5 font-weight-bold mb-2">{{ displayCode }}</h2>
            <p class="text-body-1 text-text-secondary message-text">
              {{ message?.content || (message ? "目前沒有詳細訊息。" : "找不到訊息資料，請重新操作或聯絡管理員。") }}
            </p>
          </div>
        </div>
        <v-divider class="my-6" />
        <v-btn to="/" color="primary" variant="tonal" prepend-icon="mdi-home-outline">回到首頁</v-btn>
      </v-card>
      <template #fallback>
        <v-card color="surface" elevation="0" rounded="lg" class="border pa-8 text-center" role="status">
          正在載入訊息…
        </v-card>
      </template>
    </ClientOnly>
  </section>
</template>

<style lang="scss" scoped>
.message-content {
  min-width: 0;
  flex: 1 1 200px;
}

.message-text {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
