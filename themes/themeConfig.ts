import type { VuetifyOptions } from "vuetify";
import { v2Theme } from "./v2Theme";
import { v1Theme } from "./v1Theme";
import { daylightTheme } from "./daylightTheme";
import { midnightTheme } from "./midnightTheme";

export type AppTheme = "v1-theme" | "v2-theme" | "daylight-theme" | "midnight-theme";

export const DEFAULT_THEME: AppTheme = "midnight-theme";
export const THEME_COOKIE_NAME = "blog-theme";

export const themes = {
  "v1-theme": v1Theme,
  "v2-theme": v2Theme,
  "daylight-theme": daylightTheme,
  "midnight-theme": midnightTheme,
};

export const themeLabels: Record<AppTheme, string> = {
  "v2-theme": "V2主題",
  "daylight-theme": "淺色主題",
  "midnight-theme": "深色主題",
  "v1-theme": "V1主題",
};

export const themeConfig: NonNullable<VuetifyOptions["theme"]> = {
  defaultTheme: DEFAULT_THEME,
  themes,
};

export const themeCookieOptions = {
  default: (): AppTheme => DEFAULT_THEME,
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax" as const,
};

export const isAppTheme = (value: unknown): value is AppTheme =>
  typeof value === "string" && Object.hasOwn(themes, value);
