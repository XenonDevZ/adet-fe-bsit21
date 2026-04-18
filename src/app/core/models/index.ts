export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  picture: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
  course: string | null; // ADD
  year_level: string | null; // ADD
  department: string | null; // ADD
  role: Role;
  created_at: string;
}

export interface Teacher {
  teacher_id: number;
  user_id: number;
  name: string;
  email: string;
  picture: string;
  department: string | null;
  bio: string | null;
}

export interface Availability {
  id: number;
  teacher_id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Booking {
  id: number;
  student_id: number;
  teacher_id: number;
  availability_id: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  consultation_type: 'ONLINE' | 'FACE_TO_FACE';
  student_notes: string | null;
  teacher_notes: string | null;
  meet_link: string | null;
  student_name: string;
  student_email: string;
  student_picture: string;
  teacher_name: string;
  teacher_picture: string | null;
  created_at: string;
  updated_at: string;
  reschedule_date: string | null;
  reschedule_start_time: string | null;
  reschedule_end_time: string | null;
  reschedule_status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | null;
  chat_closed: boolean;
}

export interface Notification {
  id: number;
  user_id: number;
  booking_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number };
  error?: string;
}

export interface BookingFile {
  id: number;
  booking_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploader_name: string;
}

export interface Feedback {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

export interface ChatMessage {
  id: number;
  booking_id: number;
  sender_id: number;
  message: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  is_system: boolean;
  created_at: string;
  sender_name: string;
  sender_picture: string;
  sender_role: string;
}
