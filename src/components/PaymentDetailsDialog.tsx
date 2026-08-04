import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, QrCode, X, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/lib/i18n";
import { EquipmentRow, updateEquipmentPayment, uploadPaymentQr, getPaymentQrUrl } from "@/lib/equipmentData";

interface Props {
  equipment: EquipmentRow;
  userId: string;
}

const PaymentDetailsDialog = ({ equipment, userId }: Props) => {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upiId, setUpiId] = useState(equipment.upi_id || "");
  const [phonepe, setPhonepe] = useState(equipment.phonepe_number || "");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [existingQr, setExistingQr] = useState<string | null>(null);

  const openDialog = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) setExistingQr(await getPaymentQrUrl(equipment.payment_qr_url));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("list.photoSizeError"));
      return;
    }
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const clearQr = () => {
    setQrFile(null);
    if (qrPreview) URL.revokeObjectURL(qrPreview);
    setQrPreview(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      let qrPath = equipment.payment_qr_url;
      if (qrFile) qrPath = await uploadPaymentQr(qrFile, userId);
      await updateEquipmentPayment(equipment.id, {
        upi_id: upiId || null,
        phonepe_number: phonepe || null,
        payment_qr_url: qrPath,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-equipment", userId] }),
        queryClient.invalidateQueries({ queryKey: ["equipment"] }),
      ]);
      toast.success(t("my.paymentSaved"));
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || t("my.paymentSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const shownQr = qrPreview || existingQr;

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" aria-label={t("my.payment")}>
          <Wallet className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">{t("my.payment")}</DialogTitle>
          <DialogDescription>{equipment.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`upi-${equipment.id}`}>{t("list.upiId")}</Label>
            <Input
              id={`upi-${equipment.id}`}
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@okaxis"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`pp-${equipment.id}`}>{t("list.phonepeNumber")}</Label>
            <Input
              id={`pp-${equipment.id}`}
              value={phonepe}
              onChange={(e) => setPhonepe(e.target.value)}
              placeholder="9876543210"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("list.paymentQr")}</Label>
            <p className="text-xs text-muted-foreground">{t("list.qrHint")}</p>
            {shownQr ? (
              <div className="relative w-40 overflow-hidden rounded-lg border bg-background">
                <img src={shownQr} alt={t("list.paymentQr")} className="h-40 w-40 object-contain" />
                {qrPreview && (
                  <button
                    type="button"
                    onClick={clearQr}
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 shadow-sm hover:bg-background"
                    aria-label={t("list.removeQr")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : null}
            <label
              htmlFor={`qr-${equipment.id}`}
              className="flex h-20 w-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-muted/30 p-2 text-center text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-muted/50"
            >
              <QrCode className="h-5 w-5" />
              <span>{t("list.clickUploadQr")}</span>
            </label>
            <input id={`qr-${equipment.id}`} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("my.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsDialog;
