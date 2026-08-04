import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { equipmentTypes, useDistricts, useTalukas, useVillages, insertEquipment, uploadEquipmentPhoto, tractorClasses, featureOptions, paymentModeOptions } from "@/lib/equipmentData";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { CheckCircle, Loader2, ImagePlus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const ListEquipment = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { t } = useLang();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [districtId, setDistrictId] = useState("");
  const [talukaId, setTalukaId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [type, setType] = useState("");
  const [tractorClass, setTractorClass] = useState("");
  const [condition, setCondition] = useState("good");
  const [features, setFeatures] = useState<string[]>([]);
  const [paymentModes, setPaymentModes] = useState<string[]>(["advance_cash"]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void, val: string) =>
    set(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);


  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(districtId || undefined);
  const { data: villages } = useVillages(talukaId || undefined);
  const queryClient = useQueryClient();

  // Pre-fill location from profile
  useEffect(() => {
    if (profile && !districtId) {
      if (profile.district_id) setDistrictId(profile.district_id);
      if (profile.taluka_id) setTalukaId(profile.taluka_id);
      if (profile.village_id) setVillageId(profile.village_id);
    }
  }, [profile, districtId]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" state={{ from: "/list-equipment" }} replace />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!districtId || !talukaId || !villageId || !type) {
      toast.error(t("list.selectRequired"));
      return;
    }

    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (photoFile) {
        try {
          imageUrl = await uploadEquipmentPhoto(photoFile, user.id);
        } catch (uploadErr: any) {
          toast.error(uploadErr.message || t("list.photoUploadFailed"));
          setLoading(false);
          return;
        }
      }

      await insertEquipment({
        name: formData.get("name") as string,
        type,
        description: formData.get("description") as string,
        price_per_hour: Number(formData.get("priceHour")),
        price_per_day: Number(formData.get("priceDay")),
        owner_name: (formData.get("ownerName") as string) || profile?.full_name || "",
        whatsapp: (formData.get("whatsapp") as string) || profile?.whatsapp || "",
        village_id: villageId,
        taluka_id: talukaId,
        district_id: districtId,
        quantity: Number(formData.get("quantity")) || 1,
        owner_user_id: user.id,
        image_url: imageUrl,
        brand: (formData.get("brand") as string) || null,
        model: (formData.get("model") as string) || null,
        hp: formData.get("hp") ? Number(formData.get("hp")) : null,
        tractor_class: tractorClass || null,
        year_of_purchase: formData.get("year") ? Number(formData.get("year")) : null,
        condition: condition || null,
        features,
        payment_modes: paymentModes.length ? paymentModes : ["advance_cash"],
        advance_percent: Number(formData.get("advancePercent")) || 0,
        upi_id: (formData.get("upiId") as string) || null,
      });

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setSubmitted(true);
      toast.success(t("list.listedSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("list.listFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("list.photoSizeError"));
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground">
            {t("list.listedHeading")}
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            {t("list.listedDesc")}
          </p>
          <Button className="mt-6" onClick={() => setSubmitted(false)}>
            {t("list.listAnother")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const profileIncomplete = !profile?.full_name || !profile?.whatsapp;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            {t("list.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("list.subtitle")}
          </p>

          {profileIncomplete && !profileLoading && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              {t("list.completeProfile1")} <Link to="/profile" className="font-medium text-primary underline">{t("list.completeProfile2")}</Link> {t("list.completeProfile3")}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("list.equipmentName")}</Label>
                <Input id="name" name="name" placeholder={t("list.equipmentNamePh")} required />
              </div>
              <div className="space-y-2">
                <Label>{t("list.equipmentType")}</Label>
                <Select
                  value={type}
                  onValueChange={(v) => {
                    setType(v);
                    if (v === "tractor_small") setTractorClass("small");
                    else if (v === "tractor_big") setTractorClass("big");
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("list.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes
                      .filter((tp) => tp.value !== "all")
                      .map((tp) => (
                        <SelectItem key={tp.value} value={tp.value}>
                          {t(`list.type.${tp.value}`)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tractor size guide */}
            {type.startsWith("tractor") && (
              <div className="grid gap-3 sm:grid-cols-2">
                {tractorClasses.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setTractorClass(c.value)}
                    className={`rounded-lg border p-3 text-left transition ${
                      tractorClass === c.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <p className="font-display text-base font-semibold text-foreground">🚜 {t(`list.class.${c.value}.label`)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("list.hpRange")} {t(`list.class.${c.value}.hp`)}</p>
                    <p className="text-xs text-muted-foreground">{t("list.farmSize")} {t(`list.class.${c.value}.farm`)}</p>
                    <p className="text-xs text-muted-foreground">{t("list.usage")} {t(`list.class.${c.value}.usage`)}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Machine details */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="brand">{t("list.brand")}</Label>
                <Input id="brand" name="brand" placeholder="Mahindra" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">{t("list.model")}</Label>
                <Input id="model" name="model" placeholder="575 DI XP Plus" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hp">{t("list.hp")}</Label>
                <Input id="hp" name="hp" type="number" placeholder="45" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">{t("list.year")}</Label>
                <Input id="year" name="year" type="number" placeholder="2021" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("list.condition")}</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t("list.condition.new")}</SelectItem>
                  <SelectItem value="good">{t("list.condition.good")}</SelectItem>
                  <SelectItem value="average">{t("list.condition.average")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("list.features")}</Label>
              <div className="flex flex-wrap gap-2">
                {featureOptions.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle(features, setFeatures, f)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      features.includes(f)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t(`list.feature.${f}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("list.paymentOptions")}</Label>
              <div className="flex flex-wrap gap-2">
                {paymentModeOptions.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggle(paymentModes, setPaymentModes, m.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      paymentModes.includes(m.value)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t(`list.pay.${m.value}`)}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="advancePercent">{t("list.advanceRequired")}</Label>
                  <Input id="advancePercent" name="advancePercent" type="number" placeholder="20" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upiId">{t("list.upiId")}</Label>
                  <Input id="upiId" name="upiId" placeholder="name@okaxis" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phonepeNumber">{t("list.phonepeNumber")}</Label>
                  <Input id="phonepeNumber" name="phonepeNumber" placeholder="9876543210" inputMode="numeric" />
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Label>{t("list.paymentQr")}</Label>
                <p className="text-xs text-muted-foreground">{t("list.qrHint")}</p>
                {qrPreview ? (
                  <div className="relative w-40 overflow-hidden rounded-lg border bg-muted">
                    <img src={qrPreview} alt="QR preview" className="h-40 w-40 object-contain bg-background" />
                    <button
                      type="button"
                      onClick={clearQr}
                      className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 shadow-sm hover:bg-background"
                      aria-label={t("list.removeQr")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="qr"
                    className="flex h-32 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-2 text-center text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-muted/50"
                  >
                    <QrCode className="h-6 w-6" />
                    <span>{t("list.clickUploadQr")}</span>
                  </label>
                )}
                <input id="qr" type="file" accept="image/*" className="hidden" onChange={handleQrChange} />
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="description">{t("list.description")}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t("list.descriptionPh")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t("list.equipmentPhoto")} <span className="text-xs font-normal text-muted-foreground">{t("list.optionalMax5mb")}</span></Label>
              {photoPreview ? (
                <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
                  <img src={photoPreview} alt="Equipment preview" className="h-56 w-full object-cover" />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow-sm hover:bg-background"
                    aria-label={t("list.removePhoto")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="photo"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-muted/50"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span>{t("list.clickUpload")}</span>
                </label>
              )}
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priceHour">{t("list.pricePerHour")}</Label>
                <Input id="priceHour" name="priceHour" type="number" placeholder="500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceDay">{t("list.pricePerDay")}</Label>
                <Input id="priceDay" name="priceDay" type="number" placeholder="3500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t("list.availableQty")}</Label>
                <Input id="quantity" name="quantity" type="number" placeholder="1" defaultValue="1" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">{t("list.yourName")}</Label>
                <Input id="ownerName" name="ownerName" placeholder={t("list.fullNamePh")} defaultValue={profile?.full_name || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t("list.whatsappPhoneNumber")}</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="e.g., 919876543210" defaultValue={profile?.whatsapp || ""} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("list.district")}</Label>
                <Select
                  value={districtId}
                  onValueChange={(val) => {
                    setDistrictId(val);
                    setTalukaId("");
                    setVillageId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("list.selectDistrict")} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("list.talukaSub")}</Label>
                <Select
                  value={talukaId}
                  onValueChange={(val) => {
                    setTalukaId(val);
                    setVillageId("");
                  }}
                  disabled={!districtId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={districtId ? t("list.selectTaluka") : t("list.selectDistrictFirst")} />
                  </SelectTrigger>
                  <SelectContent>
                    {talukas?.map((tk) => (
                      <SelectItem key={tk.id} value={tk.id}>
                        {tk.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("list.village")}</Label>
                <Select value={villageId} onValueChange={setVillageId} disabled={!talukaId}>
                  <SelectTrigger>
                    <SelectValue placeholder={talukaId ? t("list.selectVillage") : t("list.selectTalukaFirst")} />
                  </SelectTrigger>
                  <SelectContent>
                    {villages?.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {t("list.noVillages")}
                      </div>
                    )}
                    {villages?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("list.listEquipment")}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ListEquipment;
