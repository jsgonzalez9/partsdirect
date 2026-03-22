import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Dynamic routes like sitemap.xml will fail until configured in Vercel.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// ============================================
// TYPES (Decision-Dominance Schema)
// ============================================

export interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  oem_flag: boolean;
  aftermarket_brand?: string;
  price: number;
  availability: string;
  image_url?: string;
  technical_specs?: Record<string, any>;
  cross_references?: CrossReference[];
  seo_title?: string;
  seo_description?: string;
}

export interface CrossReference {
  brand: string;
  part: string;
  fit: 'exact' | 'verify_seal' | 'check_specs';
}

export interface Fitment {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  trim?: string;
  position?: string;
  fitment_notes?: string;
  confidence_score: number;
  verified: boolean;
}

export interface FailureMode {
  id: string;
  symptom: string;
  severity_score: number;
  urgency_score: number;
  common_causes: string[];
  diagnostic_steps?: string;
  safety_warning: boolean;
  drivable: boolean;
}

export interface InstallData {
  id: string;
  labor_hours?: number;
  difficulty: number;
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  tools_required: string[];
  parts_needed?: string[];
  torque_specs?: Record<string, string>;
  special_instructions?: string;
  pro_tips?: string;
  common_mistakes?: string;
}

export interface PriceSource {
  id: string;
  retailer: string;
  price: number;
  shipping_cost: number;
  availability: string;
  affiliate_link?: string;
}

export interface PartComplete extends Part {
  fitments?: Fitment[];
  failures?: FailureMode[];
  install_info?: InstallData[];
  prices?: PriceSource[];
}

// ============================================
// CATALOG API (Engine A)
// ============================================

export const searchParts = async (query: string, filters?: {
  make?: string;
  model?: string;
  year?: number;
  category?: string;
}) => {
  let dbQuery = supabase
    .from('parts')
    .select('*, prices(*)')
    .or(`part_number.ilike.%${query}%,name.ilike.%${query}%`);

  if (filters?.category) {
    dbQuery = dbQuery.eq('category', filters.category);
  }

  const { data, error } = await dbQuery.limit(20);
  if (error) throw error;
  return data as Part[];
};

export const getPartByNumber = async (partNumber: string): Promise<PartComplete> => {
  const { data, error } = await supabase
    .from('parts_complete')
    .select('*')
    .eq('part_number', partNumber)
    .single();
  
  if (error) throw error;
  return data as unknown as PartComplete;
};

export const getPartsByVehicle = async (make: string, model: string, year: number) => {
  const { data, error } = await supabase
    .from('fitment')
    .select('parts(*), confidence_score, fitment_notes')
    .eq('make', make)
    .eq('model', model)
    .eq('year', year)
    .order('confidence_score', { ascending: false });
  
  if (error) throw error;
  return data;
};

// ============================================
// EXPERT API (Engine B)
// ============================================

export const getPartFailures = async (partId: string) => {
  const { data, error } = await supabase
    .from('failure_modes')
    .select('*')
    .eq('part_id', partId)
    .order('urgency_score', { ascending: false });
  
  if (error) throw error;
  return data as FailureMode[];
};

export const getPartInstallData = async (partId: string) => {
  const { data, error } = await supabase
    .from('install_data')
    .select('*')
    .eq('part_id', partId)
    .single();
  
  if (error) throw error;
  return data as InstallData;
};

export const getBestPrices = async (partId: string) => {
  const { data, error } = await supabase
    .from('price_sources')
    .select('*')
    .eq('part_id', partId)
    .order('price', { ascending: true });
  
  if (error) throw error;
  return data as PriceSource[];
};

// ============================================
// SEO API (Engine C)
// ============================================

export const getSEOPage = async (slug: string) => {
  const { data, error } = await supabase
    .from('seo_pages')
    .select('*, seo_page_parts(parts(*))')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  
  if (error) throw error;
  return data;
};

export const getSEOPagesByType = async (pageType: string, limit = 10) => {
  const { data, error } = await supabase
    .from('seo_pages')
    .select('*')
    .eq('page_type', pageType)
    .eq('published', true)
    .order('page_priority', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

// ============================================
// LEAD GEN API
// ============================================

export const submitMechanicLead = async (lead: {
  zip_code: string;
  part_id?: string;
  vehicle_info?: Record<string, any>;
  urgency: 'DIY' | 'Soon' | 'ASAP';
  contact_email?: string;
  contact_phone?: string;
}) => {
  const { data, error } = await supabase
    .from('mechanic_leads')
    .insert([lead])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
// ============================================
// SITEMAP HELPERS
// ============================================

export const getAllPartNumbers = async (limit = 1000) => {
  const { data, error } = await supabase
    .from('parts')
    .select('part_number')
    .limit(limit);
  
  if (error) throw error;
  return data.map(p => p.part_number);
};

export const getAllSymptomSlugs = async (limit = 1000) => {
  const { data, error } = await supabase
    .from('seo_pages')
    .select('slug')
    .eq('page_type', 'symptom')
    .eq('published', true)
    .limit(limit);
  
  if (error) throw error;
  return data.map(p => p.slug);
};
