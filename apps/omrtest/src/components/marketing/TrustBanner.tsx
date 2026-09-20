import { Building2, ShieldCheck, Smartphone, Users } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: Building2,
    label: "Per-branch data isolation",
    detail: "Every campus sees only its own batches, staff, and results.",
  },
  {
    icon: Smartphone,
    label: "WhatsApp-native, zero new apps",
    detail: "Parents get scorecards where they already are — no install, no login.",
  },
  {
    icon: ShieldCheck,
    label: "Built for India's toughest entrance exams",
    detail: "OMR layouts tuned for JNVST, AISSEE, and RMS answer sheets out of the box.",
  },
  {
    icon: Users,
    label: "Support during exam season",
    detail: "A team that understands batch-day pressure, not a ticket queue.",
  },
];

export function TrustBanner() {
  return (
    <section className="border-b border-slate-200 bg-white py-12">
      <div className="container">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Why residential coaching academies choose VedicNeev
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
