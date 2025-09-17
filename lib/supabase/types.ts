export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: {
          p_usename: string
        }
        Returns: {
          username: string
          password: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  private_secrets: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          service_name: string
        }
        Insert: {
          api_key: string
          service_name: string
        }
        Update: {
          api_key?: string
          service_name?: string
        }
        Relationships: []
      }
      secrets: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
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
  public: {
    Tables: {
      client: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          panel_user_id: string | null
          permission_mask: number
          person_id: string | null
          status: string
          type: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          panel_user_id?: string | null
          permission_mask?: number
          person_id?: string | null
          status: string
          type: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          panel_user_id?: string | null
          permission_mask?: number
          person_id?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_client_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_client_panel_user_id_fkey"
            columns: ["panel_user_id"]
            referencedRelation: "panel_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_client_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          ssn: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          ssn: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          ssn?: string
        }
        Relationships: []
      }
      n8n_job: {
        Row: {
          created_at: string
          entity: string
          entity_id: string
          id: string
          name: string
          status: string
          URL: string
        }
        Insert: {
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          name: string
          status: string
          URL: string
        }
        Update: {
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          name?: string
          status?: string
          URL?: string
        }
        Relationships: []
      }
      order: {
        Row: {
          client_id: string
          client_name: string
          created_at: string
          description: string
          id: string
          pre_order_id: string | null
          status: string
          total_amount: number
          type: string
        }
        Insert: {
          client_id: string
          client_name: string
          created_at?: string
          description: string
          id?: string
          pre_order_id?: string | null
          status: string
          total_amount: number
          type: string
        }
        Update: {
          client_id?: string
          client_name?: string
          created_at?: string
          description?: string
          id?: string
          pre_order_id?: string | null
          status?: string
          total_amount?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_order_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_order_pre_order_id_fkey"
            columns: ["pre_order_id"]
            referencedRelation: "pre_order"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          permission_mask: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          permission_mask: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          permission_mask?: number
          updated_at?: string
        }
        Relationships: []
      }
      person: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          ssn: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          ssn: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          ssn?: string
        }
        Relationships: []
      }
      pre_order: {
        Row: {
          client_id: string
          client_name: string
          created_at: string
          description: string
          estimated_amount: number | null
          id: string
          status: string
          type: string
        }
        Insert: {
          client_id: string
          client_name: string
          created_at?: string
          description: string
          estimated_amount?: number | null
          id?: string
          status: string
          type: string
        }
        Update: {
          client_id?: string
          client_name?: string
          created_at?: string
          description?: string
          estimated_amount?: number | null
          id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_pre-orders_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_send_sms_hook: {
        Args: {
          payload: Json
        }
        Returns: Json
      }
      filter_client_paginated: {
        Args: {
          _types: string[]
          _statuses: string[]
          _limit: number
          _offset: number
        }
        Returns: {
          company_id: string | null
          created_at: string
          id: string
          panel_user_id: string | null
          permission_mask: number
          person_id: string | null
          status: string
          type: string
        }[]
      }
      filter_order_paginated: {
        Args: {
          _types: string[]
          _statuses: string[]
          _limit: number
          _offset: number
        }
        Returns: {
          client_id: string
          client_name: string
          created_at: string
          description: string
          id: string
          pre_order_id: string | null
          status: string
          total_amount: number
          type: string
        }[]
      }
      filter_pre_order_paginated: {
        Args: {
          _types: string[]
          _statuses: string[]
          _limit: number
          _offset: number
        }
        Returns: {
          client_id: string
          client_name: string
          created_at: string
          description: string
          estimated_amount: number | null
          id: string
          status: string
          type: string
        }[]
      }
      filtered_client_total: {
        Args: {
          _types: string[]
          _statuses: string[]
        }
        Returns: number
      }
      filtered_order_total: {
        Args: {
          _types: string[]
          _statuses: string[]
        }
        Returns: number
      }
      filtered_pre_order_total: {
        Args: {
          _types: string[]
          _statuses: string[]
        }
        Returns: number
      }
      get_all_client_names: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_id: string
          client_name: string
          client_type: string
        }[]
      }
      get_client_name: {
        Args: {
          _client_id: string
        }
        Returns: string
      }
      get_filtered_clients_total_with_permissions: {
        Args: {
          requesting_user_mask: number
          _types?: string[]
          _statuses?: string[]
        }
        Returns: number
      }
      get_filtered_clients_with_permissions: {
        Args: {
          requesting_user_id: string
          requesting_user_mask: number
          _types?: string[]
          _statuses?: string[]
          _limit?: number
          _offset?: number
        }
        Returns: {
          id: string
          created_at: string
          type: string
          status: string
          person_id: string
          company_id: string
          permission_mask: number
          panel_user_id: string
          is_mutable: boolean
        }[]
      }
      search_company_by_name: {
        Args: {
          search_term: string
        }
        Returns: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          ssn: string
        }[]
      }
      search_person_by_name: {
        Args: {
          search_term: string
        }
        Returns: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          ssn: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
