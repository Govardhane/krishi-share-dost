import { EquipmentRow } from "@/lib/equipmentData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, IndianRupee, MessageCircle, Phone, MessageSquare, User, Package } from "lucide-react";
import tractorImg from "@/assets/tractor.jpg";
import rotavatorImg from "@/assets/rotavator.jpg";
import harvesterImg from "@/assets/harvester.jpg";

const typeImages: Record<string, string> = {
  tractor: tractorImg,
  rotavator: rotavatorImg,
  harvester: harvesterImg,
};

const EquipmentCard = ({ equipment }: { equipment: EquipmentRow }) => {
  const image = equipment.image_url || typeImages[equipment.type] || tractorImg;
  const villageName = equipment.villages?.name || "";
  const talukaName = equipment.talukas?.name || "";
  const districtName = equipment.districts?.name || "";

  const phone = equipment.whatsapp.replace(/\D/g, "");

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
          alt={equipment.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
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
        <h3 className="font-display text-lg font-semibold text-card-foreground">
          {equipment.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{equipment.description}</p>

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

        <Button
          variant="whatsapp"
          className="mt-4 w-full"
          onClick={handleWhatsApp}
          disabled={!equipment.available}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCall}
            disabled={!equipment.available}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSMS}
            disabled={!equipment.available}
          >
            <MessageSquare className="h-4 w-4" />
            SMS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
