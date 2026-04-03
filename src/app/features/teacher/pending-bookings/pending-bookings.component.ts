import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component'
import type { Booking, BookingStatus } from '../../../core/models/index'

@Component({
  selector: 'app-pending-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Consultation Requests</h2>

        <!-- Filter tabs -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg text-sm">
          @for (tab of tabs; track tab.value) {
            <button (click)="activeTab.set(tab.value)"
              [class.bg-white]="activeTab() === tab.value"
              [class.shadow-sm]="activeTab() === tab.value"
              [class.text-blue-900]="activeTab() === tab.value"
              class="px-3 py-1.5 rounded-md font-medium text-gray-500 transition-all">
              {{ tab.label }}
              <span class="ml-1 text-xs">({{ countByStatus(tab.value) }})</span>
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <p class="text-sm text-gray-400">Loading bookings...</p>
      }

      @if (!loading() && filtered().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <p>No {{ activeTab() === 'ALL' ? '' : activeTab().toLowerCase() }} bookings.</p>
        </div>
      }

      <div class="space-y-4">
        @for (b of filtered(); track b.id) {
          <div class="bg-white rounded-xl shadow p-5">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-semibold text-gray-900">{{ b.student_name }}</p>
                  <span class="text-xs text-gray-400">{{ b.student_email }}</span>
                </div>
                <p class="text-sm text-gray-600">
                  {{ b.scheduled_date }} &nbsp;·&nbsp; {{ b.start_time }} – {{ b.end_time }}
                </p>
                @if (b.student_notes) {
                  <p class="text-sm text-gray-500 mt-2 italic">"{{ b.student_notes }}"</p>
                }

                <!-- Teacher notes form (only for COMPLETED bookings without notes yet) -->
                @if (b.status === 'COMPLETED' && !b.teacher_notes) {
                  <div class="mt-3 border-t pt-3">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Add Consultation Notes</label>
                    <textarea [(ngModel)]="notesInput[b.id]" rows="2" placeholder="Session summary..."
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none">
                    </textarea>
                    <button (click)="saveNotes(b.id)"
                      class="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                      Save Notes
                    </button>
                  </div>
                }

                @if (b.teacher_notes) {
                  <div class="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p class="text-xs font-medium text-green-700 mb-1">Your Notes</p>
                    <p class="text-sm text-green-800">{{ b.teacher_notes }}</p>
                  </div>
                }

                @if (b.meet_link) {
                  <a [href]="b.meet_link" target="_blank"
                    class="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline mt-2">
                    Google Meet Link →
                  </a>
                }
              </div>

              <!-- Status + actions -->
              <div class="flex flex-col items-end gap-2 min-w-fit">
                <app-status-badge [status]="b.status" />

                @if (b.status === 'PENDING') {
                  <div class="flex gap-2">
                    <button (click)="updateStatus(b.id, 'APPROVED')"
                      [disabled]="acting() === b.id"
                      class="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors">
                      Approve
                    </button>
                    <button (click)="updateStatus(b.id, 'CANCELLED')"
                      [disabled]="acting() === b.id"
                      class="text-xs bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors">
                      Reject
                    </button>
                  </div>
                }

                @if (b.status === 'APPROVED') {
                  <button (click)="updateStatus(b.id, 'COMPLETED')"
                    [disabled]="acting() === b.id"
                    class="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors">
                    Mark Completed
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
export class PendingBookingsComponent implements OnInit {
  private api = inject(ApiService)

  bookings  = signal<Booking[]>([])
  loading   = signal(true)
  acting    = signal<number | null>(null)
  activeTab = signal<string>('ALL')

  notesInput: Record<number, string> = {}

  tabs = [
    { label: 'All',       value: 'ALL'       },
    { label: 'Pending',   value: 'PENDING'   },
    { label: 'Approved',  value: 'APPROVED'  },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ]

  get filtered(): () => Booking[] {
    return () => {
      const tab = this.activeTab()
      if (tab === 'ALL') return this.bookings()
      return this.bookings().filter(b => b.status === tab)
    }
  }

  countByStatus(status: string): number {
    if (status === 'ALL') return this.bookings().length
    return this.bookings().filter(b => b.status === status).length
  }

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

  updateStatus(id: number, status: BookingStatus): void {
    this.acting.set(id)
    this.api.updateBookingStatus(id, status).subscribe({
      next: () => {
        this.acting.set(null)
        this.load()
      },
      error: () => this.acting.set(null),
    })
  }

  saveNotes(id: number): void {
    const notes = this.notesInput[id]?.trim()
    if (!notes) return
    this.api.addBookingNotes(id, notes).subscribe({
      next: () => this.load(),
    })
  }
}