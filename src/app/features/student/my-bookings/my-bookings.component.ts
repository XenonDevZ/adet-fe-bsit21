import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../core/services/api.service'
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component'
import type { Booking } from '../../../core/models/index'

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>

      @if (loading()) {
        <p class="text-gray-400 text-sm">Loading...</p>
      }

      @if (!loading() && bookings().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <p class="mb-2">You have no bookings yet.</p>
          <a routerLink="/student/teachers" class="text-blue-700 text-sm hover:underline">Book a consultation →</a>
        </div>
      }

      <div class="space-y-4">
        @for (b of bookings(); track b.id) {
          <div class="bg-white rounded-xl shadow p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-semibold text-gray-900">{{ b.teacher_name }}</p>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ b.scheduled_date }} &nbsp;·&nbsp; {{ b.start_time }} – {{ b.end_time }}
                </p>
                @if (b.student_notes) {
                  <p class="text-sm text-gray-600 mt-2 italic">"{{ b.student_notes }}"</p>
                }
                @if (b.teacher_notes) {
                  <div class="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p class="text-xs font-medium text-green-700 mb-1">Teacher Notes</p>
                    <p class="text-sm text-green-800">{{ b.teacher_notes }}</p>
                  </div>
                }
                @if (b.meet_link) {
                  <a [href]="b.meet_link" target="_blank"
                    class="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline mt-2">
                    Join Google Meet →
                  </a>
                }
              </div>
              <div class="flex flex-col items-end gap-2">
                <app-status-badge [status]="b.status" />
                @if (b.status === 'PENDING') {
                  <button (click)="cancel(b.id)"
                    [disabled]="cancelling() === b.id"
                    class="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50">
                    Cancel
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private api = inject(ApiService)

  bookings   = signal<Booking[]>([])
  loading    = signal(true)
  cancelling = signal<number | null>(null)

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

  cancel(id: number): void {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    this.cancelling.set(id)
    this.api.updateBookingStatus(id, 'CANCELLED').subscribe({
      next: () => {
        this.cancelling.set(null)
        this.load()
      },
      error: () => this.cancelling.set(null),
    })
  }
}