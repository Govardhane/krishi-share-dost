import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import BrowseFilters, { BrowseFilterState, defaultFilters } from "@/components/BrowseFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useEquipment, EquipmentRow } from "@/lib/equipmentData";
import { MapPin, Lock, IndianRupee, CheckCircle2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useLang } from "@/lib/i18n";
import { TrustAssuranceBar } from "@/components/TrustSignals";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const BrowseEquipment = () => {
  const { t } = useLang();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const [filters, setFilters] = useState<BrowseFilterState>(defaultFilters);
  const [appliedDefault, setAppliedDefault] = useState(false);

  const patch = (p: Partial<BrowseFilterState>) => setFilters((f) => ({ ...f, ...p }));

  // Lock browsing to the user's own area (district + taluka) once profile loads
  useEffect(() => {
    if (!appliedDefault && profile?.district_id) {
      setFilters((f) => ({
        ...f,
        districtId: profile.district_id as string,
        talukaId: profile.taluka_id ?? "all",
      }));
      setAppliedDefault(true);
    }
  }, [profile, appliedDefault]);

  const hasArea = !!profile?.district_id;
  const { data: equipment, isLoading } = useEquipment({
    type: filters.type,
    districtId: filters.districtId,
    talukaId: filters.talukaId,
    villageId: filters.villageId,
    search: filters.search || undefined,
  });

  const filtered = useMemo(() => {
    if (!user || !hasArea) return [] as EquipmentRow[];
    let rows = [...(equipment || [])];

    if (filters.onlyAvailable) rows = rows.filter((r) => r.available);
    if (filters.maxDayPrice > 0) rows = rows.filter((r) => Number(r.price_per_day) <= filters.maxDayPrice);
    if (filters.minHp > 0) rows = rows.filter((r) => (r.hp ?? 0) >= filters.minHp);
    if (filters.paymentMode !== "all")
      rows = rows.filter((r) => (r.payment_modes || []).includes(filters.paymentMode));
    if (filters.features.length > 0)
      rows = rows.filter((r) => filters.features.every((f) => (r.features || []).includes(f)));

    const byAvailability = (a: EquipmentRow, b: EquipmentRow) =>
      Number(b.available) - Number(a.available);

    switch (filters.sort) {
      case "price_low":
        rows.sort((a, b) => byAvailability(a, b) || Number(a.price_per_day) - Number(b.price_per_day));
        break;
      case "price_high":
        rows.sort((a, b) => byAvailability(a, b) || Number(b.price_per_day) - Number(a.price_per_day));
        break;
      case "rating":
        rows.sort(
          (a, b) =>
            byAvailability(a, b) ||
            Number(b.rating) - Number(a.rating) ||
            b.rating_count - a.rating_count
        );
        break;
      case "hp":
        rows.sort((a, b) => byAvailability(a, b) || (b.hp ?? 0) - (a.hp ?? 0));
        break;
      case "newest":
        rows.sort(
          (a, b) =>
            byAvailability(a, b) ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        break; // "best" — already ranked by the scoring algorithm
    }
    return rows;
  }, [equipment, filters, user, hasArea]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const prices = filtered.map((r) => Number(r.price_per_day));
    return {
      avg: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
      min: Math.min(...prices),
      availableCount: filtered.filter((r) => r.available).length,
    };
  }, [filtered]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <Lock className="h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">{t("browse.loginTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("browse.loginDesc")}</p>
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
          <p className="mt-3 text-muted-foreground">{t("browse.setLocationDesc")}</p>
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
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t("browse.title")}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("browse.subtitle")}</p>

        <div className="mt-5">
          <TrustAssuranceBar />
        </div>

        <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          {t("browse.savedAreaNote")}
        </div>

        <div className="mt-6">
          <BrowseFilters value={filters} onChange={patch} onReset={() => setFilters(defaultFilters)} />
        </div>

        {/* Result summary */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <PackageSearch className="h-4 w-4 text-primary" />
            {filtered.length} {t("browse.foundSuffix")}
          </span>
          {stats && (
            <>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {stats.availableCount} {t("browse.availableNow")}
              </span>
              <span className="flex items-center gap-1">
                {t("browse.cheapest")}: <IndianRupee className="h-3 w-3" />
                {stats.min}
              </span>
              <span className="flex items-center gap-1">
                {t("browse.avgRate")}: <IndianRupee className="h-3 w-3" />
                {stats.avg}
              </span>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border bg-card">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-14 flex flex-col items-center text-center">
            <PackageSearch className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">{t("browse.noResults")}</p>
            <Button variant="outline" className="mt-4" onClick={() => setFilters(defaultFilters)}>
              {t("browse.clearAll")}
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((eq, i) => (
              <EquipmentCard key={eq.id} equipment={eq} rank={filters.sort === "best" ? i : undefined} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowseEquipment;
