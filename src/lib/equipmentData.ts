import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface District {
  id: string;
  name: string;
  state: string;
}

export interface Taluka {
  id: string;
  name: string;
  district_id: string;
}

export interface Village {
  id: string;
  name: string;
  district_id: string;
  taluka_id: string | null;
}

export interface EquipmentRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
  price_per_hour: number;
  price_per_day: number;
  owner_name: string;
  whatsapp: string;
  village_id: string;
  district_id: string;
  taluka_id: string | null;
  available: boolean;
  quantity: number;
  image_url: string | null;
  created_at: string;
  brand: string | null;
  model: string | null;
  hp: number | null;
  tractor_class: string | null;
  year_of_purchase: number | null;
  condition: string | null;
  features: string[];
  payment_modes: string[];
  advance_percent: number;
  upi_id: string | null;
  phonepe_number: string | null;
  payment_qr_url: string | null;
  rating: number;
  rating_count: number;
  owner_user_id?: string | null;
  districts?: { name: string } | null;
  villages?: { name: string } | null;
  talukas?: { name: string } | null;
}

export const equipmentTypes = [
  { value: "all", label: "All Equipment" },
  { value: "tractor_small", label: "Small Tractor (11–40 HP)" },
  { value: "tractor_big", label: "Big Tractor (50–130+ HP)" },
  { value: "tractor", label: "Tractor (other)" },
  { value: "rotavator", label: "Rotavator" },
  { value: "harvester", label: "Harvester" },
  { value: "cultivator", label: "Cultivator" },
  { value: "sprayer", label: "Sprayer" },
  { value: "plough", label: "Plough" },
  { value: "seed_drill", label: "Seed Drill" },
  { value: "thresher", label: "Thresher" },
];

export const tractorClasses = [
  {
    value: "small",
    label: "Small Tractor",
    hp: "11 – 40 HP",
    farm: "Small farms (1–10 acre)",
    usage: "Light work (sowing, spraying)",
  },
  {
    value: "big",
    label: "Big Tractor",
    hp: "50 – 130+ HP",
    farm: "Large farms (10+ acre)",
    usage: "Heavy work (ploughing, harvesting)",
  },
];

export const featureOptions = [
  "4WD",
  "Power Steering",
  "Oil Immersed Brakes",
  "Dual Clutch",
  "Hydraulic Lift",
  "PTO Attachment",
  "Trolley Included",
  "Driver Included",
  "Fuel Included",
  "AC Cabin",
];

export const paymentModeOptions = [
  { value: "advance_cash", label: "Advance Cash" },
  { value: "online", label: "Online (Card / Netbanking)" },
  { value: "upi", label: "UPI" },
];

// ---------- Smart ranking algorithm ----------
// Multi-criteria decision scoring (min-max normalised, weighted) so that
// comparisons are relative to the equipment actually available in the area,
// instead of arbitrary magic numbers.
const RANK_WEIGHTS = {
  price: 0.3, // cheaper per-day rate = better
  rating: 0.22, // quality signal
  trust: 0.1, // number of ratings (confidence, log-scaled)
  features: 0.14, // more useful attachments/features
  power: 0.1, // HP suitability
  freshness: 0.06, // newer machine / recent listing
  availability: 0.05,
  payment: 0.03, // more payment options = more convenient
} as const;

function norm(value: number, min: number, max: number) {
  if (!isFinite(value)) return 0;
  if (max - min <= 0) return 0.5;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

const bayesianRating = (rating: number, count: number, mean: number) => {
  const C = 3; // smoothing: needs ~3 ratings before full weight
  return (count * (Number(rating) || 0) + C * mean) / ((count || 0) + C);
};

export function rankEquipment(rows: EquipmentRow[]) {
  if (rows.length <= 1) return [...rows];

  const prices = rows.map((r) => Number(r.price_per_day) || 0).filter((p) => p > 0);
  const minPrice = Math.min(...prices, Infinity);
  const maxPrice = Math.max(...prices, 0);
  const maxFeatures = Math.max(...rows.map((r) => r.features?.length || 0), 1);
  const maxHp = Math.max(...rows.map((r) => r.hp || 0), 1);
  const rated = rows.filter((r) => (r.rating_count || 0) > 0);
  const meanRating = rated.length
    ? rated.reduce((s, r) => s + (Number(r.rating) || 0), 0) / rated.length
    : 3.5;
  const maxCount = Math.max(...rows.map((r) => r.rating_count || 0), 1);
  const now = Date.now();
  const currentYear = new Date().getFullYear();

  const scored = rows.map((e) => {
    const price = Number(e.price_per_day) || 0;
    // invert: lower price scores higher
    const priceScore = price > 0 ? 1 - norm(price, minPrice, maxPrice) : 0.4;

    const ratingScore = norm(bayesianRating(Number(e.rating) || 0, e.rating_count || 0, meanRating), 1, 5);
    const trustScore = Math.log1p(e.rating_count || 0) / Math.log1p(maxCount);
    const featureScore = (e.features?.length || 0) / maxFeatures;
    const powerScore = e.hp ? norm(e.hp, 0, maxHp) : 0.35;

    const ageYears = e.year_of_purchase ? Math.max(0, currentYear - e.year_of_purchase) : 8;
    const conditionBonus =
      e.condition === "excellent" ? 1 : e.condition === "good" ? 0.7 : e.condition === "average" ? 0.4 : 0.5;
    const listedDays = (now - new Date(e.created_at).getTime()) / 86_400_000;
    const freshnessScore =
      0.6 * Math.max(0, 1 - ageYears / 15) + 0.25 * conditionBonus + 0.15 * Math.max(0, 1 - listedDays / 90);

    const availabilityScore = e.available ? 1 : 0;
    const paymentScore = Math.min(1, (e.payment_modes?.length || 1) / 3);

    const score =
      RANK_WEIGHTS.price * priceScore +
      RANK_WEIGHTS.rating * ratingScore +
      RANK_WEIGHTS.trust * trustScore +
      RANK_WEIGHTS.features * featureScore +
      RANK_WEIGHTS.power * powerScore +
      RANK_WEIGHTS.freshness * freshnessScore +
      RANK_WEIGHTS.availability * availabilityScore +
      RANK_WEIGHTS.payment * paymentScore;

    return { e, score };
  });

  return scored
    .sort((a, b) => {
      // unavailable machines always after available ones
      if (a.e.available !== b.e.available) return a.e.available ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      return (Number(a.e.price_per_day) || 0) - (Number(b.e.price_per_day) || 0);
    })
    .map((s) => s.e);
}

// Kept for backwards compatibility (single-item heuristic score)
export function valueScore(e: EquipmentRow) {
  const priceScore = e.price_per_day > 0 ? 4000 / e.price_per_day : 0;
  return (
    (Number(e.rating) || 0) * 12 +
    Math.min(e.rating_count || 0, 20) * 0.5 +
    (e.features?.length || 0) * 4 +
    (e.hp ? Math.min(e.hp, 130) / 20 : 0) +
    priceScore * 6 +
    (e.available ? 15 : 0)
  );
}


// ---------- Locations ----------
export function useDistricts() {
  return useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("districts").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as District[];
    },
  });
}

export function useTalukas(districtId?: string) {
  return useQuery({
    queryKey: ["talukas", districtId],
    queryFn: async () => {
      if (!districtId) return [] as Taluka[];
      const { data, error } = await supabase
        .from("talukas")
        .select("*")
        .eq("district_id", districtId)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Taluka[];
    },
    enabled: !!districtId,
  });
}

export function useVillages(talukaId?: string) {
  return useQuery({
    queryKey: ["villages", talukaId],
    queryFn: async () => {
      if (!talukaId) return [] as Village[];
      const { data, error } = await supabase
        .from("villages")
        .select("*")
        .eq("taluka_id", talukaId)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Village[];
    },
    enabled: !!talukaId,
  });
}

// ---------- Equipment ----------
export function useEquipment(filters?: {
  type?: string;
  districtId?: string;
  talukaId?: string;
  villageId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["equipment", filters],
    queryFn: async () => {
      let q = supabase
        .from("equipment")
        .select("*, districts(name), talukas(name), villages(name)")
        .order("created_at", { ascending: false });

      if (filters?.type && filters.type !== "all") q = q.eq("type", filters.type);
      if (filters?.districtId && filters.districtId !== "all") q = q.eq("district_id", filters.districtId);
      if (filters?.talukaId && filters.talukaId !== "all") q = q.eq("taluka_id", filters.talukaId);
      if (filters?.villageId && filters.villageId !== "all") q = q.eq("village_id", filters.villageId);

      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as EquipmentRow[];

      if (filters?.search) {
        const s = filters.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().includes(s) ||
            r.owner_name.toLowerCase().includes(s) ||
            (r.brand ?? "").toLowerCase().includes(s) ||
            (r.model ?? "").toLowerCase().includes(s) ||
            (r.description ?? "").toLowerCase().includes(s)
        );
      }
      // Smart best-value ranking (normalised multi-criteria score)
      rows = rankEquipment(rows);
      return rows;
    },
  });
}

export async function insertEquipment(equipment: {
  name: string;
  type: string;
  description: string;
  price_per_hour: number;
  price_per_day: number;
  owner_name: string;
  whatsapp: string;
  village_id: string;
  taluka_id: string;
  district_id: string;
  quantity: number;
  owner_user_id: string;
  image_url?: string | null;
  brand?: string | null;
  model?: string | null;
  hp?: number | null;
  tractor_class?: string | null;
  year_of_purchase?: number | null;
  condition?: string | null;
  features?: string[];
  payment_modes?: string[];
  advance_percent?: number;
  upi_id?: string | null;
  phonepe_number?: string | null;
  payment_qr_url?: string | null;
}) {
  const { data, error } = await supabase.from("equipment").insert(equipment).select().single();
  if (error) throw error;
  return data as EquipmentRow;
}

// ---------- Bookings ----------
export interface BookingInput {
  equipment_id: string;
  renter_user_id: string;
  owner_user_id: string | null;
  renter_name: string;
  renter_phone: string;
  start_date: string;
  duration_unit: "hour" | "day";
  duration_value: number;
  total_amount: number;
  advance_amount: number;
  payment_mode: string;
  payment_status: string;
  payment_ref?: string | null;
  notes?: string | null;
}

export async function createBooking(booking: BookingInput) {
  const { data, error } = await supabase.from("bookings").insert(booking).select().single();
  if (error) throw error;
  return data;
}

export function useMyBookings(userId?: string) {
  return useQuery({
    queryKey: ["my-bookings", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, equipment(name, owner_name, whatsapp)")
        .or(`renter_user_id.eq.${userId},owner_user_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}


export function useMyEquipment(userId?: string) {
  return useQuery({
    queryKey: ["my-equipment", userId],
    queryFn: async () => {
      if (!userId) return [] as EquipmentRow[];
      const { data, error } = await supabase
        .from("equipment")
        .select("*, districts(name), talukas(name), villages(name)")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EquipmentRow[];
    },
    enabled: !!userId,
  });
}

export async function deleteEquipment(id: string) {
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadEquipmentPhoto(file: File, userId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("equipment-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("equipment-photos").getPublicUrl(path);
  return data.publicUrl;
}
