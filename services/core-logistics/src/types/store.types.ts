export interface ServiceChannel {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  metadata: {
    rank?: number;
    icon?: string;
    color?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  product?: Product[];
}

export interface Product {
  id: string;
  service_channel_id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Advertisement {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  target_url?: string;
  is_active: boolean;
  metadata: {
    adsRank?: number;
    imageUrl?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface UserServiceSession {
  id: string;
  user_id: string;
  service_channel_id: string;
  session_data: Record<string, any>;
  started_at: string;
  last_activity_at: string;
  is_active: boolean;
  service_channel?: ServiceChannel;
}

export interface ServiceAnalytic {
  id: string;
  user_id?: string;
  service_channel_id: string;
  action_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface StoreInitResponse {
  supported_sales_channels: ServiceChannel[];
  ads: Advertisement[];
  main_services: ServiceChannel[];
  vendors?: VendorsResponse;
}

export interface VendorsResponse {
  trending: { data: any[] };
  new: { data: any[] };
  featured: { data: any[] };
  nearby: { data: any[] };
}

export interface ServiceSelectionRequest {
  service_channel_name: string;
  user_location?: {
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, any>;
}

export interface ServiceContextResponse {
  has_active_session: boolean;
  session_id?: string;
  service_channel?: {
    id: string;
    name: string;
    description: string;
  };
  session_data?: Record<string, any>;
  started_at?: string;
  last_activity_at?: string;
  message?: string;
}
