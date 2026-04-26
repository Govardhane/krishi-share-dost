import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  whatsapp: string | null;
  district_id: string | null;
  taluka_id: string | null;
  village_id: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      // Try update first; if no row, insert.
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", user.id)
          .select()
          .single();
        if (error) throw error;
        return data as Profile;
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .insert({ user_id: user.id, ...updates })
          .select()
          .single();
        if (error) throw error;
        return data as Profile;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}
