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
  const allowedModes = paymentModeOptions.filter((m) =>
    (equipment.payment_modes?.length ? equipment.payment_modes : ["advance_cash"]).includes(m.value)
  );

  const reset = () => {
    setStep("details");
    setPayRef("");
  };

  const goToPayment = () => {
    if (!startDate || !(Number(qty) > 0)) {
      toast.error("Please choose a start date and duration");
      return;
    }
    if (!(name || profile?.full_name) || !(phone || profile?.whatsapp)) {
      toast.error("Please enter your name and phone number");
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
      toast.error("Enter the payment reference / UPI transaction ID");
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
      toast.success("Booking request sent to the owner");
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsApp = () => {
    const digits = equipment.whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Namaste ${equipment.owner_name}, maine AI-Agrishare par aapka ${equipment.name} book kiya hai.\n` +
        `Date: ${startDate}\nDuration: ${qty} ${unit}\nTotal: ₹${total}\nPayment: ${
          allowedModes.find((m) => m.value === mode)?.label
        }${payRef ? ` (Ref: ${payRef})` : ""}`
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
              <DialogTitle className="font-display">Book {equipment.name}</DialogTitle>
              <DialogDescription>
                Owner: {equipment.owner_name} · ₹{equipment.price_per_hour}/hr · ₹{equipment.price_per_day}/day
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-date">Start date</Label>
                  <Input
                    id="bk-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rent by</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as "hour" | "day")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Per hour</SelectItem>
                      <SelectItem value="day">Per day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-qty">{unit === "day" ? "Days" : "Hours"}</Label>
                  <Input
                    id="bk-qty"
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bk-name">Your name</Label>
                  <Input
                    id="bk-name"
                    value={name || profile?.full_name || ""}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bk-phone">Phone</Label>
                  <Input
                    id="bk-phone"
                    value={phone || profile?.whatsapp || ""}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="91XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bk-notes">Work details (optional)</Label>
                <Textarea
                  id="bk-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., 5 acre ploughing, Sakur village"
                />
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated total</span>
                  <span className="font-display text-lg font-bold text-foreground">
                    <IndianRupee className="inline h-4 w-4" />
                    {total}
                  </span>
                </div>
                {equipment.advance_percent > 0 && (
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Advance ({equipment.advance_percent}%)</span>
                    <span>₹{advance}</span>
                  </div>
                )}
              </div>

              <Button className="w-full" size="lg" onClick={goToPayment}>
                Continue to payment
              </Button>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Payment</DialogTitle>
              <DialogDescription>Choose how you want to pay {equipment.owner_name}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2">
                {allowedModes.map((m) => {
                  const Icon = modeIcon[m.value] || Banknote;
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
                        <p className="text-sm font-medium text-foreground">{m.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.value === "advance_cash"
                            ? `Pay ₹${advance || total} advance in cash, rest after work`
                            : m.value === "upi"
                            ? `Pay ₹${total} via UPI${equipment.upi_id ? ` to ${equipment.upi_id}` : ""}`
                            : `Pay ₹${total} online`}
                        </p>
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
                  />
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("pay.afterPay")}</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="UPI transaction ID"
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
                  />
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("pay.afterPay")}</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="Payment reference number"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                Booking details owner ko turant dikh jayenge. Payment aap seedha owner ko karte hain.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setStep("details")}>
                  Back
                </Button>
                <Button onClick={confirmBooking} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm booking
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Booking confirmed 🎉</DialogTitle>
              <DialogDescription>
                {equipment.owner_name} ko aapki request mil gayi hai.
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
                Send details on WhatsApp
              </Button>
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
