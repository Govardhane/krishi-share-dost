import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, QrCode, Phone, Copy, Check, IndianRupee } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getPaymentQrUrl } from "@/lib/equipmentData";
import { toast } from "sonner";

interface Props {
  upiId: string | null;
  payeeName: string;
  amount: number;
  note: string;
  phonepeNumber?: string | null;
  ownerQrPath?: string | null;
}

const UpiPayButtons = ({ upiId, payeeName, amount, note, phonepeNumber, ownerQrPath }: Props) => {
  const { t } = useLang();
  const [ownerQr, setOwnerQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPaymentQrUrl(ownerQrPath).then((url) => {
      if (active) setOwnerQr(url);
    });
    return () => {
      active = false;
    };
  }, [ownerQrPath]);

  const copy = async (value: string, key: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(msg);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const apps = [
    { key: "phonepe", label: t("pay2.phonepe"), scheme: "phonepe://pay", color: "bg-[#5f259f]" },
    { key: "gpay", label: t("pay2.gpay"), scheme: "tez://upi/pay", color: "bg-[#1a73e8]" },
    { key: "paytm", label: t("pay2.paytm"), scheme: "paytmmp://pay", color: "bg-[#00baf2]" },
    { key: "any", label: t("pay2.anyUpiApp"), scheme: "upi://pay", color: "bg-primary" },
  ];

  const amountChip = (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      <IndianRupee className="h-3 w-3" />
      {amount}
    </span>
  );

  const ownerBlock = (
    <>
      {ownerQr && (
        <div className="rounded-lg border bg-background p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <QrCode className="h-3.5 w-3.5 text-primary" /> {t("pay.ownerQr")}
          </p>
          <img
            src={ownerQr}
            alt={t("pay.ownerQr")}
            className="mx-auto mt-2 h-44 w-44 rounded-md border object-contain"
          />
        </div>
      )}
      {phonepeNumber && (
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2">
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0 text-primary" /> {t("pay.ownerPhonepe")}:{" "}
            <span className="truncate font-semibold text-foreground">{phonepeNumber}</span>
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 px-2 text-xs"
            onClick={() => copy(phonepeNumber, "phone", t("book.copied"))}
          >
            {copied === "phone" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}
    </>
  );

  if (!upiId) {
    return (
      <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
        {ownerQr || phonepeNumber ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{t("pay.amountChip")}</p>
              {amountChip}
            </div>
            {ownerBlock}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">{t("pay.noUpi")}</p>
        )}
      </div>
    );
  }

  const params = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const genericUri = `upi://pay?${params}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(genericUri)}`;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{t("pay.openApp")}</p>
          <p className="text-xs text-muted-foreground">{t("pay.choose")}</p>
        </div>
        {amountChip}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {apps.map((app) => (
          <Button
            key={app.key}
            type="button"
            variant="outline"
            className="justify-start bg-background"
            onClick={() => {
              window.location.href = `${app.scheme}?${params}`;
            }}
          >
            <span className={`mr-2 flex h-5 w-5 items-center justify-center rounded ${app.color}`}>
              <Smartphone className="h-3 w-3 text-primary-foreground" />
            </span>
            {app.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          {t("pay2.upiIdLabel").replace("{id}", upiId)}
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          onClick={() => copy(upiId, "upi", t("pay.copiedUpi"))}
        >
          {copied === "upi" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {t("pay.copyUpi")}
        </Button>
      </div>

      {ownerBlock}

      <details className="text-xs text-muted-foreground">
        <summary className="flex cursor-pointer items-center gap-1.5">
          <QrCode className="h-3.5 w-3.5" /> {t("pay.desktopHint")}
        </summary>
        <img
          src={qrSrc}
          alt={t("pay2.qrAlt")}
          className="mx-auto mt-2 h-44 w-44 rounded-md border bg-background p-1"
        />
      </details>
    </div>
  );
};

export default UpiPayButtons;
