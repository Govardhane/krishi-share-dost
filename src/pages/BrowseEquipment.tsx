import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEquipment, useDistricts, useTalukas, useVillages, equipmentTypes } from "@/lib/equipmentData";
import { Search, MapPin, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const BrowseEquipment = () => {
  const { t } = useLang();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [talukaFilter, setTalukaFilter] = useState("all");
  const [villageFilter, setVillageFilter] = useState("all");
  const [appliedDefault, setAppliedDefault] = useState(false);

  // Lock browsing to the user's own area (district + taluka) once profile loads
  useEffect(() => {
    if (!appliedDefault && profile?.district_id) {
      setDistrictFilter(profile.district_id);
      if (profile.taluka_id) setTalukaFilter(profile.taluka_id);
      setAppliedDefault(true);
    }
  }, [profile, appliedDefault]);

  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(districtFilter !== "all" ? districtFilter : undefined);
  const { data: villages } = useVillages(talukaFilter !== "all" ? talukaFilter : undefined);
  const hasArea = !!profile?.district_id;
  const { data: equipment, isLoading } = useEquipment({
    type: typeFilter,
    districtId: districtFilter,
    talukaId: talukaFilter,
    villageId: villageFilter,
    search: search || undefined,
  });

  const filtered = user && hasArea ? equipment || [] : [];

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <Lock className="h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">{t("browse.loginTitle")}</h1>
          <p className="mt-3 text-muted-foreground">
            {t("browse.loginDesc")}
          </p>
          <Link to="/auth" className="mt-6">
            <Button size="lg">{t("browse.loginBtn")}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profileLoading && !hasArea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <MapPin className="h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">{t("browse.setLocationTitle")}</h1>
          <p className="mt-3 text-muted-foreground">
            {t("browse.setLocationDesc")}
          </p>
          <Link to="/profile" className="mt-6">
            <Button size="lg">{t("browse.goToProfile")}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          {t("browse.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("browse.subtitle")}
        </p>

        <div className="mt-4 rounded-lg border bg-card p-3 text-sm text-muted-foreground">
          {t("browse.savedAreaNote")}
        </div>


        {/* Filters */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("browse.searchPlaceholder")}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("browse.equipmentType")} />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={districtFilter}
            onValueChange={(val) => {
              setDistrictFilter(val);
              setTalukaFilter("all");
              setVillageFilter("all");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("browse.district")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("browse.allDistricts")}</SelectItem>
              {districts?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={talukaFilter}
            onValueChange={(val) => {
              setTalukaFilter(val);
              setVillageFilter("all");
            }}
            disabled={districtFilter === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("browse.talukaPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("browse.allTalukas")}</SelectItem>
              {talukas?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={villageFilter}
            onValueChange={setVillageFilter}
            disabled={talukaFilter === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("browse.village")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("browse.allVillages")}</SelectItem>
              {villages?.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{filtered.length} {t("browse.foundSuffix")}</span>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((eq, i) => (
              <EquipmentCard key={eq.id} equipment={eq} rank={i} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">
              {t("browse.noResults")}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowseEquipment;
