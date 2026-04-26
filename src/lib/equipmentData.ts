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
  districts?: { name: string } | null;
  villages?: { name: string } | null;
  talukas?: { name: string } | null;
}

export const equipmentTypes = [
  { value: "all", label: "All Equipment" },
  { value: "tractor", label: "Tractor" },
  { value: "rotavator", label: "Rotavator" },
  { value: "harvester", label: "Harvester" },
  { value: "cultivator", label: "Cultivator" },
  { value: "sprayer", label: "Sprayer" },
  { value: "plough", label: "Plough" },
  { value: "seed_drill", label: "Seed Drill" },
  { value: "thresher", label: "Thresher" },
];

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
            (r.description ?? "").toLowerCase().includes(s)
        );
      }
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
}) {
  const { data, error } = await supabase.from("equipment").insert(equipment).select().single();
  if (error) throw error;
  return data as EquipmentRow;
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
