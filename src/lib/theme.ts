export type ThemePreference = "light" | "dark";

const THEME_COOKIE_NAME = "flowlary-theme";

export function resolveThemePreference(value?: string | null): ThemePreference {
  if (value === "dark") {
    return "dark";
  }

  return "light";
}

export function getThemeCookieName() {
  return THEME_COOKIE_NAME;
}

export function buildThemeCookie(theme: ThemePreference) {
  return `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
