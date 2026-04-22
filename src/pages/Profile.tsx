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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

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
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Set your location to see equipment available in your taluka.
          </p>

          {isLoading ? (
            <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <form onSubmit={handleSave} className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa">WhatsApp / Phone</Label>
                  <Input id="wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={districtId} onValueChange={(v) => { setDistrictId(v); setTalukaId(""); setVillageId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {districts?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Taluka / Sub-district</Label>
                  <Select value={talukaId} onValueChange={(v) => { setTalukaId(v); setVillageId(""); }} disabled={!districtId}>
                    <SelectTrigger><SelectValue placeholder={districtId ? "Select taluka / sub-district" : "Select district first"} /></SelectTrigger>
                    <SelectContent>
                      {talukas?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Village</Label>
                  <Select value={villageId} onValueChange={setVillageId} disabled={!talukaId}>
                    <SelectTrigger><SelectValue placeholder={talukaId ? "Select village" : "Select taluka first"} /></SelectTrigger>
                    <SelectContent>
                      {villages?.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={update.isPending}>
                {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
