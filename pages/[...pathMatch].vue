<template>
  <v-container fluid class="main-block">
    <MotionReveal hoverable>
      <v-card class="error-card">
        <v-card-text class="center-content">
          <div class="error-code">404</div>
          <div class="error-hint">Page Not Found</div>
          <div class="error-message">找不到該頁面！請確定網址輸入正確</div>
          <div class="go-home-button">
            <v-btn color="primary" variant="elevated" size="large" to="/" class="button-submit">
              回到首頁
              <v-icon end>mdi-home</v-icon>
            </v-btn>
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

  :deep(.motion-reveal) {
    width: 100%;
    max-width: 960px;
  }
}

.error-card {
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

.error-code {
  font-size: 100px;
  color: rgb(var(--v-theme-error));
  font-weight: bold;
  margin-bottom: 1rem;
}

.error-hint {
  font-size: 50px;
  margin-bottom: 20px;
  color: rgb(var(--v-theme-error));
  font-weight: bold;
}

.error-message {
  font-size: 24px;
  margin-bottom: 20px;
  color: rgb(var(--v-theme-on-surface));
}

.go-home-button {
  margin-top: 30px;
}

.button-submit {
  font-family: "Cubic_11_1.100_R", sans-serif;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-hint {
    font-size: 40px;
  }

  .error-message {
    font-size: 20px;
  }

  .center-content {
    font-size: 24px;
  }
}
</style>
