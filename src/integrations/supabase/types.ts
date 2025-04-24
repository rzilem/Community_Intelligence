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
          category: Database["public"]["Enums"]["message_category"]
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
          category?: Database["public"]["Enums"]["message_category"]
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
          category?: Database["public"]["Enums"]["message_category"]
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
      association_portal_widgets: {
        Row: {
          association_id: string
          created_at: string
          id: string
          is_enabled: boolean | null
          position: number | null
          settings: Json | null
          updated_at: string
          widget_type: string
        }
        Insert: {
          association_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: number | null
          settings?: Json | null
          updated_at?: string
          widget_type: string
        }
        Update: {
          association_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: number | null
          settings?: Json | null
          updated_at?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_portal_widgets_association_id_fkey"
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
          ach_auto_draft_day: string | null
          ach_draft_amount: string | null
          ach_generate_in_advance: number | null
          ach_include_charges: string | null
          additional_arc_models: Json | null
          additional_collections_models: Json | null
          address: string | null
          age_of_balance: string | null
          approval_threshold: number | null
          arc_model: string | null
          arc_name: string | null
          association_address_setting: string | null
          association_time_zone: string | null
          auto_reminders: boolean | null
          balance_threshold: string | null
          balance_threshold_type: string | null
          board_approval_required: boolean | null
          city: string | null
          collections_active: string | null
          collections_model: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          decline_threshold: number | null
          description: string | null
          email_notifications: boolean | null
          fire_inspection_due: string | null
          founded_date: string | null
          grace_period_days: string | null
          id: string
          include_ach_default: boolean | null
          include_all_properties_default: boolean | null
          include_block_ledger_accounts: boolean | null
          include_credit_balances_default: boolean | null
          include_qr_code: boolean | null
          insurance_expiration: string | null
          is_archived: boolean | null
          late_fee_percentage: string | null
          lien_threshold: string | null
          lien_threshold_type: string | null
          logo_url: string | null
          minimum_balance: number | null
          name: string
          new_association_grace_period: string | null
          new_owner_grace_period: string | null
          payment_due_day: string | null
          phone: string | null
          primary_color: string | null
          processing_days: string | null
          property_type: string | null
          remittance_coupon_message: string | null
          require_arc_voting: boolean | null
          secondary_color: string | null
          sms_notifications: boolean | null
          state: string | null
          statement_format: string | null
          status: string | null
          total_units: number | null
          updated_at: string
          utilities_billing_message: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          ach_auto_draft_day?: string | null
          ach_draft_amount?: string | null
          ach_generate_in_advance?: number | null
          ach_include_charges?: string | null
          additional_arc_models?: Json | null
          additional_collections_models?: Json | null
          address?: string | null
          age_of_balance?: string | null
          approval_threshold?: number | null
          arc_model?: string | null
          arc_name?: string | null
          association_address_setting?: string | null
          association_time_zone?: string | null
          auto_reminders?: boolean | null
          balance_threshold?: string | null
          balance_threshold_type?: string | null
          board_approval_required?: boolean | null
          city?: string | null
          collections_active?: string | null
          collections_model?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          decline_threshold?: number | null
          description?: string | null
          email_notifications?: boolean | null
          fire_inspection_due?: string | null
          founded_date?: string | null
          grace_period_days?: string | null
          id?: string
          include_ach_default?: boolean | null
          include_all_properties_default?: boolean | null
          include_block_ledger_accounts?: boolean | null
          include_credit_balances_default?: boolean | null
          include_qr_code?: boolean | null
          insurance_expiration?: string | null
          is_archived?: boolean | null
          late_fee_percentage?: string | null
          lien_threshold?: string | null
          lien_threshold_type?: string | null
          logo_url?: string | null
          minimum_balance?: number | null
          name: string
          new_association_grace_period?: string | null
          new_owner_grace_period?: string | null
          payment_due_day?: string | null
          phone?: string | null
          primary_color?: string | null
          processing_days?: string | null
          property_type?: string | null
          remittance_coupon_message?: string | null
          require_arc_voting?: boolean | null
          secondary_color?: string | null
          sms_notifications?: boolean | null
          state?: string | null
          statement_format?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string
          utilities_billing_message?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          ach_auto_draft_day?: string | null
          ach_draft_amount?: string | null
          ach_generate_in_advance?: number | null
          ach_include_charges?: string | null
          additional_arc_models?: Json | null
          additional_collections_models?: Json | null
          address?: string | null
          age_of_balance?: string | null
          approval_threshold?: number | null
          arc_model?: string | null
          arc_name?: string | null
          association_address_setting?: string | null
          association_time_zone?: string | null
          auto_reminders?: boolean | null
          balance_threshold?: string | null
          balance_threshold_type?: string | null
          board_approval_required?: boolean | null
          city?: string | null
          collections_active?: string | null
          collections_model?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          decline_threshold?: number | null
          description?: string | null
          email_notifications?: boolean | null
          fire_inspection_due?: string | null
          founded_date?: string | null
          grace_period_days?: string | null
          id?: string
          include_ach_default?: boolean | null
          include_all_properties_default?: boolean | null
          include_block_ledger_accounts?: boolean | null
          include_credit_balances_default?: boolean | null
          include_qr_code?: boolean | null
          insurance_expiration?: string | null
          is_archived?: boolean | null
          late_fee_percentage?: string | null
          lien_threshold?: string | null
          lien_threshold_type?: string | null
          logo_url?: string | null
          minimum_balance?: number | null
          name?: string
          new_association_grace_period?: string | null
          new_owner_grace_period?: string | null
          payment_due_day?: string | null
          phone?: string | null
          primary_color?: string | null
          processing_days?: string | null
          property_type?: string | null
          remittance_coupon_message?: string | null
          require_arc_voting?: boolean | null
          secondary_color?: string | null
          sms_notifications?: boolean | null
          state?: string | null
          statement_format?: string | null
          status?: string | null
          total_units?: number | null
          updated_at?: string
          utilities_billing_message?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_number: string
          account_type: string
          association_id: string | null
          bank_name: string
          created_at: string
          id: string
          last_reconciled_date: string | null
          last_statement_date: string | null
          name: string
          routing_number: string | null
          updated_at: string
        }
        Insert: {
          account_number: string
          account_type: string
          association_id?: string | null
          bank_name: string
          created_at?: string
          id?: string
          last_reconciled_date?: string | null
          last_statement_date?: string | null
          name: string
          routing_number?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string
          account_type?: string
          association_id?: string | null
          bank_name?: string
          created_at?: string
          id?: string
          last_reconciled_date?: string | null
          last_statement_date?: string | null
          name?: string
          routing_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_statements: {
        Row: {
          balance_ending: number | null
          bank_account_id: string
          created_at: string
          file_size: number | null
          file_url: string | null
          filename: string | null
          id: string
          import_status: string
          imported_at: string | null
          processed_at: string | null
          statement_date: string
          updated_at: string
          upload_method: string
        }
        Insert: {
          balance_ending?: number | null
          bank_account_id: string
          created_at?: string
          file_size?: number | null
          file_url?: string | null
          filename?: string | null
          id?: string
          import_status?: string
          imported_at?: string | null
          processed_at?: string | null
          statement_date: string
          updated_at?: string
          upload_method?: string
        }
        Update: {
          balance_ending?: number | null
          bank_account_id?: string
          created_at?: string
          file_size?: number | null
          file_url?: string | null
          filename?: string | null
          id?: string
          import_status?: string
          imported_at?: string | null
          processed_at?: string | null
          statement_date?: string
          updated_at?: string
          upload_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          is_reconciled: boolean | null
          reconciled_at: string | null
          reference_number: string | null
          statement_id: string
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          is_reconciled?: boolean | null
          reconciled_at?: string | null
          reference_number?: string | null
          statement_id: string
          transaction_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          is_reconciled?: boolean | null
          reconciled_at?: string | null
          reference_number?: string | null
          statement_id?: string
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
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
      collections_account_documents: {
        Row: {
          collections_account_id: string
          created_at: string
          document_name: string
          document_url: string
          id: string
          opened_date: string | null
          sent_date: string | null
          status: string
          step_id: string
          updated_at: string
        }
        Insert: {
          collections_account_id: string
          created_at?: string
          document_name: string
          document_url: string
          id?: string
          opened_date?: string | null
          sent_date?: string | null
          status?: string
          step_id: string
          updated_at?: string
        }
        Update: {
          collections_account_id?: string
          created_at?: string
          document_name?: string
          document_url?: string
          id?: string
          opened_date?: string | null
          sent_date?: string | null
          status?: string
          step_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_account_documents_collections_account_id_fkey"
            columns: ["collections_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_account_documents_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "collections_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_account_history: {
        Row: {
          action_date: string
          action_details: Json | null
          action_type: string
          amount: number | null
          collections_account_id: string
          created_at: string
          document_url: string | null
          id: string
          notes: string | null
          performed_by: string | null
          step_id: string | null
          updated_at: string
        }
        Insert: {
          action_date?: string
          action_details?: Json | null
          action_type: string
          amount?: number | null
          collections_account_id: string
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Update: {
          action_date?: string
          action_details?: Json | null
          action_type?: string
          amount?: number | null
          collections_account_id?: string
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          step_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_account_history_collections_account_id_fkey"
            columns: ["collections_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_account_history_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "collections_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_accounts: {
        Row: {
          account_number: string | null
          association_id: string
          balance_amount: number
          created_at: string
          delinquent_since: string
          id: string
          last_payment_amount: number | null
          last_payment_date: string | null
          property_id: string
          resident_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          association_id: string
          balance_amount?: number
          created_at?: string
          delinquent_since: string
          id?: string
          last_payment_amount?: number | null
          last_payment_date?: string | null
          property_id: string
          resident_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          association_id?: string
          balance_amount?: number
          created_at?: string
          delinquent_since?: string
          id?: string
          last_payment_amount?: number | null
          last_payment_date?: string | null
          property_id?: string
          resident_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_accounts_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_accounts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_accounts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_payment_plans: {
        Row: {
          collections_account_id: string
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          monthly_amount: number
          notes: string | null
          plan_type: string
          start_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          collections_account_id: string
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          monthly_amount: number
          notes?: string | null
          plan_type: string
          start_date: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          collections_account_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          monthly_amount?: number
          notes?: string | null
          plan_type?: string
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_payment_plans_collections_account_id_fkey"
            columns: ["collections_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_payments: {
        Row: {
          amount: number
          collections_account_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payment_plan_id: string | null
          reference_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          collections_account_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method: string
          payment_plan_id?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          collections_account_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_plan_id?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_payments_collections_account_id_fkey"
            columns: ["collections_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_payments_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "collections_payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_step_templates: {
        Row: {
          created_at: string
          document_type: string
          id: string
          step_id: string
          template_content: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          id?: string
          step_id: string
          template_content: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          step_id?: string
          template_content?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_step_templates_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "collections_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_steps: {
        Row: {
          association_id: string
          created_at: string
          days_after_delinquent: number | null
          description: string | null
          id: string
          is_automated: boolean | null
          is_closing_step: boolean | null
          name: string
          order_no: number | null
          portal_reply: string | null
          reply_to: string | null
          send_to: string | null
          step_order: number
          step_type: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          association_id: string
          created_at?: string
          days_after_delinquent?: number | null
          description?: string | null
          id?: string
          is_automated?: boolean | null
          is_closing_step?: boolean | null
          name: string
          order_no?: number | null
          portal_reply?: string | null
          reply_to?: string | null
          send_to?: string | null
          step_order: number
          step_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          association_id?: string
          created_at?: string
          days_after_delinquent?: number | null
          description?: string | null
          id?: string
          is_automated?: boolean | null
          is_closing_step?: boolean | null
          name?: string
          order_no?: number | null
          portal_reply?: string | null
          reply_to?: string | null
          send_to?: string | null
          step_order?: number
          step_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_steps_association_id_fkey"
            columns: ["association_id"]
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
      communications_log: {
        Row: {
          category: Database["public"]["Enums"]["message_category"]
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
          category?: Database["public"]["Enums"]["message_category"]
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
          category?: Database["public"]["Enums"]["message_category"]
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
      community_polls: {
        Row: {
          association_id: string
          closes_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_closed: boolean | null
          options: Json
          title: string
        }
        Insert: {
          association_id: string
          closes_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_closed?: boolean | null
          options?: Json
          title: string
        }
        Update: {
          association_id?: string
          closes_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_closed?: boolean | null
          options?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_polls_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
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
      direct_messages: {
        Row: {
          association_id: string
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          association_id: string
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          association_id?: string
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analyses: {
        Row: {
          analysis_results: Json
          created_at: string
          document_name: string | null
          document_type: string | null
          document_url: string
          id: string
          updated_at: string
        }
        Insert: {
          analysis_results: Json
          created_at?: string
          document_name?: string | null
          document_type?: string | null
          document_url: string
          id?: string
          updated_at?: string
        }
        Update: {
          analysis_results?: Json
          created_at?: string
          document_name?: string | null
          document_type?: string | null
          document_url?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
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
      form_conversion_jobs: {
        Row: {
          association_id: string | null
          converted_form_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          original_pdf_url: string
          status: string
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          converted_form_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          original_pdf_url: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          converted_form_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          original_pdf_url?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_conversion_jobs_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          association_id: string
          created_at: string
          form_data: Json
          form_template_id: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          property_id: string | null
          status: string
          submitted_at: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          association_id: string
          created_at?: string
          form_data?: Json
          form_template_id: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          property_id?: string | null
          status?: string
          submitted_at?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          association_id?: string
          created_at?: string
          form_data?: Json
          form_template_id?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          property_id?: string | null
          status?: string
          submitted_at?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_template_id_fkey"
            columns: ["form_template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_associations: {
        Row: {
          association_id: string
          created_at: string | null
          form_template_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          form_template_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          form_template_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_template_associations_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_template_associations_form_template_id_fkey"
            columns: ["form_template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          association_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          fields: Json
          form_type: string | null
          id: string
          is_global: boolean | null
          is_public: boolean | null
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          fields?: Json
          form_type?: string | null
          id?: string
          is_global?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          fields?: Json
          form_type?: string | null
          id?: string
          is_global?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_templates_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_workflow_execution_logs: {
        Row: {
          actionid: string
          createdat: string
          details: Json | null
          id: string
          status: string
          stepid: string
          submissionid: string
          workflowid: string
        }
        Insert: {
          actionid: string
          createdat?: string
          details?: Json | null
          id?: string
          status: string
          stepid: string
          submissionid: string
          workflowid: string
        }
        Update: {
          actionid?: string
          createdat?: string
          details?: Json | null
          id?: string
          status?: string
          stepid?: string
          submissionid?: string
          workflowid?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_workflow_execution_logs_submissionid_fkey"
            columns: ["submissionid"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_workflow_execution_logs_workflowid_fkey"
            columns: ["workflowid"]
            isOneToOne: false
            referencedRelation: "form_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      form_workflows: {
        Row: {
          createdat: string
          description: string | null
          formtemplateid: string
          id: string
          isenabled: boolean
          logging: boolean | null
          maxretries: number | null
          name: string
          retryfailed: boolean | null
          steps: Json
          updatedat: string
        }
        Insert: {
          createdat?: string
          description?: string | null
          formtemplateid: string
          id?: string
          isenabled?: boolean
          logging?: boolean | null
          maxretries?: number | null
          name: string
          retryfailed?: boolean | null
          steps?: Json
          updatedat?: string
        }
        Update: {
          createdat?: string
          description?: string | null
          formtemplateid?: string
          id?: string
          isenabled?: boolean
          logging?: boolean | null
          maxretries?: number | null
          name?: string
          retryfailed?: boolean | null
          steps?: Json
          updatedat?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_workflows_formtemplateid_fkey"
            columns: ["formtemplateid"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_discussions: {
        Row: {
          association_id: string
          category: string
          content: string
          created_at: string
          created_by: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          association_id: string
          category: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          association_id?: string
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_discussions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          created_by: string
          discussion_id: string
          id: string
          is_solution: boolean | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          discussion_id: string
          id?: string
          is_solution?: boolean | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          discussion_id?: string
          id?: string
          is_solution?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "forum_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_accounts: {
        Row: {
          account_number: string | null
          association_id: string | null
          balance: number | null
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          association_id?: string | null
          balance?: number | null
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          association_id?: string | null
          balance?: number | null
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gl_accounts_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_budget_entries: {
        Row: {
          annual_total: number
          budget_id: string
          created_at: string | null
          gl_account_id: string
          id: string
          monthly_amounts: Json | null
          notes: string | null
          previous_year_actual: number | null
          previous_year_budget: number | null
          updated_at: string | null
        }
        Insert: {
          annual_total?: number
          budget_id: string
          created_at?: string | null
          gl_account_id: string
          id?: string
          monthly_amounts?: Json | null
          notes?: string | null
          previous_year_actual?: number | null
          previous_year_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          annual_total?: number
          budget_id?: string
          created_at?: string | null
          gl_account_id?: string
          id?: string
          monthly_amounts?: Json | null
          notes?: string | null
          previous_year_actual?: number | null
          previous_year_budget?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_budget_entries_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "gl_budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_budget_entries_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_budgets: {
        Row: {
          association_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          fund_type: string
          id: string
          name: string
          status: string
          total_expenses: number | null
          total_revenue: number | null
          updated_at: string | null
          year: string
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fund_type?: string
          id?: string
          name: string
          status?: string
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          year: string
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fund_type?: string
          id?: string
          name?: string
          status?: string
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "gl_budgets_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
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
      invoice_line_items: {
        Row: {
          amount: number
          bank_account_id: string | null
          created_at: string
          description: string | null
          gl_account_id: string | null
          id: string
          invoice_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          invoice_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          invoice_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          association_id: string | null
          association_name: string | null
          bank_account_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          gl_account_id: string | null
          html_content: string | null
          id: string
          invoice_date: string | null
          invoice_number: string
          payment_date: string | null
          payment_method: string | null
          pdf_url: string | null
          source_document: string | null
          status: string
          tracking_number: string | null
          updated_at: string
          vendor: string
        }
        Insert: {
          amount: number
          association_id?: string | null
          association_name?: string | null
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          gl_account_id?: string | null
          html_content?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          payment_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          source_document?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          vendor: string
        }
        Update: {
          amount?: number
          association_id?: string | null
          association_name?: string | null
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          gl_account_id?: string | null
          html_content?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          payment_date?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          source_document?: string | null
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
      lead_follow_ups: {
        Row: {
          completed_date: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          scheduled_date: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          scheduled_date?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          scheduled_date?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_follow_ups_lead_id_fkey"
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
          follow_up_sequence: number | null
          html_content: string | null
          id: string
          last_follow_up: string | null
          last_name: string | null
          lead_score: number | null
          name: string
          next_follow_up: string | null
          notes: string | null
          number_of_units: number | null
          phone: string | null
          proposal_count: number | null
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
          follow_up_sequence?: number | null
          html_content?: string | null
          id?: string
          last_follow_up?: string | null
          last_name?: string | null
          lead_score?: number | null
          name: string
          next_follow_up?: string | null
          notes?: string | null
          number_of_units?: number | null
          phone?: string | null
          proposal_count?: number | null
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
          follow_up_sequence?: number | null
          html_content?: string | null
          id?: string
          last_follow_up?: string | null
          last_name?: string | null
          lead_score?: number | null
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          number_of_units?: number | null
          phone?: string | null
          proposal_count?: number | null
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
      meeting_minutes: {
        Row: {
          association_id: string | null
          attendees: Json | null
          audio_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          key_action_items: Json | null
          meeting_date: string
          minutes_content: string | null
          status: string
          title: string
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          attendees?: Json | null
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          key_action_items?: Json | null
          meeting_date?: string
          minutes_content?: string | null
          status?: string
          title: string
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          attendees?: Json | null
          audio_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          key_action_items?: Json | null
          meeting_date?: string
          minutes_content?: string | null
          status?: string
          title?: string
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_minutes_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_history: {
        Row: {
          association_id: string | null
          content: string
          created_at: string | null
          id: string
          recipient_groups: string[] | null
          sent_at: string | null
          subject: string
          type: string
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          recipient_groups?: string[] | null
          sent_at?: string | null
          subject: string
          type: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          recipient_groups?: string[] | null
          sent_at?: string | null
          subject?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_history_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          association_id: string | null
          category: Database["public"]["Enums"]["message_category"] | null
          content: string
          created_at: string
          description: string | null
          id: string
          is_ai_generated: boolean | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          association_id?: string | null
          category?: Database["public"]["Enums"]["message_category"] | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_ai_generated?: boolean | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          association_id?: string | null
          category?: Database["public"]["Enums"]["message_category"] | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_ai_generated?: boolean | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_translations: {
        Row: {
          created_at: string | null
          id: string
          language_code: string
          message_id: string
          original_text: string
          translated_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_code: string
          message_id: string
          original_text: string
          translated_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language_code?: string
          message_id?: string
          original_text?: string
          translated_text?: string
          updated_at?: string | null
        }
        Relationships: []
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
      poll_responses: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          selected_option: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          selected_option: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          selected_option?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "community_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_notifications: {
        Row: {
          association_id: string
          content: string
          created_at: string
          id: string
          link: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          association_id: string
          content: string
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          association_id?: string
          content?: string
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_notifications_association_id_fkey"
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
          preferred_language: string | null
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
          preferred_language?: string | null
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
          preferred_language?: string | null
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
          lot_size: number | null
          notes: string | null
          property_type: string
          square_feet: number | null
          state: string | null
          status: string | null
          unit_number: string | null
          updated_at: string
          year_built: number | null
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
          lot_size?: number | null
          notes?: string | null
          property_type: string
          square_feet?: number | null
          state?: string | null
          status?: string | null
          unit_number?: string | null
          updated_at?: string
          year_built?: number | null
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
          lot_size?: number | null
          notes?: string | null
          property_type?: string
          square_feet?: number | null
          state?: string | null
          status?: string | null
          unit_number?: string | null
          updated_at?: string
          year_built?: number | null
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
      resale_orders: {
        Row: {
          amount: number
          association_id: string | null
          contact_info: Json
          created_at: string
          id: string
          order_details: Json
          order_number: string
          payment_info: Json | null
          payment_status: string
          property_id: string | null
          property_info: Json
          rush_option: string | null
          status: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          association_id?: string | null
          contact_info: Json
          created_at?: string
          id?: string
          order_details: Json
          order_number: string
          payment_info?: Json | null
          payment_status?: string
          property_id?: string | null
          property_info: Json
          rush_option?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          association_id?: string | null
          contact_info?: Json
          created_at?: string
          id?: string
          order_details?: Json
          order_number?: string
          payment_info?: Json | null
          payment_status?: string
          property_id?: string | null
          property_info?: Json
          rush_option?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      resident_portal_settings: {
        Row: {
          created_at: string | null
          dashboard_layout: Json | null
          id: string
          notification_preferences: Json | null
          resident_id: string | null
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_preferences?: Json | null
          resident_id?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dashboard_layout?: Json | null
          id?: string
          notification_preferences?: Json | null
          resident_id?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resident_portal_settings_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          client_portal_link: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          id: string
          is_primary: boolean | null
          move_in_date: string | null
          move_out_date: string | null
          name: string | null
          phone: string | null
          preferences: Json | null
          property_id: string | null
          resident_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_portal_link?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_primary?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          name?: string | null
          phone?: string | null
          preferences?: Json | null
          property_id?: string | null
          resident_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_portal_link?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_primary?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          name?: string | null
          phone?: string | null
          preferences?: Json | null
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
      scheduled_messages: {
        Row: {
          association_id: string
          category: Database["public"]["Enums"]["message_category"]
          content: string
          created_at: string
          id: string
          recipient_groups: string[]
          scheduled_date: string
          sent: boolean
          sent_at: string | null
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          association_id: string
          category?: Database["public"]["Enums"]["message_category"]
          content: string
          created_at?: string
          id?: string
          recipient_groups: string[]
          scheduled_date: string
          sent?: boolean
          sent_at?: string | null
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          association_id?: string
          category?: Database["public"]["Enums"]["message_category"]
          content?: string
          created_at?: string
          id?: string
          recipient_groups?: string[]
          scheduled_date?: string
          sent?: boolean
          sent_at?: string | null
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
      user_portal_widgets: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          position: number | null
          settings: Json | null
          updated_at: string
          user_id: string
          widget_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: number | null
          settings?: Json | null
          updated_at?: string
          user_id: string
          widget_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: number | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
          widget_type?: string
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
      vendor_profiles: {
        Row: {
          company_description: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_preferred: boolean | null
          services_offered: string[] | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_description?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_preferred?: boolean | null
          services_offered?: string[] | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_description?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_preferred?: boolean | null
          services_offered?: string[] | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          rating: number | null
          service_type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          rating?: number | null
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          rating?: number | null
          service_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      violations: {
        Row: {
          association_id: string
          created_at: string
          description: string | null
          due_date: string | null
          fine_amount: number | null
          id: string
          issued_date: string
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
          issued_date?: string
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
          issued_date?: string
          property_id?: string
          resident_id?: string | null
          resolved_date?: string | null
          status?: string
          updated_at?: string
          violation_type?: string
        }
        Relationships: []
      }
      work_order_updates: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string | null
          id: string
          update_details: Json | null
          update_type: string
          work_order_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          update_details?: Json | null
          update_type: string
          work_order_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          update_details?: Json | null
          update_type?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_updates_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          association_id: string
          attachments: Json | null
          budget_estimate: number | null
          category: string | null
          completed_date: string | null
          completion_target_date: string | null
          cost_tracking: Json | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_cost: number | null
          id: string
          priority: string
          progress_status: number | null
          property_id: string | null
          requested_by: string | null
          scheduled_date: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          vendor_id: string | null
          vendor_name: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          association_id: string
          attachments?: Json | null
          budget_estimate?: number | null
          category?: string | null
          completed_date?: string | null
          completion_target_date?: string | null
          cost_tracking?: Json | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          priority?: string
          progress_status?: number | null
          property_id?: string | null
          requested_by?: string | null
          scheduled_date?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          association_id?: string
          attachments?: Json | null
          budget_estimate?: number | null
          category?: string | null
          completed_date?: string | null
          completion_target_date?: string | null
          cost_tracking?: Json | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          priority?: string
          progress_status?: number | null
          property_id?: string | null
          requested_by?: string | null
          scheduled_date?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      workflow_templates: {
        Row: {
          created_at: string
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_associations: {
        Args: Record<PropertyKey, never>
        Returns: {
          ach_auto_draft_day: string | null
          ach_draft_amount: string | null
          ach_generate_in_advance: number | null
          ach_include_charges: string | null
          additional_arc_models: Json | null
          additional_collections_models: Json | null
          address: string | null
          age_of_balance: string | null
          approval_threshold: number | null
          arc_model: string | null
          arc_name: string | null
          association_address_setting: string | null
          association_time_zone: string | null
          auto_reminders: boolean | null
          balance_threshold: string | null
          balance_threshold_type: string | null
          board_approval_required: boolean | null
          city: string | null
          collections_active: string | null
          collections_model: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          decline_threshold: number | null
          description: string | null
          email_notifications: boolean | null
          fire_inspection_due: string | null
          founded_date: string | null
          grace_period_days: string | null
          id: string
          include_ach_default: boolean | null
          include_all_properties_default: boolean | null
          include_block_ledger_accounts: boolean | null
          include_credit_balances_default: boolean | null
          include_qr_code: boolean | null
          insurance_expiration: string | null
          is_archived: boolean | null
          late_fee_percentage: string | null
          lien_threshold: string | null
          lien_threshold_type: string | null
          logo_url: string | null
          minimum_balance: number | null
          name: string
          new_association_grace_period: string | null
          new_owner_grace_period: string | null
          payment_due_day: string | null
          phone: string | null
          primary_color: string | null
          processing_days: string | null
          property_type: string | null
          remittance_coupon_message: string | null
          require_arc_voting: boolean | null
          secondary_color: string | null
          sms_notifications: boolean | null
          state: string | null
          statement_format: string | null
          status: string | null
          total_units: number | null
          updated_at: string
          utilities_billing_message: string | null
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
          ach_auto_draft_day: string | null
          ach_draft_amount: string | null
          ach_generate_in_advance: number | null
          ach_include_charges: string | null
          additional_arc_models: Json | null
          additional_collections_models: Json | null
          address: string | null
          age_of_balance: string | null
          approval_threshold: number | null
          arc_model: string | null
          arc_name: string | null
          association_address_setting: string | null
          association_time_zone: string | null
          auto_reminders: boolean | null
          balance_threshold: string | null
          balance_threshold_type: string | null
          board_approval_required: boolean | null
          city: string | null
          collections_active: string | null
          collections_model: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          decline_threshold: number | null
          description: string | null
          email_notifications: boolean | null
          fire_inspection_due: string | null
          founded_date: string | null
          grace_period_days: string | null
          id: string
          include_ach_default: boolean | null
          include_all_properties_default: boolean | null
          include_block_ledger_accounts: boolean | null
          include_credit_balances_default: boolean | null
          include_qr_code: boolean | null
          insurance_expiration: string | null
          is_archived: boolean | null
          late_fee_percentage: string | null
          lien_threshold: string | null
          lien_threshold_type: string | null
          logo_url: string | null
          minimum_balance: number | null
          name: string
          new_association_grace_period: string | null
          new_owner_grace_period: string | null
          payment_due_day: string | null
          phone: string | null
          primary_color: string | null
          processing_days: string | null
          property_type: string | null
          remittance_coupon_message: string | null
          require_arc_voting: boolean | null
          secondary_color: string | null
          sms_notifications: boolean | null
          state: string | null
          statement_format: string | null
          status: string | null
          total_units: number | null
          updated_at: string
          utilities_billing_message: string | null
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
      validate_resident_preferences: {
        Args: { preferences: Json }
        Returns: boolean
      }
    }
    Enums: {
      message_category:
        | "general"
        | "maintenance"
        | "compliance"
        | "events"
        | "financial"
        | "emergency"
        | "announcement"
        | "community"
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
    Enums: {
      message_category: [
        "general",
        "maintenance",
        "compliance",
        "events",
        "financial",
        "emergency",
        "announcement",
        "community",
      ],
    },
  },
} as const
