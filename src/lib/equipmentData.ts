import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  // joined
  districts?: { name: string };
  villages?: { name: string };
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

export function useDistricts() {
  return useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name, state")
        .order("name");
      if (error) throw error;
      return data as District[];
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
        .select("id, name, district_id")
        .eq("district_id", districtId)
        .order("name");
      if (error) throw error;
      return data as Taluka[];
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
        .select("id, name, district_id, taluka_id")
        .eq("taluka_id", talukaId)
        .order("name");
      if (error) throw error;
      return data as Village[];
    },
    enabled: !!talukaId,
  });
}

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
      let query = supabase
        .from("equipment")
        .select("*, districts(name), villages(name), talukas(name)")
        .order("created_at", { ascending: false });

      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters?.districtId && filters.districtId !== "all") {
        query = query.eq("district_id", filters.districtId);
      }
      if (filters?.talukaId && filters.talukaId !== "all") {
        query = query.eq("taluka_id", filters.talukaId);
      }
      if (filters?.villageId && filters.villageId !== "all") {
        query = query.eq("village_id", filters.villageId);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EquipmentRow[];
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
  const { data, error } = await supabase.from("equipment").insert(equipment).select();
  if (error) throw error;
  return data;
}

export async function uploadEquipmentPhoto(file: File, userId: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("equipment-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("equipment-photos").getPublicUrl(path);
  return data.publicUrl;
}
