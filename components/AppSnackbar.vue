<script setup lang="ts">
import { useAppSnackbar } from "@/stores/useAppSnackbar";

const { showSnackbar, snackbarMessage, snackbarColor, closeSnackbar } = useAppSnackbar();
</script>

<template>
  <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="top" :timeout="4000">
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn variant="text" @click="closeSnackbar">關閉</v-btn>
    </template>
  </v-snackbar>
</template>
