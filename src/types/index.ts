// Core Types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  user_id: string;
  name: string;
  role: 'user' | 'organiser' | 'admin';
  organisation_uuid?: string;
  is_staff: boolean;
  staff_name?: string;
  phone_number?: string;
  location?: string;
  avatar_url?: string;
  photo?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  avatar_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_name: string;
  contact_email: string;
  contact_phone?: string;
  registration_link?: string;
  ticket_price?: number;
  max_participants?: number;
  banner_url?: string;
  created_by: string;
  organisation_uuid?: string;
  status: 'pending' | 'approved' | 'rejected';
  form_schema: FormField[];
  created_at: string;
}

export interface FormField {
  id: string;
  type: 'radio' | 'checkbox' | 'textarea' | 'number' | 'date' | 'file';
  label: string;
  required: boolean;
  options?: string[]; // For radio and checkbox
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface EventResponse {
  id: string;
  event_id: string;
  user_id: string;
  responses: Record<string, any>;
  created_at: string;
}

export interface Post {
  id: string;
  content: string;
  image_url?: string;
  author_id: string;
  organisation_id: string;
  created_at: string;
  organization?: { name: string };
  author?: { name: string; avatar_url?: string; is_staff: boolean; staff_name?: string };
  likes_count: number;
  comments_count: number;
  shares_count: number;
  user_liked: boolean;
  user_shared: boolean;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user?: { name: string; avatar_url?: string };
}

export interface Share {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// Form Types
export interface DynamicFormProps {
  schema: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  loading?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}