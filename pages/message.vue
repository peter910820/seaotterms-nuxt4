<script setup lang="ts">
import { messageGet } from "@/utils/messageHandler";

import type { MessageData } from "@/types/common";

let msg: MessageData | undefined = {
  statusCode: 0,
  content: "",
  errCode: "",
};

// Get message data
if (import.meta.client) {
  msg = messageGet();
}
</script>

<template>
  <v-container class="main-block">
    <MotionReveal>
      <v-card class="message-card floatup-div">
        <v-card-text class="center-content">
          <div v-if="msg">
            <div
              v-if="!msg.statusCode.toString().startsWith('2') && msg.statusCode !== 998 && msg.statusCode !== 999"
              class="msg-code"
            >
              {{ msg.statusCode }}
            </div>
            <div v-else-if="msg.statusCode === 998" class="msg-code">{{ msg.errCode }}</div>
            <div :class="msg.statusCode.toString().startsWith('2') ? 'success-hint' : 'msg-hint'">
              {{ msg.content }}
            </div>
            <div class="go-home-button">
              <v-btn color="primary" variant="elevated" size="large" to="/" class="button-submit">
                回到首頁
                <v-icon end>mdi-home</v-icon>
              </v-btn>
            </div>
          </div>
          <div v-else>
            <div class="msg-hint">Session遺失，請聯絡管理員</div>
            <div class="msg-hint">Session lost, please contact the administrator</div>
            <div class="go-home-button">
              <v-btn color="primary" variant="elevated" size="large" to="/" class="button-submit">
                回到首頁
                <v-icon end>mdi-home</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </MotionReveal>
  </v-container>
</template>

<style lang="scss" scoped>
.main-block {
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-card {
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 20px;
  background-color: rgb(var(--v-theme-background));
  max-height: 600px;
  min-height: 400px;
  width: 100%;
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  font-size: 30px;
  min-height: 400px;
  padding: 2rem;
}

.msg-code {
  font-size: 80px;
  color: rgb(var(--v-theme-error));
  font-weight: bold;
  margin-bottom: 1rem;
}

.msg-hint {
  font-size: 40px;
  margin-bottom: 20px;
  color: rgb(var(--v-theme-error));
}

.success-hint {
  font-size: 60px;
  margin-bottom: 20px;
  color: rgb(var(--v-theme-primary));
}

.go-home-button {
  margin-top: 30px;
}

.button-submit {
  font-family: "Cubic_11_1.100_R", sans-serif;
}

@media (max-width: 768px) {
  .msg-code {
    font-size: 60px;
  }

  .msg-hint {
    font-size: 30px;
  }

  .success-hint {
    font-size: 45px;
  }

  .center-content {
    font-size: 24px;
  }
}
</style>
