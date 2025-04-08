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
      association_photos: {
        Row: {
          association_id: string
          content_type: string
          created_at: string | null
          description: string | null
          embed_html: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_primary: boolean | null
          updated_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          association_id: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          embed_html?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          association_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          embed_html?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      association_settings: {
        Row: {
          association_id: string | null
          created_at: string | null
          id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "association_settings_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: true
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      associations: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_website: string | null
          country: string | null
          created_at: string | null
          description: string | null
          founded_date: string | null
          id: string
          name: string
          state: string | null
          status: string | null
          type: string | null
          units: number | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          founded_date?: string | null
          id?: string
          name: string
          state?: string | null
          status?: string | null
          type?: string | null
          units?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          founded_date?: string | null
          id?: string
          name?: string
          state?: string | null
          status?: string | null
          type?: string | null
          units?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string
          association_id: string
          balance: number
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          routing_number: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          account_type: string
          association_id: string
          balance?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          routing_number?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string
          association_id?: string
          balance?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          routing_number?: string | null
          updated_at?: string | null
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
          association_id: string
          bank_account_id: string
          beginning_balance: number
          created_at: string | null
          ending_balance: number
          file_url: string | null
          id: string
          is_reconciled: boolean
          reconciled_by: string | null
          reconciled_date: string | null
          statement_date: string
          updated_at: string | null
        }
        Insert: {
          association_id: string
          bank_account_id: string
          beginning_balance: number
          created_at?: string | null
          ending_balance: number
          file_url?: string | null
          id?: string
          is_reconciled?: boolean
          reconciled_by?: string | null
          reconciled_date?: string | null
          statement_date: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string
          bank_account_id?: string
          beginning_balance?: number
          created_at?: string | null
          ending_balance?: number
          file_url?: string | null
          id?: string
          is_reconciled?: boolean
          reconciled_by?: string | null
          reconciled_date?: string | null
          statement_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
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
          association_id: string
          bank_account_id: string
          check_number: string | null
          created_at: string | null
          description: string | null
          id: string
          is_reconciled: boolean
          statement_id: string | null
          status: string
          transaction_date: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          association_id: string
          bank_account_id: string
          check_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_reconciled?: boolean
          statement_id?: string | null
          status?: string
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          association_id?: string
          bank_account_id?: string
          check_number?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_reconciled?: boolean
          statement_id?: string | null
          status?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_request_images: {
        Row: {
          bid_request_id: string
          category: string | null
          created_at: string | null
          created_by: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
        }
        Insert: {
          bid_request_id: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
        }
        Update: {
          bid_request_id?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_request_images_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_request_vendors: {
        Row: {
          bid_amount: number | null
          bid_request_id: string
          created_at: string
          estimated_completion_date: string | null
          id: string
          response_date: string | null
          response_notes: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          bid_amount?: number | null
          bid_request_id: string
          created_at?: string
          estimated_completion_date?: string | null
          id?: string
          response_date?: string | null
          response_notes?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          bid_amount?: number | null
          bid_request_id?: string
          created_at?: string
          estimated_completion_date?: string | null
          id?: string
          response_date?: string | null
          response_notes?: string | null
          status?: string
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
          answers: Json
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          project_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          project_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          project_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          access_level: string
          all_day: boolean | null
          association_id: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          location: string | null
          metadata: Json | null
          recurring_pattern: Json | null
          start_time: string
          title: string
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          access_level?: string
          all_day?: boolean | null
          association_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_type: string
          id?: string
          location?: string | null
          metadata?: Json | null
          recurring_pattern?: Json | null
          start_time: string
          title: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          access_level?: string
          all_day?: boolean | null
          association_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          recurring_pattern?: Json | null
          start_time?: string
          title?: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      communication_recipients: {
        Row: {
          communication_id: string | null
          created_at: string
          id: string
          recipient_email: string
          recipient_type: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          communication_id?: string | null
          created_at?: string
          id?: string
          recipient_email: string
          recipient_type?: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          communication_id?: string | null
          created_at?: string
          id?: string
          recipient_email?: string
          recipient_type?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_recipients_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          content: string
          created_at: string
          format: string
          id: string
          message_type: string
          scheduled_for: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          format?: string
          id?: string
          message_type?: string
          scheduled_for?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          format?: string
          id?: string
          message_type?: string
          scheduled_for?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          access_level: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          association_id: string
          category: string | null
          description: string | null
          file_size: number
          file_type: string
          id: string
          is_archived: boolean | null
          is_public: boolean | null
          last_modified: string | null
          name: string
          tags: string[] | null
          uploaded_by: string | null
          uploaded_date: string | null
          url: string
          version: number | null
        }
        Insert: {
          association_id: string
          category?: string | null
          description?: string | null
          file_size: number
          file_type: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          last_modified?: string | null
          name: string
          tags?: string[] | null
          uploaded_by?: string | null
          uploaded_date?: string | null
          url: string
          version?: number | null
        }
        Update: {
          association_id?: string
          category?: string | null
          description?: string | null
          file_size?: number
          file_type?: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          last_modified?: string | null
          name?: string
          tags?: string[] | null
          uploaded_by?: string | null
          uploaded_date?: string | null
          url?: string
          version?: number | null
        }
        Relationships: []
      }
      email_sequences: {
        Row: {
          active: boolean | null
          createdat: string
          createdby: string | null
          description: string | null
          id: string
          name: string
          steps: Json
          updatedat: string | null
        }
        Insert: {
          active?: boolean | null
          createdat?: string
          createdby?: string | null
          description?: string | null
          id?: string
          name: string
          steps?: Json
          updatedat?: string | null
        }
        Update: {
          active?: boolean | null
          createdat?: string
          createdby?: string | null
          description?: string | null
          id?: string
          name?: string
          steps?: Json
          updatedat?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          category: string
          createdat: string
          createdby: string | null
          id: string
          name: string
          subject: string
          updatedat: string | null
        }
        Insert: {
          body: string
          category: string
          createdat?: string
          createdby?: string | null
          id?: string
          name: string
          subject: string
          updatedat?: string | null
        }
        Update: {
          body?: string
          category?: string
          createdat?: string
          createdby?: string | null
          id?: string
          name?: string
          subject?: string
          updatedat?: string | null
        }
        Relationships: []
      }
      email_workflows: {
        Row: {
          association: string | null
          created_at: string | null
          description: string | null
          enable_ocr: boolean | null
          forward_to: string | null
          forwarding_email: string | null
          id: string
          inbound_email: string
          is_active: boolean | null
          name: string
          ocr_settings: Json | null
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          association?: string | null
          created_at?: string | null
          description?: string | null
          enable_ocr?: boolean | null
          forward_to?: string | null
          forwarding_email?: string | null
          id?: string
          inbound_email: string
          is_active?: boolean | null
          name: string
          ocr_settings?: Json | null
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          association?: string | null
          created_at?: string | null
          description?: string | null
          enable_ocr?: boolean | null
          forward_to?: string | null
          forwarding_email?: string | null
          id?: string
          inbound_email?: string
          is_active?: boolean | null
          name?: string
          ocr_settings?: Json | null
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      file_operation_logs: {
        Row: {
          created_at: string | null
          file_count: number | null
          file_name: string | null
          file_size: number | null
          file_types: string[] | null
          id: string
          metadata: Json | null
          operation_type: string
        }
        Insert: {
          created_at?: string | null
          file_count?: number | null
          file_name?: string | null
          file_size?: number | null
          file_types?: string[] | null
          id?: string
          metadata?: Json | null
          operation_type: string
        }
        Update: {
          created_at?: string | null
          file_count?: number | null
          file_name?: string | null
          file_size?: number | null
          file_types?: string[] | null
          id?: string
          metadata?: Json | null
          operation_type?: string
        }
        Relationships: []
      }
      gl_accounts: {
        Row: {
          association_id: string | null
          category: string
          code: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          category: string
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          category?: string
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_accounts_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      html_templates: {
        Row: {
          association_id: string | null
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_global: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "html_templates_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          association_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          entry_date: string
          id: string
          posted_by: string | null
          posted_date: string | null
          reference: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entry_date: string
          id?: string
          posted_by?: string | null
          posted_date?: string | null
          reference?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          posted_by?: string | null
          posted_date?: string | null
          reference?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          address_line2: string | null
          assignedto: string | null
          association_name: string | null
          association_type: string | null
          city: string | null
          company: string | null
          createdat: string
          current_management: string | null
          email: string
          has_gate: boolean | null
          has_onsite_management: boolean | null
          has_pool: boolean | null
          id: string
          lastcontactedat: string | null
          name: string | null
          notes: string | null
          phone: string | null
          proposalids: string[] | null
          source: string | null
          state: string | null
          status: string
          tags: string[] | null
          unit_count: number | null
          updatedat: string | null
          uploaded_files: Json | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          address_line2?: string | null
          assignedto?: string | null
          association_name?: string | null
          association_type?: string | null
          city?: string | null
          company?: string | null
          createdat?: string
          current_management?: string | null
          email: string
          has_gate?: boolean | null
          has_onsite_management?: boolean | null
          has_pool?: boolean | null
          id?: string
          lastcontactedat?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          proposalids?: string[] | null
          source?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          unit_count?: number | null
          updatedat?: string | null
          uploaded_files?: Json | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          address_line2?: string | null
          assignedto?: string | null
          association_name?: string | null
          association_type?: string | null
          city?: string | null
          company?: string | null
          createdat?: string
          current_management?: string | null
          email?: string
          has_gate?: boolean | null
          has_onsite_management?: boolean | null
          has_pool?: boolean | null
          id?: string
          lastcontactedat?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          proposalids?: string[] | null
          source?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          unit_count?: number | null
          updatedat?: string | null
          uploaded_files?: Json | null
          zip?: string | null
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          account_id: string | null
          amount: number
          association_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          entry_type: string
          gl_account_id: string | null
          id: string
          journal_entry_id: string | null
          reference_number: string | null
          transaction_date: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          association_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entry_type: string
          gl_account_id?: string | null
          id?: string
          journal_entry_id?: string | null
          reference_number?: string | null
          transaction_date: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entry_type?: string
          gl_account_id?: string | null
          id?: string
          journal_entry_id?: string | null
          reference_number?: string | null
          transaction_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_terms: {
        Row: {
          created_at: string | null
          days_due: number | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          days_due?: number | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          days_due?: number | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          profile_image_url: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          association_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string | null
          id: string
          property_type: string | null
          square_feet: number | null
          state: string | null
          unit_number: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address: string
          association_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          square_feet?: number | null
          state?: string | null
          unit_number?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string
          association_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          id?: string
          property_type?: string | null
          square_feet?: number | null
          state?: string | null
          unit_number?: string | null
          updated_at?: string | null
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
      proposal_sections: {
        Row: {
          content: string
          description: string | null
          id: string
          proposalid: string | null
          sortorder: number | null
          title: string
          type: string
        }
        Insert: {
          content: string
          description?: string | null
          id?: string
          proposalid?: string | null
          sortorder?: number | null
          title: string
          type: string
        }
        Update: {
          content?: string
          description?: string | null
          id?: string
          proposalid?: string | null
          sortorder?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_sections_proposalid_fkey"
            columns: ["proposalid"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_views: {
        Row: {
          id: string
          proposalid: string | null
          sections: Json | null
          totaltimespent: number | null
          viewedat: string
          vieweremail: string
          viewerip: string | null
        }
        Insert: {
          id?: string
          proposalid?: string | null
          sections?: Json | null
          totaltimespent?: number | null
          viewedat?: string
          vieweremail: string
          viewerip?: string | null
        }
        Update: {
          id?: string
          proposalid?: string | null
          sections?: Json | null
          totaltimespent?: number | null
          viewedat?: string
          vieweremail?: string
          viewerip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_views_proposalid_fkey"
            columns: ["proposalid"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          createdat: string
          createdby: string | null
          description: string | null
          id: string
          lastviewedat: string | null
          name: string
          sections: Json
          updatedat: string | null
          viewcount: number | null
        }
        Insert: {
          createdat?: string
          createdby?: string | null
          description?: string | null
          id?: string
          lastviewedat?: string | null
          name: string
          sections?: Json
          updatedat?: string | null
          viewcount?: number | null
        }
        Update: {
          createdat?: string
          createdby?: string | null
          description?: string | null
          id?: string
          lastviewedat?: string | null
          name?: string
          sections?: Json
          updatedat?: string | null
          viewcount?: number | null
        }
        Relationships: []
      }
      report_data: {
        Row: {
          association_id: string | null
          created_at: string | null
          data: Json
          id: string
          report_category: string
          report_type: string
          time_range: string
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          data: Json
          id?: string
          report_category: string
          report_type: string
          time_range: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          report_category?: string
          report_type?: string
          time_range?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_data_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_certificates: {
        Row: {
          assessment_frequency: string | null
          association_name: string
          closing_date: string | null
          created_at: string | null
          created_by: string | null
          id: string
          litigation: string | null
          outstanding_balance: number | null
          owner_name: string
          property_id: string | null
          regular_assessment: number | null
          special_assessment: string | null
          status: string | null
          transfer_fee: number | null
          updated_at: string | null
          violations: string | null
        }
        Insert: {
          assessment_frequency?: string | null
          association_name: string
          closing_date?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          litigation?: string | null
          outstanding_balance?: number | null
          owner_name: string
          property_id?: string | null
          regular_assessment?: number | null
          special_assessment?: string | null
          status?: string | null
          transfer_fee?: number | null
          updated_at?: string | null
          violations?: string | null
        }
        Update: {
          assessment_frequency?: string | null
          association_name?: string
          closing_date?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          litigation?: string | null
          outstanding_balance?: number | null
          owner_name?: string
          property_id?: string | null
          regular_assessment?: number | null
          special_assessment?: string | null
          status?: string | null
          transfer_fee?: number | null
          updated_at?: string | null
          violations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resale_certificates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_profiles: {
        Row: {
          balance: number | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          mailing_address: string | null
          move_in_date: string
          move_out_date: string | null
          payment_preference: string | null
          phone: string | null
          property: string | null
          property_address: string | null
          status: string
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          mailing_address?: string | null
          move_in_date: string
          move_out_date?: string | null
          payment_preference?: string | null
          phone?: string | null
          property?: string | null
          property_address?: string | null
          status: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mailing_address?: string | null
          move_in_date?: string
          move_out_date?: string | null
          payment_preference?: string | null
          phone?: string | null
          property?: string | null
          property_address?: string | null
          status?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      residents: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          move_in_date: string | null
          move_out_date: string | null
          property_id: string | null
          resident_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          property_id?: string | null
          resident_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          property_id?: string | null
          resident_type?: string
          updated_at?: string | null
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
      scheduled_processes: {
        Row: {
          association_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          frequency: string
          id: string
          last_end: string | null
          last_run: string | null
          name: string
          parameters: Json | null
          process_type: string
          run_time: string
          start_date: string
        }
        Insert: {
          association_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          frequency?: string
          id?: string
          last_end?: string | null
          last_run?: string | null
          name: string
          parameters?: Json | null
          process_type: string
          run_time: string
          start_date: string
        }
        Update: {
          association_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          frequency?: string
          id?: string
          last_end?: string | null
          last_run?: string | null
          name?: string
          parameters?: Json | null
          process_type?: string
          run_time?: string
          start_date?: string
        }
        Relationships: []
      }
      section_views: {
        Row: {
          id: string
          proposalid: string | null
          sectionid: string | null
          timespent: number | null
          viewedat: string
          vieweremail: string
        }
        Insert: {
          id?: string
          proposalid?: string | null
          sectionid?: string | null
          timespent?: number | null
          viewedat?: string
          vieweremail: string
        }
        Update: {
          id?: string
          proposalid?: string | null
          sectionid?: string | null
          timespent?: number | null
          viewedat?: string
          vieweremail?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_views_proposalid_fkey"
            columns: ["proposalid"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_views_sectionid_fkey"
            columns: ["sectionid"]
            isOneToOne: false
            referencedRelation: "proposal_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          integration_name: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          integration_name: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          integration_name?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_data?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendor_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_documents: {
        Row: {
          document_type: string | null
          expiration_date: string | null
          file_path: string
          file_type: string | null
          id: string
          is_insurance: boolean | null
          name: string
          size: number | null
          uploaded_at: string | null
          uploaded_by: string | null
          vendor_id: string | null
        }
        Insert: {
          document_type?: string | null
          expiration_date?: string | null
          file_path: string
          file_type?: string | null
          id?: string
          is_insurance?: boolean | null
          name: string
          size?: number | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          vendor_id?: string | null
        }
        Update: {
          document_type?: string | null
          expiration_date?: string | null
          file_path?: string
          file_type?: string | null
          id?: string
          is_insurance?: boolean | null
          name?: string
          size?: number | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_insurance: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          agent_phone: string | null
          coverage_amount: number | null
          coverage_type: string | null
          created_at: string | null
          expiration_date: string | null
          id: string
          next_verification_date: string | null
          policy_number: string | null
          provider: string | null
          updated_at: string | null
          vendor_id: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          coverage_amount?: number | null
          coverage_type?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          next_verification_date?: string | null
          policy_number?: string | null
          provider?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          agent_phone?: string | null
          coverage_amount?: number | null
          coverage_type?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          next_verification_date?: string | null
          policy_number?: string | null
          provider?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_insurance_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_insurance_documents: {
        Row: {
          document_name: string
          document_type: string | null
          expiration_date: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_verified: boolean | null
          uploaded_at: string | null
          vendor_id: string | null
        }
        Insert: {
          document_name: string
          document_type?: string | null
          expiration_date?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_verified?: boolean | null
          uploaded_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string | null
          expiration_date?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_verified?: boolean | null
          uploaded_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_insurance_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_insurance_notifications: {
        Row: {
          created_at: string | null
          id: string
          insurance_id: string | null
          notification_type: string
          recipient: string | null
          scheduled_date: string
          sent_at: string | null
          status: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insurance_id?: string | null
          notification_type: string
          recipient?: string | null
          scheduled_date: string
          sent_at?: string | null
          status?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insurance_id?: string | null
          notification_type?: string
          recipient?: string | null
          scheduled_date?: string
          sent_at?: string | null
          status?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_insurance_notifications_insurance_id_fkey"
            columns: ["insurance_id"]
            isOneToOne: false
            referencedRelation: "vendor_insurance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_insurance_notifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_insurance_requirements: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          min_coverage_amount: number | null
          required_coverage_types: string[] | null
          updated_at: string | null
          vendor_category_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          min_coverage_amount?: number | null
          required_coverage_types?: string[] | null
          updated_at?: string | null
          vendor_category_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          min_coverage_amount?: number | null
          required_coverage_types?: string[] | null
          updated_at?: string | null
          vendor_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_insurance_requirements_vendor_category_id_fkey"
            columns: ["vendor_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          vendor_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          vendor_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_notes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rated_by: string | null
          rating: number
          vendor_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_by?: string | null
          rating: number
          vendor_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_by?: string | null
          rating?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ratings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          rate: number | null
          rate_type: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          rate?: number | null
          rate_type?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          rate?: number | null
          rate_type?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          label: string
          type: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          label: string
          type: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          label?: string
          type?: string
        }
        Relationships: []
      }
      vendor_to_tags: {
        Row: {
          tag_id: string
          vendor_id: string
        }
        Insert: {
          tag_id: string
          vendor_id: string
        }
        Update: {
          tag_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_to_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vendor_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_to_tags_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address1: string | null
          address2: string | null
          association_id: string | null
          check_name: string | null
          city: string | null
          compliance_group: string | null
          compliance_status: string | null
          contact_name: string | null
          created_at: string | null
          dba: string | null
          default_payment_method: string | null
          email: string | null
          hold_payment: boolean | null
          hold_reason: string | null
          id: string
          insurance: Json | null
          is_1099: boolean | null
          is_compliant: boolean | null
          is_default: boolean | null
          is_preferred: boolean | null
          name: string
          notes: string | null
          old_provider_id: string | null
          payment_terms_id: string | null
          phone: string | null
          provider_type: string | null
          report_1099_box: string | null
          state: string | null
          status: string | null
          street_no: string | null
          tags: Json | null
          tax_id: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          association_id?: string | null
          check_name?: string | null
          city?: string | null
          compliance_group?: string | null
          compliance_status?: string | null
          contact_name?: string | null
          created_at?: string | null
          dba?: string | null
          default_payment_method?: string | null
          email?: string | null
          hold_payment?: boolean | null
          hold_reason?: string | null
          id?: string
          insurance?: Json | null
          is_1099?: boolean | null
          is_compliant?: boolean | null
          is_default?: boolean | null
          is_preferred?: boolean | null
          name: string
          notes?: string | null
          old_provider_id?: string | null
          payment_terms_id?: string | null
          phone?: string | null
          provider_type?: string | null
          report_1099_box?: string | null
          state?: string | null
          status?: string | null
          street_no?: string | null
          tags?: Json | null
          tax_id?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address1?: string | null
          address2?: string | null
          association_id?: string | null
          check_name?: string | null
          city?: string | null
          compliance_group?: string | null
          compliance_status?: string | null
          contact_name?: string | null
          created_at?: string | null
          dba?: string | null
          default_payment_method?: string | null
          email?: string | null
          hold_payment?: boolean | null
          hold_reason?: string | null
          id?: string
          insurance?: Json | null
          is_1099?: boolean | null
          is_compliant?: boolean | null
          is_default?: boolean | null
          is_preferred?: boolean | null
          name?: string
          notes?: string | null
          old_provider_id?: string | null
          payment_terms_id?: string | null
          phone?: string | null
          provider_type?: string | null
          report_1099_box?: string | null
          state?: string | null
          status?: string | null
          street_no?: string | null
          tags?: Json | null
          tax_id?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_association_fk"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payment_terms_fk"
            columns: ["payment_terms_id"]
            isOneToOne: false
            referencedRelation: "payment_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      violation_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
          violation_id: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          violation_id?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          violation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "violation_attachments_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "violations"
            referencedColumns: ["id"]
          },
        ]
      }
      violation_communications: {
        Row: {
          communication_type: string | null
          created_at: string | null
          delivery_status: string | null
          id: string
          message: string
          sent_by: string | null
          sent_date: string | null
          sent_to: string | null
          violation_id: string | null
        }
        Insert: {
          communication_type?: string | null
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          message: string
          sent_by?: string | null
          sent_date?: string | null
          sent_to?: string | null
          violation_id?: string | null
        }
        Update: {
          communication_type?: string | null
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          message?: string
          sent_by?: string | null
          sent_date?: string | null
          sent_to?: string | null
          violation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "violation_communications_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "violations"
            referencedColumns: ["id"]
          },
        ]
      }
      violation_templates: {
        Row: {
          association_id: string | null
          category: string | null
          created_at: string | null
          default_due_days: number | null
          default_fine: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          category?: string | null
          created_at?: string | null
          default_due_days?: number | null
          default_fine?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          category?: string | null
          created_at?: string | null
          default_due_days?: number | null
          default_fine?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "violation_templates_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      violations: {
        Row: {
          association_id: string | null
          created_at: string | null
          description: string | null
          id: string
          property_id: string | null
          reported_date: string | null
          resolved_date: string | null
          status: string | null
          updated_at: string | null
          violation_type: string
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          property_id?: string | null
          reported_date?: string | null
          resolved_date?: string | null
          status?: string | null
          updated_at?: string | null
          violation_type: string
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          property_id?: string | null
          reported_date?: string | null
          resolved_date?: string | null
          status?: string | null
          updated_at?: string | null
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "violations_property_id_fkey"
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
      storage_path_for_association: {
        Args: { association_id: string }
        Returns: string
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
