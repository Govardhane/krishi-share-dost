import { Equipment } from "@/lib/equipmentData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, IndianRupee, MessageCircle } from "lucide-react";
import tractorImg from "@/assets/tractor.jpg";
import rotavatorImg from "@/assets/rotavator.jpg";
import harvesterImg from "@/assets/harvester.jpg";

const typeImages: Record<string, string> = {
  tractor: tractorImg,
  rotavator: rotavatorImg,
  harvester: harvesterImg,
};

const EquipmentCard = ({ equipment }: { equipment: Equipment }) => {
  const image = equipment.image || typeImages[equipment.type] || tractorImg;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi ${equipment.ownerName}, I'm interested in renting your ${equipment.name}. Is it available?`
    );
    window.open(`https://wa.me/${equipment.whatsapp}?text=${message}`, "_blank");
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

        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{equipment.village}, {equipment.district}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-secondary" />
            <span className="text-sm font-semibold text-card-foreground">
              <IndianRupee className="inline h-3 w-3" />
              {equipment.pricePerHour}/hr
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              <IndianRupee className="inline h-3 w-3" />
              {equipment.pricePerDay}/day
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Owner: {equipment.ownerName} · Qty: {equipment.quantity}
          </span>
        </div>

        <Button
          variant="whatsapp"
          className="mt-3 w-full"
          onClick={handleWhatsApp}
          disabled={!equipment.available}
        >
          <MessageCircle className="h-4 w-4" />
          Contact on WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default EquipmentCard;
