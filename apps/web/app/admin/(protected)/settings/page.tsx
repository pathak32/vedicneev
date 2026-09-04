import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vedicneev/ui";
import { CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface ConfigRow {
  label: string;
  configured: boolean;
  note: string;
}

function buildConfigRows(): ConfigRow[] {
  const hasDatabase = Boolean(process.env.DATABASE_URL) && Boolean(process.env.DIRECT_URL);
  const hasAdminKey = Boolean(process.env.ADMIN_ACCESS_KEY);
  const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_ID) && Boolean(process.env.RAZORPAY_KEY_SECRET);
  const hasWhatsapp = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID) && Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const hasSupabasePublicConfig =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasSupabaseAuth = hasSupabasePublicConfig && hasServiceRoleKey;

  return [
    {
      label: "Database (Supabase Postgres)",
      configured: hasDatabase,
      note: hasDatabase ? "DATABASE_URL and DIRECT_URL are set." : "Required — see .env.example.",
    },
    {
      label: "Admin panel access key",
      configured: hasAdminKey,
      note: hasAdminKey ? "ADMIN_ACCESS_KEY is set — this page wouldn't be reachable otherwise." : "Not set.",
    },
    {
      label: "Razorpay payments",
      configured: hasRazorpay,
      note: hasRazorpay ? "Live keys configured." : "Unset — checkout runs in mock/demo mode.",
    },
    {
      label: "WhatsApp report delivery",
      configured: hasWhatsapp,
      note: hasWhatsapp ? "Live credentials configured." : "Unset — report sends are logged, not delivered.",
    },
    {
      label: "Supabase Auth (WhatsApp OTP + session bridge)",
      configured: hasSupabaseAuth,
      note: hasSupabaseAuth
        ? "Live — sign-in delivers real OTPs over WhatsApp and mints real Supabase sessions."
        : !hasSupabasePublicConfig && !hasServiceRoleKey
          ? "Not set — sign-in uses the mock OTP provider (always 123456)."
          : hasSupabasePublicConfig
            ? "NEXT_PUBLIC_SUPABASE_* set, but SUPABASE_SERVICE_ROLE_KEY is missing — still running mock sign-in."
            : "SUPABASE_SERVICE_ROLE_KEY set, but NEXT_PUBLIC_SUPABASE_* is missing — still running mock sign-in.",
    },
  ];
}

export default function AdminSettingsPage() {
  const rows = buildConfigRows();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground">
          Read-only configuration status, derived from server environment variables. No secret values are shown
          here — only whether each is set.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
          <CardDescription>To change any of these, update the deployment&apos;s environment variables and redeploy.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border pt-0">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.note}</p>
              </div>
              {row.configured ? (
                <Badge variant="secondary" className="shrink-0 gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="shrink-0 gap-1.5 text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5" />
                  Not set
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
