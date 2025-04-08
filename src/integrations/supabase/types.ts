export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      associations: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          amenity_id: string | null
          booked_by: string | null
          created_at: string
          end_time: string
          event_type: string
          hoa_id: string
          id: string
          start_time: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          amenity_id?: string | null
          booked_by?: string | null
          created_at?: string
          end_time: string
          event_type: string
          hoa_id: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          amenity_id?: string | null
          booked_by?: string | null
          created_at?: string
          end_time?: string
          event_type?: string
          hoa_id?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_hoa_id_fkey"
            columns: ["hoa_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          association_id: string
          category: string | null
          created_at: string
          description: string | null
          file_size: number
          file_type: string
          id: string
          is_archived: boolean | null
          is_public: boolean | null
          name: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
          uploaded_date: string
          url: string
        }
        Insert: {
          association_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          file_size: number
          file_type: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          uploaded_date?: string
          url: string
        }
        Update: {
          association_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: number
          file_type?: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          uploaded_date?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          profile_image_url: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          association_id: string
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          id: string
          property_type: string
          square_feet: number | null
          state: string | null
          unit_number: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address: string
          association_id: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          id?: string
          property_type: string
          square_feet?: number | null
          state?: string | null
          unit_number?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string
          association_id?: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          id?: string
          property_type?: string
          square_feet?: number | null
          state?: string | null
          unit_number?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          created_at: string
          email: string | null
          emergency_contact: string | null
          id: string
          is_primary: boolean | null
          move_in_date: string | null
          move_out_date: string | null
          name: string | null
          phone: string | null
          property_id: string | null
          resident_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_primary?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          name?: string | null
          phone?: string | null
          property_id?: string | null
          resident_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_primary?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          name?: string | null
          phone?: string | null
          property_id?: string | null
          resident_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
