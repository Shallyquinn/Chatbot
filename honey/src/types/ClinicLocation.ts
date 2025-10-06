export interface ClinicLocation {
  clinic_id: string;
  clinic_name: string;
  clinic_type?: string;
  state: string;
  lga: string;
  city?: string;
  address?: string;
  landmark?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  services_offered: string[];
  fpm_methods_available: string[];
  consultation_fee?: number;
  operating_hours?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}
