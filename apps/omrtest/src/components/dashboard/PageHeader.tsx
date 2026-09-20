import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, backLabel, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel ?? "Back"}
          </Link>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
