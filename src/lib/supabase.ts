import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          username: string;
          bio: string | null;
          avatar_initial: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          username: string;
          bio?: string | null;
          avatar_initial?: string;
          created_at?: string;
        };
        Update: {
          display_name?: string;
          username?: string;
          bio?: string | null;
          avatar_initial?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          body: string;
          tags: string[];
          featured: boolean;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          body: string;
          tags?: string[];
          featured?: boolean;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          body?: string;
          tags?: string[];
          featured?: boolean;
          image_url?: string | null;
        };
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
      saved_posts: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
      chat_messages: {
        Row: {
          id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          body?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)
  : null;
