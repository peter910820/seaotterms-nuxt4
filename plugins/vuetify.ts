// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import { DEFAULT_THEME, THEME_COOKIE_NAME, isAppTheme, themeConfig, themeCookieOptions } from "@/themes/themeConfig";

export default defineNuxtPlugin((app) => {
  const themeCookie = useCookie<string>(THEME_COOKIE_NAME, themeCookieOptions);
  const initialTheme = isAppTheme(themeCookie.value) ? themeCookie.value : DEFAULT_THEME;

  if (themeCookie.value !== initialTheme) {
    themeCookie.value = initialTheme;
  }

  const vuetify = createVuetify({
    ssr: true,
    theme: {
      ...themeConfig,
      defaultTheme: initialTheme,
    },
  });
  app.vueApp.use(vuetify);
});
