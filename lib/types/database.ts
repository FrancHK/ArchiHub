export type UserRole = 'admin' | 'engineer' | 'customer'
export type PlanHouseType = 'modern' | 'classic' | 'contemporary' | 'traditional' | 'minimalist' | 'bungalow' | 'villa' | 'apartment'
export type WithdrawalMethod = 'bank_transfer' | 'mpesa' | 'airtel_money' | 'paypal'
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed'
export type HireStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'
export type ProjectStage = 'planning' | 'foundation' | 'walling' | 'roofing' | 'finishing'
export type PaymentStatus = 'pending' | 'completed' | 'refunded'
export type NotificationType = 'sale' | 'withdrawal' | 'hire' | 'review' | 'system'

export interface ArchiProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  location: string | null
  bio: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ArchiEngineerProfile {
  id: string
  user_id: string
  title: string
  experience_years: number
  skills: string[]
  certifications: string[]
  is_verified: boolean
  is_active: boolean
  rating: number
  total_reviews: number
  total_sales: number
  hourly_rate: number | null
  created_at: string
  updated_at: string
  // joined
  profile?: ArchiProfile
}

export interface ArchiPlan {
  id: string
  engineer_id: string
  title: string
  description: string
  price: number
  bedrooms: number | null
  bathrooms: number | null
  floors: number
  area_sqft: number | null
  house_type: PlanHouseType | null
  thumbnail_url: string | null
  preview_images: string[]
  file_url: string | null
  tags: string[]
  is_published: boolean
  total_sales: number
  created_at: string
  updated_at: string
  // joined
  engineer?: ArchiEngineerProfile & { profile?: ArchiProfile }
}

export interface ArchiSale {
  id: string
  plan_id: string
  buyer_id: string
  engineer_id: string
  amount: number
  engineer_amount: number
  commission_amount: number
  payment_method: string
  payment_status: PaymentStatus
  stripe_payment_intent: string | null
  created_at: string
  plan?: ArchiPlan
}

export interface ArchiWallet {
  id: string
  engineer_id: string
  balance: number
  pending_balance: number
  total_earned: number
  updated_at: string
}

export interface ArchiWithdrawal {
  id: string
  engineer_id: string
  amount: number
  method: WithdrawalMethod
  account_details: Record<string, string>
  status: WithdrawalStatus
  admin_note: string | null
  requested_at: string
  processed_at: string | null
  engineer?: ArchiEngineerProfile & { profile?: ArchiProfile }
}

export interface ArchiReview {
  id: string
  reviewer_id: string
  engineer_id: string | null
  plan_id: string | null
  rating: number
  comment: string
  created_at: string
  reviewer?: ArchiProfile
}

export interface ArchiHireRequest {
  id: string
  client_id: string
  engineer_id: string
  project_title: string
  description: string
  budget_min: number | null
  budget_max: number | null
  location: string | null
  status: HireStatus
  current_stage: ProjectStage | null
  created_at: string
  updated_at: string
  client?: ArchiProfile
  engineer?: ArchiEngineerProfile & { profile?: ArchiProfile }
}

export interface ArchiMessage {
  id: string
  hire_request_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: ArchiProfile
}

export interface ArchiNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}

export interface ArchiFilterOptions {
  house_type?: PlanHouseType
  bedrooms?: number
  min_price?: number
  max_price?: number
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
}
