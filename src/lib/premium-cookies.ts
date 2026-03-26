export const PREMIUM_COOKIE = "dsp_premium";
export const NOTION_OAUTH_COOKIE = "notion_oat";

export function baseCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
