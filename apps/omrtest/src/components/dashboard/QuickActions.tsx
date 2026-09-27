import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid, PlusCircle, ScanLine, Users } from "lucide-react";

interface QuickAction {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface QuickActionsProps {
  uploadHref: string | null;
  isOwner: boolean;
}

/** Plain server-rendered link cards — no client state, just a launchpad grid. */
export function QuickActions({ uploadHref, isOwner }: QuickActionsProps) {
  const actions: QuickAction[] = [
    { href: "/tests/new", icon: PlusCircle, label: "Generate OMR Sheets" },
    ...(uploadHref ? [{ href: uploadHref, icon: ScanLine, label: "Scan Batch" }] : []),
    ...(isOwner ? [{ href: "/control-room", icon: LayoutGrid, label: "Control Room" }] : []),
    ...(isOwner ? [{ href: "/faculty", icon: Users, label: "Manage Faculty" }] : []),
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.href + action.label}
          href={action.href}
          className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-indigo/30 hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo transition-colors group-hover:bg-brand-indigo group-hover:text-white">
            <action.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xs font-medium text-slate-700">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
