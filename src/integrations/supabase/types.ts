export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_credits: {
        Row: {
          amount: number
          applied_to_invoice_id: string | null
          association_id: string
          created_at: string | null
          created_by: string | null
          credit_date: string
          credit_type: string
          description: string | null
          expiry_date: string | null
          gl_account_code: string | null
          id: string
          property_id: string
          reference_number: string | null
          remaining_balance: number
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          applied_to_invoice_id?: string | null
          association_id: string
          created_at?: string | null
          created_by?: string | null
          credit_date: string
          credit_type: string
          description?: string | null
          expiry_date?: string | null
          gl_account_code?: string | null
          id?: string
          property_id: string
          reference_number?: string | null
          remaining_balance: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          applied_to_invoice_id?: string | null
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          credit_date?: string
          credit_type?: string
          description?: string | null
          expiry_date?: string | null
          gl_account_code?: string | null
          id?: string
          property_id?: string
          reference_number?: string | null
          remaining_balance?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      accounts_payable: {
        Row: {
          aging_bucket: string | null
          aging_days: number | null
          ap_number: string
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          association_id: string
          created_at: string | null
          created_by: string | null
          current_balance: number
          description: string | null
          discount_amount: number | null
          due_date: string
          gl_account_code: string | null
          id: string
          invoice_date: string
          invoice_id: string | null
          invoice_number: string | null
          is_recurring: boolean | null
          original_amount: number
          paid_amount: number | null
          payment_batch_id: string | null
          payment_terms: string | null
          purchase_order_number: string | null
          recurring_schedule: Json | null
          reference_number: string | null
          status: string
          updated_at: string | null
          vendor_id: string | null
          vendor_name: string
          withholding_amount: number | null
        }
        Insert: {
          aging_bucket?: string | null
          aging_days?: number | null
          ap_number: string
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          association_id: string
          created_at?: string | null
          created_by?: string | null
          current_balance: number
          description?: string | null
          discount_amount?: number | null
          due_date: string
          gl_account_code?: string | null
          id?: string
          invoice_date: string
          invoice_id?: string | null
          invoice_number?: string | null
          is_recurring?: boolean | null
          original_amount: number
          paid_amount?: number | null
          payment_batch_id?: string | null
          payment_terms?: string | null
          purchase_order_number?: string | null
          recurring_schedule?: Json | null
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name: string
          withholding_amount?: number | null
        }
        Update: {
          aging_bucket?: string | null
          aging_days?: number | null
          ap_number?: string
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          current_balance?: number
          description?: string | null
          discount_amount?: number | null
          due_date?: string
          gl_account_code?: string | null
          id?: string
          invoice_date?: string
          invoice_id?: string | null
          invoice_number?: string | null
          is_recurring?: boolean | null
          original_amount?: number
          paid_amount?: number | null
          payment_batch_id?: string | null
          payment_terms?: string | null
          purchase_order_number?: string | null
          recurring_schedule?: Json | null
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name?: string
          withholding_amount?: number | null
        }
        Relationships: []
      }
      accounts_receivable: {
        Row: {
          aging_bucket: string | null
          aging_days: number | null
          association_id: string
          collections_case_id: string | null
          created_at: string | null
          current_balance: number
          due_date: string
          gl_account_code: string | null
          id: string
          invoice_date: string
          invoice_number: string | null
          invoice_type: string
          is_in_collections: boolean | null
          last_payment_date: string | null
          original_amount: number
          paid_amount: number | null
          property_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          aging_bucket?: string | null
          aging_days?: number | null
          association_id: string
          collections_case_id?: string | null
          created_at?: string | null
          current_balance: number
          due_date: string
          gl_account_code?: string | null
          id?: string
          invoice_date: string
          invoice_number?: string | null
          invoice_type: string
          is_in_collections?: boolean | null
          last_payment_date?: string | null
          original_amount: number
          paid_amount?: number | null
          property_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          aging_bucket?: string | null
          aging_days?: number | null
          association_id?: string
          collections_case_id?: string | null
          created_at?: string | null
          current_balance?: number
          due_date?: string
          gl_account_code?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          invoice_type?: string
          is_in_collections?: boolean | null
          last_payment_date?: string | null
          original_amount?: number
          paid_amount?: number | null
          property_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_collections_case_id_fkey"
            columns: ["collections_case_id"]
            isOneToOne: false
            referencedRelation: "collections_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_chains: {
        Row: {
          association_id: string
          created_at: string
          current_task_index: number
          id: string
          metadata: Json
          name: string
          status: string
          tasks: Json
          updated_at: string
        }
        Insert: {
          association_id: string
          created_at?: string
          current_task_index?: number
          id: string
          metadata?: Json
          name: string
          status?: string
          tasks?: Json
          updated_at?: string
        }
        Update: {
          association_id?: string
          created_at?: string
          current_task_index?: number
          id?: string
          metadata?: Json
          name?: string
          status?: string
          tasks?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ai_conversation_history: {
        Row: {
          association_id: string
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          association_id: string
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          association_id?: string
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_document_processing_results: {
        Row: {
          association_id: string
          compliance_check: Json | null
          confidence: number
          created_at: string
          document_type: string
          extracted_data: Json
          id: string
          metadata: Json
          risk_assessment: Json | null
          updated_at: string
        }
        Insert: {
          association_id: string
          compliance_check?: Json | null
          confidence: number
          created_at?: string
          document_type: string
          extracted_data?: Json
          id?: string
          metadata?: Json
          risk_assessment?: Json | null
          updated_at?: string
        }
        Update: {
          association_id?: string
          compliance_check?: Json | null
          confidence?: number
          created_at?: string
          document_type?: string
          extracted_data?: Json
          id?: string
          metadata?: Json
          risk_assessment?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_financial_forecasts: {
        Row: {
          accuracy: number
          association_id: string
          created_at: string
          forecast_type: string
          id: string
          metadata: Json
          predictions: Json
          recommendations: Json
          updated_at: string
        }
        Insert: {
          accuracy: number
          association_id: string
          created_at?: string
          forecast_type: string
          id?: string
          metadata?: Json
          predictions?: Json
          recommendations?: Json
          updated_at?: string
        }
        Update: {
          accuracy?: number
          association_id?: string
          created_at?: string
          forecast_type?: string
          id?: string
          metadata?: Json
          predictions?: Json
          recommendations?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ai_learning_corrections: {
        Row: {
          confidence_after: number | null
          confidence_before: number | null
          corrected_value: Json
          correction_type: string
          created_at: string | null
          id: string
          invoice_id: string | null
          line_item_id: string | null
          original_suggestion: Json
          user_id: string | null
        }
        Insert: {
          confidence_after?: number | null
          confidence_before?: number | null
          corrected_value: Json
          correction_type: string
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          line_item_id?: string | null
          original_suggestion: Json
          user_id?: string | null
        }
        Update: {
          confidence_after?: number | null
          confidence_before?: number | null
          corrected_value?: Json
          correction_type?: string
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          line_item_id?: string | null
          original_suggestion?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_corrections_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_corrections_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_corrections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_maintenance_predictions: {
        Row: {
          created_at: string
          equipment_type: string
          estimated_cost: Json
          id: string
          prediction_type: string
          preventive_actions: string[] | null
          probability: number
          property_id: string
          risk_factors: string[] | null
          timeframe: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_type: string
          estimated_cost: Json
          id?: string
          prediction_type: string
          preventive_actions?: string[] | null
          probability: number
          property_id: string
          risk_factors?: string[] | null
          timeframe: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_type?: string
          estimated_cost?: Json
          id?: string
          prediction_type?: string
          preventive_actions?: string[] | null
          probability?: number
          property_id?: string
          risk_factors?: string[] | null
          timeframe?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ai_model_performance: {
        Row: {
          accuracy_score: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_trained: string | null
          model_name: string
          model_version: string
          performance_metrics: Json
          training_data_size: number | null
          updated_at: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_trained?: string | null
          model_name: string
          model_version: string
          performance_metrics?: Json
          training_data_size?: number | null
          updated_at?: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_trained?: string | null
          model_name?: string
          model_version?: string
          performance_metrics?: Json
          training_data_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_model_training_jobs: {
        Row: {
          accuracy_improvement: number | null
          association_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_status: string
          model_type: string
          started_at: string | null
          training_data_size: number | null
          updated_at: string
        }
        Insert: {
          accuracy_improvement?: number | null
          association_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_status?: string
          model_type: string
          started_at?: string | null
          training_data_size?: number | null
          updated_at?: string
        }
        Update: {
          accuracy_improvement?: number | null
          association_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_status?: string
          model_type?: string
          started_at?: string | null
          training_data_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          accuracy_score: number | null
          actual_outcome: Json | null
          association_id: string | null
          confidence_level: number
          created_at: string
          id: string
          model_version: string | null
          prediction_data: Json
          prediction_type: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          association_id?: string | null
          confidence_level?: number
          created_at?: string
          id?: string
          model_version?: string | null
          prediction_data?: Json
          prediction_type: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          association_id?: string | null
          confidence_level?: number
          created_at?: string
          id?: string
          model_version?: string | null
          prediction_data?: Json
          prediction_type?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_predictions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_processing_queue: {
        Row: {
          association_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          image_url: string
          invoice_id: string | null
          max_retries: number | null
          priority: number | null
          processing_completed_at: string | null
          processing_started_at: string | null
          retry_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_url: string
          invoice_id?: string | null
          max_retries?: number | null
          priority?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_url?: string
          invoice_id?: string | null
          max_retries?: number | null
          priority?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_queue_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_processing_queue_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_processing_results: {
        Row: {
          confidence_scores: Json | null
          created_at: string | null
          id: string
          invoice_id: string | null
          model_version: string | null
          processing_time_ms: number | null
          raw_text_extracted: string | null
          structured_data: Json | null
        }
        Insert: {
          confidence_scores?: Json | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          model_version?: string | null
          processing_time_ms?: number | null
          raw_text_extracted?: string | null
          structured_data?: Json | null
        }
        Update: {
          confidence_scores?: Json | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          model_version?: string | null
          processing_time_ms?: number | null
          raw_text_extracted?: string | null
          structured_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_results_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_resident_insights: {
        Row: {
          action_items: Json
          association_id: string
          created_at: string
          id: string
          insight_type: string
          patterns: Json
          recommendations: string[] | null
          updated_at: string
        }
        Insert: {
          action_items?: Json
          association_id: string
          created_at?: string
          id?: string
          insight_type: string
          patterns?: Json
          recommendations?: string[] | null
          updated_at?: string
        }
        Update: {
          action_items?: Json
          association_id?: string
          created_at?: string
          id?: string
          insight_type?: string
          patterns?: Json
          recommendations?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
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
      ai_vendor_patterns: {
        Row: {
          association_id: string | null
          created_at: string | null
          frequency_count: number | null
          id: string
          last_updated: string | null
          pattern_data: Json
          vendor_name: string
          vendor_normalized: string
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          last_updated?: string | null
          pattern_data: Json
          vendor_name: string
          vendor_normalized: string
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          frequency_count?: number | null
          id?: string
          last_updated?: string | null
          pattern_data?: Json
          vendor_name?: string
          vendor_normalized?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_vendor_patterns_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_vision_analysis_results: {
        Row: {
          analysis_type: string
          association_id: string
          created_at: string
          estimated_cost: number | null
          findings: Json
          id: string
          overall_score: number | null
          property_id: string | null
          recommendations: string[] | null
          updated_at: string
        }
        Insert: {
          analysis_type: string
          association_id: string
          created_at?: string
          estimated_cost?: number | null
          findings?: Json
          id?: string
          overall_score?: number | null
          property_id?: string | null
          recommendations?: string[] | null
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          association_id?: string
          created_at?: string
          estimated_cost?: number | null
          findings?: Json
          id?: string
          overall_score?: number | null
          property_id?: string | null
          recommendations?: string[] | null
          updated_at?: string
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
      analytics_dashboards: {
        Row: {
          association_id: string | null
          created_at: string | null
          created_by: string | null
          dashboard_config: Json
          dashboard_name: string
          id: string
          is_active: boolean | null
          refresh_interval: number | null
          updated_at: string | null
          widgets: Json | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dashboard_config?: Json
          dashboard_name: string
          id?: string
          is_active?: boolean | null
          refresh_interval?: number | null
          updated_at?: string | null
          widgets?: Json | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dashboard_config?: Json
          dashboard_name?: string
          id?: string
          is_active?: boolean | null
          refresh_interval?: number | null
          updated_at?: string | null
          widgets?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_dashboards_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_metrics: {
        Row: {
          aggregation_period: string | null
          association_id: string | null
          created_at: string | null
          dimensions: Json | null
          id: string
          metric_name: string
          metric_type: string
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          aggregation_period?: string | null
          association_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          metric_name: string
          metric_type: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          aggregation_period?: string | null
          association_id?: string | null
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_metrics_association_id_fkey"
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
      api_keys: {
        Row: {
          association_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key: string
          last_used: string | null
          name: string
          permissions: string[] | null
          rate_limit_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          last_used?: string | null
          name: string
          permissions?: string[] | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          last_used?: string | null
          name?: string
          permissions?: string[] | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          api_key_id: string | null
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          response_time: number
          status_code: number
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          response_time: number
          status_code: number
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          response_time?: number
          status_code?: number
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_billing_cycles: {
        Row: {
          assessment_types: Json
          association_id: string
          auto_generate: boolean | null
          billing_day: number
          created_at: string | null
          created_by: string | null
          cycle_name: string
          cycle_type: string
          due_day: number
          grace_period_days: number | null
          id: string
          is_active: boolean | null
          last_generated_date: string | null
          late_fee_day: number | null
          next_billing_date: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_types?: Json
          association_id: string
          auto_generate?: boolean | null
          billing_day?: number
          created_at?: string | null
          created_by?: string | null
          cycle_name: string
          cycle_type: string
          due_day?: number
          grace_period_days?: number | null
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          late_fee_day?: number | null
          next_billing_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_types?: Json
          association_id?: string
          auto_generate?: boolean | null
          billing_day?: number
          created_at?: string | null
          created_by?: string | null
          cycle_name?: string
          cycle_type?: string
          due_day?: number
          grace_period_days?: number | null
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          late_fee_day?: number | null
          next_billing_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      assessment_billing_runs: {
        Row: {
          association_id: string
          billing_cycle_id: string
          billing_period_end: string
          billing_period_start: string
          created_at: string | null
          created_by: string | null
          error_details: string | null
          id: string
          run_date: string
          status: string
          total_amount: number | null
          total_assessments_generated: number | null
        }
        Insert: {
          association_id: string
          billing_cycle_id: string
          billing_period_end: string
          billing_period_start: string
          created_at?: string | null
          created_by?: string | null
          error_details?: string | null
          id?: string
          run_date: string
          status?: string
          total_amount?: number | null
          total_assessments_generated?: number | null
        }
        Update: {
          association_id?: string
          billing_cycle_id?: string
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string | null
          created_by?: string | null
          error_details?: string | null
          id?: string
          run_date?: string
          status?: string
          total_amount?: number | null
          total_assessments_generated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_billing_runs_billing_cycle_id_fkey"
            columns: ["billing_cycle_id"]
            isOneToOne: false
            referencedRelation: "assessment_billing_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_schedules: {
        Row: {
          amount: number
          assessment_type_id: string
          association_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          last_generated_at: string | null
          name: string
          next_generation_date: string | null
          recurrence_day: number | null
          recurrence_month: number | null
          schedule_type: string
          start_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          assessment_type_id: string
          association_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          name: string
          next_generation_date?: string | null
          recurrence_day?: number | null
          recurrence_month?: number | null
          schedule_type: string
          start_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          assessment_type_id?: string
          association_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          name?: string
          next_generation_date?: string | null
          recurrence_day?: number | null
          recurrence_month?: number | null
          schedule_type?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_schedules_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_schedules_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
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
      assessment_types_enhanced: {
        Row: {
          approval_threshold: number | null
          association_id: string
          auto_generate: boolean | null
          base_amount: number | null
          calculation_formula: string | null
          calculation_method: string | null
          category: string
          compound_late_fees: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          gl_account_code: string | null
          grace_period_days: number | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          late_fee_amount: number | null
          late_fee_type: string | null
          name: string
          payment_terms_days: number | null
          proration_method: string | null
          recurrence_pattern: Json | null
          requires_approval: boolean | null
          tax_code: string | null
          updated_at: string | null
        }
        Insert: {
          approval_threshold?: number | null
          association_id: string
          auto_generate?: boolean | null
          base_amount?: number | null
          calculation_formula?: string | null
          calculation_method?: string | null
          category: string
          compound_late_fees?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          gl_account_code?: string | null
          grace_period_days?: number | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          late_fee_amount?: number | null
          late_fee_type?: string | null
          name: string
          payment_terms_days?: number | null
          proration_method?: string | null
          recurrence_pattern?: Json | null
          requires_approval?: boolean | null
          tax_code?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_threshold?: number | null
          association_id?: string
          auto_generate?: boolean | null
          base_amount?: number | null
          calculation_formula?: string | null
          calculation_method?: string | null
          category?: string
          compound_late_fees?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          gl_account_code?: string | null
          grace_period_days?: number | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          late_fee_amount?: number | null
          late_fee_type?: string | null
          name?: string
          payment_terms_days?: number | null
          proration_method?: string | null
          recurrence_pattern?: Json | null
          requires_approval?: boolean | null
          tax_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          payment_due_date: string | null
          payment_status: string | null
          payment_url: string | null
          property_id: string
          stripe_session_id: string | null
          total_amount_paid: number | null
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
          payment_due_date?: string | null
          payment_status?: string | null
          payment_url?: string | null
          property_id: string
          stripe_session_id?: string | null
          total_amount_paid?: number | null
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
          payment_due_date?: string | null
          payment_status?: string | null
          payment_url?: string | null
          property_id?: string
          stripe_session_id?: string | null
          total_amount_paid?: number | null
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
          accounting_method: string | null
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
          cash_basis: boolean | null
          city: string | null
          code: string | null
          collections_active: string | null
          collections_model: string | null
          contact_email: string | null
          country: string | null
          county: string | null
          created_at: string
          decline_threshold: number | null
          description: string | null
          email_notifications: boolean | null
          empty_lots: number | null
          fire_inspection_due: string | null
          fiscal_year_end: string | null
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
          is_master_association: boolean | null
          late_fee_percentage: string | null
          legal_name: string | null
          lien_threshold: string | null
          lien_threshold_type: string | null
          logo_url: string | null
          master_association_code: string | null
          minimum_balance: number | null
          model: string | null
          name: string
          new_association_grace_period: string | null
          new_owner_grace_period: string | null
          nickname: string | null
          offsite_addresses: number | null
          payment_due_day: string | null
          phone: string | null
          portfolios: string | null
          primary_color: string | null
          processing_days: string | null
          property_type: string | null
          remittance_coupon_message: string | null
          require_arc_voting: boolean | null
          secondary_color: string | null
          service_type: string | null
          sms_notifications: boolean | null
          state: string | null
          state_tax_id: string | null
          statement_format: string | null
          status: string | null
          tax_id: string | null
          total_leases: number | null
          total_properties: number | null
          total_tenants: number | null
          total_units: number | null
          updated_at: string
          utilities_billing_message: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          accounting_method?: string | null
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
          cash_basis?: boolean | null
          city?: string | null
          code?: string | null
          collections_active?: string | null
          collections_model?: string | null
          contact_email?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          decline_threshold?: number | null
          description?: string | null
          email_notifications?: boolean | null
          empty_lots?: number | null
          fire_inspection_due?: string | null
          fiscal_year_end?: string | null
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
          is_master_association?: boolean | null
          late_fee_percentage?: string | null
          legal_name?: string | null
          lien_threshold?: string | null
          lien_threshold_type?: string | null
          logo_url?: string | null
          master_association_code?: string | null
          minimum_balance?: number | null
          model?: string | null
          name: string
          new_association_grace_period?: string | null
          new_owner_grace_period?: string | null
          nickname?: string | null
          offsite_addresses?: number | null
          payment_due_day?: string | null
          phone?: string | null
          portfolios?: string | null
          primary_color?: string | null
          processing_days?: string | null
          property_type?: string | null
          remittance_coupon_message?: string | null
          require_arc_voting?: boolean | null
          secondary_color?: string | null
          service_type?: string | null
          sms_notifications?: boolean | null
          state?: string | null
          state_tax_id?: string | null
          statement_format?: string | null
          status?: string | null
          tax_id?: string | null
          total_leases?: number | null
          total_properties?: number | null
          total_tenants?: number | null
          total_units?: number | null
          updated_at?: string
          utilities_billing_message?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          accounting_method?: string | null
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
          cash_basis?: boolean | null
          city?: string | null
          code?: string | null
          collections_active?: string | null
          collections_model?: string | null
          contact_email?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          decline_threshold?: number | null
          description?: string | null
          email_notifications?: boolean | null
          empty_lots?: number | null
          fire_inspection_due?: string | null
          fiscal_year_end?: string | null
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
          is_master_association?: boolean | null
          late_fee_percentage?: string | null
          legal_name?: string | null
          lien_threshold?: string | null
          lien_threshold_type?: string | null
          logo_url?: string | null
          master_association_code?: string | null
          minimum_balance?: number | null
          model?: string | null
          name?: string
          new_association_grace_period?: string | null
          new_owner_grace_period?: string | null
          nickname?: string | null
          offsite_addresses?: number | null
          payment_due_day?: string | null
          phone?: string | null
          portfolios?: string | null
          primary_color?: string | null
          processing_days?: string | null
          property_type?: string | null
          remittance_coupon_message?: string | null
          require_arc_voting?: boolean | null
          secondary_color?: string | null
          service_type?: string | null
          sms_notifications?: boolean | null
          state?: string | null
          state_tax_id?: string | null
          statement_format?: string | null
          status?: string | null
          tax_id?: string | null
          total_leases?: number | null
          total_properties?: number | null
          total_tenants?: number | null
          total_units?: number | null
          updated_at?: string
          utilities_billing_message?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          risk_level: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          risk_level?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          risk_level?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auto_pay_settings: {
        Row: {
          amount_type: string | null
          association_id: string
          created_at: string
          fixed_amount: number | null
          id: string
          is_enabled: boolean | null
          next_payment_date: string | null
          payment_method_id: string | null
          process_day: number | null
          resident_id: string
          updated_at: string
        }
        Insert: {
          amount_type?: string | null
          association_id: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_enabled?: boolean | null
          next_payment_date?: string | null
          payment_method_id?: string | null
          process_day?: number | null
          resident_id: string
          updated_at?: string
        }
        Update: {
          amount_type?: string | null
          association_id?: string
          created_at?: string
          fixed_amount?: number | null
          id?: string
          is_enabled?: boolean | null
          next_payment_date?: string | null
          payment_method_id?: string | null
          process_day?: number | null
          resident_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_sequence: Json
          association_id: string | null
          created_at: string
          created_by: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed: string | null
          learning_enabled: boolean | null
          performance_stats: Json | null
          rule_name: string
          rule_type: string
          success_rate: number | null
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          action_sequence?: Json
          association_id?: string | null
          created_at?: string
          created_by?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          learning_enabled?: boolean | null
          performance_stats?: Json | null
          rule_name: string
          rule_type: string
          success_rate?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          action_sequence?: Json
          association_id?: string | null
          created_at?: string
          created_by?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          learning_enabled?: boolean | null
          performance_stats?: Json | null
          rule_name?: string
          rule_type?: string
          success_rate?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
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
      bank_reconciliation_items: {
        Row: {
          amount: number
          bank_transaction_id: string | null
          cleared_date: string | null
          created_at: string | null
          description: string
          gl_transaction_id: string | null
          id: string
          notes: string | null
          reconciliation_id: string
          reference_number: string | null
          status: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          bank_transaction_id?: string | null
          cleared_date?: string | null
          created_at?: string | null
          description: string
          gl_transaction_id?: string | null
          id?: string
          notes?: string | null
          reconciliation_id: string
          reference_number?: string | null
          status?: string
          transaction_date: string
          transaction_type: string
        }
        Update: {
          amount?: number
          bank_transaction_id?: string | null
          cleared_date?: string | null
          created_at?: string | null
          description?: string
          gl_transaction_id?: string | null
          id?: string
          notes?: string | null
          reconciliation_id?: string
          reference_number?: string | null
          status?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliation_items_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliation_items_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "bank_reconciliations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_reconciliations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_account_id: string
          beginning_balance: number
          created_at: string | null
          difference: number | null
          ending_balance: number
          id: string
          notes: string | null
          reconciled_at: string | null
          reconciled_balance: number
          reconciled_by: string | null
          reconciliation_date: string
          statement_balance: number
          statement_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id: string
          beginning_balance: number
          created_at?: string | null
          difference?: number | null
          ending_balance: number
          id?: string
          notes?: string | null
          reconciled_at?: string | null
          reconciled_balance: number
          reconciled_by?: string | null
          reconciliation_date: string
          statement_balance: number
          statement_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string
          beginning_balance?: number
          created_at?: string | null
          difference?: number | null
          ending_balance?: number
          id?: string
          notes?: string | null
          reconciled_at?: string | null
          reconciled_balance?: number
          reconciled_by?: string | null
          reconciliation_date?: string
          statement_balance?: number
          statement_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliations_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
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
          batch_id: string | null
          category: string | null
          created_at: string
          description: string | null
          gl_account_id: string | null
          id: string
          is_categorized: boolean | null
          is_reconciled: boolean | null
          notes: string | null
          reconciled_at: string | null
          reference_number: string | null
          statement_id: string
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          batch_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          is_categorized?: boolean | null
          is_reconciled?: boolean | null
          notes?: string | null
          reconciled_at?: string | null
          reference_number?: string | null
          statement_id: string
          transaction_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          batch_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          is_categorized?: boolean | null
          is_reconciled?: boolean | null
          notes?: string | null
          reconciled_at?: string | null
          reference_number?: string | null
          statement_id?: string
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
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
      bi_reports: {
        Row: {
          association_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_automated: boolean | null
          last_generated: string | null
          query_definition: Json
          recipients: Json | null
          report_name: string
          report_type: string
          schedule_config: Json | null
          updated_at: string | null
          visualization_config: Json | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_automated?: boolean | null
          last_generated?: string | null
          query_definition: Json
          recipients?: Json | null
          report_name: string
          report_type: string
          schedule_config?: Json | null
          updated_at?: string | null
          visualization_config?: Json | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_automated?: boolean | null
          last_generated?: string | null
          query_definition?: Json
          recipients?: Json | null
          report_name?: string
          report_type?: string
          schedule_config?: Json | null
          updated_at?: string | null
          visualization_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_reports_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_communications: {
        Row: {
          bid_request_id: string | null
          communication_type: string | null
          created_at: string | null
          email_status: string | null
          id: string
          message: string | null
          sent_by: string | null
          subject: string | null
          vendor_id: string | null
        }
        Insert: {
          bid_request_id?: string | null
          communication_type?: string | null
          created_at?: string | null
          email_status?: string | null
          id?: string
          message?: string | null
          sent_by?: string | null
          subject?: string | null
          vendor_id?: string | null
        }
        Update: {
          bid_request_id?: string | null
          communication_type?: string | null
          created_at?: string | null
          email_status?: string | null
          id?: string
          message?: string | null
          sent_by?: string | null
          subject?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_communications_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_request_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_communications_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_communications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_communications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_evaluations: {
        Row: {
          bid_request_id: string | null
          created_at: string | null
          evaluation_criteria: Json | null
          evaluator_id: string | null
          id: string
          notes: string | null
          overall_score: number | null
          recommendation: string | null
          updated_at: string | null
        }
        Insert: {
          bid_request_id?: string | null
          created_at?: string | null
          evaluation_criteria?: Json | null
          evaluator_id?: string | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          recommendation?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_request_id?: string | null
          created_at?: string | null
          evaluation_criteria?: Json | null
          evaluator_id?: string | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          recommendation?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_evaluations_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_request_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_evaluations_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_reminders: {
        Row: {
          bid_request_id: string | null
          created_at: string | null
          id: string
          reminder_type: string | null
          scheduled_date: string
          sent_date: string | null
          status: string | null
          vendor_id: string | null
        }
        Insert: {
          bid_request_id?: string | null
          created_at?: string | null
          id?: string
          reminder_type?: string | null
          scheduled_date: string
          sent_date?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Update: {
          bid_request_id?: string | null
          created_at?: string | null
          id?: string
          reminder_type?: string | null
          scheduled_date?: string
          sent_date?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_reminders_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_request_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_reminders_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_reminders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_reminders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_request_files: {
        Row: {
          bid_request_id: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          bid_request_id?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          bid_request_id?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_request_files_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_request_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_request_files_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
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
            referencedRelation: "bid_request_summary"
            referencedColumns: ["id"]
          },
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
          awarded_amount: number | null
          awarded_at: string | null
          bid_deadline: string | null
          budget: number | null
          budget_range_max: number | null
          budget_range_min: number | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          hoa_id: string | null
          id: string
          image_url: string | null
          location: string | null
          maintenance_request_id: string | null
          preferred_start_date: string | null
          priority: string | null
          required_completion_date: string | null
          selected_vendor_id: string | null
          special_requirements: string | null
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          assigned_to?: string | null
          association_id: string
          attachments?: Json | null
          awarded_amount?: number | null
          awarded_at?: string | null
          bid_deadline?: string | null
          budget?: number | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          hoa_id?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          maintenance_request_id?: string | null
          preferred_start_date?: string | null
          priority?: string | null
          required_completion_date?: string | null
          selected_vendor_id?: string | null
          special_requirements?: string | null
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          assigned_to?: string | null
          association_id?: string
          attachments?: Json | null
          awarded_amount?: number | null
          awarded_at?: string | null
          bid_deadline?: string | null
          budget?: number | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          hoa_id?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          maintenance_request_id?: string | null
          preferred_start_date?: string | null
          priority?: string | null
          required_completion_date?: string | null
          selected_vendor_id?: string | null
          special_requirements?: string | null
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
          {
            foreignKeyName: "bid_requests_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_selected_vendor_id_fkey"
            columns: ["selected_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_selected_vendor_id_fkey"
            columns: ["selected_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_entries: {
        Row: {
          actual_amount: number
          association_id: string
          budget_year: number
          budgeted_amount: number
          created_at: string | null
          created_by: string | null
          gl_account_id: string
          id: string
          notes: string | null
          period_number: number
          period_type: string
          updated_at: string | null
          updated_by: string | null
          variance_amount: number | null
          variance_percent: number | null
        }
        Insert: {
          actual_amount?: number
          association_id: string
          budget_year: number
          budgeted_amount?: number
          created_at?: string | null
          created_by?: string | null
          gl_account_id: string
          id?: string
          notes?: string | null
          period_number: number
          period_type?: string
          updated_at?: string | null
          updated_by?: string | null
          variance_amount?: number | null
          variance_percent?: number | null
        }
        Update: {
          actual_amount?: number
          association_id?: string
          budget_year?: number
          budgeted_amount?: number
          created_at?: string | null
          created_by?: string | null
          gl_account_id?: string
          id?: string
          notes?: string | null
          period_number?: number
          period_type?: string
          updated_at?: string | null
          updated_by?: string | null
          variance_amount?: number | null
          variance_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_entries_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_entries_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_line_items: {
        Row: {
          actual_amount: number | null
          budget_id: string
          budgeted_amount: number
          category: string | null
          created_at: string
          description: string | null
          gl_account_id: string
          id: string
          updated_at: string
          variance_amount: number | null
        }
        Insert: {
          actual_amount?: number | null
          budget_id: string
          budgeted_amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          gl_account_id: string
          id?: string
          updated_at?: string
          variance_amount?: number | null
        }
        Update: {
          actual_amount?: number | null
          budget_id?: string
          budgeted_amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          gl_account_id?: string
          id?: string
          updated_at?: string
          variance_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_line_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_line_items_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          association_id: string
          budget_year: number
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          total_expenses: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          association_id: string
          budget_year: number
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: string
          total_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          association_id?: string
          budget_year?: number
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: string
          total_expenses?: number | null
          total_revenue?: number | null
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
          bounce_reason: string | null
          campaign_id: string
          clicked_date: string | null
          created_at: string
          delivery_attempts: number | null
          email: string
          id: string
          last_delivery_attempt: string | null
          lead_id: string | null
          metadata: Json | null
          opened_date: string | null
          sent_date: string | null
          status:
            | Database["public"]["Enums"]["campaign_recipient_status"]
            | null
          unsubscribe_reason: string | null
          updated_at: string
        }
        Insert: {
          bounce_reason?: string | null
          campaign_id: string
          clicked_date?: string | null
          created_at?: string
          delivery_attempts?: number | null
          email: string
          id?: string
          last_delivery_attempt?: string | null
          lead_id?: string | null
          metadata?: Json | null
          opened_date?: string | null
          sent_date?: string | null
          status?:
            | Database["public"]["Enums"]["campaign_recipient_status"]
            | null
          unsubscribe_reason?: string | null
          updated_at?: string
        }
        Update: {
          bounce_reason?: string | null
          campaign_id?: string
          clicked_date?: string | null
          created_at?: string
          delivery_attempts?: number | null
          email?: string
          id?: string
          last_delivery_attempt?: string | null
          lead_id?: string | null
          metadata?: Json | null
          opened_date?: string | null
          sent_date?: string | null
          status?:
            | Database["public"]["Enums"]["campaign_recipient_status"]
            | null
          unsubscribe_reason?: string | null
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
      cash_flow_forecasts: {
        Row: {
          actual_balance: number | null
          actual_disbursements: number | null
          actual_receipts: number | null
          association_id: string
          confidence_level: number | null
          created_at: string | null
          created_by: string | null
          forecast_date: string
          forecast_type: string
          id: string
          notes: string | null
          opening_balance: number
          projected_balance: number
          projected_disbursements: number
          projected_receipts: number
          updated_at: string | null
          variance_disbursements: number | null
          variance_receipts: number | null
        }
        Insert: {
          actual_balance?: number | null
          actual_disbursements?: number | null
          actual_receipts?: number | null
          association_id: string
          confidence_level?: number | null
          created_at?: string | null
          created_by?: string | null
          forecast_date: string
          forecast_type?: string
          id?: string
          notes?: string | null
          opening_balance?: number
          projected_balance?: number
          projected_disbursements?: number
          projected_receipts?: number
          updated_at?: string | null
          variance_disbursements?: number | null
          variance_receipts?: number | null
        }
        Update: {
          actual_balance?: number | null
          actual_disbursements?: number | null
          actual_receipts?: number | null
          association_id?: string
          confidence_level?: number | null
          created_at?: string | null
          created_by?: string | null
          forecast_date?: string
          forecast_type?: string
          id?: string
          notes?: string | null
          opening_balance?: number
          projected_balance?: number
          projected_disbursements?: number
          projected_receipts?: number
          updated_at?: string | null
          variance_disbursements?: number | null
          variance_receipts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_forecasts_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_flow_forecasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_actions: {
        Row: {
          action_date: string
          action_type: string
          amount: number | null
          case_id: string
          completed_date: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          outcome: string | null
          performed_by: string | null
          scheduled_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action_date?: string
          action_type: string
          amount?: number | null
          case_id: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          outcome?: string | null
          performed_by?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action_date?: string
          action_type?: string
          amount?: number | null
          case_id?: string
          completed_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          outcome?: string | null
          performed_by?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_cases: {
        Row: {
          assigned_to: string | null
          association_id: string
          attorney_assigned: string | null
          attorney_fees: number | null
          case_number: string
          case_status: string
          collection_fees: number | null
          collection_stage: string
          court_case_number: string | null
          court_costs: number | null
          created_at: string | null
          created_by: string | null
          escalation_date: string | null
          id: string
          last_contact_date: string | null
          next_action_date: string | null
          notes: string | null
          original_balance: number
          payment_plan_id: string | null
          property_id: string
          resident_id: string | null
          settlement_amount: number | null
          total_amount_owed: number
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          association_id: string
          attorney_assigned?: string | null
          attorney_fees?: number | null
          case_number: string
          case_status?: string
          collection_fees?: number | null
          collection_stage?: string
          court_case_number?: string | null
          court_costs?: number | null
          created_at?: string | null
          created_by?: string | null
          escalation_date?: string | null
          id?: string
          last_contact_date?: string | null
          next_action_date?: string | null
          notes?: string | null
          original_balance: number
          payment_plan_id?: string | null
          property_id: string
          resident_id?: string | null
          settlement_amount?: number | null
          total_amount_owed: number
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          association_id?: string
          attorney_assigned?: string | null
          attorney_fees?: number | null
          case_number?: string
          case_status?: string
          collection_fees?: number | null
          collection_stage?: string
          court_case_number?: string | null
          court_costs?: number | null
          created_at?: string | null
          created_by?: string | null
          escalation_date?: string | null
          id?: string
          last_contact_date?: string | null
          next_action_date?: string | null
          notes?: string | null
          original_balance?: number
          payment_plan_id?: string | null
          property_id?: string
          resident_id?: string | null
          settlement_amount?: number | null
          total_amount_owed?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_cases_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_cases_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_cases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_cases_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
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
            foreignKeyName: "collections_accounts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_activities: {
        Row: {
          activity_type: string
          amount: number | null
          assigned_to: string | null
          collections_case_id: string
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          metadata: Json | null
          status: string | null
        }
        Insert: {
          activity_type: string
          amount?: number | null
          assigned_to?: string | null
          collections_case_id: string
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
        }
        Update: {
          activity_type?: string
          amount?: number | null
          assigned_to?: string | null
          collections_case_id?: string
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_activities_collections_case_id_fkey"
            columns: ["collections_case_id"]
            isOneToOne: false
            referencedRelation: "collections_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_cases: {
        Row: {
          assigned_to: string | null
          association_id: string
          case_number: string
          closed_at: string | null
          closed_reason: string | null
          collection_stage: string
          created_at: string | null
          current_balance: number
          days_delinquent: number | null
          external_agency: string | null
          id: string
          last_payment_date: string | null
          notes: string | null
          original_balance: number
          priority_level: string | null
          property_id: string
          status: string
          total_amount_due: number
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          association_id: string
          case_number: string
          closed_at?: string | null
          closed_reason?: string | null
          collection_stage?: string
          created_at?: string | null
          current_balance: number
          days_delinquent?: number | null
          external_agency?: string | null
          id?: string
          last_payment_date?: string | null
          notes?: string | null
          original_balance: number
          priority_level?: string | null
          property_id: string
          status?: string
          total_amount_due: number
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          association_id?: string
          case_number?: string
          closed_at?: string | null
          closed_reason?: string | null
          collection_stage?: string
          created_at?: string | null
          current_balance?: number
          days_delinquent?: number | null
          external_agency?: string | null
          id?: string
          last_payment_date?: string | null
          notes?: string | null
          original_balance?: number
          priority_level?: string | null
          property_id?: string
          status?: string
          total_amount_due?: number
          updated_at?: string | null
        }
        Relationships: []
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
      communication_channels: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      communication_intelligence: {
        Row: {
          ai_category: string | null
          association_id: string | null
          auto_routing_rules: Json | null
          communication_id: string | null
          confidence_metrics: Json | null
          created_at: string
          id: string
          message_content: string
          sentiment_score: number | null
          suggested_responses: Json | null
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          ai_category?: string | null
          association_id?: string | null
          auto_routing_rules?: Json | null
          communication_id?: string | null
          confidence_metrics?: Json | null
          created_at?: string
          id?: string
          message_content: string
          sentiment_score?: number | null
          suggested_responses?: Json | null
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          ai_category?: string | null
          association_id?: string | null
          auto_routing_rules?: Json | null
          communication_id?: string | null
          confidence_metrics?: Json | null
          created_at?: string
          id?: string
          message_content?: string
          sentiment_score?: number | null
          suggested_responses?: Json | null
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_intelligence_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
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
      document_import_progress: {
        Row: {
          association_id: string | null
          completed_at: string | null
          created_at: string | null
          created_properties: number | null
          current_stage: string | null
          error_details: Json | null
          failed_imports: number | null
          id: string
          processed_files: number | null
          session_id: string
          stage_progress: number | null
          successful_imports: number | null
          total_files: number | null
          updated_at: string | null
          user_id: string | null
          warnings: Json | null
        }
        Insert: {
          association_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_properties?: number | null
          current_stage?: string | null
          error_details?: Json | null
          failed_imports?: number | null
          id?: string
          processed_files?: number | null
          session_id: string
          stage_progress?: number | null
          successful_imports?: number | null
          total_files?: number | null
          updated_at?: string | null
          user_id?: string | null
          warnings?: Json | null
        }
        Update: {
          association_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_properties?: number | null
          current_stage?: string | null
          error_details?: Json | null
          failed_imports?: number | null
          id?: string
          processed_files?: number | null
          session_id?: string
          stage_progress?: number | null
          successful_imports?: number | null
          total_files?: number | null
          updated_at?: string | null
          user_id?: string | null
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_import_progress_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_processing_queue: {
        Row: {
          ai_classification: Json | null
          confidence_score: number | null
          created_at: string
          document_id: string | null
          extracted_data: Json | null
          id: string
          processing_results: Json | null
          processing_type: string
          status: string
          updated_at: string
          workflow_triggers: Json | null
        }
        Insert: {
          ai_classification?: Json | null
          confidence_score?: number | null
          created_at?: string
          document_id?: string | null
          extracted_data?: Json | null
          id?: string
          processing_results?: Json | null
          processing_type: string
          status?: string
          updated_at?: string
          workflow_triggers?: Json | null
        }
        Update: {
          ai_classification?: Json | null
          confidence_score?: number | null
          created_at?: string
          document_id?: string | null
          extracted_data?: Json | null
          id?: string
          processing_results?: Json | null
          processing_type?: string
          status?: string
          updated_at?: string
          workflow_triggers?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_queue_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string | null
          description: string | null
          form_template_id: string | null
          id: string
          name: string
          template_content: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          form_template_id?: string | null
          id?: string
          name: string
          template_content: string
          template_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          form_template_id?: string | null
          id?: string
          name?: string
          template_content?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_form_template_id_fkey"
            columns: ["form_template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
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
      email_automation_steps: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string | null
          delay_amount: number | null
          id: string
          step_order: number
          step_type: string
          template_id: string | null
          workflow_id: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          delay_amount?: number | null
          id?: string
          step_order: number
          step_type: string
          template_id?: string | null
          workflow_id: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          delay_amount?: number | null
          id?: string
          step_order?: number
          step_type?: string
          template_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_automation_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "email_automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automation_workflows: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_criteria: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_criteria?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_criteria?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_campaign_analytics: {
        Row: {
          campaign_id: string
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          recipient_id: string
          user_agent: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          recipient_id: string
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          recipient_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_analytics_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "campaign_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_segments: {
        Row: {
          campaign_id: string
          created_at: string | null
          criteria: Json
          id: string
          lead_count: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          criteria?: Json
          id?: string
          lead_count?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          criteria?: Json
          id?: string
          lead_count?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_segments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          body: string
          bounce_rate: number | null
          campaign_settings: Json | null
          click_count: number
          click_rate: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          delivery_count: number | null
          id: string
          name: string
          open_count: number
          open_rate: number | null
          recipient_count: number
          scheduled_date: string | null
          send_at: string | null
          sent_date: string | null
          status: Database["public"]["Enums"]["email_campaign_status"] | null
          subject: string
          target_audience: Json | null
          template_id: string | null
          unsubscribe_count: number | null
          updated_at: string
        }
        Insert: {
          body: string
          bounce_rate?: number | null
          campaign_settings?: Json | null
          click_count?: number
          click_rate?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivery_count?: number | null
          id?: string
          name: string
          open_count?: number
          open_rate?: number | null
          recipient_count?: number
          scheduled_date?: string | null
          send_at?: string | null
          sent_date?: string | null
          status?: Database["public"]["Enums"]["email_campaign_status"] | null
          subject: string
          target_audience?: Json | null
          template_id?: string | null
          unsubscribe_count?: number | null
          updated_at?: string
        }
        Update: {
          body?: string
          bounce_rate?: number | null
          campaign_settings?: Json | null
          click_count?: number
          click_rate?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivery_count?: number | null
          id?: string
          name?: string
          open_count?: number
          open_rate?: number | null
          recipient_count?: number
          scheduled_date?: string | null
          send_at?: string | null
          sent_date?: string | null
          status?: Database["public"]["Enums"]["email_campaign_status"] | null
          subject?: string
          target_audience?: Json | null
          template_id?: string | null
          unsubscribe_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          category:
            | Database["public"]["Enums"]["email_template_category"]
            | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          merge_tags: Json | null
          name: string
          parent_template_id: string | null
          preview_text: string | null
          subject: string
          updated_at: string
          version: number | null
        }
        Insert: {
          body: string
          category?:
            | Database["public"]["Enums"]["email_template_category"]
            | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          merge_tags?: Json | null
          name: string
          parent_template_id?: string | null
          preview_text?: string | null
          subject: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          body?: string
          category?:
            | Database["public"]["Enums"]["email_template_category"]
            | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          merge_tags?: Json | null
          name?: string
          parent_template_id?: string | null
          preview_text?: string | null
          subject?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
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
      financial_audit_logs: {
        Row: {
          action_type: string
          association_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          association_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          association_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_audit_logs_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_periods: {
        Row: {
          association_id: string
          closed_at: string | null
          closed_by: string | null
          created_at: string | null
          end_date: string
          fiscal_year: number
          id: string
          is_closed: boolean | null
          period_name: string
          period_type: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          association_id: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          end_date: string
          fiscal_year: number
          id?: string
          is_closed?: boolean | null
          period_name: string
          period_type?: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          end_date?: string
          fiscal_year?: number
          id?: string
          is_closed?: boolean | null
          period_name?: string
          period_type?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_periods_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_periods_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          association_id: string
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          is_cached: boolean | null
          period_end: string
          period_start: string
          report_data: Json
          report_name: string
          report_type: string
          template_config: Json | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_cached?: boolean | null
          period_end: string
          period_start: string
          report_data?: Json
          report_name: string
          report_type: string
          template_config?: Json | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_cached?: boolean | null
          period_end?: string
          period_start?: string
          report_data?: Json
          report_name?: string
          report_type?: string
          template_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_statements: {
        Row: {
          association_id: string
          created_at: string | null
          created_by: string | null
          data: Json
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          statement_type: string
        }
        Insert: {
          association_id: string
          created_at?: string | null
          created_by?: string | null
          data: Json
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          statement_type: string
        }
        Update: {
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          data?: Json
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          statement_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_statements_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
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
      function_logs: {
        Row: {
          created_at: string
          function_name: string
          id: string
          level: string
          message: string
          metadata: Json | null
          request_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          level: string
          message: string
          metadata?: Json | null
          request_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          request_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          document_template_id: string | null
          file_size: number | null
          file_url: string
          form_submission_id: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          status: string
        }
        Insert: {
          document_template_id?: string | null
          file_size?: number | null
          file_url: string
          form_submission_id?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
        }
        Update: {
          document_template_id?: string | null
          file_size?: number | null
          file_url?: string
          form_submission_id?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_document_template_id_fkey"
            columns: ["document_template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_account_balances: {
        Row: {
          association_id: string
          closing_balance: number
          created_at: string | null
          gl_account_id: string
          id: string
          opening_balance: number
          period_end: string
          period_start: string
          total_credits: number
          total_debits: number
          updated_at: string | null
          ytd_balance: number
        }
        Insert: {
          association_id: string
          closing_balance?: number
          created_at?: string | null
          gl_account_id: string
          id?: string
          opening_balance?: number
          period_end: string
          period_start: string
          total_credits?: number
          total_debits?: number
          updated_at?: string | null
          ytd_balance?: number
        }
        Update: {
          association_id?: string
          closing_balance?: number
          created_at?: string | null
          gl_account_id?: string
          id?: string
          opening_balance?: number
          period_end?: string
          period_start?: string
          total_credits?: number
          total_debits?: number
          updated_at?: string | null
          ytd_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "gl_account_balances_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_account_balances_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_account_usage_stats: {
        Row: {
          association_id: string | null
          created_at: string | null
          description_keywords: Json | null
          gl_account_code: string
          id: string
          last_used: string | null
          usage_count: number | null
          vendor_name: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          description_keywords?: Json | null
          gl_account_code: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          vendor_name?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          description_keywords?: Json | null
          gl_account_code?: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_account_usage_stats_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
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
      gl_accounts_enhanced: {
        Row: {
          account_code: string
          account_name: string
          account_subtype: string
          account_type: string
          association_id: string
          budget_account: boolean | null
          cash_flow_category: string | null
          created_at: string | null
          current_balance: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_account: boolean | null
          normal_balance: string
          parent_account_id: string | null
          tax_line_mapping: string | null
          updated_at: string | null
          ytd_balance: number | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_subtype: string
          account_type: string
          association_id: string
          budget_account?: boolean | null
          cash_flow_category?: string | null
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_account?: boolean | null
          normal_balance: string
          parent_account_id?: string | null
          tax_line_mapping?: string | null
          updated_at?: string | null
          ytd_balance?: number | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_subtype?: string
          account_type?: string
          association_id?: string
          budget_account?: boolean | null
          cash_flow_category?: string | null
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_account?: boolean | null
          normal_balance?: string
          parent_account_id?: string | null
          tax_line_mapping?: string | null
          updated_at?: string | null
          ytd_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_accounts_enhanced_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts_enhanced"
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
      history: {
        Row: {
          action: string
          association_id: string | null
          category: string
          count: number
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          association_id?: string | null
          category: string
          count: number
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          association_id?: string | null
          category?: string
          count?: number
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "history_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      homeowner_request_responses: {
        Row: {
          created_at: string
          id: string
          request_id: string | null
          response_content: string
          response_method: string
          sent_at: string
          sent_by: string | null
          sent_to: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id?: string | null
          response_content: string
          response_method?: string
          sent_at?: string
          sent_by?: string | null
          sent_to: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string | null
          response_content?: string
          response_method?: string
          sent_at?: string
          sent_by?: string | null
          sent_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "homeowner_request_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "homeowner_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      homeowner_requests: {
        Row: {
          assigned_to: string | null
          association_id: string | null
          attachments: Json | null
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
          attachments?: Json | null
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
          attachments?: Json | null
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
      homeowners: {
        Row: {
          account_number: string | null
          ach_start_date: string | null
          all_emails: string | null
          all_phones: string | null
          billing_communication_preference: string | null
          blocked_ledger_view: boolean | null
          business_name: string | null
          charge_tags: string | null
          collection_provider: string | null
          collection_status: string | null
          created_at: string | null
          current_balance: number | null
          deed_name: string | null
          email: string | null
          first_name: string | null
          full_homeowner_name: string | null
          general_communication_preference: string | null
          homeowner_id: number | null
          id: number
          is_blocked: boolean | null
          last_name: string | null
          last_payment_amount: number | null
          last_payment_date: string | null
          lease_status: string | null
          login_emails: string | null
          mailing_address: string | null
          mailing_city: string | null
          mailing_full_address: string | null
          mailing_state: string | null
          mailing_zip: string | null
          old_account_number: string | null
          overall_balance: number | null
          ownership_percentage: number | null
          phone: string | null
          portal_key: string | null
          second_owner_first_name: string | null
          second_owner_last_name: string | null
          tags: string | null
          tenant_emails: string | null
          tenant_end_date: string | null
          tenant_names: string | null
          tenant_phones: string | null
          tenant_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          ach_start_date?: string | null
          all_emails?: string | null
          all_phones?: string | null
          billing_communication_preference?: string | null
          blocked_ledger_view?: boolean | null
          business_name?: string | null
          charge_tags?: string | null
          collection_provider?: string | null
          collection_status?: string | null
          created_at?: string | null
          current_balance?: number | null
          deed_name?: string | null
          email?: string | null
          first_name?: string | null
          full_homeowner_name?: string | null
          general_communication_preference?: string | null
          homeowner_id?: number | null
          id?: number
          is_blocked?: boolean | null
          last_name?: string | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          lease_status?: string | null
          login_emails?: string | null
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_full_address?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          old_account_number?: string | null
          overall_balance?: number | null
          ownership_percentage?: number | null
          phone?: string | null
          portal_key?: string | null
          second_owner_first_name?: string | null
          second_owner_last_name?: string | null
          tags?: string | null
          tenant_emails?: string | null
          tenant_end_date?: string | null
          tenant_names?: string | null
          tenant_phones?: string | null
          tenant_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          ach_start_date?: string | null
          all_emails?: string | null
          all_phones?: string | null
          billing_communication_preference?: string | null
          blocked_ledger_view?: boolean | null
          business_name?: string | null
          charge_tags?: string | null
          collection_provider?: string | null
          collection_status?: string | null
          created_at?: string | null
          current_balance?: number | null
          deed_name?: string | null
          email?: string | null
          first_name?: string | null
          full_homeowner_name?: string | null
          general_communication_preference?: string | null
          homeowner_id?: number | null
          id?: number
          is_blocked?: boolean | null
          last_name?: string | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          lease_status?: string | null
          login_emails?: string | null
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_full_address?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          old_account_number?: string | null
          overall_balance?: number | null
          ownership_percentage?: number | null
          phone?: string | null
          portal_key?: string | null
          second_owner_first_name?: string | null
          second_owner_last_name?: string | null
          tags?: string | null
          tenant_emails?: string | null
          tenant_end_date?: string | null
          tenant_names?: string | null
          tenant_phones?: string | null
          tenant_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      import_export_jobs: {
        Row: {
          association_id: string | null
          created_at: string | null
          data_type: string
          error_details: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          job_type: string
          metadata: Json | null
          row_count: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          data_type: string
          error_details?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          job_type: string
          metadata?: Json | null
          row_count?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          data_type?: string
          error_details?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          job_type?: string
          metadata?: Json | null
          row_count?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_export_jobs_association_id_fkey"
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
      integration_configs: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          ai_confidence: number | null
          ai_description_original: string | null
          amount: number
          bank_account_id: string | null
          created_at: string
          description: string | null
          gl_account_id: string | null
          id: string
          invoice_id: string | null
          is_ai_suggested: boolean | null
          is_user_edited: boolean | null
          property_assignment: string | null
          suggested_category: string | null
          suggested_gl_account: string | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_description_original?: string | null
          amount: number
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          invoice_id?: string | null
          is_ai_suggested?: boolean | null
          is_user_edited?: boolean | null
          property_assignment?: string | null
          suggested_category?: string | null
          suggested_gl_account?: string | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          ai_description_original?: string | null
          amount?: number
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          gl_account_id?: string | null
          id?: string
          invoice_id?: string | null
          is_ai_suggested?: boolean | null
          is_user_edited?: boolean | null
          property_assignment?: string | null
          suggested_category?: string | null
          suggested_gl_account?: string | null
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
      invoice_matching: {
        Row: {
          auto_matched: boolean | null
          created_at: string | null
          exception_description: string | null
          exception_type: string | null
          id: string
          invoice_id: string | null
          matching_status: string | null
          override_at: string | null
          override_by: string | null
          override_reason: string | null
          po_id: string | null
          price_variance: number | null
          quantity_variance: number | null
          receipt_id: string | null
          tolerance_exceeded: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_matched?: boolean | null
          created_at?: string | null
          exception_description?: string | null
          exception_type?: string | null
          id?: string
          invoice_id?: string | null
          matching_status?: string | null
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
          po_id?: string | null
          price_variance?: number | null
          quantity_variance?: number | null
          receipt_id?: string | null
          tolerance_exceeded?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_matched?: boolean | null
          created_at?: string | null
          exception_description?: string | null
          exception_type?: string | null
          id?: string
          invoice_id?: string | null
          matching_status?: string | null
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
          po_id?: string | null
          price_variance?: number | null
          quantity_variance?: number | null
          receipt_id?: string | null
          tolerance_exceeded?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_matching_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_matching_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_matching_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          ai_confidence: Json | null
          ai_confidence_score: number | null
          ai_line_items: Json | null
          ai_processed_at: string | null
          ai_processing_status: string | null
          amount: number
          association_id: string | null
          association_name: string | null
          association_type: string | null
          bank_account_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          email_content: string | null
          gl_account_id: string | null
          html_content: string | null
          id: string
          image_url: string | null
          invoice_date: string | null
          invoice_number: string
          needs_review: boolean | null
          payment_date: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          pdf_url: string | null
          raw_extracted_text: string | null
          scheduled_payment_date: string | null
          source_document: string | null
          status: string
          tracking_number: string | null
          updated_at: string
          vendor: string
        }
        Insert: {
          ai_confidence?: Json | null
          ai_confidence_score?: number | null
          ai_line_items?: Json | null
          ai_processed_at?: string | null
          ai_processing_status?: string | null
          amount: number
          association_id?: string | null
          association_name?: string | null
          association_type?: string | null
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          email_content?: string | null
          gl_account_id?: string | null
          html_content?: string | null
          id?: string
          image_url?: string | null
          invoice_date?: string | null
          invoice_number: string
          needs_review?: boolean | null
          payment_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pdf_url?: string | null
          raw_extracted_text?: string | null
          scheduled_payment_date?: string | null
          source_document?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          vendor: string
        }
        Update: {
          ai_confidence?: Json | null
          ai_confidence_score?: number | null
          ai_line_items?: Json | null
          ai_processed_at?: string | null
          ai_processing_status?: string | null
          amount?: number
          association_id?: string | null
          association_name?: string | null
          association_type?: string | null
          bank_account_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          email_content?: string | null
          gl_account_id?: string | null
          html_content?: string | null
          id?: string
          image_url?: string | null
          invoice_date?: string | null
          invoice_number?: string
          needs_review?: boolean | null
          payment_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pdf_url?: string | null
          raw_extracted_text?: string | null
          scheduled_payment_date?: string | null
          source_document?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          vendor?: string
        }
        Relationships: []
      }
      iot_devices: {
        Row: {
          association_id: string | null
          configuration: Json | null
          created_at: string | null
          device_id: string
          device_name: string
          device_type: string
          firmware_version: string | null
          id: string
          installed_at: string | null
          last_seen: string | null
          location_description: string | null
          manufacturer: string | null
          model: string | null
          property_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          device_id: string
          device_name: string
          device_type: string
          firmware_version?: string | null
          id?: string
          installed_at?: string | null
          last_seen?: string | null
          location_description?: string | null
          manufacturer?: string | null
          model?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          device_id?: string
          device_name?: string
          device_type?: string
          firmware_version?: string | null
          id?: string
          installed_at?: string | null
          last_seen?: string | null
          location_description?: string | null
          manufacturer?: string | null
          model?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_devices_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_sensor_data: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          metadata: Json | null
          quality_score: number | null
          recorded_at: string | null
          sensor_type: string
          unit: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          metadata?: Json | null
          quality_score?: number | null
          recorded_at?: string | null
          sensor_type: string
          unit?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          metadata?: Json | null
          quality_score?: number | null
          recorded_at?: string | null
          sensor_type?: string
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensor_data_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "iot_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_whitelist: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          ip_address: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          ip_address: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          association_id: string
          created_at: string | null
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          posted_at: string | null
          posted_by: string | null
          reference_number: string | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
          source_id: string | null
          source_type: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          created_by?: string | null
          description: string
          entry_date: string
          entry_number: string
          id?: string
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          source_id?: string | null
          source_type: string
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          posted_at?: string | null
          posted_by?: string | null
          reference_number?: string | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entry_line_items: {
        Row: {
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          gl_account_id: string
          id: string
          journal_entry_id: string
          line_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          gl_account_id: string
          id?: string
          journal_entry_id: string
          line_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          gl_account_id?: string
          id?: string
          journal_entry_id?: string
          line_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_line_items_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_line_items_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          created_at: string | null
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          gl_account_id: string
          id: string
          journal_entry_id: string
          line_number: number
          property_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          gl_account_id: string
          id?: string
          journal_entry_id: string
          line_number: number
          property_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          gl_account_id?: string
          id?: string
          journal_entry_id?: string
          line_number?: number
          property_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts_enhanced"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_definitions: {
        Row: {
          association_id: string
          calculation_formula: string
          created_at: string | null
          created_by: string | null
          critical_threshold: number | null
          id: string
          is_active: boolean | null
          kpi_category: string
          kpi_name: string
          target_value: number | null
          unit_of_measure: string | null
          updated_at: string | null
          warning_threshold: number | null
        }
        Insert: {
          association_id: string
          calculation_formula: string
          created_at?: string | null
          created_by?: string | null
          critical_threshold?: number | null
          id?: string
          is_active?: boolean | null
          kpi_category: string
          kpi_name: string
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
          warning_threshold?: number | null
        }
        Update: {
          association_id?: string
          calculation_formula?: string
          created_at?: string | null
          created_by?: string | null
          critical_threshold?: number | null
          id?: string
          is_active?: boolean | null
          kpi_category?: string
          kpi_name?: string
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
          warning_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_definitions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_values: {
        Row: {
          actual_value: number
          created_at: string | null
          id: string
          kpi_definition_id: string
          measurement_date: string
          performance_status: string | null
          target_value: number | null
          variance_amount: number | null
          variance_percent: number | null
        }
        Insert: {
          actual_value: number
          created_at?: string | null
          id?: string
          kpi_definition_id: string
          measurement_date: string
          performance_status?: string | null
          target_value?: number | null
          variance_amount?: number | null
          variance_percent?: number | null
        }
        Update: {
          actual_value?: number
          created_at?: string | null
          id?: string
          kpi_definition_id?: string
          measurement_date?: string
          performance_status?: string | null
          target_value?: number | null
          variance_amount?: number | null
          variance_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_values_kpi_definition_id_fkey"
            columns: ["kpi_definition_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      late_fee_rules: {
        Row: {
          applies_to_partial_payments: boolean | null
          assessment_type_id: string | null
          association_id: string
          compound_fees: boolean | null
          created_at: string | null
          created_by: string | null
          effective_date: string
          expiry_date: string | null
          fee_amount: number
          fee_type: string
          id: string
          is_active: boolean | null
          maximum_fee: number | null
          rule_name: string
          trigger_days_past_due: number
          updated_at: string | null
          waiver_threshold: number | null
        }
        Insert: {
          applies_to_partial_payments?: boolean | null
          assessment_type_id?: string | null
          association_id: string
          compound_fees?: boolean | null
          created_at?: string | null
          created_by?: string | null
          effective_date: string
          expiry_date?: string | null
          fee_amount: number
          fee_type: string
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          rule_name: string
          trigger_days_past_due: number
          updated_at?: string | null
          waiver_threshold?: number | null
        }
        Update: {
          applies_to_partial_payments?: boolean | null
          assessment_type_id?: string | null
          association_id?: string
          compound_fees?: boolean | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          expiry_date?: string | null
          fee_amount?: number
          fee_type?: string
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          rule_name?: string
          trigger_days_past_due?: number
          updated_at?: string | null
          waiver_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "late_fee_rules_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types_enhanced"
            referencedColumns: ["id"]
          },
        ]
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
      ml_training_pipelines: {
        Row: {
          accuracy_score: number | null
          association_id: string | null
          created_at: string | null
          dataset_size: number | null
          deployed_at: string | null
          hyperparameters: Json | null
          id: string
          model_type: string
          model_version: string | null
          pipeline_name: string
          training_metrics: Json | null
          training_status: string
          updated_at: string | null
        }
        Insert: {
          accuracy_score?: number | null
          association_id?: string | null
          created_at?: string | null
          dataset_size?: number | null
          deployed_at?: string | null
          hyperparameters?: Json | null
          id?: string
          model_type: string
          model_version?: string | null
          pipeline_name: string
          training_metrics?: Json | null
          training_status?: string
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number | null
          association_id?: string | null
          created_at?: string | null
          dataset_size?: number | null
          deployed_at?: string | null
          hyperparameters?: Json | null
          id?: string
          model_type?: string
          model_version?: string | null
          pipeline_name?: string
          training_metrics?: Json | null
          training_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_training_pipelines_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_app_configs: {
        Row: {
          app_name: string
          app_version: string | null
          association_id: string | null
          created_at: string | null
          feature_flags: Json | null
          id: string
          is_published: boolean | null
          offline_capabilities: Json | null
          push_notification_config: Json | null
          pwa_config: Json | null
          theme_config: Json | null
          updated_at: string | null
        }
        Insert: {
          app_name: string
          app_version?: string | null
          association_id?: string | null
          created_at?: string | null
          feature_flags?: Json | null
          id?: string
          is_published?: boolean | null
          offline_capabilities?: Json | null
          push_notification_config?: Json | null
          pwa_config?: Json | null
          theme_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          app_name?: string
          app_version?: string | null
          association_id?: string | null
          created_at?: string | null
          feature_flags?: Json | null
          id?: string
          is_published?: boolean | null
          offline_capabilities?: Json | null
          push_notification_config?: Json | null
          pwa_config?: Json | null
          theme_config?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_app_configs_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      multi_channel_messages: {
        Row: {
          channels: string[] | null
          created_at: string | null
          id: string
          message_template: string
          metadata: Json | null
          priority: string | null
          scheduled_for: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          channels?: string[] | null
          created_at?: string | null
          id?: string
          message_template: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          channels?: string[] | null
          created_at?: string | null
          id?: string
          message_template?: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notices: {
        Row: {
          association_id: string
          content: string
          created_at: string
          id: string
          recipient_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          association_id: string
          content: string
          created_at?: string
          id: string
          recipient_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          association_id?: string
          content?: string
          created_at?: string
          id?: string
          recipient_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          recipient_id: string
          recipient_type: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          template_id: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_id: string
          recipient_type: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_id?: string
          recipient_type?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          association_id: string | null
          body_template: string
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_template: string | null
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          association_id?: string | null
          body_template: string
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_template?: string | null
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          association_id?: string | null
          body_template?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_template?: string | null
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sync_queue: {
        Row: {
          association_id: string
          created_at: string
          data: Json
          id: string
          last_attempt_at: string | null
          operation_type: string
          record_id: string | null
          retry_count: number | null
          sync_status: string | null
          table_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          association_id: string
          created_at?: string
          data: Json
          id?: string
          last_attempt_at?: string | null
          operation_type: string
          record_id?: string | null
          retry_count?: number | null
          sync_status?: string | null
          table_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          association_id?: string
          created_at?: string
          data?: Json
          id?: string
          last_attempt_at?: string | null
          operation_type?: string
          record_id?: string | null
          retry_count?: number | null
          sync_status?: string | null
          table_name?: string
          updated_at?: string
          user_id?: string
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
      payment_allocation_rules: {
        Row: {
          allocation_type: string
          association_id: string
          charge_types: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority_order: number
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          allocation_type: string
          association_id: string
          charge_types?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority_order: number
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          allocation_type?: string
          association_id?: string
          charge_types?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority_order?: number
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocation_rules_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          accounts_receivable_id: string
          allocated_amount: number
          allocation_date: string | null
          allocation_type: string | null
          created_by: string | null
          id: string
          notes: string | null
          payment_transaction_id: string
        }
        Insert: {
          accounts_receivable_id: string
          allocated_amount: number
          allocation_date?: string | null
          allocation_type?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_transaction_id: string
        }
        Update: {
          accounts_receivable_id?: string
          allocated_amount?: number
          allocation_date?: string | null
          allocation_type?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_accounts_receivable_id_fkey"
            columns: ["accounts_receivable_id"]
            isOneToOne: false
            referencedRelation: "accounts_receivable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_authorizations: {
        Row: {
          amount_threshold: number
          association_id: string
          authorization_level: number
          authorized_at: string | null
          authorizer_id: string | null
          created_at: string | null
          digital_signature: string | null
          id: string
          ip_address: unknown | null
          payment_batch_id: string | null
          rejection_reason: string | null
          status: string | null
        }
        Insert: {
          amount_threshold: number
          association_id: string
          authorization_level: number
          authorized_at?: string | null
          authorizer_id?: string | null
          created_at?: string | null
          digital_signature?: string | null
          id?: string
          ip_address?: unknown | null
          payment_batch_id?: string | null
          rejection_reason?: string | null
          status?: string | null
        }
        Update: {
          amount_threshold?: number
          association_id?: string
          authorization_level?: number
          authorized_at?: string | null
          authorizer_id?: string | null
          created_at?: string | null
          digital_signature?: string | null
          id?: string
          ip_address?: unknown | null
          payment_batch_id?: string | null
          rejection_reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      payment_batches: {
        Row: {
          ach_file_path: string | null
          approved_by: string | null
          association_id: string
          bank_account_id: string | null
          batch_date: string
          batch_number: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          payment_method: string
          processed_at: string | null
          status: string | null
          total_amount: number
          total_count: number
          transmission_id: string | null
          updated_at: string | null
        }
        Insert: {
          ach_file_path?: string | null
          approved_by?: string | null
          association_id: string
          bank_account_id?: string | null
          batch_date?: string
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          processed_at?: string | null
          status?: string | null
          total_amount?: number
          total_count?: number
          transmission_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ach_file_path?: string | null
          approved_by?: string | null
          association_id?: string
          bank_account_id?: string | null
          batch_date?: string
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          processed_at?: string | null
          status?: string | null
          total_amount?: number
          total_count?: number
          transmission_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_batches_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          id: string
          is_default: boolean
          last_four: string | null
          metadata: Json | null
          resident_id: string
          stripe_customer_id: string
          stripe_payment_method_id: string
          type: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          last_four?: string | null
          metadata?: Json | null
          resident_id: string
          stripe_customer_id: string
          stripe_payment_method_id: string
          type: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          last_four?: string | null
          metadata?: Json | null
          resident_id?: string
          stripe_customer_id?: string
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plan_installments: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          late_fee_assessed: number | null
          payment_date: string | null
          payment_plan_id: string | null
          payment_transaction_id: string | null
          status: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          late_fee_assessed?: number | null
          payment_date?: string | null
          payment_plan_id?: string | null
          payment_transaction_id?: string | null
          status?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          late_fee_assessed?: number | null
          payment_date?: string | null
          payment_plan_id?: string | null
          payment_transaction_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_plan_installments_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plan_installments_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          agreement_document_url: string | null
          agreement_signed_date: string | null
          association_id: string
          created_at: string | null
          created_by: string | null
          down_payment: number | null
          end_date: string
          id: string
          installment_amount: number
          late_fee_waived: boolean | null
          payment_frequency: string | null
          plan_name: string
          property_id: string
          remaining_balance: number
          resident_id: string
          start_date: string
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          agreement_document_url?: string | null
          agreement_signed_date?: string | null
          association_id: string
          created_at?: string | null
          created_by?: string | null
          down_payment?: number | null
          end_date: string
          id?: string
          installment_amount: number
          late_fee_waived?: boolean | null
          payment_frequency?: string | null
          plan_name: string
          property_id: string
          remaining_balance: number
          resident_id: string
          start_date: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          agreement_document_url?: string | null
          agreement_signed_date?: string | null
          association_id?: string
          created_at?: string | null
          created_by?: string | null
          down_payment?: number | null
          end_date?: string
          id?: string
          installment_amount?: number
          late_fee_waived?: boolean | null
          payment_frequency?: string | null
          plan_name?: string
          property_id?: string
          remaining_balance?: number
          resident_id?: string
          start_date?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          assessment_id: string
          association_id: string
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          property_id: string
          resident_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_receipt_url: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          assessment_id: string
          association_id: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          property_id: string
          resident_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_receipt_url?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          assessment_id?: string
          association_id?: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          property_id?: string
          resident_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_receipt_url?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions_enhanced: {
        Row: {
          amount: number
          association_id: string
          batch_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          external_transaction_id: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          net_amount: number
          payment_date: string | null
          payment_method_id: string | null
          processed_at: string | null
          processing_fee: number | null
          property_id: string
          reconciliation_status: string | null
          reference_number: string | null
          status: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          association_id: string
          batch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          payment_date?: string | null
          payment_method_id?: string | null
          processed_at?: string | null
          processing_fee?: number | null
          property_id: string
          reconciliation_status?: string | null
          reference_number?: string | null
          status?: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          association_id?: string
          batch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          payment_date?: string | null
          payment_method_id?: string | null
          processed_at?: string | null
          processing_fee?: number | null
          property_id?: string
          reconciliation_status?: string | null
          reference_number?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string | null
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
          role: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_types: {
        Row: {
          conditional_fields: Json | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          conditional_fields?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          conditional_fields?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          account_number: string | null
          address: string
          address_line_2: string | null
          assessment_amount: number | null
          association_id: string | null
          bathrooms: number | null
          bedrooms: number | null
          block_number: string | null
          city: string | null
          co_date: string | null
          created_at: string | null
          current_balance: number | null
          full_address: string | null
          homeowner_id: number | null
          id: string
          legal_description: string | null
          lot_number: string | null
          lot_size: number | null
          notes: string | null
          old_account_number: string | null
          overall_balance: number | null
          parcel_id: string | null
          parking_spaces: number | null
          phase: string | null
          property_type: string | null
          settled_date: string | null
          special_assessment: number | null
          special_features: string | null
          square_footage: number | null
          state: string | null
          status: string | null
          street_name: string | null
          street_number: number | null
          unit_number: string | null
          updated_at: string | null
          village: string | null
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          account_number?: string | null
          address: string
          address_line_2?: string | null
          assessment_amount?: number | null
          association_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          block_number?: string | null
          city?: string | null
          co_date?: string | null
          created_at?: string | null
          current_balance?: number | null
          full_address?: string | null
          homeowner_id?: number | null
          id?: string
          legal_description?: string | null
          lot_number?: string | null
          lot_size?: number | null
          notes?: string | null
          old_account_number?: string | null
          overall_balance?: number | null
          parcel_id?: string | null
          parking_spaces?: number | null
          phase?: string | null
          property_type?: string | null
          settled_date?: string | null
          special_assessment?: number | null
          special_features?: string | null
          square_footage?: number | null
          state?: string | null
          status?: string | null
          street_name?: string | null
          street_number?: number | null
          unit_number?: string | null
          updated_at?: string | null
          village?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string
          address_line_2?: string | null
          assessment_amount?: number | null
          association_id?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          block_number?: string | null
          city?: string | null
          co_date?: string | null
          created_at?: string | null
          current_balance?: number | null
          full_address?: string | null
          homeowner_id?: number | null
          id?: string
          legal_description?: string | null
          lot_number?: string | null
          lot_size?: number | null
          notes?: string | null
          old_account_number?: string | null
          overall_balance?: number | null
          parcel_id?: string | null
          parking_spaces?: number | null
          phase?: string | null
          property_type?: string | null
          settled_date?: string | null
          special_assessment?: number | null
          special_features?: string | null
          square_footage?: number | null
          state?: string | null
          status?: string | null
          street_name?: string | null
          street_number?: number | null
          unit_number?: string | null
          updated_at?: string | null
          village?: string | null
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_hoa_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_homeowners: {
        Row: {
          created_at: string | null
          homeowner_id: number
          id: string
          is_primary_owner: boolean | null
          move_in_date: string | null
          move_out_date: string | null
          ownership_percentage: number | null
          ownership_type: string | null
          property_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          homeowner_id: number
          id?: string
          is_primary_owner?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          ownership_percentage?: number | null
          ownership_type?: string | null
          property_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          homeowner_id?: number
          id?: string
          is_primary_owner?: boolean | null
          move_in_date?: string | null
          move_out_date?: string | null
          ownership_percentage?: number | null
          ownership_type?: string | null
          property_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_homeowners_homeowner_id_fkey"
            columns: ["homeowner_id"]
            isOneToOne: false
            referencedRelation: "homeowners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_homeowners_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      purchase_order_line_items: {
        Row: {
          created_at: string | null
          delivery_date: string | null
          gl_account_code: string | null
          id: string
          invoiced_quantity: number | null
          item_code: string | null
          item_description: string
          line_number: number
          line_total: number
          notes: string | null
          po_id: string
          quantity: number
          received_quantity: number | null
          unit_of_measure: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          delivery_date?: string | null
          gl_account_code?: string | null
          id?: string
          invoiced_quantity?: number | null
          item_code?: string | null
          item_description: string
          line_number: number
          line_total: number
          notes?: string | null
          po_id: string
          quantity: number
          received_quantity?: number | null
          unit_of_measure?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          delivery_date?: string | null
          gl_account_code?: string | null
          id?: string
          invoiced_quantity?: number | null
          item_code?: string | null
          item_description?: string
          line_number?: number
          line_total?: number
          notes?: string | null
          po_id?: string
          quantity?: number
          received_quantity?: number | null
          unit_of_measure?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_line_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_lines: {
        Row: {
          created_at: string | null
          description: string
          gl_account_code: string | null
          id: string
          invoiced_quantity: number | null
          line_number: number
          line_total: number
          po_id: string | null
          quantity: number
          received_quantity: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          gl_account_code?: string | null
          id?: string
          invoiced_quantity?: number | null
          line_number: number
          line_total: number
          po_id?: string | null
          quantity: number
          received_quantity?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          gl_account_code?: string | null
          id?: string
          invoiced_quantity?: number | null
          line_number?: number
          line_total?: number
          po_id?: string | null
          quantity?: number
          received_quantity?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approval_status: string | null
          approved_by: string | null
          association_id: string
          billing_address: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          delivery_date: string | null
          department: string | null
          description: string | null
          discount_amount: number | null
          id: string
          net_amount: number
          notes: string | null
          payment_terms: string | null
          po_date: string
          po_number: string
          requested_by: string | null
          shipping_address: string | null
          shipping_amount: number | null
          status: string
          tax_amount: number | null
          terms_conditions: string | null
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          approval_status?: string | null
          approved_by?: string | null
          association_id: string
          billing_address?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_date?: string | null
          department?: string | null
          description?: string | null
          discount_amount?: number | null
          id?: string
          net_amount: number
          notes?: string | null
          payment_terms?: string | null
          po_date: string
          po_number: string
          requested_by?: string | null
          shipping_address?: string | null
          shipping_amount?: number | null
          status?: string
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount: number
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          approval_status?: string | null
          approved_by?: string | null
          association_id?: string
          billing_address?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_date?: string | null
          department?: string | null
          description?: string | null
          discount_amount?: number | null
          id?: string
          net_amount?: number
          notes?: string | null
          payment_terms?: string | null
          po_date?: string
          po_number?: string
          requested_by?: string | null
          shipping_address?: string | null
          shipping_amount?: number | null
          status?: string
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          association_id: string
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh_key: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          association_id: string
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh_key: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          association_id?: string
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pwa_configurations: {
        Row: {
          app_description: string | null
          app_name: string
          association_id: string
          background_color: string | null
          created_at: string
          created_by: string | null
          display_mode: string | null
          icon_url: string | null
          id: string
          install_prompt_enabled: boolean | null
          offline_enabled: boolean | null
          orientation: string | null
          push_enabled: boolean | null
          start_url: string | null
          theme_color: string | null
          updated_at: string
        }
        Insert: {
          app_description?: string | null
          app_name: string
          association_id: string
          background_color?: string | null
          created_at?: string
          created_by?: string | null
          display_mode?: string | null
          icon_url?: string | null
          id?: string
          install_prompt_enabled?: boolean | null
          offline_enabled?: boolean | null
          orientation?: string | null
          push_enabled?: boolean | null
          start_url?: string | null
          theme_color?: string | null
          updated_at?: string
        }
        Update: {
          app_description?: string | null
          app_name?: string
          association_id?: string
          background_color?: string | null
          created_at?: string
          created_by?: string | null
          display_mode?: string | null
          icon_url?: string | null
          id?: string
          install_prompt_enabled?: boolean | null
          offline_enabled?: boolean | null
          orientation?: string | null
          push_enabled?: boolean | null
          start_url?: string | null
          theme_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      realtime_channels: {
        Row: {
          channel_name: string
          channel_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          channel_name: string
          channel_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          channel_name?: string
          channel_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      realtime_events: {
        Row: {
          channel_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "realtime_events_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "realtime_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_lines: {
        Row: {
          condition_notes: string | null
          created_at: string | null
          id: string
          po_line_id: string | null
          quantity_received: number
          receipt_id: string | null
          rejected_quantity: number | null
          rejection_reason: string | null
          total_amount: number | null
          unit_price: number | null
        }
        Insert: {
          condition_notes?: string | null
          created_at?: string | null
          id?: string
          po_line_id?: string | null
          quantity_received: number
          receipt_id?: string | null
          rejected_quantity?: number | null
          rejection_reason?: string | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Update: {
          condition_notes?: string | null
          created_at?: string | null
          id?: string
          po_line_id?: string | null
          quantity_received?: number
          receipt_id?: string | null
          rejected_quantity?: number | null
          rejection_reason?: string | null
          total_amount?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_lines_po_line_id_fkey"
            columns: ["po_line_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_lines_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          association_id: string
          created_at: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          po_id: string | null
          receipt_date: string
          receipt_number: string
          received_by: string | null
          status: string | null
          total_received: number | null
          updated_at: string | null
          vendor_id: string | null
          vendor_packing_slip: string | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          po_id?: string | null
          receipt_date?: string
          receipt_number: string
          received_by?: string | null
          status?: string | null
          total_received?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_packing_slip?: string | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          po_id?: string | null
          receipt_date?: string
          receipt_number?: string
          received_by?: string | null
          status?: string | null
          total_received?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_packing_slip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      recurring_transactions: {
        Row: {
          amount: number
          association_id: string | null
          category: string | null
          created_at: string
          created_by: string
          description: string
          end_date: string | null
          frequency: string
          gl_account_id: string | null
          id: string
          is_active: boolean | null
          last_generated_date: string | null
          next_generation_date: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          association_id?: string | null
          category?: string | null
          created_at?: string
          created_by: string
          description: string
          end_date?: string | null
          frequency: string
          gl_account_id?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          next_generation_date?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          association_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string
          end_date?: string | null
          frequency?: string
          gl_account_id?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          next_generation_date?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      report_definitions: {
        Row: {
          association_id: string | null
          chart_config: Json | null
          columns: Json | null
          created_at: string | null
          created_by: string | null
          data_source: string
          description: string | null
          filters: Json | null
          id: string
          is_public: boolean | null
          name: string
          report_type: string
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          chart_config?: Json | null
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_source: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          name: string
          report_type: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          chart_config?: Json | null
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_source?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          name?: string
          report_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_definitions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      report_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          report_definition_id: string | null
          result_data: Json | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          report_definition_id?: string | null
          result_data?: Json | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          report_definition_id?: string | null
          result_data?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_executions_report_definition_id_fkey"
            columns: ["report_definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
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
      resident_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          association_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          metadata: Json | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          association_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          metadata?: Json | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          association_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          metadata?: Json | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_invitations_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_payment_methods: {
        Row: {
          account_nickname: string | null
          account_type: string | null
          bank_name: string | null
          created_at: string | null
          expiry_month: number | null
          expiry_year: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_four_digits: string | null
          payment_type: string
          resident_id: string
          stripe_payment_method_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_nickname?: string | null
          account_type?: string | null
          bank_name?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four_digits?: string | null
          payment_type: string
          resident_id: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_nickname?: string | null
          account_type?: string | null
          bank_name?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four_digits?: string | null
          payment_type?: string
          resident_id?: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
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
          account_number: string | null
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
          account_number?: string | null
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
          account_number?: string | null
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
        Relationships: []
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
      security_alerts: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          details: Json | null
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          type: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          type: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          type?: string
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          applies_to: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          rules: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          applies_to?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rules?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          applies_to?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rules?: Json | null
          type?: string
          updated_at?: string | null
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
      tax_1099_records: {
        Row: {
          association_id: string
          box_1_amount: number | null
          box_2_amount: number | null
          box_3_amount: number | null
          box_4_amount: number | null
          correction_form: boolean | null
          created_at: string | null
          form_type: string | null
          id: string
          submitted_date: string | null
          submitted_to_irs: boolean | null
          tax_year: number
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          association_id: string
          box_1_amount?: number | null
          box_2_amount?: number | null
          box_3_amount?: number | null
          box_4_amount?: number | null
          correction_form?: boolean | null
          created_at?: string | null
          form_type?: string | null
          id?: string
          submitted_date?: string | null
          submitted_to_irs?: boolean | null
          tax_year: number
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          association_id?: string
          box_1_amount?: number | null
          box_2_amount?: number | null
          box_3_amount?: number | null
          box_4_amount?: number | null
          correction_form?: boolean | null
          created_at?: string | null
          form_type?: string | null
          id?: string
          submitted_date?: string | null
          submitted_to_irs?: boolean | null
          tax_year?: number
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_1099_records_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_1099_records_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string | null
          id: string
          permissions: string[] | null
          role: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: string[] | null
          role?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: string[] | null
          role?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          branding: Json | null
          created_at: string | null
          custom_domain: string | null
          domain: string
          id: string
          name: string
          settings: Json | null
          status: string | null
          subscription: Json | null
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          domain: string
          id?: string
          name: string
          settings?: Json | null
          status?: string | null
          subscription?: Json | null
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          domain?: string
          id?: string
          name?: string
          settings?: Json | null
          status?: string | null
          subscription?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      three_way_matches: {
        Row: {
          association_id: string
          created_at: string | null
          exception_reason: string | null
          id: string
          invoice_id: string | null
          match_status: string
          match_type: string
          matched_at: string | null
          matched_by: string | null
          purchase_order_id: string
          receipt_id: string | null
          tolerance_exceeded: boolean | null
          updated_at: string | null
          variance_amount: number | null
          variance_percentage: number | null
        }
        Insert: {
          association_id: string
          created_at?: string | null
          exception_reason?: string | null
          id?: string
          invoice_id?: string | null
          match_status?: string
          match_type?: string
          matched_at?: string | null
          matched_by?: string | null
          purchase_order_id: string
          receipt_id?: string | null
          tolerance_exceeded?: boolean | null
          updated_at?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Update: {
          association_id?: string
          created_at?: string | null
          exception_reason?: string | null
          id?: string
          invoice_id?: string | null
          match_status?: string
          match_type?: string
          matched_at?: string | null
          matched_by?: string | null
          purchase_order_id?: string
          receipt_id?: string | null
          tolerance_exceeded?: boolean | null
          updated_at?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "three_way_matches_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_matches_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_matches_matched_by_fkey"
            columns: ["matched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_matches_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "three_way_matches_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      three_way_matching: {
        Row: {
          ap_id: string | null
          association_id: string
          auto_matched: boolean | null
          created_at: string | null
          exception_reasons: Json | null
          id: string
          invoice_id: string | null
          matched_at: string | null
          matched_by: string | null
          matching_status: string
          price_variance: number | null
          purchase_order_id: string | null
          quantity_variance: number | null
          receiving_record_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          tolerance_exceeded: boolean | null
          total_variance: number | null
          updated_at: string | null
        }
        Insert: {
          ap_id?: string | null
          association_id: string
          auto_matched?: boolean | null
          created_at?: string | null
          exception_reasons?: Json | null
          id?: string
          invoice_id?: string | null
          matched_at?: string | null
          matched_by?: string | null
          matching_status?: string
          price_variance?: number | null
          purchase_order_id?: string | null
          quantity_variance?: number | null
          receiving_record_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          tolerance_exceeded?: boolean | null
          total_variance?: number | null
          updated_at?: string | null
        }
        Update: {
          ap_id?: string | null
          association_id?: string
          auto_matched?: boolean | null
          created_at?: string | null
          exception_reasons?: Json | null
          id?: string
          invoice_id?: string | null
          matched_at?: string | null
          matched_by?: string | null
          matching_status?: string
          price_variance?: number | null
          purchase_order_id?: string | null
          quantity_variance?: number | null
          receiving_record_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          tolerance_exceeded?: boolean | null
          total_variance?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "three_way_matching_ap_id_fkey"
            columns: ["ap_id"]
            isOneToOne: false
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_batches: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          operation_type: string
          processed_by: string | null
          processed_transactions: number | null
          status: string
          total_transactions: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          operation_type: string
          processed_by?: string | null
          processed_transactions?: number | null
          status?: string
          total_transactions?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          operation_type?: string
          processed_by?: string | null
          processed_transactions?: number | null
          status?: string
          total_transactions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_hoa_access: {
        Row: {
          created_at: string | null
          hoa_id: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          hoa_id?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          hoa_id?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_hoa_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      user_sessions: {
        Row: {
          created_at: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          location: string | null
          terminated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: string | null
          terminated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          location?: string | null
          terminated_at?: string | null
          user_agent?: string | null
          user_id?: string
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
      user_totp: {
        Row: {
          created_at: string
          totp_secret: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          totp_secret: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          totp_secret?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      vendor_1099_records: {
        Row: {
          association_id: string
          backup_withholding: boolean | null
          box_number: string | null
          correction_filed: boolean | null
          created_at: string | null
          form_generated: boolean | null
          form_sent: boolean | null
          form_type: string
          generated_date: string | null
          id: string
          is_1099_required: boolean | null
          sent_date: string | null
          status: string
          tax_id: string | null
          tax_id_type: string | null
          tax_year: number
          total_amount: number | null
          total_payments: number
          updated_at: string | null
          vendor_id: string
          vendor_name: string | null
          vendor_tin: string | null
        }
        Insert: {
          association_id: string
          backup_withholding?: boolean | null
          box_number?: string | null
          correction_filed?: boolean | null
          created_at?: string | null
          form_generated?: boolean | null
          form_sent?: boolean | null
          form_type?: string
          generated_date?: string | null
          id?: string
          is_1099_required?: boolean | null
          sent_date?: string | null
          status?: string
          tax_id?: string | null
          tax_id_type?: string | null
          tax_year: number
          total_amount?: number | null
          total_payments?: number
          updated_at?: string | null
          vendor_id: string
          vendor_name?: string | null
          vendor_tin?: string | null
        }
        Update: {
          association_id?: string
          backup_withholding?: boolean | null
          box_number?: string | null
          correction_filed?: boolean | null
          created_at?: string | null
          form_generated?: boolean | null
          form_sent?: boolean | null
          form_type?: string
          generated_date?: string | null
          id?: string
          is_1099_required?: boolean | null
          sent_date?: string | null
          status?: string
          tax_id?: string | null
          tax_id_type?: string | null
          tax_year?: number
          total_amount?: number | null
          total_payments?: number
          updated_at?: string | null
          vendor_id?: string
          vendor_name?: string | null
          vendor_tin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_1099_records_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_1099_records_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_1099_records_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          application_status: string
          association_id: string | null
          background_check_date: string | null
          background_check_status: string | null
          bond_amount: number | null
          bond_expiry_date: string | null
          business_address: string | null
          business_name: string
          business_references: Json | null
          contact_person: string
          created_at: string | null
          email: string
          id: string
          insurance_expiry_date: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          license_number: string | null
          notes: string | null
          phone: string | null
          qualification_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialties: string[] | null
          submitted_at: string | null
          tax_id: string | null
          updated_at: string | null
          years_in_business: number | null
        }
        Insert: {
          application_status?: string
          association_id?: string | null
          background_check_date?: string | null
          background_check_status?: string | null
          bond_amount?: number | null
          bond_expiry_date?: string | null
          business_address?: string | null
          business_name: string
          business_references?: Json | null
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          insurance_expiry_date?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          license_number?: string | null
          notes?: string | null
          phone?: string | null
          qualification_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string[] | null
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Update: {
          application_status?: string
          association_id?: string | null
          background_check_date?: string | null
          background_check_status?: string | null
          bond_amount?: number | null
          bond_expiry_date?: string | null
          business_address?: string | null
          business_name?: string
          business_references?: Json | null
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          insurance_expiry_date?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          license_number?: string | null
          notes?: string | null
          phone?: string | null
          qualification_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string[] | null
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string | null
          id: string
          is_available: boolean | null
          start_time: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          start_time?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          start_time?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bids: {
        Row: {
          admin_notes: string | null
          attachments: Json | null
          bid_amount: number | null
          bid_request_id: string | null
          bid_request_vendor_id: string | null
          created_at: string | null
          estimated_completion_date: string | null
          estimated_start_date: string | null
          evaluation_notes: string | null
          evaluation_score: number | null
          id: string
          is_selected: boolean | null
          payment_terms: string | null
          proposal_details: string | null
          proposal_text: string | null
          proposed_timeline: number | null
          status: string | null
          submitted_at: string | null
          terms_and_conditions: string | null
          timeline_completion_date: string | null
          timeline_start_date: string | null
          updated_at: string | null
          vendor_id: string | null
          warranty_terms: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachments?: Json | null
          bid_amount?: number | null
          bid_request_id?: string | null
          bid_request_vendor_id?: string | null
          created_at?: string | null
          estimated_completion_date?: string | null
          estimated_start_date?: string | null
          evaluation_notes?: string | null
          evaluation_score?: number | null
          id?: string
          is_selected?: boolean | null
          payment_terms?: string | null
          proposal_details?: string | null
          proposal_text?: string | null
          proposed_timeline?: number | null
          status?: string | null
          submitted_at?: string | null
          terms_and_conditions?: string | null
          timeline_completion_date?: string | null
          timeline_start_date?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          warranty_terms?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachments?: Json | null
          bid_amount?: number | null
          bid_request_id?: string | null
          bid_request_vendor_id?: string | null
          created_at?: string | null
          estimated_completion_date?: string | null
          estimated_start_date?: string | null
          evaluation_notes?: string | null
          evaluation_score?: number | null
          id?: string
          is_selected?: boolean | null
          payment_terms?: string | null
          proposal_details?: string | null
          proposal_text?: string | null
          proposed_timeline?: number | null
          status?: string | null
          submitted_at?: string | null
          terms_and_conditions?: string | null
          timeline_completion_date?: string | null
          timeline_start_date?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          warranty_terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_bids_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_request_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bids_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bids_bid_request_vendor_id_fkey"
            columns: ["bid_request_vendor_id"]
            isOneToOne: false
            referencedRelation: "bid_request_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bids_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bids_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_capabilities: {
        Row: {
          category_id: string | null
          certifications: string[] | null
          created_at: string | null
          id: string
          preferred_vendor: boolean | null
          proficiency_level: string
          updated_at: string | null
          vendor_id: string | null
          years_experience: number | null
        }
        Insert: {
          category_id?: string | null
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          preferred_vendor?: boolean | null
          proficiency_level: string
          updated_at?: string | null
          vendor_id?: string | null
          years_experience?: number | null
        }
        Update: {
          category_id?: string | null
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          preferred_vendor?: boolean | null
          proficiency_level?: string
          updated_at?: string | null
          vendor_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_capabilities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_capabilities_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_capabilities_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_categories: {
        Row: {
          association_id: string | null
          category_name: string
          created_at: string | null
          description: string | null
          id: string
          minimum_insurance_amount: number | null
          parent_category_id: string | null
          requires_insurance: boolean | null
          requires_license: boolean | null
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          category_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          minimum_insurance_amount?: number | null
          parent_category_id?: string | null
          requires_insurance?: boolean | null
          requires_license?: boolean | null
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          category_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          minimum_insurance_amount?: number | null
          parent_category_id?: string | null
          requires_insurance?: boolean | null
          requires_license?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_categories_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_certifications: {
        Row: {
          certification_name: string
          certification_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          certification_name: string
          certification_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          certification_name?: string
          certification_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_certifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_certifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_compliance_items: {
        Row: {
          association_id: string | null
          compliance_type: string
          created_at: string | null
          description: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          item_name: string
          last_reminder_sent: string | null
          notes: string | null
          renewal_notice_days: number | null
          required: boolean | null
          status: string
          updated_at: string | null
          vendor_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          association_id?: string | null
          compliance_type: string
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          item_name: string
          last_reminder_sent?: string | null
          notes?: string | null
          renewal_notice_days?: number | null
          required?: boolean | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          association_id?: string | null
          compliance_type?: string
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          item_name?: string
          last_reminder_sent?: string | null
          notes?: string | null
          renewal_notice_days?: number | null
          required?: boolean | null
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_compliance_items_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_compliance_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_compliance_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_compliance_items_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contract_amendments: {
        Row: {
          amendment_number: number
          amendment_type: string
          approved_at: string | null
          approved_by: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          effective_date: string
          id: string
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          amendment_number: number
          amendment_type: string
          approved_at?: string | null
          approved_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          effective_date: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          amendment_number?: number
          amendment_type?: string
          approved_at?: string | null
          approved_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          effective_date?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contract_amendments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contract_amendments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "vendor_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contract_amendments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contract_templates: {
        Row: {
          association_id: string | null
          auto_renew: boolean | null
          contract_terms: string
          created_at: string | null
          created_by: string | null
          default_duration_months: number | null
          id: string
          is_active: boolean | null
          requires_insurance: boolean | null
          requires_license: boolean | null
          template_content: string
          template_name: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          association_id?: string | null
          auto_renew?: boolean | null
          contract_terms: string
          created_at?: string | null
          created_by?: string | null
          default_duration_months?: number | null
          id?: string
          is_active?: boolean | null
          requires_insurance?: boolean | null
          requires_license?: boolean | null
          template_content: string
          template_name: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          association_id?: string | null
          auto_renew?: boolean | null
          contract_terms?: string
          created_at?: string | null
          created_by?: string | null
          default_duration_months?: number | null
          id?: string
          is_active?: boolean | null
          requires_insurance?: boolean | null
          requires_license?: boolean | null
          template_content?: string
          template_name?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contract_templates_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contract_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contracts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          association_id: string | null
          auto_renew: boolean | null
          contract_number: string
          contract_terms: string | null
          contract_title: string
          contract_type: string
          contract_value: number | null
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          payment_terms: string | null
          renewal_notice_days: number | null
          start_date: string
          status: string
          template_id: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          association_id?: string | null
          auto_renew?: boolean | null
          contract_number: string
          contract_terms?: string | null
          contract_title: string
          contract_type: string
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          payment_terms?: string | null
          renewal_notice_days?: number | null
          start_date: string
          status?: string
          template_id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          association_id?: string | null
          auto_renew?: boolean | null
          contract_number?: string
          contract_terms?: string | null
          contract_title?: string
          contract_type?: string
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          payment_terms?: string | null
          renewal_notice_days?: number | null
          start_date?: string
          status?: string
          template_id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contracts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contracts_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "vendor_contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          updated_at: string | null
          uploaded_by: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_emergency_contacts: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          relationship: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          relationship?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          relationship?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_emergency_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_emergency_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_management_enhanced: {
        Row: {
          average_payment_days: number | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_routing_number: string | null
          business_type: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          discount_percentage: number | null
          discount_terms_days: number | null
          id: string
          insurance_cert_on_file: boolean | null
          insurance_expiry_date: string | null
          onboarding_completed_at: string | null
          onboarding_status: string | null
          payment_method: string | null
          payment_terms_days: number | null
          performance_rating: number | null
          tax_id: string | null
          total_amount_paid: number | null
          total_invoices_processed: number | null
          updated_at: string | null
          vendor_id: string | null
          w9_date_received: string | null
          w9_on_file: boolean | null
        }
        Insert: {
          average_payment_days?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_routing_number?: string | null
          business_type?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          discount_percentage?: number | null
          discount_terms_days?: number | null
          id?: string
          insurance_cert_on_file?: boolean | null
          insurance_expiry_date?: string | null
          onboarding_completed_at?: string | null
          onboarding_status?: string | null
          payment_method?: string | null
          payment_terms_days?: number | null
          performance_rating?: number | null
          tax_id?: string | null
          total_amount_paid?: number | null
          total_invoices_processed?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          w9_date_received?: string | null
          w9_on_file?: boolean | null
        }
        Update: {
          average_payment_days?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_routing_number?: string | null
          business_type?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          discount_percentage?: number | null
          discount_terms_days?: number | null
          id?: string
          insurance_cert_on_file?: boolean | null
          insurance_expiry_date?: string | null
          onboarding_completed_at?: string | null
          onboarding_status?: string | null
          payment_method?: string | null
          payment_terms_days?: number | null
          performance_rating?: number | null
          tax_id?: string | null
          total_amount_paid?: number | null
          total_invoices_processed?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          w9_date_received?: string | null
          w9_on_file?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_management_enhanced_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_management_enhanced_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_performance_metrics: {
        Row: {
          association_id: string
          average_completion_days: number | null
          budget_adherence_rate: number | null
          cancelled_jobs: number | null
          completed_jobs: number | null
          created_at: string | null
          customer_satisfaction_score: number | null
          id: string
          on_time_completion_rate: number | null
          period_end: string
          period_start: string
          quality_score: number | null
          total_jobs: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          association_id: string
          average_completion_days?: number | null
          budget_adherence_rate?: number | null
          cancelled_jobs?: number | null
          completed_jobs?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          id?: string
          on_time_completion_rate?: number | null
          period_end: string
          period_start: string
          quality_score?: number | null
          total_jobs?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          association_id?: string
          average_completion_days?: number | null
          budget_adherence_rate?: number | null
          cancelled_jobs?: number | null
          completed_jobs?: number | null
          created_at?: string | null
          customer_satisfaction_score?: number | null
          id?: string
          on_time_completion_rate?: number | null
          period_end?: string
          period_start?: string
          quality_score?: number | null
          total_jobs?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_performance_metrics_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_performance_metrics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_performance_metrics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
      vendor_project_types: {
        Row: {
          created_at: string | null
          id: string
          is_preferred: boolean | null
          project_type_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          project_type_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          project_type_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_project_types_project_type_id_fkey"
            columns: ["project_type_id"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_project_types_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_project_types_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_reviews: {
        Row: {
          association_id: string
          created_at: string | null
          id: string
          is_verified: boolean | null
          job_reference: string | null
          rating: number
          review_date: string | null
          review_text: string | null
          reviewer_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          association_id: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          job_reference?: string | null
          rating: number
          review_date?: string | null
          review_text?: string | null
          reviewer_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          association_id?: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          job_reference?: string | null
          rating?: number
          review_date?: string | null
          review_text?: string | null
          reviewer_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_reviews_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_service_areas: {
        Row: {
          area_name: string
          area_type: string
          area_value: string
          created_at: string | null
          id: string
          is_primary_area: boolean | null
          travel_fee: number | null
          vendor_id: string | null
        }
        Insert: {
          area_name: string
          area_type: string
          area_value: string
          created_at?: string | null
          id?: string
          is_primary_area?: boolean | null
          travel_fee?: number | null
          vendor_id?: string | null
        }
        Update: {
          area_name?: string
          area_type?: string
          area_value?: string
          created_at?: string | null
          id?: string
          is_primary_area?: boolean | null
          travel_fee?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_service_areas_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_service_areas_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_staging: {
        Row: {
          Address1: string | null
          Address2: string | null
          "Check Name": string | null
          City: string | null
          "Compliance Status": string | null
          Contact: string | null
          DBA: string | null
          "Default Payment Method": string | null
          eMail: string | null
          "Hold Payment": boolean | null
          "Hold Reason": string | null
          "Is 1099": boolean | null
          "Is Compliant": boolean | null
          Phone: string | null
          "Provider Name": string | null
          "Provider Type": string | null
          "Service Provider ID": number | null
          State: string | null
          "Street No": string | null
          TaxID: string | null
          Zip: string | null
        }
        Insert: {
          Address1?: string | null
          Address2?: string | null
          "Check Name"?: string | null
          City?: string | null
          "Compliance Status"?: string | null
          Contact?: string | null
          DBA?: string | null
          "Default Payment Method"?: string | null
          eMail?: string | null
          "Hold Payment"?: boolean | null
          "Hold Reason"?: string | null
          "Is 1099"?: boolean | null
          "Is Compliant"?: boolean | null
          Phone?: string | null
          "Provider Name"?: string | null
          "Provider Type"?: string | null
          "Service Provider ID"?: number | null
          State?: string | null
          "Street No"?: string | null
          TaxID?: string | null
          Zip?: string | null
        }
        Update: {
          Address1?: string | null
          Address2?: string | null
          "Check Name"?: string | null
          City?: string | null
          "Compliance Status"?: string | null
          Contact?: string | null
          DBA?: string | null
          "Default Payment Method"?: string | null
          eMail?: string | null
          "Hold Payment"?: boolean | null
          "Hold Reason"?: string | null
          "Is 1099"?: boolean | null
          "Is Compliant"?: boolean | null
          Phone?: string | null
          "Provider Name"?: string | null
          "Provider Type"?: string | null
          "Service Provider ID"?: number | null
          State?: string | null
          "Street No"?: string | null
          TaxID?: string | null
          Zip?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          average_response_time: number | null
          bond_amount: number | null
          bond_expiry_date: string | null
          category: string | null
          completed_jobs: number | null
          contact_person: string | null
          created_at: string
          description: string | null
          email: string | null
          has_insurance: boolean
          hoa_id: string | null
          id: string
          insurance_certificate_url: string | null
          insurance_expiry_date: string | null
          insurance_info: Json | null
          is_active: boolean | null
          last_invoice: string | null
          license_number: string | null
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          service_type: string | null
          specialties: string[] | null
          status: string
          total_jobs: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          average_response_time?: number | null
          bond_amount?: number | null
          bond_expiry_date?: string | null
          category?: string | null
          completed_jobs?: number | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_insurance?: boolean
          hoa_id?: string | null
          id?: string
          insurance_certificate_url?: string | null
          insurance_expiry_date?: string | null
          insurance_info?: Json | null
          is_active?: boolean | null
          last_invoice?: string | null
          license_number?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          service_type?: string | null
          specialties?: string[] | null
          status?: string
          total_jobs?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          average_response_time?: number | null
          bond_amount?: number | null
          bond_expiry_date?: string | null
          category?: string | null
          completed_jobs?: number | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          has_insurance?: boolean
          hoa_id?: string | null
          id?: string
          insurance_certificate_url?: string | null
          insurance_expiry_date?: string | null
          insurance_info?: Json | null
          is_active?: boolean | null
          last_invoice?: string | null
          license_number?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          service_type?: string | null
          specialties?: string[] | null
          status?: string
          total_jobs?: number | null
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
          severity: string | null
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
          severity?: string | null
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
          severity?: string | null
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
      workflow_analytics: {
        Row: {
          association_id: string | null
          created_at: string
          id: string
          measurement_date: string
          metric_name: string
          metric_type: string
          metric_value: number
          workflow_execution_id: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string
          id?: string
          measurement_date?: string
          metric_name: string
          metric_type: string
          metric_value: number
          workflow_execution_id?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string
          id?: string
          measurement_date?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          workflow_execution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_analytics_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_analytics_workflow_execution_id_fkey"
            columns: ["workflow_execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_approvals: {
        Row: {
          approval_level: number
          approved_at: string | null
          approver_id: string | null
          association_id: string
          comments: string | null
          created_at: string | null
          deadline: string | null
          escalated_at: string | null
          escalated_to: string | null
          id: string
          record_id: string
          required_approver_role: string | null
          status: string | null
          workflow_type: string
        }
        Insert: {
          approval_level: number
          approved_at?: string | null
          approver_id?: string | null
          association_id: string
          comments?: string | null
          created_at?: string | null
          deadline?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          record_id: string
          required_approver_role?: string | null
          status?: string | null
          workflow_type: string
        }
        Update: {
          approval_level?: number
          approved_at?: string | null
          approver_id?: string | null
          association_id?: string
          comments?: string | null
          created_at?: string | null
          deadline?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          record_id?: string
          required_approver_role?: string | null
          status?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_events: {
        Row: {
          association_id: string | null
          correlation_id: string | null
          entity_id: string
          entity_type: string
          event_data: Json
          event_type: string
          id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          association_id?: string | null
          correlation_id?: string | null
          entity_id: string
          entity_type: string
          event_data?: Json
          event_type: string
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          association_id?: string | null
          correlation_id?: string | null
          entity_id?: string
          entity_type?: string
          event_data?: Json
          event_type?: string
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_events_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          ai_insights: Json | null
          association_id: string | null
          completed_at: string | null
          created_at: string
          execution_data: Json
          id: string
          performance_metrics: Json | null
          started_at: string | null
          status: string
          updated_at: string
          workflow_template_id: string | null
        }
        Insert: {
          ai_insights?: Json | null
          association_id?: string | null
          completed_at?: string | null
          created_at?: string
          execution_data?: Json
          id?: string
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          workflow_template_id?: string | null
        }
        Update: {
          ai_insights?: Json | null
          association_id?: string | null
          completed_at?: string | null
          created_at?: string
          execution_data?: Json
          id?: string
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_template_id_fkey"
            columns: ["workflow_template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_schedules: {
        Row: {
          association_id: string | null
          created_at: string | null
          created_by: string | null
          cron_expression: string
          id: string
          is_active: boolean | null
          last_run: string | null
          next_run: string | null
          parameters: Json | null
          run_count: number | null
          schedule_name: string
          updated_at: string | null
          workflow_template_id: string | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cron_expression: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          parameters?: Json | null
          run_count?: number | null
          schedule_name: string
          updated_at?: string | null
          workflow_template_id?: string | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          created_by?: string | null
          cron_expression?: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          parameters?: Json | null
          run_count?: number | null
          schedule_name?: string
          updated_at?: string | null
          workflow_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_schedules_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
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
      ai_processing_stats: {
        Row: {
          ai_processed: number | null
          association_id: string | null
          avg_confidence: number | null
          high_confidence: number | null
          low_confidence: number | null
          needs_review: number | null
          total_invoices: number | null
        }
        Relationships: []
      }
      bid_request_summary: {
        Row: {
          average_bid: number | null
          awarded_amount: number | null
          bid_deadline: string | null
          budget_range_max: number | null
          budget_range_min: number | null
          created_at: string | null
          highest_bid: number | null
          hoa_id: string | null
          id: string | null
          lowest_bid: number | null
          priority: string | null
          selected_vendor_id: string | null
          status: string | null
          title: string | null
          total_bids: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_requests_selected_vendor_id_fkey"
            columns: ["selected_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_selected_vendor_id_fkey"
            columns: ["selected_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      global_search_view: {
        Row: {
          association_id: string | null
          created_at: string | null
          id: string | null
          path: string | null
          search_vector: unknown | null
          subtitle: string | null
          title: string | null
          type: string | null
        }
        Relationships: []
      }
      vendor_learning_progress: {
        Row: {
          association_id: string | null
          avg_confidence_after_correction: number | null
          correction_count: number | null
          frequency_count: number | null
          last_updated: string | null
          vendor_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_vendor_patterns_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_performance: {
        Row: {
          average_response_time: number | null
          avg_evaluation_score: number | null
          bid_win_rate: number | null
          completed_jobs: number | null
          completion_rate: number | null
          hoa_id: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          rating: number | null
          selected_bids: number | null
          total_bids: number | null
          total_jobs: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_to_association: {
        Args: { p_association_id: string; p_user_id: string; p_role?: string }
        Returns: undefined
      }
      auto_allocate_payment: {
        Args: { p_payment_id: string }
        Returns: undefined
      }
      bulk_import_documents: {
        Args: {
          p_documents: Json
          p_association_id: string
          p_session_id?: string
        }
        Returns: Json
      }
      calculate_campaign_metrics: {
        Args: { campaign_uuid: string }
        Returns: {
          total_recipients: number
          delivered_count: number
          opened_count: number
          clicked_count: number
          bounced_count: number
          unsubscribed_count: number
          open_rate: number
          click_rate: number
          bounce_rate: number
        }[]
      }
      check_association_admin: {
        Args: { association_uuid: string }
        Returns: boolean
      }
      check_totp_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_user_association: {
        Args: { association_uuid: string }
        Returns: boolean
      }
      cleanup_processing_queue: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_processing_results: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      delete_totp_secret: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      generate_account_number: {
        Args: { p_association_id: string; p_prefix?: string }
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_scheduled_assessments: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_ai_suggestions: {
        Args: {
          p_association_id: string
          p_vendor_name?: string
          p_description?: string
        }
        Returns: Json
      }
      get_associations: {
        Args: Record<PropertyKey, never>
        Returns: {
          accounting_method: string | null
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
          cash_basis: boolean | null
          city: string | null
          code: string | null
          collections_active: string | null
          collections_model: string | null
          contact_email: string | null
          country: string | null
          county: string | null
          created_at: string
          decline_threshold: number | null
          description: string | null
          email_notifications: boolean | null
          empty_lots: number | null
          fire_inspection_due: string | null
          fiscal_year_end: string | null
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
          is_master_association: boolean | null
          late_fee_percentage: string | null
          legal_name: string | null
          lien_threshold: string | null
          lien_threshold_type: string | null
          logo_url: string | null
          master_association_code: string | null
          minimum_balance: number | null
          model: string | null
          name: string
          new_association_grace_period: string | null
          new_owner_grace_period: string | null
          nickname: string | null
          offsite_addresses: number | null
          payment_due_day: string | null
          phone: string | null
          portfolios: string | null
          primary_color: string | null
          processing_days: string | null
          property_type: string | null
          remittance_coupon_message: string | null
          require_arc_voting: boolean | null
          secondary_color: string | null
          service_type: string | null
          sms_notifications: boolean | null
          state: string | null
          state_tax_id: string | null
          statement_format: string | null
          status: string | null
          tax_id: string | null
          total_leases: number | null
          total_properties: number | null
          total_tenants: number | null
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
      get_secret: {
        Args: { secret_name: string }
        Returns: string
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
          accounting_method: string | null
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
          cash_basis: boolean | null
          city: string | null
          code: string | null
          collections_active: string | null
          collections_model: string | null
          contact_email: string | null
          country: string | null
          county: string | null
          created_at: string
          decline_threshold: number | null
          description: string | null
          email_notifications: boolean | null
          empty_lots: number | null
          fire_inspection_due: string | null
          fiscal_year_end: string | null
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
          is_master_association: boolean | null
          late_fee_percentage: string | null
          legal_name: string | null
          lien_threshold: string | null
          lien_threshold_type: string | null
          logo_url: string | null
          master_association_code: string | null
          minimum_balance: number | null
          model: string | null
          name: string
          new_association_grace_period: string | null
          new_owner_grace_period: string | null
          nickname: string | null
          offsite_addresses: number | null
          payment_due_day: string | null
          phone: string | null
          portfolios: string | null
          primary_color: string | null
          processing_days: string | null
          property_type: string | null
          remittance_coupon_message: string | null
          require_arc_voting: boolean | null
          secondary_color: string | null
          service_type: string | null
          sms_notifications: boolean | null
          state: string | null
          state_tax_id: string | null
          statement_format: string | null
          status: string | null
          tax_id: string | null
          total_leases: number | null
          total_properties: number | null
          total_tenants: number | null
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
      global_search: {
        Args: {
          search_query: string
          result_limit?: number
          result_offset?: number
          search_types?: string[]
        }
        Returns: {
          id: string
          type: string
          title: string
          subtitle: string
          path: string
          rank: number
          created_at: string
        }[]
      }
      set_secret: {
        Args: { secret_name: string; secret_value: string }
        Returns: boolean
      }
      set_totp_verified: {
        Args: { p_user_id: string; p_verified?: boolean }
        Returns: undefined
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
      update_vendor_pattern: {
        Args: {
          p_vendor_name: string
          p_association_id: string
          p_gl_account: string
          p_category: string
          p_description: string
        }
        Returns: undefined
      }
      upsert_totp_secret: {
        Args: { p_user_id: string; p_totp_secret: string; p_verified?: boolean }
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
      validate_document_upload: {
        Args: { file_size_bytes: number; file_type?: string }
        Returns: Json
      }
      validate_resident_preferences: {
        Args: { preferences: Json }
        Returns: boolean
      }
      validate_webhook_signature: {
        Args: { payload: string; signature: string; secret: string }
        Returns: boolean
      }
      verify_totp: {
        Args: { p_user_id: string; p_token: string }
        Returns: Json
      }
    }
    Enums: {
      campaign_recipient_status:
        | "pending"
        | "sent"
        | "delivered"
        | "opened"
        | "clicked"
        | "bounced"
        | "unsubscribed"
        | "failed"
      email_campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "paused"
        | "cancelled"
      email_template_category:
        | "welcome"
        | "follow_up"
        | "newsletter"
        | "announcement"
        | "promotional"
        | "custom"
      message_category:
        | "general"
        | "maintenance"
        | "compliance"
        | "events"
        | "financial"
        | "emergency"
        | "announcement"
        | "community"
      user_role:
        | "admin"
        | "manager"
        | "resident"
        | "maintenance"
        | "accountant"
        | "user"
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
    Enums: {
      campaign_recipient_status: [
        "pending",
        "sent",
        "delivered",
        "opened",
        "clicked",
        "bounced",
        "unsubscribed",
        "failed",
      ],
      email_campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "paused",
        "cancelled",
      ],
      email_template_category: [
        "welcome",
        "follow_up",
        "newsletter",
        "announcement",
        "promotional",
        "custom",
      ],
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
      user_role: [
        "admin",
        "manager",
        "resident",
        "maintenance",
        "accountant",
        "user",
      ],
    },
  },
} as const
