export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'
export type BookingStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'

export interface JwtPayload {
  sub: number
  email: string
  name: string
  picture: string
  role: Role
  iat: number
  exp: number
}

export interface User {
  id: number
  email: string
  name: string
  picture: string
  role: Role
  created_at: string
}

export interface Teacher {
  teacher_id: number
  user_id: number
  name: string
  email: string
  picture: string
  department: string | null
  bio: string | null
}

export interface Availability {
  id: number
  teacher_id: number
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Booking {
  id: number
  student_id: number
  teacher_id: number
  availability_id: number
  scheduled_date: string
  start_time: string
  end_time: string
  status: BookingStatus
  student_notes: string | null
  teacher_notes: string | null
  meet_link: string | null
  student_name: string
  student_email: string
  teacher_name: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: number
  user_id: number
  booking_id: number | null
  message: string
  is_read: boolean
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: { total: number }
  error?: string
}