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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      af1_coupons: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent: number
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      af1_profiles: {
        Row: {
          consent_at: string
          created_at: string
          id: string
          nickname: string
        }
        Insert: {
          consent_at: string
          created_at?: string
          id: string
          nickname: string
        }
        Update: {
          consent_at?: string
          created_at?: string
          id?: string
          nickname?: string
        }
        Relationships: []
      }
      af1_scratches: {
        Row: {
          coupon_id: string | null
          created_at: string
          id: string
          redeemed_at: string | null
          revealed_at: string | null
          sneaker_id: string
          status: string
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          id?: string
          redeemed_at?: string | null
          revealed_at?: string | null
          sneaker_id: string
          status?: string
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          id?: string
          redeemed_at?: string | null
          revealed_at?: string | null
          sneaker_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "af1_scratches_coupon_fk"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "af1_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "af1_scratches_sneaker_id_fkey"
            columns: ["sneaker_id"]
            isOneToOne: false
            referencedRelation: "af1_sneakers"
            referencedColumns: ["id"]
          },
        ]
      }
      af1_settings: {
        Row: {
          description: string | null
          key: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          value?: Json
        }
        Relationships: []
      }
      af1_sneaker_images: {
        Row: {
          alt: string
          created_at: string
          id: string
          position: number
          sneaker_id: string
          url: string
        }
        Insert: {
          alt: string
          created_at?: string
          id?: string
          position?: number
          sneaker_id: string
          url: string
        }
        Update: {
          alt?: string
          created_at?: string
          id?: string
          position?: number
          sneaker_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "af1_sneaker_images_sneaker_id_fkey"
            columns: ["sneaker_id"]
            isOneToOne: false
            referencedRelation: "af1_sneakers"
            referencedColumns: ["id"]
          },
        ]
      }
      af1_sneakers: {
        Row: {
          active: boolean
          color_hex: string
          color_name: string
          created_at: string
          draw_weight: number
          id: string
          keywords: string[]
          meaning: string
          name: string
          rarity: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          color_hex: string
          color_name: string
          created_at?: string
          draw_weight?: number
          id?: string
          keywords?: string[]
          meaning?: string
          name: string
          rarity?: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          color_hex?: string
          color_name?: string
          created_at?: string
          draw_weight?: number
          id?: string
          keywords?: string[]
          meaning?: string
          name?: string
          rarity?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      af1_unlocks: {
        Row: {
          scratch_id: string | null
          sneaker_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          scratch_id?: string | null
          sneaker_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          scratch_id?: string | null
          sneaker_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "af1_unlocks_scratch_fk"
            columns: ["scratch_id"]
            isOneToOne: false
            referencedRelation: "af1_scratches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "af1_unlocks_sneaker_id_fkey"
            columns: ["sneaker_id"]
            isOneToOne: false
            referencedRelation: "af1_sneakers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      af1_draw_sneaker: { Args: { p_user_id: string }; Returns: string }
      af1_get_or_create_scratch: { Args: never; Returns: Json }
      af1_mark_scratch_revealed: {
        Args: { p_scratch_id: string }
        Returns: Json
      }
      af1_new_coupon_code: { Args: never; Returns: string }
      af1_redeem_scratch: { Args: { p_scratch_id: string }; Returns: Json }
      af1_scratch_payload: {
        Args: {
          p_scratch: Database["public"]["Tables"]["af1_scratches"]["Row"]
        }
        Returns: Json
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
