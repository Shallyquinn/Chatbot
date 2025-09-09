// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = 'https://ylxmkvwshlrjqjtdjjjo.supabase.co'; // replace with your URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlseG1rdndzaGxyanFqdGRqampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NTA5NzAsImV4cCI6MjA1NDAyNjk3MH0.cmQ_HGxPm604PeFGeBR02zxYHCKc1tpniFIOXE2sEgo'; // replace with your public key

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Stores user data in the "users" table.
 * @param userData - The user data to store.
 * @returns The inserted rows of type T or null.
 */

interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at?: string;
          [key: string]: string | undefined;
        };
        Insert: {
          id?: string;
          [key: string]: string | undefined;
        };
      };
    };
  };
}

export const storeUserData = async <T extends object>(
  userData: T
): Promise<Database['public']['Tables']['users']['Row'][] | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: uuidv4(), ...userData }]);

  if (error) {
    console.error("Error storing user data:", error);
  }
  return data;
};
