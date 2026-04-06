import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component'
import type { Booking } from '../../../core/models/index'

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">My Appointments</h2>
          <p class="text-gray-400 text-sm mt-1">Track and manage your consultation sessions.</p>
        </div>
        <button (click)="router.navigate(['/student/teachers'])"
          class="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white
                 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Booking
        </button>
      </div>

      <!-- Upcoming / Past tabs -->
      <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        <button (click)="view.set('upcoming')"
          class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          [class.bg-white]="view() === 'upcoming'"
          [class.text-gray-900]="view() === 'upcoming'"
          [class.shadow-sm]="view() === 'upcoming'"
          [class.text-gray-500]="view() !== 'upcoming'">
          Upcoming
          <span class="ml-1.5 text-xs opacity-70">({{ upcomingCount() }})</span>
        </button>
        <button (click)="view.set('past')"
          class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          [class.bg-white]="view() === 'past'"
          [class.text-gray-900]="view() === 'past'"
          [class.shadow-sm]="view() === 'past'"
          [class.text-gray-500]="view() !== 'past'">
          Past
          <span class="ml-1.5 text-xs opacity-70">({{ pastCount() }})</span>
        </button>
      </div>

      <!-- Status filter tabs (upcoming only) -->
      @if (view() === 'upcoming') {
        <div class="flex gap-2 mb-6 flex-wrap">
          @for (tab of upcomingTabs; track tab.value) {
            <button (click)="statusFilter.set(tab.value)"
              class="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              [class.bg-red-800]="statusFilter() === tab.value"
              [class.text-white]="statusFilter() === tab.value"
              [class.bg-white]="statusFilter() !== tab.value"
              [class.text-gray-500]="statusFilter() !== tab.value"
              [class.hover:bg-gray-100]="statusFilter() !== tab.value">
              {{ tab.label }}
              <span class="ml-1 text-xs opacity-70">({{ countByStatus(tab.value) }})</span>
            </button>
          }
        </div>
      }

      <!-- Skeleton -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
              <div class="flex items-start justify-between">
                <div class="space-y-2 flex-1">
                  <div class="h-4 bg-gray-200 rounded-lg w-1/3"></div>
                  <div class="h-3 bg-gray-200 rounded-lg w-1/4"></div>
                </div>
                <div class="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && displayed().length === 0) {
        <div class="text-center py-20 bg-white rounded-2xl shadow-sm">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-semibold mb-1">
            No {{ view() === 'upcoming' ? 'upcoming' : 'past' }} appointments
          </p>
          @if (view() === 'upcoming') {
            <p class="text-gray-400 text-sm mb-5">Book a session with one of our teachers.</p>
            <button (click)="router.navigate(['/student/teachers'])"
              class="bg-red-800 hover:bg-red-700 text-white text-sm font-semibold
                     px-6 py-2.5 rounded-xl transition-colors">
              Browse Teachers
            </button>
          } @else {
            <p class="text-gray-400 text-sm">Your completed and cancelled sessions will appear here.</p>
          }
        </div>
      }

      <!-- Booking cards -->
      <div class="space-y-4">
        @for (b of displayed(); track b.id) {
          <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div class="flex items-stretch">

              <!-- Status color bar -->
              <div class="w-1 flex-shrink-0"
                [class.bg-yellow-400]="b.status === 'PENDING'"
                [class.bg-blue-500]="b.status === 'APPROVED'"
                [class.bg-green-500]="b.status === 'COMPLETED'"
                [class.bg-red-300]="b.status === 'CANCELLED'">
              </div>

              <div class="flex-1 p-5">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">

                    <!-- Teacher + date -->
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <p class="font-semibold text-gray-900">{{ b.teacher_name }}</p>
                      <span class="text-gray-300">·</span>
                      <p class="text-sm text-gray-500">{{ b.scheduled_date }}</p>
                    </div>

                    <div class="flex items-center gap-3 mb-3 flex-wrap">
                      <p class="text-xs text-gray-400">
                        🕐 {{ b.start_time }} – {{ b.end_time }}
                      </p>
                      <span class="text-xs font-medium px-2 py-0.5 rounded-lg"
                        [class.bg-blue-50]="b.consultation_type === 'ONLINE'"
                        [class.text-blue-700]="b.consultation_type === 'ONLINE'"
                        [class.bg-gray-100]="b.consultation_type === 'FACE_TO_FACE'"
                        [class.text-gray-600]="b.consultation_type === 'FACE_TO_FACE'">
                        {{ b.consultation_type === 'ONLINE' ? '🌐 Online' : '🏫 Face to Face' }}
                      </span>
                    </div>

                    <!-- Reschedule request status -->
                    @if (b.reschedule_status === 'REQUESTED') {
                      <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                        <p class="text-xs font-semibold text-amber-700 mb-1">⏳ Reschedule Requested</p>
                        <p class="text-xs text-amber-600">
                          Requested: {{ b.reschedule_date }} · {{ b.reschedule_start_time }} – {{ b.reschedule_end_time }}
                        </p>
                        <p class="text-xs text-amber-500 mt-1">Waiting for teacher response.</p>
                      </div>
                    }

                    @if (b.reschedule_status === 'ACCEPTED') {
                      <div class="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                        <p class="text-xs font-semibold text-green-700">✅ Reschedule Accepted</p>
                        <p class="text-xs text-green-600 mt-0.5">Your booking has been updated to the new time.</p>
                      </div>
                    }

                    @if (b.reschedule_status === 'REJECTED') {
                      <div class="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                        <p class="text-xs font-semibold text-red-700">❌ Reschedule Rejected</p>
                        <p class="text-xs text-red-500 mt-0.5">Your original schedule remains unchanged.</p>
                      </div>
                    }

                    @if (b.student_notes) {
                      <p class="text-sm text-gray-500 italic mb-3">"{{ b.student_notes }}"</p>
                    }

                    @if (b.teacher_notes) {
                      <div class="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                        <p class="text-xs font-semibold text-green-700 mb-1">📝 Teacher Notes</p>
                        <p class="text-sm text-green-800">{{ b.teacher_notes }}</p>
                      </div>
                    }

                    @if (b.meet_link && b.status === 'APPROVED') {
                      <a [href]="b.meet_link" target="_blank"
                        class="inline-flex items-center gap-1.5 text-xs font-semibold
                               text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5
                               rounded-lg transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        Join Google Meet
                      </a>
                    }
                  </div>

                  <!-- Status + actions -->
                  <div class="flex flex-col items-end gap-2 flex-shrink-0">
                    <app-status-badge [status]="b.status" />

                    <!-- Cancel -->
                    @if (b.status === 'PENDING' && b.reschedule_status !== 'REQUESTED') {
                      <button (click)="cancel(b.id)"
                        [disabled]="cancelling() === b.id"
                        class="text-xs text-red-500 hover:text-red-700 font-medium
                               underline underline-offset-2 disabled:opacity-40 transition-colors">
                        {{ cancelling() === b.id ? 'Cancelling...' : 'Cancel' }}
                      </button>
                    }

                    <!-- Reschedule -->
                    @if ((b.status === 'PENDING' || b.status === 'APPROVED') && b.reschedule_status !== 'REQUESTED') {
                      <button (click)="openReschedule(b)"
                        class="text-xs text-blue-600 hover:text-blue-800 font-medium
                               underline underline-offset-2 transition-colors">
                        Reschedule
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Reschedule Modal -->
      @if (rescheduleTarget()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="h-1.5 bg-gradient-to-r from-red-900 to-red-500"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-5">
                <h3 class="font-bold text-gray-900">Request Reschedule</h3>
                <button (click)="closeReschedule()"
                  class="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Current schedule -->
              <div class="bg-gray-50 rounded-xl p-4 mb-5">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Schedule</p>
                <p class="text-sm font-medium text-gray-800">
                  {{ rescheduleTarget()!.scheduled_date }} · {{ rescheduleTarget()!.start_time }} – {{ rescheduleTarget()!.end_time }}
                </p>
              </div>

              <!-- New schedule inputs -->
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    New Date
                  </label>
                  <input type="date" [(ngModel)]="rescheduleForm.date" [min]="minDate"
                    class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:border-red-400 transition-colors" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Start Time
                    </label>
                    <input type="time" [(ngModel)]="rescheduleForm.start_time"
                      class="w-full border-2 border-gray-100 rounded-xl px-3 py-3 text-sm
                             focus:outline-none focus:border-red-400 transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      End Time
                    </label>
                    <input type="time" [(ngModel)]="rescheduleForm.end_time"
                      class="w-full border-2 border-gray-100 rounded-xl px-3 py-3 text-sm
                             focus:outline-none focus:border-red-400 transition-colors" />
                  </div>
                </div>
              </div>

              @if (rescheduleError()) {
                <div class="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                  {{ rescheduleError() }}
                </div>
              }

              <div class="flex gap-3 mt-6">
                <button (click)="closeReschedule()"
                  class="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50
                         font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Cancel
                </button>
                <button (click)="submitReschedule()"
                  [disabled]="rescheduling()"
                  class="flex-1 bg-red-800 hover:bg-red-700 disabled:bg-gray-200
                         disabled:cursor-not-allowed text-white font-semibold py-2.5
                         rounded-xl transition-colors text-sm">
                  {{ rescheduling() ? 'Submitting...' : 'Submit Request' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private api = inject(ApiService)
  router      = inject(Router)

  bookings     = signal<Booking[]>([])
  loading      = signal(true)
  cancelling   = signal<number | null>(null)
  view         = signal<'upcoming' | 'past'>('upcoming')
  statusFilter = signal<string>('ALL')

  rescheduleTarget = signal<Booking | null>(null)
  rescheduling     = signal(false)
  rescheduleError  = signal<string | null>(null)
  minDate          = new Date().toISOString().split('T')[0]

  rescheduleForm = {
    date:       '',
    start_time: '',
    end_time:   '',
  }

  upcomingTabs = [
    { label: 'All',      value: 'ALL'      },
    { label: 'Pending',  value: 'PENDING'  },
    { label: 'Approved', value: 'APPROVED' },
  ]

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.api.getBookings().subscribe({
      next: res => {
        this.bookings.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  private isUpcoming(b: Booking): boolean {
    return b.status === 'PENDING' || b.status === 'APPROVED'
  }

  private isPast(b: Booking): boolean {
    return b.status === 'COMPLETED' || b.status === 'CANCELLED'
  }

  upcomingCount(): number {
    return this.bookings().filter(b => this.isUpcoming(b)).length
  }

  pastCount(): number {
    return this.bookings().filter(b => this.isPast(b)).length
  }

  countByStatus(status: string): number {
    const upcoming = this.bookings().filter(b => this.isUpcoming(b))
    if (status === 'ALL') return upcoming.length
    return upcoming.filter(b => b.status === status).length
  }

  displayed(): Booking[] {
    if (this.view() === 'past') {
      return this.bookings().filter(b => this.isPast(b))
    }
    const upcoming = this.bookings().filter(b => this.isUpcoming(b))
    const filter   = this.statusFilter()
    if (filter === 'ALL') return upcoming
    return upcoming.filter(b => b.status === filter)
  }

  cancel(id: number): void {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    this.cancelling.set(id)
    this.api.updateBookingStatus(id, 'CANCELLED').subscribe({
      next:  () => { this.cancelling.set(null); this.load() },
      error: () => this.cancelling.set(null),
    })
  }

  openReschedule(booking: Booking): void {
    this.rescheduleTarget.set(booking)
    this.rescheduleForm = { date: '', start_time: '', end_time: '' }
    this.rescheduleError.set(null)
  }

  closeReschedule(): void {
    this.rescheduleTarget.set(null)
    this.rescheduleError.set(null)
  }

  submitReschedule(): void {
    const { date, start_time, end_time } = this.rescheduleForm
    if (!date)       { this.rescheduleError.set('Please select a date.');       return }
    if (!start_time) { this.rescheduleError.set('Please select a start time.'); return }
    if (!end_time)   { this.rescheduleError.set('Please select an end time.');  return }
    if (start_time >= end_time) {
      this.rescheduleError.set('End time must be after start time.')
      return
    }

    this.rescheduling.set(true)
    this.rescheduleError.set(null)

    this.api.requestReschedule(this.rescheduleTarget()!.id, {
      reschedule_date:       date,
      reschedule_start_time: start_time,
      reschedule_end_time:   end_time,
    }).subscribe({
      next: () => {
        this.rescheduling.set(false)
        this.closeReschedule()
        this.load()
      },
      error: (err) => {
        this.rescheduling.set(false)
        this.rescheduleError.set(err.error?.error ?? 'Failed to request reschedule.')
      },
    })
  }
}
