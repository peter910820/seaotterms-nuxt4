<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";

import type { CommonResponse, GetUserGameResponse, KuroHelperAPIOK } from "@/types/response";
import { isUserGameFinished } from "@/utils/userGameStatus";

const { data, error, pending } = await useFetch<KuroHelperAPIOK<GetUserGameResponse>, CommonResponse>("/api/user/1/game", {
  lazy: true,
});

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
  <v-container class="main-block">
    <h1 class="page-title mb-6">海獺的Galgame遊玩紀錄</h1>

    <v-card class="header-card mb-4" color="background">
      <v-card-text class="pa-4">
        <v-row align="center" class="galgame-header">
          <v-col cols="12" sm="5" class="font-weight-bold">ゲーム</v-col>
          <v-col cols="12" sm="3" class="text-center font-weight-bold">ブランド</v-col>
          <v-col cols="12" sm="2" class="text-center font-weight-bold">遊玩結束時間</v-col>
          <v-col cols="12" sm="2" class="text-center font-weight-bold">批評空間網址</v-col>
        </v-row>
        <v-row align="center" class="galgame-header">
          <v-col cols="12" sm="5"></v-col>
          <v-col cols="12" sm="3" class="text-center font-weight-bold">攻略總數: {{ total }}</v-col>
          <v-col cols="12" sm="2"></v-col>
          <v-col cols="12" sm="2"></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="pending" class="status-card" color="background">
      <v-card-text class="status-card__content">
        <v-progress-circular indeterminate color="primary" size="28"></v-progress-circular>
        <span>正在搜尋 Galgame 紀錄…</span>
      </v-card-text>
    </v-card>

    <v-card v-else-if="error" class="status-card status-card--error" color="background">
      <v-card-text class="status-card__content">{{ errorMessage }}</v-card-text>
    </v-card>

    <template v-else-if="sortedGameList.length">
      <MotionReveal v-for="game in sortedGameList" :key="game.gameErogsId">
        <v-card class="game-card mb-3 floatup-div" color="background">
          <v-card-text class="pa-3">
            <v-row align="center" no-gutters>
              <v-col cols="12" sm="5" class="game-name">{{ game.gameName }}</v-col>
              <v-col cols="12" sm="3" class="text-center">{{ game.brandName }}</v-col>
              <v-col cols="12" sm="2" class="text-center">
                {{
                  game.completedAt === null || game.completedAt === undefined
                    ? formatDate(game.createdAt)
                    : formatDate(game.completedAt)
                }}
              </v-col>
              <v-col cols="12" sm="2" class="text-center rainbow-text">
                <a
                  :href="`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/game.php?game=${game.gameErogsId}`"
                  target="_blank"
                  >{{ game.gameErogsId }}</a
                >
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </MotionReveal>
    </template>

    <v-card v-else class="status-card" color="background">
      <v-card-text class="status-card__content">目前沒有已完成的 Galgame 紀錄</v-card-text>
    </v-card>
  </v-container>
</template>

<style lang="scss" scoped>
.page-title {
  text-align: center;
}

.header-card {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
}

.status-card {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
}

.status-card__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 120px;
}

.status-card--error {
  border-color: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-error));
}

.galgame-header {
  font-size: 1.25rem;
  min-height: 60px;
}

.game-card {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.game-name {
  font-weight: bold;
  font-size: 1.125rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.rainbow-text a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .galgame-header {
    font-size: 1rem;
    min-height: 50px;
  }

  .game-name {
    font-size: 1rem;
  }
}
</style>
