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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_tickets: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          issued_at: string
          qr_code_data: string
          registration_id: string | null
          ticket_number: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          issued_at?: string
          qr_code_data: string
          registration_id?: string | null
          ticket_number: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          issued_at?: string
          qr_code_data?: string
          registration_id?: string | null
          ticket_number?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_tickets_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_dashboard_access: {
        Row: {
          access_token: string
          created_at: string | null
          email: string
          event_id: string | null
          expires_at: string
          granted_by: string | null
          id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          email: string
          event_id?: string | null
          expires_at: string
          granted_by?: string | null
          id?: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          email?: string
          event_id?: string | null
          expires_at?: string
          granted_by?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_dashboard_access_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string | null
          custom_answers: Json | null
          email: string
          event_id: string
          id: string
          mobile_number: string | null
          name: string
          payment_id: string | null
          payment_order_id: string | null
          payment_provider: string | null
          payment_signature: string | null
          payment_status: string | null
          phone: string | null
          registration_number: string | null
          ticket_code: string | null
          user_id: string | null
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          custom_answers?: Json | null
          email: string
          event_id: string
          id?: string
          mobile_number?: string | null
          name: string
          payment_id?: string | null
          payment_order_id?: string | null
          payment_provider?: string | null
          payment_signature?: string | null
          payment_status?: string | null
          phone?: string | null
          registration_number?: string | null
          ticket_code?: string | null
          user_id?: string | null
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          custom_answers?: Json | null
          email?: string
          event_id?: string
          id?: string
          mobile_number?: string | null
          name?: string
          payment_id?: string | null
          payment_order_id?: string | null
          payment_provider?: string | null
          payment_signature?: string | null
          payment_status?: string | null
          phone?: string | null
          registration_number?: string | null
          ticket_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_responses: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          responses: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          responses?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          responses?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_responses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          category: string
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string
          form_schema: Json | null
          id: string
          location: string
          max_participants: number
          organisation_uuid: string | null
          organization_id: string | null
          organizer_name: string
          questions: Json | null
          registration_link: string | null
          start_date: string
          status: string | null
          ticket_price: number | null
          title: string
        }
        Insert: {
          banner_url?: string | null
          category: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date: string
          form_schema?: Json | null
          id?: string
          location: string
          max_participants: number
          organisation_uuid?: string | null
          organization_id?: string | null
          organizer_name: string
          questions?: Json | null
          registration_link?: string | null
          start_date: string
          status?: string | null
          ticket_price?: number | null
          title: string
        }
        Update: {
          banner_url?: string | null
          category?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string
          form_schema?: Json | null
          id?: string
          location?: string
          max_participants?: number
          organisation_uuid?: string | null
          organization_id?: string | null
          organizer_name?: string
          questions?: Json | null
          registration_link?: string | null
          start_date?: string
          status?: string | null
          ticket_price?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      optimus_applications: {
        Row: {
          action: string | null
          areas_of_interest: string[]
          branch: string
          course_year: string
          created_at: string | null
          date_of_birth: string
          email: string
          full_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          motivation: string
          participated_before: boolean
          phone_number: string
          registration_number: string
          residence: string
          whatsapp_number: string | null
        }
        Insert: {
          action?: string | null
          areas_of_interest: string[]
          branch: string
          course_year: string
          created_at?: string | null
          date_of_birth: string
          email: string
          full_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          motivation: string
          participated_before: boolean
          phone_number: string
          registration_number: string
          residence: string
          whatsapp_number?: string | null
        }
        Update: {
          action?: string | null
          areas_of_interest?: string[]
          branch?: string
          course_year?: string
          created_at?: string | null
          date_of_birth?: string
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          motivation?: string
          participated_before?: boolean
          phone_number?: string
          registration_number?: string
          residence?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      organisation_invites: {
        Row: {
          created_at: string | null
          id: string
          organisation_id: string | null
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          token?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "organisation_invites_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string | null
          organisation_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          organisation_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          organisation_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          organisation_id: string
          organisation_uuid: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          organisation_id: string
          organisation_uuid?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          organisation_id?: string
          organisation_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          is_staff: boolean | null
          location: string | null
          name: string | null
          organisation_uuid: string | null
          phone_number: string | null
          photo: string | null
          role: string | null
          staff_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          is_staff?: boolean | null
          location?: string | null
          name?: string | null
          organisation_uuid?: string | null
          phone_number?: string | null
          photo?: string | null
          role?: string | null
          staff_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          is_staff?: boolean | null
          location?: string | null
          name?: string | null
          organisation_uuid?: string | null
          phone_number?: string | null
          photo?: string | null
          role?: string | null
          staff_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          name: string
          phone: string | null
          ticket_code: string | null
          user_id: string | null
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          name: string
          phone?: string | null
          ticket_code?: string | null
          user_id?: string | null
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          name?: string
          phone?: string | null
          ticket_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_organisation: {
        Args: { org_id: string }
        Returns: Json
      }
      check_in_attendee: {
        Args: { ticket_code_param: string }
        Returns: Json
      }
      generate_org_invite_token: {
        Args: { org_id: string }
        Returns: string
      }
      get_organization_by_name: {
        Args: { org_name: string }
        Returns: Json
      }
      is_organiser: {
        Args: { uid: string }
        Returns: boolean
      }
      join_organization_by_token: {
        Args: { p_token: string; p_user_id: string }
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
