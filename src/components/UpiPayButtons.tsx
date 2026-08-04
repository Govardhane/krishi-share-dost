import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, QrCode, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getPaymentQrUrl } from "@/lib/equipmentData";

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

  useEffect(() => {
    let active = true;
    getPaymentQrUrl(ownerQrPath).then((url) => {
      if (active) setOwnerQr(url);
    });
    return () => {
      active = false;
    };
  }, [ownerQrPath]);

  const apps = [
    { key: "phonepe", label: t("pay2.phonepe"), scheme: "phonepe://pay", color: "bg-[#5f259f]" },
    { key: "gpay", label: t("pay2.gpay"), scheme: "tez://upi/pay", color: "bg-[#1a73e8]" },
    { key: "paytm", label: t("pay2.paytm"), scheme: "paytmmp://pay", color: "bg-[#00baf2]" },
    { key: "any", label: t("pay2.anyUpiApp"), scheme: "upi://pay", color: "bg-primary" },
  ];

  const ownerBlock = (
    <>
      {ownerQr && (
        <div className="rounded-lg border bg-background p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <QrCode className="h-3.5 w-3.5 text-primary" /> {t("pay.ownerQr")}
          </p>
          <img src={ownerQr} alt={t("pay.ownerQr")} className="mt-2 h-44 w-44 rounded-md border object-contain" />
        </div>
      )}
      {phonepeNumber && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5 text-primary" /> {t("pay.ownerPhonepe")}: <span className="font-medium text-foreground">{phonepeNumber}</span>
        </p>
      )}
    </>
  );

  if (!upiId) {
    return (
      <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
        {ownerQr || phonepeNumber ? (
          ownerBlock
        ) : (
          <p className="text-xs text-muted-foreground">{t("pay.noUpi")}</p>
        )}
      </div>
    );
  }

  const params = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const genericUri = `upi://pay?${params}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(genericUri)}`;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">
          {t("pay.openApp")} — ₹{amount}
        </p>
        <p className="text-xs text-muted-foreground">{t("pay.choose")}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {apps.map((app) => (
          <Button
            key={app.key}
            type="button"
            variant="outline"
            className="justify-start"
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

      {ownerBlock}

      <details className="text-xs text-muted-foreground">
        <summary className="flex cursor-pointer items-center gap-1.5">
          <QrCode className="h-3.5 w-3.5" /> {t("pay.desktopHint")}
        </summary>
        <img src={qrSrc} alt={t("pay2.qrAlt")} className="mt-2 h-40 w-40 rounded-md border bg-background p-1" />
        <p className="mt-1">{t("pay2.upiIdLabel").replace("{id}", upiId)}</p>
      </details>
    </div>
  );
};

export default UpiPayButtons;
