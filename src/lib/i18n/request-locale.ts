import { cookies, headers } from "next/headers";
import { localeStorageKey, type AppLocale, defaultLocale } from "@/lib/i18n/messages";

/**
 * Locale for SSR and the first client render — same rules as `RootLayout`
 * (`LocaleProvider.initialLocale`), so markup matches after hydration.
 */
export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(localeStorageKey)?.value;
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  const localeFromAccept = ((): AppLocale | undefined => {
    const h = acceptLanguage.toLowerCase();
    if (h.includes("zh")) return "zh-TW";
    const first = h.split(",")[0]?.trim().toLowerCase() ?? "";
    if (first.startsWith("en")) return "en";
    return undefined;
  })();
  const resolved: AppLocale | undefined =
    localeCookie === "en" || localeCookie === "zh-TW" ? localeCookie : localeFromAccept;
  return resolved ?? defaultLocale;
}
