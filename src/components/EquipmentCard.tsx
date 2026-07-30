import { useState } from "react";
import { EquipmentRow } from "@/lib/equipmentData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingDialog from "@/components/BookingDialog";
import {
  MapPin,
  Clock,
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

const classLabel: Record<string, string> = {
  small: "Small Tractor · 11–40 HP",
  big: "Big Tractor · 50–130+ HP",
};

const EquipmentCard = ({ equipment, rank }: { equipment: EquipmentRow; rank?: number }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const image = equipment.image_url || typeImages[equipment.type] || tractorImg;
  const villageName = equipment.villages?.name || "";
  const talukaName = equipment.talukas?.name || "";
  const districtName = equipment.districts?.name || "";

  const phone = equipment.whatsapp.replace(/\D/g, "");
  const features = equipment.features || [];

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi ${equipment.owner_name}, I'm interested in renting your ${equipment.name}. Is it available?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:+${phone}`;
  };

  const handleSMS = () => {
    const message = encodeURIComponent(
      `Hi ${equipment.owner_name}, I'm interested in renting your ${equipment.name}.`
    );
    window.location.href = `sms:+${phone}?body=${message}`;
  };

  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-card transition-all hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${equipment.brand || ""} ${equipment.name} available for rent in ${villageName}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {rank === 0 && (
          <Badge className="absolute left-3 top-3 gap-1 bg-secondary text-secondary-foreground">
            <Award className="h-3 w-3" /> Best Value
          </Badge>
        )}
        <Badge
          className={`absolute right-3 top-3 ${
            equipment.available
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {equipment.available ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-card-foreground">
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
              {equipment.hp} HP
            </Badge>
          )}
          {equipment.model && (
            <Badge variant="outline" className="text-[11px]">
              Model: {equipment.model}
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
              <span className="text-[11px] text-muted-foreground">+{features.length - 4} more</span>
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
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>{equipment.owner_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 shrink-0" />
            <span>Quantity: {equipment.quantity}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-secondary" />
            <span className="text-sm font-semibold text-card-foreground">
              <IndianRupee className="inline h-3 w-3" />
              {equipment.price_per_hour}/hr
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              <IndianRupee className="inline h-3 w-3" />
              {equipment.price_per_day}/day
            </span>
          </div>
        </div>

        {equipment.payment_modes?.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Payment:{" "}
            {equipment.payment_modes
              .map((m) => (m === "advance_cash" ? "Advance Cash" : m === "upi" ? "UPI" : "Online"))
              .join(" · ")}
            {equipment.advance_percent > 0 && ` · ${equipment.advance_percent}% advance`}
          </p>
        )}

        <Button
          className="mt-4 w-full"
          onClick={() => setBookingOpen(true)}
          disabled={!equipment.available}
        >
          <CalendarCheck className="h-4 w-4" />
          Book Now
        </Button>

        <Button
          variant="whatsapp"
          className="mt-2 w-full"
          onClick={handleWhatsApp}
          disabled={!equipment.available}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleCall} disabled={!equipment.available}>
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button variant="outline" size="sm" onClick={handleSMS} disabled={!equipment.available}>
            <MessageSquare className="h-4 w-4" />
            SMS
          </Button>
        </div>
      </div>

      <BookingDialog equipment={equipment} open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
};

export default EquipmentCard;
