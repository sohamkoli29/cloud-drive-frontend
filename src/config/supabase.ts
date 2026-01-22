import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create Supabase client for public access
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// Create Supabase admin client for privileged operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// Type definitions for our database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          storage_quota: number;
          storage_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          storage_quota?: number;
          storage_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          storage_quota?: number;
          storage_used?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          parent_id: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          parent_id?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          parent_id?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          name: string;
          mime_type: string | null;
          size_bytes: number | null;
          storage_key: string;
          owner_id: string;
          folder_id: string | null;
          version_id: string | null;
          checksum: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          storage_key: string;
          owner_id: string;
          folder_id?: string | null;
          version_id?: string | null;
          checksum?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          storage_key?: string;
          owner_id?: string;
          folder_id?: string | null;
          version_id?: string | null;
          checksum?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};