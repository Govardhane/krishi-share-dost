export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          advance_amount: number
          created_at: string
          duration_unit: string
          duration_value: number
          equipment_id: string
          id: string
          notes: string | null
          owner_user_id: string | null
          payment_mode: string
          payment_ref: string | null
          payment_status: string
          renter_name: string
          renter_phone: string
          renter_user_id: string
          start_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          advance_amount?: number
          created_at?: string
          duration_unit?: string
          duration_value?: number
          equipment_id: string
          id?: string
          notes?: string | null
          owner_user_id?: string | null
          payment_mode?: string
          payment_ref?: string | null
          payment_status?: string
          renter_name: string
          renter_phone: string
          renter_user_id: string
          start_date: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          advance_amount?: number
          created_at?: string
          duration_unit?: string
          duration_value?: number
          equipment_id?: string
          id?: string
          notes?: string | null
          owner_user_id?: string | null
          payment_mode?: string
          payment_ref?: string | null
          payment_status?: string
          renter_name?: string
          renter_phone?: string
          renter_user_id?: string
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          created_at: string
          id: string
          name: string
          state: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          state?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          state?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          advance_percent: number
          available: boolean
          brand: string | null
          condition: string | null
          created_at: string
          description: string | null
          district_id: string
          features: string[]
          hp: number | null
          id: string
          image_url: string | null
          model: string | null
          name: string
          owner_name: string
          owner_user_id: string | null
          payment_modes: string[]
          price_per_day: number
          price_per_hour: number
          quantity: number
          rating: number
          rating_count: number
          taluka_id: string | null
          tractor_class: string | null
          type: string
          updated_at: string
          upi_id: string | null
          village_id: string
          whatsapp: string
          year_of_purchase: number | null
        }
        Insert: {
          advance_percent?: number
          available?: boolean
          brand?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          district_id: string
          features?: string[]
          hp?: number | null
          id?: string
          image_url?: string | null
          model?: string | null
          name: string
          owner_name: string
          owner_user_id?: string | null
          payment_modes?: string[]
          price_per_day: number
          price_per_hour: number
          quantity?: number
          rating?: number
          rating_count?: number
          taluka_id?: string | null
          tractor_class?: string | null
          type: string
          updated_at?: string
          upi_id?: string | null
          village_id: string
          whatsapp: string
          year_of_purchase?: number | null
        }
        Update: {
          advance_percent?: number
          available?: boolean
          brand?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          district_id?: string
          features?: string[]
          hp?: number | null
          id?: string
          image_url?: string | null
          model?: string | null
          name?: string
          owner_name?: string
          owner_user_id?: string | null
          payment_modes?: string[]
          price_per_day?: number
          price_per_hour?: number
          quantity?: number
          rating?: number
          rating_count?: number
          taluka_id?: string | null
          tractor_class?: string | null
          type?: string
          updated_at?: string
          upi_id?: string | null
          village_id?: string
          whatsapp?: string
          year_of_purchase?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_taluka_id_fkey"
            columns: ["taluka_id"]
            isOneToOne: false
            referencedRelation: "talukas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district_id: string | null
          full_name: string | null
          id: string
          taluka_id: string | null
          updated_at: string
          user_id: string
          village_id: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          full_name?: string | null
          id?: string
          taluka_id?: string | null
          updated_at?: string
          user_id: string
          village_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          district_id?: string | null
          full_name?: string | null
          id?: string
          taluka_id?: string | null
          updated_at?: string
          user_id?: string
          village_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_taluka_id_fkey"
            columns: ["taluka_id"]
            isOneToOne: false
            referencedRelation: "talukas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      talukas: {
        Row: {
          created_at: string
          district_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          district_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          district_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "talukas_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      villages: {
        Row: {
          created_at: string
          district_id: string
          id: string
          name: string
          taluka_id: string | null
        }
        Insert: {
          created_at?: string
          district_id: string
          id?: string
          name: string
          taluka_id?: string | null
        }
        Update: {
          created_at?: string
          district_id?: string
          id?: string
          name?: string
          taluka_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "villages_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "villages_taluka_id_fkey"
            columns: ["taluka_id"]
            isOneToOne: false
            referencedRelation: "talukas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
