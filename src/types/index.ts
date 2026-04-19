export type Role = 'customer' | 'staff' | 'manager' | 'owner'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired'
export type PaymentMethod = 'cash' | 'qris' | 'va' | 'transfer'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  isActive?: boolean
  createdAt?: string
  locationId?: string | null
}

export interface Studio {
  id: string
  name: string
  capacity: number
  description?: string
  isActive: boolean
}

export interface Package {
  id: string
  name: string
  price: number
  durationMin: number
  maxPax: number
  description?: string
  isActive: boolean
  studios?: Studio[]
}

export interface BookingLog {
  id: string
  bookingId: string
  changedBy: string
  action: string
  fromValue?: string
  toValue?: string
  reason?: string
  createdAt: string
}

export interface Transaction {
  id: string
  transactionCode: string
  bookingId: string
  booking?: Booking
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  proofUrl?: string
  processedById?: string
  processedBy?: User
  paidAt?: string
  createdAt: string
}

export interface Booking {
  id: string
  bookingCode: string
  user?: User
  userId?: string
  guestName?: string
  guestPhone?: string
  package: Package
  packageId: string
  studio: Studio
  studioId: string
  startTime: string
  endTime: string
  paxCount: number
  status: BookingStatus
  isWalkIn: boolean
  notes?: string
  createdAt: string
  transaction?: Transaction
  changeLogs?: BookingLog[]
}

export interface ActivityLog {
  id: string
  userId: string
  user?: User
  action: string
  resourceId?: string
  detail?: string
  ipAddress?: string
  createdAt: string
}

export interface ScheduleSlot {
  studioId: string
  studioName: string
  date: string
  slots: {
    time: string
    available: boolean
    bookingId?: string
    booking?: Booking
  }[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

export interface DashboardSummary {
  totalBookings: number
  pendingBookings: number
  activeWalkins: number
  needConfirmation: number
  monthlyBookings?: number
  monthlyRevenue?: number
  utilizationRate?: number
  cancellationRate?: number
  lastMonthRevenue?: number
  bookingTrend?: { label: string; value: number }[]
}
