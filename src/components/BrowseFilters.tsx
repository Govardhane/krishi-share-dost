import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  equipmentTypes,
  featureOptions,
  paymentModeOptions,
  useDistricts,
  useTalukas,
  useVillages,
} from "@/lib/equipmentData";

export type SortKey = "best" | "price_low" | "price_high" | "rating" | "hp" | "newest";

export interface BrowseFilterState {
  search: string;
  type: string;
  districtId: string;
  talukaId: string;
  villageId: string;
  sort: SortKey;
  maxDayPrice: number;
  minHp: number;
  features: string[];
  onlyAvailable: boolean;
  paymentMode: string;
}

export const defaultFilters: BrowseFilterState = {
  search: "",
  type: "all",
  districtId: "all",
  talukaId: "all",
  villageId: "all",
  sort: "best",
  maxDayPrice: 0,
  minHp: 0,
  features: [],
  onlyAvailable: false,
  paymentMode: "all",
};

export const PRICE_CEILING = 20000;

interface Props {
  value: BrowseFilterState;
  onChange: (patch: Partial<BrowseFilterState>) => void;
  onReset: () => void;
}

const BrowseFilters = ({ value, onChange, onReset }: Props) => {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const { data: districts } = useDistricts();
  const { data: talukas } = useTalukas(value.districtId !== "all" ? value.districtId : undefined);
  const { data: villages } = useVillages(value.talukaId !== "all" ? value.talukaId : undefined);

  const advancedCount =
    (value.maxDayPrice > 0 ? 1 : 0) +
    (value.minHp > 0 ? 1 : 0) +
    value.features.length +
    (value.onlyAvailable ? 1 : 0) +
    (value.paymentMode !== "all" ? 1 : 0) +
    (value.type !== "all" ? 1 : 0) +
    (value.search ? 1 : 0);

  const toggleFeature = (f: string) =>
    onChange({
      features: value.features.includes(f)
        ? value.features.filter((x) => x !== f)
        : [...value.features, f],
    });

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "best", label: t("browse.sortBest") },
    { value: "price_low", label: t("browse.sortPriceLow") },
    { value: "price_high", label: t("browse.sortPriceHigh") },
    { value: "rating", label: t("browse.sortRating") },
    { value: "hp", label: t("browse.sortHp") },
    { value: "newest", label: t("browse.sortNewest") },
  ];

  return (
    <div className="rounded-2xl border bg-card/80 p-4 shadow-card backdrop-blur">
      {/* Row 1: search + type + sort */}
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("browse.searchPlaceholder")}
            className="pl-10"
            value={value.search}
            onChange={(e) => onChange({ search: e.target.value })}
          />
          {value.search && (
            <button
              type="button"
              aria-label={t("browse.clearAll")}
              onClick={() => onChange({ search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={value.type} onValueChange={(v) => onChange({ type: v })}>
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

        <Select value={value.sort} onValueChange={(v) => onChange({ sort: v as SortKey })}>
          <SelectTrigger aria-label={t("browse.sortBy")}>
            <SelectValue placeholder={t("browse.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: location chain */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Select
          value={value.districtId}
          onValueChange={(v) => onChange({ districtId: v, talukaId: "all", villageId: "all" })}
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
          value={value.talukaId}
          onValueChange={(v) => onChange({ talukaId: v, villageId: "all" })}
          disabled={value.districtId === "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("browse.talukaPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("browse.allTalukas")}</SelectItem>
            {talukas?.map((tk) => (
              <SelectItem key={tk.id} value={tk.id}>
                {tk.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.villageId}
          onValueChange={(v) => onChange({ villageId: v })}
          disabled={value.talukaId === "all"}
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

      {/* Toggle advanced */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
          <SlidersHorizontal className="h-4 w-4" />
          {open ? t("browse.hideFilters") : t("browse.moreFilters")}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
        {advancedCount > 0 && (
          <>
            <Badge variant="secondary">
              {advancedCount} {t("browse.filtersActive")}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-3.5 w-3.5" />
              {t("browse.clearAll")}
            </Button>
          </>
        )}
      </div>

      {open && (
        <div className="mt-4 grid gap-5 border-t pt-4 md:grid-cols-2">
          <div>
            <Label className="text-xs">
              {t("browse.maxDayPrice")}:{" "}
              <span className="font-semibold text-foreground">
                {value.maxDayPrice > 0 ? `₹${value.maxDayPrice}` : t("browse.anyHp")}
              </span>
            </Label>
            <Slider
              className="mt-3"
              min={0}
              max={PRICE_CEILING}
              step={250}
              value={[value.maxDayPrice]}
              onValueChange={([v]) => onChange({ maxDayPrice: v })}
            />
          </div>

          <div>
            <Label className="text-xs">
              {t("browse.minHp")}:{" "}
              <span className="font-semibold text-foreground">
                {value.minHp > 0 ? `${value.minHp} ${t("card.hp")}` : t("browse.anyHp")}
              </span>
            </Label>
            <Slider
              className="mt-3"
              min={0}
              max={150}
              step={5}
              value={[value.minHp]}
              onValueChange={([v]) => onChange({ minHp: v })}
            />
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs">{t("browse.features")}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {featureOptions.map((f) => {
                const active = value.features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs">{t("browse.paymentMode")}</Label>
            <Select value={value.paymentMode} onValueChange={(v) => onChange({ paymentMode: v })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("browse.anyPayment")}</SelectItem>
                {paymentModeOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 md:mt-6">
            <Label htmlFor="only-available" className="text-xs">
              {t("browse.onlyAvailable")}
            </Label>
            <Switch
              id="only-available"
              checked={value.onlyAvailable}
              onCheckedChange={(c) => onChange({ onlyAvailable: c })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseFilters;
