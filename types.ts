
export interface UserSettings {
  app_lock_enabled: boolean;
  biometric_registered: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  settings: UserSettings;
}

export interface Item {
  id: string;
  user_id: string;
  url: string;
  thumbnail: string;
  title: string;
  category_id?: string;
  subcategory_id?: string;
  tags: string[];
  short_description_ai?: string;
  mind_notes?: string;
  created_at: string;
  deleted_at?: string | null; // For Bin
  reviewed_at?: string | null; // For Serendipity
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'other';
  is_processing?: boolean; // For background analysis UI
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
}

export type ViewTab = 'everything' | 'space' | 'serendipity' | 'profile';

export interface AIAnalysisResult {
  title: string;
  summary: string;
  category: string;
  subcategory: string;
  tags: string[];
}

