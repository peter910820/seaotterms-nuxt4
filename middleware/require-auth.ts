import { useAppSnackbar } from "@/stores/useAppSnackbar";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  if (user.value.id === 0) {
    const { openSnackbar } = useAppSnackbar();
    openSnackbar("使用者未登入", "warning");
    const { openLoginModal } = useLoginModal();
    openLoginModal();
    return navigateTo("/");
  }
});
