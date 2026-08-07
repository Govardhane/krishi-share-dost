import { useState } from "react";
import { EquipmentRow } from "@/lib/equipmentData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingDialog from "@/components/BookingDialog";
import { useLang } from "@/lib/i18n";
import { OwnerTrustRow } from "@/components/TrustSignals";
import {
  MapPin,
  IndianRupee,
  MessageCircle,
  Phone,
  MessageSquare,
  User,
  Package,
  Gauge,
  Star,
  Award,
  CalendarCheck,
} from "lucide-react";

import tractorImg from "@/assets/tractor.jpg";
import rotavatorImg from "@/assets/rotavator.jpg";
import harvesterImg from "@/assets/harvester.jpg";

const typeImages: Record<string, string> = {
  tractor: tractorImg,
  tractor_small: tractorImg,
  tractor_big: tractorImg,
  rotavator: rotavatorImg,
  harvester: harvesterImg,
};

const EquipmentCard = ({ equipment, rank }: { equipment: EquipmentRow; rank?: number }) => {
  const { t } = useLang();
  const classLabel: Record<string, string> = {
    small: t("card.classSmall"),
    big: t("card.classBig"),
  };
  const [bookingOpen, setBookingOpen] = useState(false);
  const image = equipment.image_url || typeImages[equipment.type] || tractorImg;
  const villageName = equipment.villages?.name || "";
  const talukaName = equipment.talukas?.name || "";
  const districtName = equipment.districts?.name || "";

  const phone = equipment.whatsapp.replace(/\D/g, "");
  const features = equipment.features || [];

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t("card.whatsappMsgBooking")
        .replace("{owner}", equipment.owner_name)
        .replace("{name}", equipment.name)
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:+${phone}`;
  };

  const handleSMS = () => {
    const message = encodeURIComponent(
      t("card.smsMsgBooking")
        .replace("{owner}", equipment.owner_name)
        .replace("{name}", equipment.name)
    );
    window.location.href = `sms:+${phone}?body=${message}`;
  };

  const isNew =
    Date.now() - new Date(equipment.created_at).getTime() < 1000 * 60 * 60 * 24 * 14;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${equipment.brand || ""} ${equipment.name} ${t("card.imgAlt")} ${villageName}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {rank === 0 && (
            <Badge className="gap-1 bg-secondary text-secondary-foreground">
              <Award className="h-3 w-3" /> {t("card.bestValue")}
            </Badge>
          )}
          {rank !== undefined && rank > 0 && rank < 3 && (
            <Badge variant="outline" className="gap-1 border-background/40 bg-background/80 text-foreground">
              <Award className="h-3 w-3" /> #{rank + 1} {t("card.topPick")}
            </Badge>
          )}
          {isNew && (
            <Badge variant="outline" className="border-background/40 bg-background/80 text-foreground">
              {t("card.newTag")}
            </Badge>
          )}
        </div>

        <Badge
          className={`absolute right-3 top-3 ${
            equipment.available
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {equipment.available ? t("card.available") : t("card.unavailable")}
        </Badge>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-primary-foreground">
          <div>
            <p className="font-display text-2xl font-bold leading-none drop-shadow">
              <IndianRupee className="inline h-4 w-4" />
              {equipment.price_per_day}
            </p>
            <p className="mt-0.5 text-[11px] opacity-90">{t("card.perDayLabel")}</p>
          </div>
          <span className="rounded-full bg-background/85 px-2 py-1 text-xs font-semibold text-foreground">
            <IndianRupee className="inline h-3 w-3" />
            {equipment.price_per_hour}
            {t("card.perHour")}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight text-card-foreground">
            {equipment.brand ? `${equipment.brand} ` : ""}
            {equipment.name}
          </h3>
          {equipment.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              {Number(equipment.rating).toFixed(1)}
              <span className="text-muted-foreground">({equipment.rating_count})</span>
            </span>
          )}
        </div>


        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {equipment.tractor_class && classLabel[equipment.tractor_class] && (
            <Badge variant="secondary" className="text-[11px]">
              {classLabel[equipment.tractor_class]}
            </Badge>
          )}
          {equipment.hp && (
            <Badge variant="outline" className="gap-1 text-[11px]">
              <Gauge className="h-3 w-3" />
              {equipment.hp} {t("card.hp")}
            </Badge>
          )}
          {equipment.model && (
            <Badge variant="outline" className="text-[11px]">
              {t("card.model")} {equipment.model}
            </Badge>
          )}
          {equipment.year_of_purchase && (
            <Badge variant="outline" className="text-[11px]">
              {equipment.year_of_purchase}
            </Badge>
          )}
          {equipment.condition && (
            <Badge variant="outline" className="text-[11px] capitalize">
              {equipment.condition}
            </Badge>
          )}
        </div>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{equipment.description}</p>

        {features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {features.slice(0, 4).map((f) => (
              <span key={f} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                {f}
              </span>
            ))}
            {features.length > 4 && (
              <span className="text-[11px] text-muted-foreground">+{features.length - 4} {t("card.more")}</span>
            )}
          </div>
        )}

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {villageName}
              {talukaName && `, ${talukaName}`}
              {districtName && `, ${districtName}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 shrink-0" />
            <span>{t("card.quantity")} {equipment.quantity}</span>
          </div>
        </div>

        <OwnerTrustRow equipment={equipment} />

        {equipment.payment_modes?.length > 0 && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t("card.payment")}{" "}
            {equipment.payment_modes
              .map((m) => (m === "advance_cash" ? t("card.payAdvanceCash") : m === "upi" ? t("card.payUpi") : t("card.payOnline")))
              .join(" · ")}
            {equipment.advance_percent > 0 && ` · ${equipment.advance_percent}% ${t("card.advance")}`}
          </p>
        )}

        <div className="mt-auto pt-4">
          <Button
            className="w-full"
            onClick={() => setBookingOpen(true)}
            disabled={!equipment.available}
          >
            <CalendarCheck className="h-4 w-4" />
            {t("card.bookNow")}
          </Button>

          <div className="mt-2 grid grid-cols-3 gap-2">
            <Button
              variant="whatsapp"
              size="sm"
              onClick={handleWhatsApp}
              disabled={!equipment.available}
              aria-label={t("card.whatsapp")}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">{t("card.whatsapp")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCall}
              disabled={!equipment.available}
              aria-label={t("card.call")}
            >
              <Phone className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">{t("card.call")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSMS}
              disabled={!equipment.available}
              aria-label={t("card.sms")}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">{t("card.sms")}</span>
            </Button>
          </div>
        </div>

      </div>

      <BookingDialog equipment={equipment} open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
};

export default EquipmentCard;
