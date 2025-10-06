export interface ReferralData {
  id?: string;
  clinic_id: string;
  user_session_id: string;
  chat_session_id: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at?: string;
  updated_at?: string;
  referral_date?: string;
  appointment_date?: string | null;
  notes?: string | null;
}
