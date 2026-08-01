import { useMyEquipment, deleteEquipment } from "@/lib/equipmentData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, MapPin, IndianRupee, Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import tractorImg from "@/assets/tractor.jpg";
import rotavatorImg from "@/assets/rotavator.jpg";
import harvesterImg from "@/assets/harvester.jpg";

const typeImages: Record<string, string> = {
  tractor: tractorImg,
  rotavator: rotavatorImg,
  harvester: harvesterImg,
};

const MyEquipmentList = ({ userId }: { userId: string }) => {
  const { t } = useLang();
  const { data: items, isLoading } = useMyEquipment(userId);
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEquipment(id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-equipment", userId] }),
        queryClient.invalidateQueries({ queryKey: ["equipment"] }),
      ]);
      toast.success(t("my.deleted"));
    } catch (err: any) {
      toast.error(err.message || t("my.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        {t("my.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((eq) => {
        const image = eq.image_url || typeImages[eq.type] || tractorImg;
        return (
          <div
            key={eq.id}
            className="flex gap-3 rounded-lg border bg-card p-3 shadow-sm"
          >
            <img
              src={image}
              alt={eq.name}
              className="h-20 w-20 shrink-0 rounded-md object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate font-display font-semibold text-card-foreground">
                    {eq.name}
                  </h4>
                  <p className="text-xs capitalize text-muted-foreground">{eq.type}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    eq.available
                      ? "border-primary/30 text-primary"
                      : "border-destructive/30 text-destructive"
                  }
                >
                  {eq.available ? t("my.available") : t("my.unavailable")}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {eq.villages?.name}
                  {eq.talukas?.name && `, ${eq.talukas.name}`}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {eq.price_per_hour}{t("card.perHour")} · {eq.price_per_day}{t("card.perDay")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {t("my.qty")} {eq.quantity}
                </span>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={deletingId === eq.id}
                  aria-label={`${t("my.deleteAria")} ${eq.name}`}
                >
                  {deletingId === eq.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("my.deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{eq.name}" {t("my.deleteDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("my.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(eq.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("my.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}
    </div>
  );
};

export default MyEquipmentList;
