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

// Best-value score: better rating, more features, more power, lower rate = higher rank
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
      // Best value first (rating + features + power vs rate)
      rows = [...rows].sort((a, b) => valueScore(b) - valueScore(a));
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
