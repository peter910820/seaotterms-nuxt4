<script setup lang="ts">
import { useLogin } from "@/composables/useLogin";
import type { LoginRequest } from "@/types/request";

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const router = useRouter();
const { login, loading } = useLogin();

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const request = ref<LoginRequest>({
  username: "",
  password: "",
});

const handleSubmit = async () => {
  if (!request.value.username || !request.value.password) {
    return;
  }

  if (await login(request.value)) {
    dialog.value = false;
    router.push("/message");
  }
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="460" aria-labelledby="login-title">
    <v-card color="surface" rounded="xl" class="login-card">
      <div class="login-accent" aria-hidden="true"></div>
      <div class="login-content pa-6 pa-sm-8">
        <div class="d-flex align-start justify-space-between ga-4 mb-6">
          <v-avatar color="primary" variant="tonal" rounded="lg" size="48">
            <v-icon icon="mdi-account-outline" size="26" />
          </v-avatar>
          <v-btn icon="mdi-close" variant="text" size="small" aria-label="關閉登入視窗" @click="dialog = false" />
        </div>

        <div class="mb-6">
          <p class="text-overline text-primary font-weight-bold login-eyebrow">SEAOTTERMS / ACCOUNT</p>
          <h2 id="login-title" class="text-body-2 text-text-secondary">歡迎回來</h2>
        </div>

        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="request.username"
            label="使用者名稱"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            autocomplete="username"
            required
            class="mb-3"
            density="comfortable"
            hide-details="auto"
            :rules="[(v) => !!v || '請輸入使用者名稱']"
          />

          <v-text-field
            v-model="request.password"
            label="密碼"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            autocomplete="current-password"
            required
            class="mb-6"
            density="comfortable"
            hide-details="auto"
            :rules="[(v) => !!v || '請輸入密碼']"
          />
          <v-btn color="primary" variant="flat" rounded="lg" size="large" :loading="loading" type="submit" block>
            登入
            <v-icon end icon="mdi-arrow-right" />
          </v-btn>
        </v-form>
      </div>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.login-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-border));
}

.login-accent {
  position: absolute;
  inset: 0 0 auto;
  height: 120px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), transparent 75%);
  pointer-events: none;
}

.login-content {
  position: relative;
}

.login-eyebrow {
  letter-spacing: 0.1em !important;
}
</style>
