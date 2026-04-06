import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'
import type {
  ApiResponse, User, Teacher, Availability,
  Booking, BookingStatus, DayOfWeek, Notification, Role
} from '../models/index'

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl

  constructor(private http: HttpClient) {}

  // ── Auth ───────────────────────────────────────────────
  getMe() {
    return this.http.get<ApiResponse<User>>(`${this.base}/auth/me`)
  }

  // ── Users (admin) ──────────────────────────────────────
  getUsers() {
    return this.http.get<ApiResponse<User[]>>(`${this.base}/users`)
  }

  updateUserRole(id: number, role: Role) {
    return this.http.patch<ApiResponse<User>>(`${this.base}/users/${id}/role`, { role })
  }

  // ── Teachers ───────────────────────────────────────────
  getTeachers() {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.base}/teachers`)
  }

  getTeacher(id: number) {
    return this.http.get<ApiResponse<Teacher>>(`${this.base}/teachers/${id}`)
  }

  // ── Availability ───────────────────────────────────────
  getAvailability(teacherId: number) {
    return this.http.get<ApiResponse<Availability[]>>(`${this.base}/availability/${teacherId}`)
  }

  createAvailability(data: { day_of_week: DayOfWeek; start_time: string; end_time: string }) {
    return this.http.post<ApiResponse<Availability>>(`${this.base}/availability`, data)
  }

  deleteAvailability(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/availability/${id}`)
  }

  // ── Bookings ───────────────────────────────────────────
  getBookings() {
    return this.http.get<ApiResponse<Booking[]>>(`${this.base}/bookings`)
  }

  createBooking(data: {
    teacher_id:        number
    availability_id:   number
    scheduled_date:    string
    start_time:        string
    end_time:          string
    consultation_type: 'ONLINE' | 'FACE_TO_FACE'
    notes?:            string
  }) {
    return this.http.post<ApiResponse<Booking>>(`${this.base}/bookings`, data)
  }
  

  updateBookingStatus(id: number, status: BookingStatus) {
    return this.http.patch<ApiResponse<Booking>>(`${this.base}/bookings/${id}/status`, { status })
  }

  addBookingNotes(id: number, notes: string) {
    return this.http.patch<ApiResponse<Booking>>(`${this.base}/bookings/${id}/notes`, { notes })
  }

  // ── Notifications ──────────────────────────────────────
  getUnreadNotifications() {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.base}/bookings/notifications/unread`
    )
  }
  
  getAllNotifications() {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.base}/bookings/notifications/all`
    )
  }
  
  markNotificationsRead() {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.base}/bookings/notifications/read-all`, {}
    )
  }
  
  markNotificationRead(id: number) {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.base}/bookings/notifications/${id}/read`, {}
    )
  }

  // ── Profile ────────────────────────────────────────────
  getProfile() {
    return this.http.get<ApiResponse<User>>(`${this.base}/profile`)
  }

  updateProfile(data: {
    name:       string
    course:     string
    year_level: string
    department: string
  }) {
    return this.http.patch<ApiResponse<User>>(`${this.base}/profile`, data)
  }

  updateTeacherSubjects(userId: number, subjects: string) {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.base}/users/${userId}/subjects`, { subjects }
    )
  }

  requestReschedule(id: number, data: {
    reschedule_date:       string
    reschedule_start_time: string
    reschedule_end_time:   string
  }) {
    return this.http.patch<ApiResponse<Booking>>(
      `${this.base}/bookings/${id}/reschedule`, data
    )
  }
  
  respondReschedule(id: number, accept: boolean) {
    return this.http.patch<ApiResponse<Booking>>(
      `${this.base}/bookings/${id}/reschedule-response`, { accept }
    )
  } 
}