import type { LoginRequest } from "@/types/request";
import type { CommonResponse } from "@/types/response";
import { errorHandler } from "@/utils/errorHandler";
import { messageStorage } from "@/utils/messageHandler";
import { userInfoHandler } from "@/utils/userInfoHandler";

export const useLogin = () => {
  const apiUrl = useRuntimeConfig().public.apiUrl;
  const loading = ref(false);

  const login = async (request: LoginRequest) => {
    if (loading.value) return false;

    loading.value = true;
    try {
      const response = await $fetch<CommonResponse>("auth/login", {
        baseURL: apiUrl,
        method: "POST",
        body: request,
        credentials: "include",
      });
      userInfoHandler(response.userInfo);
      messageStorage(response.statusCode, response.infoMsg);
      return true;
    } catch (error) {
      errorHandler(error);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return { login, loading };
};
