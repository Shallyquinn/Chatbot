// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ylxmkvwshlrjqjtdjjjo.supabase.co'; // replace with your URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlseG1rdndzaGxyanFqdGRqampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NTA5NzAsImV4cCI6MjA1NDAyNjk3MH0.cmQ_HGxPm604PeFGeBR02zxYHCKc1tpniFIOXE2sEgo'; // replace with your public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const storeUserData = async (userData) => {
    const { data, error } = await supabase
      .from("users")
      .insert([{ id: uuidv4(), ...userData }]);
  
    if (error) console.error("Error storing user data:", error);
    return data;
  };