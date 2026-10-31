import { useAppSnackbar } from "@/stores/useAppSnackbar";

export const useLogout = () => {
  const userStore = useUserStore();
  const { openSnackbar } = useAppSnackbar();
  const apiUrl = useRuntimeConfig().public.apiUrl;
  const loading = ref(false);

  const logout = async () => {
    if (loading.value) return false;

    loading.value = true;
    try {
      await $fetch("auth/logout", {
        baseURL: apiUrl,
        method: "POST",
        credentials: "include",
      });
      userStore.reset();
      await navigateTo("/");
      return true;
    } catch {
      openSnackbar("登出失敗，請稍後再試。", "error");
      return false;
    } finally {
      loading.value = false;
    }
  };

  return { logout, loading };
};
