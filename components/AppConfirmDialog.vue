<script setup lang="ts">
import { useAppConfirm } from "@/stores/useAppConfirm";

const { showConfirmDialog, confirmTitle, confirmMessage, confirmColor, closeConfirm } = useAppConfirm();
</script>

<template>
  <v-dialog v-model="showConfirmDialog" max-width="480" persistent>
    <v-card color="background">
      <v-card-title>{{ confirmTitle }}</v-card-title>
      <v-card-text>{{ confirmMessage }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeConfirm(false)">取消</v-btn>
        <v-btn :color="confirmColor" variant="elevated" @click="closeConfirm(true)">確定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
