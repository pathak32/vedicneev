/**
 * This app's own convention (User.phone, the sign-in UI) is raw 10-digit
 * Indian mobile digits with no country code, e.g. "9876543210". Supabase
 * Auth stores `user.phone` as E.164 digits with no leading '+' (whatever
 * was passed to admin.createUser in apps/web/app/api/auth/whatsapp-otp/route.ts,
 * i.e. "919876543210") — these two convert between them.
 */
export function toAppPhone(supabasePhoneDigits: string): string {
  return supabasePhoneDigits.replace(/^91/, "");
}

export function toSupabasePhoneDigits(appPhone: string): string {
  return `91${appPhone}`;
}
