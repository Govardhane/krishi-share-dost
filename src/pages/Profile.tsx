import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useDistricts, useTalukas, useVillages } from "@/lib/equipmentData";
import { useLang } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import MyEquipmentList from "@/components/MyEquipmentList";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const { t } = useLang();

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [talukaId, setTalukaId] = useState("");
  const [villageId, setVillageId] = useState("");

  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(districtId || undefined);
  const { data: villages } = useVillages(talukaId || undefined);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setWhatsapp(profile.whatsapp || "");
      setDistrictId(profile.district_id || "");
      setTalukaId(profile.taluka_id || "");
      setVillageId(profile.village_id || "");
    }
  }, [profile]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        full_name: fullName,
        whatsapp,
        district_id: districtId || null,
        taluka_id: talukaId || null,
        village_id: villageId || null,
      });
      toast.success(t("prof.saved"));
    } catch (err: any) {
      toast.error(err.message || t("prof.saveFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground">{t("prof.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("prof.subtitle")}
          </p>

          {isLoading ? (
            <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <form onSubmit={handleSave} className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("prof.fullName")}</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa">{t("prof.whatsappPhone")}</Label>
                  <Input id="wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("prof.district")}</Label>
                  <Select value={districtId} onValueChange={(v) => { setDistrictId(v); setTalukaId(""); setVillageId(""); }}>
                    <SelectTrigger><SelectValue placeholder={t("prof.selectDistrict")} /></SelectTrigger>
                    <SelectContent>
                      {districts?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("prof.talukaSub")}</Label>
                  <Select value={talukaId} onValueChange={(v) => { setTalukaId(v); setVillageId(""); }} disabled={!districtId}>
                    <SelectTrigger><SelectValue placeholder={districtId ? t("prof.selectTaluka") : t("prof.selectDistrictFirst")} /></SelectTrigger>
                    <SelectContent>
                      {talukas?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("prof.village")}</Label>
                  <Select value={villageId} onValueChange={setVillageId} disabled={!talukaId}>
                    <SelectTrigger><SelectValue placeholder={talukaId ? t("prof.selectVillage") : t("prof.selectTalukaFirst")} /></SelectTrigger>
                    <SelectContent>
                      {villages?.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={update.isPending}>
                {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("prof.saveProfile")}
              </Button>
            </form>
          )}

          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("prof.myEquipment")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("prof.myEquipmentDesc")}
            </p>
            <div className="mt-4">
              <MyEquipmentList userId={user.id} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
