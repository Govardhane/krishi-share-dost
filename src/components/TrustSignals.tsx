import { EquipmentRow } from "@/lib/equipmentData";
import { useLang } from "@/lib/i18n";
import { BadgeCheck, ShieldCheck, MapPin, MessageCircle, Star, CalendarDays } from "lucide-react";

const chip =
  "flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground";

export const OwnerTrustRow = ({ equipment }: { equipment: EquipmentRow }) => {
  const { t, lang } = useLang();
  const initials = (equipment.owner_name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const hasPay = Boolean(equipment.upi_id || equipment.phonepe_number || equipment.payment_qr_url);
  const since = new Date(equipment.created_at).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mt-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
            {equipment.owner_name}
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label={t("trust.verifiedOwner")} />
          </p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {t("trust.memberSince").replace("{date}", since)}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className={chip}>
          <ShieldCheck className="h-3 w-3 text-primary" />
          {t("trust.phoneVerified")}
        </span>
        {hasPay && (
          <span className={chip}>
            <ShieldCheck className="h-3 w-3 text-primary" />
            {t("trust.upiReady")}
          </span>
        )}
        {equipment.talukas?.name && (
          <span className={chip}>
            <MapPin className="h-3 w-3 text-primary" />
            {t("trust.localOwner")}
          </span>
        )}
        <span className={chip}>
          <MessageCircle className="h-3 w-3 text-primary" />
          {t("trust.repliesWhatsApp")}
        </span>
        <span className={chip}>
          <Star className="h-3 w-3 text-primary" />
          {equipment.rating_count > 0
            ? t("trust.reviews").replace("{count}", String(equipment.rating_count))
            : t("trust.noReviews")}
        </span>
      </div>
    </div>
  );
};

export const TrustAssuranceBar = () => {
  const { t } = useLang();
  const items = [
    { icon: BadgeCheck, t: "trust.bar1.t", d: "trust.bar1.d" },
    { icon: ShieldCheck, t: "trust.bar2.t", d: "trust.bar2.d" },
    { icon: MapPin, t: "trust.bar3.t", d: "trust.bar3.d" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, t: title, d }) => (
        <div key={title} className="flex items-start gap-2.5 rounded-xl border bg-card p-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{t(title)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t(d)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SafetyTips = () => {
  const { t } = useLang();
  return (
    <div className="rounded-xl border bg-muted/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("trust.safetyTitle")}
      </p>
      <ul className="mt-1.5 space-y-1">
        {["trust.safety1", "trust.safety2", "trust.safety3"].map((k) => (
          <li key={k} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {t(k)}
          </li>
        ))}
      </ul>
    </div>
  );
};
