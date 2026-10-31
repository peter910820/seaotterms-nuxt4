<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";

import type { CommonResponse, GetUserGameResponse, KuroHelperAPIOK } from "@/types/response";
import { isUserGameFinished } from "@/utils/userGameStatus";

const { data, error, pending } = await useFetch<KuroHelperAPIOK<GetUserGameResponse>, CommonResponse>(
  "/api/user/1/game",
  {
    lazy: true,
  },
);

const errorMessage = computed(() => {
  if (!error.value) return "";
  if (error.value.statusCode === 408 || error.value.statusCode === 504) {
    return "搜尋 Galgame 紀錄逾時，請稍後再試。";
  }

  return error.value.errMsg || "目前無法取得 Galgame 紀錄，請稍後再試。";
});

const sortedGameList = computed(() =>
  (data.value?.data?.games ?? [])
    .filter((game) => isUserGameFinished(game.status))
    .map((game) => ({
      gameErogsId: game.gameErogsId,
      completedAt: game.finishedDate ?? null,
      createdAt: game.createdAt,
      gameName: game.gameErogs?.name ?? "",
      brandName: game.gameErogs?.brandErogs?.name ?? "",
    }))
    .sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.createdAt).getTime();

      return bTime - aTime;
    }),
);

const total = computed(() => sortedGameList.value.length);

const formatDate = (date: string) => dayjs(date).format("YYYY-MM-DD");
</script>

<template>
  <section aria-labelledby="galgame-heading">
    <div class="d-flex align-baseline justify-space-between ga-3 mb-4 pb-3 border-b">
      <h1 id="galgame-heading" class="text-h6 font-weight-bold">Galgame 遊玩紀錄</h1>
      <span class="text-caption text-text-tertiary">GAME LOG</span>
    </div>

    <v-card color="surface" elevation="0" rounded="lg" class="border pa-5 mb-4">
      <div class="d-flex align-center ga-4">
        <v-avatar color="primary" variant="tonal" rounded="lg" size="48">
          <v-icon icon="mdi-gamepad-variant-outline" />
        </v-avatar>
        <div>
          <div class="text-caption text-text-tertiary">已完成遊戲</div>
          <div class="text-h5 font-weight-bold">
            {{ pending || error ? "—" : total }} <span class="text-body-2">款</span>
          </div>
        </div>
      </div>
    </v-card>

    <v-card v-if="pending" color="surface" elevation="0" rounded="lg" class="border pa-8 text-center" role="status">
      <v-progress-circular indeterminate color="primary" size="24" class="mr-2" />
      正在搜尋 Galgame 紀錄…
    </v-card>
    <v-alert v-else-if="error" type="error" variant="tonal" rounded="lg">{{ errorMessage }}</v-alert>
    <template v-else-if="sortedGameList.length">
      <MotionReveal v-for="game in sortedGameList" :key="game.gameErogsId">
        <v-card tag="article" color="surface" elevation="0" rounded="lg" class="border pa-5 mb-3">
          <div class="d-flex flex-wrap align-center justify-space-between ga-3">
            <div class="game-details">
              <div class="text-caption text-primary mb-1">{{ game.brandName || "品牌未提供" }}</div>
              <h2 class="text-subtitle-1 font-weight-bold game-title">{{ game.gameName || "未提供遊戲名稱" }}</h2>
              <div class="text-caption text-text-tertiary mt-2">
                <v-icon icon="mdi-calendar-check-outline" size="small" class="mr-1" />
                {{ game.completedAt ? "完成日期" : "建立日期" }}：{{ formatDate(game.completedAt || game.createdAt) }}
              </div>
            </div>
            <v-btn
              :href="`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/game.php?game=${game.gameErogsId}`"
              target="_blank"
              rel="noopener noreferrer"
              variant="tonal"
              color="primary"
              size="small"
              append-icon="mdi-open-in-new"
              :aria-label="`在批評空間查看 ${game.gameName || game.gameErogsId}`"
            >
              批評空間 #{{ game.gameErogsId }}
            </v-btn>
          </div>
        </v-card>
      </MotionReveal>
    </template>
    <v-card v-else color="surface" elevation="0" rounded="lg" class="border pa-8 text-center text-text-tertiary">
      目前沒有已完成的 Galgame 紀錄
    </v-card>
  </section>
</template>

<style lang="scss" scoped>
.game-details {
  min-width: 0;
}

.game-title {
  overflow-wrap: anywhere;
}
</style>
