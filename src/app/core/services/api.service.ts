import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type {
  ApiResponse,
  User,
  Teacher,
  Availability,
  Booking,
  BookingStatus,
  DayOfWeek,
  Notification,
  Role,
  Feedback,
  BookingFile,
  ChatMessage,
} from '../models/index';

import { Subject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  // Signal for components to know when bookings change
  public bookingsChanged$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // ── Auth ───────────────────────────────────────────────
  getMe() {
    return this.http.get<ApiResponse<User>>(`${this.base}/auth/me`);
  }

  // ── Users (admin) ──────────────────────────────────────
  getUsers() {
    return this.http.get<ApiResponse<User[]>>(`${this.base}/users`);
  }

  updateUserRole(id: number, role: Role) {
    return this.http.patch<ApiResponse<User>>(`${this.base}/users/${id}/role`, { role });
  }

  // ── Teachers ───────────────────────────────────────────
  getTeachers() {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.base}/teachers`);
  }

  getTeacher(id: number) {
    return this.http.get<ApiResponse<Teacher>>(`${this.base}/teachers/${id}`);
  }

  // ── Availability ───────────────────────────────────────
  getAvailability(teacherId: number) {
    return this.http.get<ApiResponse<Availability[]>>(`${this.base}/availability/${teacherId}`);
  }

  createAvailability(data: { day_of_week: DayOfWeek; start_time: string; end_time: string }) {
    return this.http.post<ApiResponse<Availability>>(`${this.base}/availability`, data);
  }

  deleteAvailability(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/availability/${id}`);
  }

  // ── Bookings ───────────────────────────────────────────
  getBookings() {
    return this.http.get<ApiResponse<Booking[]>>(`${this.base}/bookings`);
  }

  createBooking(data: {
    teacher_id: number;
    availability_id: number;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    consultation_type: 'ONLINE' | 'FACE_TO_FACE';
    notes?: string;
  }) {
    return this.http.post<ApiResponse<Booking>>(`${this.base}/bookings`, data);
  }

  updateBookingStatus(id: number, status: BookingStatus) {
    return this.http.patch<ApiResponse<Booking>>(`${this.base}/bookings/${id}/status`, { status })
      .pipe(tap(() => this.bookingsChanged$.next()));
  }

  addBookingNotes(id: number, notes: string) {
    return this.http.patch<ApiResponse<Booking>>(`${this.base}/bookings/${id}/notes`, { notes });
  }

  // ── Notifications ──────────────────────────────────────
  getUnreadNotifications() {
    return this.http.get<ApiResponse<Notification[]>>(`${this.base}/bookings/notifications/unread`);
  }

  getAllNotifications() {
    return this.http.get<ApiResponse<Notification[]>>(`${this.base}/bookings/notifications/all`);
  }

  markNotificationsRead() {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.base}/bookings/notifications/read-all`,
      {},
    );
  }

  markNotificationRead(id: number) {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.base}/bookings/notifications/${id}/read`,
      {},
    );
  }

  // ── Profile ────────────────────────────────────────────
  getProfile() {
    return this.http.get<ApiResponse<User>>(`${this.base}/profile`);
  }

  updateProfile(data: Partial<{ name: string; course: string; year_level: string; department: string; bio: string }>) {
    return this.http.patch<ApiResponse<User>>(`${this.base}/profile`, data);
  }


  requestReschedule(
    id: number,
    data: {
      reschedule_date: string;
      reschedule_start_time: string;
      reschedule_end_time: string;
    },
  ) {
    return this.http.patch<ApiResponse<Booking>>(`${this.base}/bookings/${id}/reschedule`, data);
  }

  respondReschedule(id: number, accept: boolean) {
    return this.http.patch<ApiResponse<Booking>>(
      `${this.base}/bookings/${id}/reschedule-response`,
      { accept },
    ).pipe(tap(() => this.bookingsChanged$.next()));
  }

  // ── Files ─────────────────────────────────────────────────
  uploadBookingFile(bookingId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<BookingFile>>(
      `${this.base}/bookings/${bookingId}/files`,
      form,
    );
  }

  getBookingFiles(bookingId: number) {
    return this.http.get<ApiResponse<BookingFile[]>>(`${this.base}/bookings/${bookingId}/files`);
  }

  deleteBookingFile(bookingId: number, fileId: number) {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.base}/bookings/${bookingId}/files/${fileId}`,
    );
  }

  getFileDownloadUrl(bookingId: number, fileId: number): string {
    return `${this.base}/bookings/${bookingId}/files/${fileId}/download`;
  }

  // ── Feedback ───────────────────────────────────────────────
  submitFeedback(bookingId: number, data: { rating: number; comment?: string }) {
    return this.http.post<ApiResponse<Feedback>>(
      `${this.base}/bookings/${bookingId}/feedback`,
      data,
    );
  }

  getBookingFeedback(bookingId: number) {
    return this.http.get<ApiResponse<Feedback[]>>(`${this.base}/bookings/${bookingId}/feedback`);
  }
  getChatHistory(bookingId: number) {
    return this.http.get<ApiResponse<ChatMessage[]>>(`${this.base}/bookings/${bookingId}/chat`);
  }
}
