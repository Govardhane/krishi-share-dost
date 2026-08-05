import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EquipmentRow, createBooking, paymentModeOptions } from "@/lib/equipmentData";
import UpiPayButtons from "@/components/UpiPayButtons";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { IndianRupee, Loader2, ShieldCheck, Smartphone, Banknote, CreditCard } from "lucide-react";

interface Props {
  equipment: EquipmentRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const modeIcon: Record<string, typeof Banknote> = {
  advance_cash: Banknote,
  online: CreditCard,
  upi: Smartphone,
};

const modeLabelKey: Record<string, string> = {
  advance_cash: "book.mode.advance_cash",
  online: "book.mode.online",
  upi: "book.mode.upi",
};

const BookingDialog = ({ equipment, open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const { t } = useLang();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState<"details" | "payment" | "done">("details");
  const [startDate, setStartDate] = useState("");
  const [unit, setUnit] = useState<"hour" | "day">("day");
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState(equipment.payment_modes?.[0] || "advance_cash");
  const [payRef, setPayRef] = useState("");
  const [saving, setSaving] = useState(false);

  const rate = unit === "day" ? equipment.price_per_day : equipment.price_per_hour;
  const total = useMemo(() => Math.max(0, Number(qty) || 0) * Number(rate || 0), [qty, rate]);
  const advance = Math.round((total * (equipment.advance_percent || 0)) / 100);
  const hasOwnerPayInfo = Boolean(
    equipment.upi_id || equipment.phonepe_number || equipment.payment_qr_url
  );
  const enabledModes = new Set(
    equipment.payment_modes?.length ? equipment.payment_modes : ["advance_cash"]
  );
  // Owner ne UPI ID / PhonePe number / QR diya hai to UPI + Online option hamesha dikhao
  if (hasOwnerPayInfo) {
    enabledModes.add("upi");
    enabledModes.add("online");
  }
  const allowedModes = paymentModeOptions.filter((m) => enabledModes.has(m.value));


  const reset = () => {
    setStep("details");
    setPayRef("");
  };

  const goToPayment = () => {
    if (!startDate || !(Number(qty) > 0)) {
      toast.error(t("book.errDateDuration"));
      return;
    }
    if (!(name || profile?.full_name) || !(phone || profile?.whatsapp)) {
      toast.error(t("book.errNamePhone"));
      return;
    }
    setStep("payment");
  };

  const confirmBooking = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if ((mode === "online" || mode === "upi") && !payRef.trim()) {
      toast.error(t("book.errPaymentRef"));
      return;
    }
    setSaving(true);
    try {
      await createBooking({
        equipment_id: equipment.id,
        renter_user_id: user.id,
        owner_user_id: equipment.owner_user_id ?? null,
        renter_name: name || profile?.full_name || "",
        renter_phone: phone || profile?.whatsapp || "",
        start_date: startDate,
        duration_unit: unit,
        duration_value: Number(qty),
        total_amount: total,
        advance_amount: mode === "advance_cash" ? advance : total,
        payment_mode: mode,
        payment_status: mode === "advance_cash" ? "pending" : "paid",
        payment_ref: payRef || null,
        notes: notes || null,
      });
      setStep("done");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["equipment"] }),
        queryClient.invalidateQueries({ queryKey: ["my-equipment"] }),
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
      ]);
      toast.success(t("book.toastBookingSent"));

    } catch (err: any) {
      toast.error(err.message || t("book.toastBookingFailed"));
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsApp = () => {
    const digits = equipment.whatsapp.replace(/\D/g, "");
    const modeLabel = t(modeLabelKey[mode] || "book.mode.advance_cash");
    const refSuffix = payRef ? t("book.whatsappRefSuffix").replace("{ref}", payRef) : "";
    const msg = encodeURIComponent(
      t("book.whatsappMsg")
        .replace("{owner}", equipment.owner_name)
        .replace("{equipment}", equipment.name)
        .replace("{date}", startDate)
        .replace("{qty}", String(qty))
        .replace("{unit}", unit)
        .replace("{total}", String(total))
        .replace("{mode}", modeLabel)
        .replace("{ref}", refSuffix)
    );
    window.open(`https://wa.me/${digits}?text=${msg}`, "_blank");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{t("book.title").replace("{name}", equipment.name)}</DialogTitle>
              <DialogDescription>
                {t("book.owner")}: {equipment.owner_name} · ₹{equipment.price_per_hour}/hr · ₹{equipment.price_per_day}/day
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-date">{t("book.startDate")}</Label>
                  <Input
                    id="bk-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("book.rentBy")}</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as "hour" | "day")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">{t("book.perHour")}</SelectItem>
                      <SelectItem value="day">{t("book.perDay")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-qty">{unit === "day" ? t("book.days") : t("book.hours")}</Label>
                  <Input
                    id="bk-qty"
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bk-name">{t("book.yourName")}</Label>
                  <Input
                    id="bk-name"
                    value={name || profile?.full_name || ""}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("book.fullNamePlaceholder")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bk-phone">{t("book.phone")}</Label>
                  <Input
                    id="bk-phone"
                    value={phone || profile?.whatsapp || ""}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("book.phonePlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bk-notes">{t("book.workDetails")}</Label>
                <Textarea
                  id="bk-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("book.workDetailsPlaceholder")}
                />
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("book.estimatedTotal")}</span>
                  <span className="font-display text-lg font-bold text-foreground">
                    <IndianRupee className="inline h-4 w-4" />
                    {total}
                  </span>
                </div>
                {equipment.advance_percent > 0 && (
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("book.advance").replace("{percent}", String(equipment.advance_percent))}</span>
                    <span>₹{advance}</span>
                  </div>
                )}
              </div>

              <Button className="w-full" size="lg" onClick={goToPayment}>
                {t("book.continueToPayment")}
              </Button>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{t("book.paymentTitle")}</DialogTitle>
              <DialogDescription>{t("book.paymentDesc").replace("{owner}", equipment.owner_name)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2">
                {allowedModes.map((m) => {
                  const Icon = modeIcon[m.value] || Banknote;
                  const label = t(modeLabelKey[m.value] || "book.mode.advance_cash");
                  let desc = "";
                  if (m.value === "advance_cash") {
                    desc = t("book.mode.advanceDesc").replace("{amount}", String(advance || total));
                  } else if (m.value === "upi") {
                    const to = equipment.upi_id ? t("book.mode.upiTo").replace("{upi}", equipment.upi_id) : "";
                    desc = t("book.mode.upiDesc").replace("{amount}", String(total)).replace("{to}", to);
                  } else {
                    desc = t("book.mode.onlineDesc").replace("{amount}", String(total));
                  }
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMode(m.value)}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                        mode === m.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {mode === "upi" && (
                <div className="space-y-3">
                  <UpiPayButtons
                    upiId={equipment.upi_id}
                    payeeName={equipment.owner_name}
                    amount={total}
                    note={`AI-Agrishare ${equipment.name}`}
                    phonepeNumber={equipment.phonepe_number}
                    ownerQrPath={equipment.payment_qr_url}
                  />
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("pay.afterPay")}</Label>
                    <Input
                      className="mt-1.5"
                      placeholder={t("book.upiRefPlaceholder")}
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {mode === "online" && (
                <div className="space-y-3">
                  <UpiPayButtons
                    upiId={equipment.upi_id}
                    payeeName={equipment.owner_name}
                    amount={total}
                    note={`AI-Agrishare ${equipment.name}`}
                    phonepeNumber={equipment.phonepe_number}
                    ownerQrPath={equipment.payment_qr_url}
                  />
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("pay.afterPay")}</Label>
                    <Input
                      className="mt-1.5"
                      placeholder={t("book.paymentRefPlaceholder")}
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                {t("book.trustNote")}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setStep("details")}>
                  {t("book.back")}
                </Button>
                <Button onClick={confirmBooking} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("book.confirmBooking")}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{t("book.confirmedTitle")}</DialogTitle>
              <DialogDescription>
                {t("book.confirmedDesc").replace("{owner}", equipment.owner_name)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p>
                  <Badge variant="secondary" className="mr-2">
                    {startDate}
                  </Badge>
                  {qty} {unit} · ₹{total}
                </p>
              </div>
              <Button variant="whatsapp" className="w-full" onClick={sendWhatsApp}>
                {t("book.sendWhatsApp")}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                {t("book.close")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
