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
      ai_settings: {
        Row: {
          created_at: string | null
          id: string
          max_tokens: number | null
          model: string | null
          prompt_templates: Json | null
          temperature: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          prompt_templates?: Json | null
          temperature?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          prompt_templates?: Json | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      association_member_roles: {
        Row: {
          association_id: string
          created_at: string
          id: string
          role_name: string
          role_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          association_id: string
          created_at?: string
          id?: string
          role_name: string
          role_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          association_id?: string
          created_at?: string
          id?: string
          role_name?: string
          role_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_member_roles_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
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
          city: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          description: string | null
          fire_inspection_due: string | null
          founded_date: string | null
          id: string
          insurance_expiration: string | null
          is_archived: boolean | null
          name: string
          phone: string | null
          property_type: string | null
          state: string | null
          total_units: number | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          fire_inspection_due?: string | null
          founded_date?: string | null
          id?: string
          insurance_expiration?: string | null
          is_archived?: boolean | null
          name: string
          phone?: string | null
          property_type?: string | null
          state?: string | null
          total_units?: number | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          fire_inspection_due?: string | null
          founded_date?: string | null
          id?: string
          insurance_expiration?: string | null
          is_archived?: boolean | null
          name?: string
          phone?: string | null
          property_type?: string | null
          state?: string | null
          total_units?: number | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      bid_request_vendors: {
        Row: {
          bid_request_id: string
          created_at: string
          id: string
          quote_amount: number | null
          quote_details: Json | null
          status: string
          submitted_at: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          bid_request_id: string
          created_at?: string
          id?: string
          quote_amount?: number | null
          quote_details?: Json | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          bid_request_id?: string
          created_at?: string
          id?: string
          quote_amount?: number | null
          quote_details?: Json | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_request_vendors_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_requests: {
        Row: {
          assigned_to: string | null
          association_id: string
          attachments: Json | null
          budget: number | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          image_url: string | null
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          assigned_to?: string | null
          association_id: string
          attachments?: Json | null
          budget?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          image_url?: string | null
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          assigned_to?: string | null
          association_id?: string
          attachments?: Json | null
          budget?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          image_url?: string | null
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_requests_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          amenity_id: string | null
          booked_by: string | null
          color: string | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          hoa_id: string
          id: string
          location: string | null
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
          description?: string | null
          end_time: string
          event_type: string
          hoa_id: string
          id?: string
          location?: string | null
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
          description?: string | null
          end_time?: string
          event_type?: string
          hoa_id?: string
          id?: string
          location?: string | null
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
      campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_date: string | null
          created_at: string
          email: string
          id: string
          lead_id: string | null
          opened_date: string | null
          sent_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicked_date?: string | null
          created_at?: string
          email: string
          id?: string
          lead_id?: string | null
          opened_date?: string | null
          sent_date?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicked_date?: string | null
          created_at?: string
          email?: string
          id?: string
          lead_id?: string | null
          opened_date?: string | null
          sent_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
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
      communications_log: {
        Row: {
          communication_type: string
          created_at: string
          homeowner_request_id: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          received_at: string
          status: string
          tracking_number: string
          updated_at: string
        }
        Insert: {
          communication_type: string
          created_at?: string
          homeowner_request_id?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          received_at?: string
          status?: string
          tracking_number: string
          updated_at?: string
        }
        Update: {
          communication_type?: string
          created_at?: string
          homeowner_request_id?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          received_at?: string
          status?: string
          tracking_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_log_homeowner_request_id_fkey"
            columns: ["homeowner_request_id"]
            isOneToOne: false
            referencedRelation: "homeowner_requests"
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
      document_versions: {
        Row: {
          created_at: string
          created_by: string | null
          document_id: string
          file_size: number
          id: string
          notes: string | null
          url: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_id: string
          file_size: number
          id?: string
          notes?: string | null
          url: string
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_id?: string
          file_size?: number
          id?: string
          notes?: string | null
          url?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          association_id: string
          category: string | null
          created_at: string
          current_version: number | null
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
          current_version?: number | null
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
          current_version?: number | null
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
      email_campaigns: {
        Row: {
          body: string
          click_count: number
          created_at: string
          id: string
          name: string
          open_count: number
          recipient_count: number
          scheduled_date: string | null
          sent_date: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          click_count?: number
          created_at?: string
          id?: string
          name: string
          open_count?: number
          recipient_count?: number
          scheduled_date?: string | null
          sent_date?: string | null
          status: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          click_count?: number
          created_at?: string
          id?: string
          name?: string
          open_count?: number
          recipient_count?: number
          scheduled_date?: string | null
          sent_date?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_workflows: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          settings: Json | null
          template_id: string | null
          trigger_event: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          settings?: Json | null
          template_id?: string | null
          trigger_event?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          settings?: Json | null
          template_id?: string | null
          trigger_event?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_workflows_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      homeowner_requests: {
        Row: {
          assigned_to: string | null
          association_id: string | null
          created_at: string
          description: string
          html_content: string | null
          id: string
          priority: string
          property_id: string | null
          resident_id: string | null
          resolved_at: string | null
          status: string
          title: string
          tracking_number: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          association_id?: string | null
          created_at?: string
          description: string
          html_content?: string | null
          id?: string
          priority?: string
          property_id?: string | null
          resident_id?: string | null
          resolved_at?: string | null
          status?: string
          title: string
          tracking_number?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          association_id?: string | null
          created_at?: string
          description?: string
          html_content?: string | null
          id?: string
          priority?: string
          property_id?: string | null
          resident_id?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          tracking_number?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
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
      invoices: {
        Row: {
          amount: number
          association_id: string | null
          association_name: string | null
          created_at: string
          description: string | null
          due_date: string | null
          html_content: string | null
          id: string
          invoice_date: string | null
          invoice_number: string
          status: string
          tracking_number: string | null
          updated_at: string
          vendor: string
        }
        Insert: {
          amount: number
          association_id?: string | null
          association_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          html_content?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          vendor: string
        }
        Update: {
          amount?: number
          association_id?: string | null
          association_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          html_content?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          vendor?: string
        }
        Relationships: []
      }
      lead_documents: {
        Row: {
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          lead_id: string
          name: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          lead_id: string
          name: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          lead_id?: string
          name?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
          html_content: string | null
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
          tracking_number: string | null
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
          html_content?: string | null
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
          tracking_number?: string | null
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
          html_content?: string | null
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
          tracking_number?: string | null
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
      onboarding_documents: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
          project_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
          project_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "onboarding_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_project_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          due_date: string
          id: string
          notes: string | null
          project_id: string
          stage_name: string
          status: string
          task_name: string
          task_type: string
          template_task_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          project_id: string
          stage_name?: string
          status?: string
          task_name?: string
          task_type?: string
          template_task_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          project_id?: string
          stage_name?: string
          status?: string
          task_name?: string
          task_type?: string
          template_task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "onboarding_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_project_tasks_template_task_id_fkey"
            columns: ["template_task_id"]
            isOneToOne: false
            referencedRelation: "onboarding_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_projects: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          name: string
          start_date: string
          status: string
          target_completion_date: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          name: string
          start_date?: string
          status?: string
          target_completion_date?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          name?: string
          start_date?: string
          status?: string
          target_completion_date?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_stages: {
        Row: {
          created_at: string
          description: string | null
          estimated_days: number | null
          id: string
          name: string
          order_index: number
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          id?: string
          name: string
          order_index: number
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          id?: string
          name?: string
          order_index?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_stages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          assigned_role: string | null
          created_at: string
          description: string | null
          estimated_days: number | null
          id: string
          name: string
          order_index: number
          stage_id: string
          task_type: string
          updated_at: string
        }
        Insert: {
          assigned_role?: string | null
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          id?: string
          name: string
          order_index: number
          stage_id: string
          task_type?: string
          updated_at?: string
        }
        Update: {
          assigned_role?: string | null
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          id?: string
          name?: string
          order_index?: number
          stage_id?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "onboarding_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          created_at: string
          description: string | null
          estimated_days: number | null
          icon: string | null
          id: string
          name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          icon?: string | null
          id?: string
          name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_days?: number | null
          icon?: string | null
          id?: string
          name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
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
      proposal_attachments: {
        Row: {
          content_type: string
          created_at: string
          id: string
          name: string
          proposal_id: string | null
          size: number | null
          type: string
          url: string
        }
        Insert: {
          content_type: string
          created_at?: string
          id?: string
          name: string
          proposal_id?: string | null
          size?: number | null
          type: string
          url: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          name?: string
          proposal_id?: string | null
          size?: number | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_attachments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_requests: {
        Row: {
          additional_details: string | null
          address: Json
          bid_request_type: string | null
          community_name: string
          cpa_service: string | null
          created_at: string | null
          created_by: string | null
          fence_location: string | null
          id: string
          number_of_bids: number
          project_type: string
          road_work_types: string[] | null
          status: string
          updated_at: string | null
          work_location: string | null
        }
        Insert: {
          additional_details?: string | null
          address: Json
          bid_request_type?: string | null
          community_name: string
          cpa_service?: string | null
          created_at?: string | null
          created_by?: string | null
          fence_location?: string | null
          id?: string
          number_of_bids: number
          project_type: string
          road_work_types?: string[] | null
          status?: string
          updated_at?: string | null
          work_location?: string | null
        }
        Update: {
          additional_details?: string | null
          address?: Json
          bid_request_type?: string | null
          community_name?: string
          cpa_service?: string | null
          created_at?: string | null
          created_by?: string | null
          fence_location?: string | null
          id?: string
          number_of_bids?: number
          project_type?: string
          road_work_types?: string[] | null
          status?: string
          updated_at?: string | null
          work_location?: string | null
        }
        Relationships: []
      }
      proposal_templates: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          amount: number
          analytics_data: Json | null
          client_portal_link: string | null
          content: string
          created_at: string
          id: string
          lead_id: string
          name: string
          responded_date: string | null
          sections: Json | null
          sent_date: string | null
          signature_data: string | null
          signature_required: boolean | null
          signed_by: string | null
          signed_date: string | null
          status: string
          template_id: string | null
          updated_at: string
          viewed_date: string | null
        }
        Insert: {
          amount?: number
          analytics_data?: Json | null
          client_portal_link?: string | null
          content: string
          created_at?: string
          id?: string
          lead_id: string
          name: string
          responded_date?: string | null
          sections?: Json | null
          sent_date?: string | null
          signature_data?: string | null
          signature_required?: boolean | null
          signed_by?: string | null
          signed_date?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          viewed_date?: string | null
        }
        Update: {
          amount?: number
          analytics_data?: Json | null
          client_portal_link?: string | null
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          name?: string
          responded_date?: string | null
          sections?: Json | null
          sent_date?: string | null
          signature_data?: string | null
          signature_required?: boolean | null
          signed_by?: string | null
          signed_date?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          viewed_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      recipient_groups: {
        Row: {
          association_id: string
          created_at: string
          criteria: Json | null
          description: string | null
          group_type: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          association_id: string
          created_at?: string
          criteria?: Json | null
          description?: string | null
          group_type: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          association_id?: string
          created_at?: string
          criteria?: Json | null
          description?: string | null
          group_type?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipient_groups_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_events: {
        Row: {
          color: string | null
          created_at: string
          date: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          property: string | null
          start_time: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          date: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          property?: string | null
          start_time: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          property?: string | null
          start_time?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          column_preferences: Json | null
          created_at: string | null
          id: string
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          column_preferences?: Json | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          column_preferences?: Json | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_popular: boolean | null
          is_template: boolean
          name: string
          status: string
          steps: Json
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          is_template?: boolean
          name: string
          status: string
          steps: Json
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          is_template?: boolean
          name?: string
          status?: string
          steps?: Json
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          association_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_template: boolean
          name: string
          status: string
          steps: Json
          type: string
          updated_at: string
        }
        Insert: {
          association_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          name: string
          status: string
          steps: Json
          type: string
          updated_at?: string
        }
        Update: {
          association_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          name?: string
          status?: string
          steps?: Json
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_to_association: {
        Args: { p_association_id: string; p_user_id: string; p_role?: string }
        Returns: undefined
      }
      check_user_association: {
        Args: { association_uuid: string }
        Returns: boolean
      }
      create_association_with_admin: {
        Args: {
          p_name: string
          p_address?: string
          p_contact_email?: string
          p_city?: string
          p_state?: string
          p_zip?: string
          p_phone?: string
          p_property_type?: string
          p_total_units?: number
        }
        Returns: string
      }
      get_associations: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          city: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          description: string | null
          fire_inspection_due: string | null
          founded_date: string | null
          id: string
          insurance_expiration: string | null
          is_archived: boolean | null
          name: string
          phone: string | null
          property_type: string | null
          state: string | null
          total_units: number | null
          updated_at: string
          website: string | null
          zip: string | null
        }[]
      }
      get_next_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_system_setting: {
        Args: { setting_key: string }
        Returns: Json
      }
      get_user_association_role: {
        Args: { association_uuid: string }
        Returns: string
      }
      get_user_associations: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          city: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          description: string | null
          fire_inspection_due: string | null
          founded_date: string | null
          id: string
          insurance_expiration: string | null
          is_archived: boolean | null
          name: string
          phone: string | null
          property_type: string | null
          state: string | null
          total_units: number | null
          updated_at: string
          website: string | null
          zip: string | null
        }[]
      }
      get_user_settings: {
        Args: { user_id_param: string }
        Returns: {
          column_preferences: Json | null
          created_at: string | null
          id: string
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }[]
      }
      sync_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_system_setting: {
        Args: { setting_key: string; setting_value: Json }
        Returns: undefined
      }
      update_user_ai_settings: {
        Args: {
          p_model?: string
          p_temperature?: number
          p_max_tokens?: number
          p_prompt_templates?: Json
        }
        Returns: undefined
      }
      update_user_settings: {
        Args: {
          user_id_param: string
          theme_param?: string
          notifications_param?: boolean
          column_preferences_param?: Json
        }
        Returns: undefined
      }
      user_has_association_access: {
        Args: { association_uuid: string; min_role?: string }
        Returns: boolean
      }
      user_is_associated_with_association: {
        Args: { association_uuid: string }
        Returns: boolean
      }
      user_is_association_admin: {
        Args: { association_uuid: string }
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
