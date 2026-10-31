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
  <v-dialog v-model="dialog" max-width="600px" @click:outside="dialog = false">
    <v-card class="login-card">
      <v-card-title class="login-title">
        <v-icon size="large" class="mr-3">mdi-login</v-icon>
        登入
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-8">
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="request.username"
            label="Username"
            prepend-inner-icon="mdi-account-circle"
            variant="outlined"
            required
            class="mb-4"
            density="comfortable"
            :rules="[(v) => !!v || '請輸入使用者名稱']"
          />

          <v-text-field
            v-model="request.password"
            label="Password"
            type="password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            required
            class="mb-2"
            density="comfortable"
            :rules="[(v) => !!v || '請輸入密碼']"
          />
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="dialog = false" class="mr-2">取消</v-btn>
        <v-btn color="info" variant="elevated" :loading="loading" @click="handleSubmit" size="large">
          登入
          <v-icon end>mdi-send</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.login-card {
  background-color: rgb(var(--v-theme-background));
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.login-title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-info));
  padding: 24px 32px;
}
</style>
