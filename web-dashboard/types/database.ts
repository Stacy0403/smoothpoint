export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      org_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          organization_id: string;
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          organization_id: string;
          token?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          organization_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_invites_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      org_memberships: {
        Row: {
          id: string;
          invited_at: string;
          joined_at: string | null;
          organization_id: string;
          role: Database["public"]["Enums"]["org_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          invited_at?: string;
          joined_at?: string | null;
          organization_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          invited_at?: string;
          joined_at?: string | null;
          organization_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          admin_id: string;
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          seat_limit: number;
          watermark_config: Json;
        };
        Insert: {
          admin_id: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          seat_limit?: number;
          watermark_config?: Json;
        };
        Update: {
          admin_id?: string;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          seat_limit?: number;
          watermark_config?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          last_license_check: string | null;
          organization_id: string | null;
          plan_type: Database["public"]["Enums"]["plan_type"];
          updated_at: string;
          watermark_url: string | null;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email: string;
          id: string;
          last_license_check?: string | null;
          organization_id?: string | null;
          plan_type?: Database["public"]["Enums"]["plan_type"];
          updated_at?: string;
          watermark_url?: string | null;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string;
          id?: string;
          last_license_check?: string | null;
          organization_id?: string | null;
          plan_type?: Database["public"]["Enums"]["plan_type"];
          updated_at?: string;
          watermark_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          id: string;
          price_id: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_end: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          price_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_end?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          price_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_end?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      org_role: "admin" | "member";
      plan_type: "free" | "pro" | "enterprise";
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "incomplete";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PlanType = Database["public"]["Enums"]["plan_type"];
