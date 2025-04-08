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
      amenities: {
        Row: {
          association_id: string
          booking_fee: number | null
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          requires_approval: boolean | null
          updated_at: string
        }
        Insert: {
          association_id: string
          booking_fee?: number | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          association_id?: string
          booking_fee?: number | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          requires_approval?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenities_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          association_id: string
          author_id: string | null
          content: string
          created_at: string
          expiry_date: string | null
          id: string
          is_published: boolean | null
          priority: string | null
          publish_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          association_id: string
          author_id?: string | null
          content: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          publish_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          association_id?: string
          author_id?: string | null
          content?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          publish_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_types: {
        Row: {
          association_id: string
          created_at: string
          description: string | null
          id: string
          is_recurring: boolean | null
          name: string
          recurrence_period: string | null
          updated_at: string
        }
        Insert: {
          association_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          name: string
          recurrence_period?: string | null
          updated_at?: string
        }
        Update: {
          association_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string
          recurrence_period?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_types_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          amount: number
          assessment_type_id: string | null
          created_at: string
          due_date: string
          id: string
          late_fee: number | null
          paid: boolean | null
          payment_date: string | null
          property_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          assessment_type_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          late_fee?: number | null
          paid?: boolean | null
          payment_date?: string | null
          property_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          assessment_type_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          late_fee?: number | null
          paid?: boolean | null
          payment_date?: string | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      association_users: {
        Row: {
          association_id: string
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          association_id: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          association_id?: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_users_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "association_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          color: string | null
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
          color?: string | null
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
          color?: string | null
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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string
          parent_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id: string
          parent_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_issues: {
        Row: {
          association_id: string
          created_at: string
          description: string | null
          due_date: string | null
          fine_amount: number | null
          id: string
          property_id: string
          resident_id: string | null
          resolved_date: string | null
          status: string
          updated_at: string
          violation_type: string
        }
        Insert: {
          association_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          fine_amount?: number | null
          id?: string
          property_id: string
          resident_id?: string | null
          resolved_date?: string | null
          status?: string
          updated_at?: string
          violation_type: string
        }
        Update: {
          association_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          fine_amount?: number | null
          id?: string
          property_id?: string
          resident_id?: string | null
          resolved_date?: string | null
          status?: string
          updated_at?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_issues_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_issues_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_issues_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
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
      import_jobs: {
        Row: {
          association_id: string
          created_at: string | null
          created_by: string | null
          error_details: Json | null
          file_name: string
          file_size: number
          id: string
          import_type: string
          rows_failed: number | null
          rows_processed: number | null
          rows_succeeded: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          created_by?: string | null
          error_details?: Json | null
          file_name: string
          file_size: number
          id?: string
          import_type: string
          rows_failed?: number | null
          rows_processed?: number | null
          rows_succeeded?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          error_details?: Json | null
          file_name?: string
          file_size?: number
          id?: string
          import_type?: string
          rows_failed?: number | null
          rows_processed?: number | null
          rows_succeeded?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_mappings: {
        Row: {
          association_id: string
          created_at: string | null
          created_by: string | null
          id: string
          import_type: string
          mappings: Json
          updated_at: string | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          import_type: string
          mappings: Json
          updated_at?: string | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          import_type?: string
          mappings?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_mappings_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_mappings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          additional_requirements: string | null
          address_line2: string | null
          association_name: string | null
          association_type: string | null
          city: string | null
          company: string | null
          created_at: string
          current_management: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          name: string
          notes: string | null
          number_of_units: number | null
          phone: string | null
          source: string
          state: string | null
          status: string
          street_address: string | null
          updated_at: string
          uploaded_files: Json | null
          zip: string | null
        }
        Insert: {
          additional_requirements?: string | null
          address_line2?: string | null
          association_name?: string | null
          association_type?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          current_management?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          name: string
          notes?: string | null
          number_of_units?: number | null
          phone?: string | null
          source?: string
          state?: string | null
          status?: string
          street_address?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          zip?: string | null
        }
        Update: {
          additional_requirements?: string | null
          address_line2?: string | null
          association_name?: string | null
          association_type?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          current_management?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string
          notes?: string | null
          number_of_units?: number | null
          phone?: string | null
          source?: string
          state?: string | null
          status?: string
          street_address?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          zip?: string | null
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          priority: string
          property_id: string
          resolved_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          property_id: string
          resolved_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          property_id?: string
          resolved_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      user_has_association_access: {
        Args: { association_uuid: string; min_role?: string }
        Returns: boolean
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
