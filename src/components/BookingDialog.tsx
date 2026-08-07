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
import { OwnerTrustRow, SafetyTips } from "@/components/TrustSignals";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  IndianRupee,
  Loader2,
  ShieldCheck,
  Smartphone,
  Banknote,
  CreditCard,
  Minus,
  Plus,
  Check,
  Copy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

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
  const queryClient = useQueryClient();

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
  const [copied, setCopied] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const rate = unit === "day" ? equipment.price_per_day : equipment.price_per_hour;
  const qtyNum = Math.max(0, Number(qty) || 0);
  const total = useMemo(() => qtyNum * Number(rate || 0), [qtyNum, rate]);
  const advance = Math.round((total * (equipment.advance_percent || 0)) / 100);
  const balance = Math.max(0, total - advance);

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
  const payNow = mode === "advance_cash" ? advance || total : total;

  const steps = [
    { key: "details", label: t("book.step1") },
    { key: "payment", label: t("book.step2") },
    { key: "done", label: t("book.step3") },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  const reset = () => {
    setStep("details");
    setPayRef("");
    setCopied(false);
  };

  const bumpQty = (delta: number) => setQty(String(Math.max(1, qtyNum + delta)));

  const goToPayment = () => {
    if (!startDate || !(qtyNum > 0)) {
      toast.error(t("book.errDateDuration"));
      return;
    }
    if (startDate < today) {
      toast.error(t("book.errPastDate"));
      return;
    }
    if (!(name || profile?.full_name) || !(phone || profile?.whatsapp)) {
      toast.error(t("book.errNamePhone"));
      return;
    }
    setStep("payment");
  };

  const summaryText = () =>
    `${equipment.name}\n${t("book.owner")}: ${equipment.owner_name}\n${startDate} · ${qtyNum} ${unit}\n${t("book.estimatedTotal")}: ₹${total}\n${t("book.payNow")}: ₹${payNow}${payRef ? `\nRef: ${payRef}` : ""}`;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      toast.success(t("book.copied"));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
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
        duration_value: qtyNum,
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
        .replace("{qty}", String(qtyNum))
        .replace("{unit}", unit)
        .replace("{total}", String(total))
        .replace("{mode}", modeLabel)
        .replace("{ref}", refSuffix)
    );
    window.open(`https://wa.me/${digits}?text=${msg}`, "_blank");
  };

  const breakdown = (
    <div className="rounded-xl border bg-muted/40 p-3 text-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("book.rateLine")}</span>
        <span>
          ₹{Number(rate)} / {unit === "day" ? t("book.perDay") : t("book.perHour")}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("book.qtyLine")}</span>
        <span>
          {qtyNum} {unit === "day" ? t("book.days") : t("book.hours")}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t pt-2">
        <span className="text-muted-foreground">{t("book.estimatedTotal")}</span>
        <span className="font-display text-lg font-bold text-foreground">
          <IndianRupee className="inline h-4 w-4" />
          {total}
        </span>
      </div>
      {equipment.advance_percent > 0 && (
        <>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("book.advance").replace("{percent}", String(equipment.advance_percent))}</span>
            <span className="font-medium text-foreground">₹{advance}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("book.balance")}</span>
            <span>₹{balance}</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  i <= stepIndex ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <span className={`h-0.5 flex-1 rounded ${i < stepIndex ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                {t("book.title").replace("{name}", equipment.name)}
              </DialogTitle>
              <DialogDescription>
                {t("book.owner")}: {equipment.owner_name} · ₹{equipment.price_per_hour}/hr · ₹
                {equipment.price_per_day}/day
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!equipment.available && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  {t("book.unavailableWarn")}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-date">{t("book.startDate")}</Label>
                  <Input
                    id="bk-date"
                    type="date"
                    min={today}
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

              <div className="space-y-1.5">
                <Label htmlFor="bk-qty">{unit === "day" ? t("book.days") : t("book.hours")}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => bumpQty(-1)}
                    aria-label="minus"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="bk-qty"
                    type="number"
                    min="1"
                    className="text-center"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => bumpQty(1)}
                    aria-label="plus"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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

              {breakdown}

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
              <DialogDescription>
                {t("book.paymentDesc").replace("{owner}", equipment.owner_name)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                <span className="text-sm text-muted-foreground">{t("book.payNow")}</span>
                <span className="font-display text-xl font-bold text-primary">
                  <IndianRupee className="inline h-4 w-4" />
                  {payNow}
                </span>
              </div>

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
                  const active = mode === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMode(m.value)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>

              {(mode === "upi" || mode === "online") && (
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
                      placeholder={
                        mode === "upi" ? t("book.upiRefPlaceholder") : t("book.paymentRefPlaceholder")
                      }
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {breakdown}

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
              <div className="space-y-2 rounded-xl border bg-muted/40 p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("book.summary")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{equipment.name}</span>
                  <Badge variant="secondary">{startDate}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("book.qtyLine")}</span>
                  <span>
                    {qtyNum} {unit === "day" ? t("book.days") : t("book.hours")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("book.estimatedTotal")}</span>
                  <span className="font-semibold text-foreground">₹{total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("book.myBookings")}</span>
                  <Badge variant={mode === "advance_cash" ? "outline" : "default"}>
                    {mode === "advance_cash" ? t("book.pendingLabel") : t("book.paidLabel")}
                  </Badge>
                </div>
              </div>
              <Button variant="whatsapp" className="w-full" onClick={sendWhatsApp}>
                {t("book.sendWhatsApp")}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={copySummary}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? t("book.copied") : t("book.copy")}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t("book.close")}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
