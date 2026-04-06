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
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Consultation Requests</h2>
        <p class="text-gray-400 text-sm mt-1">Review and manage your student bookings.</p>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        @for (stat of statCards(); track stat.label) {
          <div class="bg-white rounded-2xl shadow-sm p-4">
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{{ stat.label }}</p>
            <p class="text-2xl font-bold" [class]="stat.color">{{ stat.value }}</p>
          </div>
        }
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 mb-6 flex-wrap">
        @for (tab of tabs; track tab.value) {
          <button (click)="activeTab.set(tab.value)"
            class="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            [class.bg-red-800]="activeTab() === tab.value"
            [class.text-white]="activeTab() === tab.value"
            [class.shadow-sm]="activeTab() === tab.value"
            [class.bg-white]="activeTab() !== tab.value"
            [class.text-gray-500]="activeTab() !== tab.value"
            [class.hover:bg-gray-100]="activeTab() !== tab.value">
            {{ tab.label }}
            <span class="ml-1.5 text-xs opacity-70">({{ countByStatus(tab.value) }})</span>
          </button>
        }
      </div>

      <!-- Skeleton -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
              <div class="flex justify-between">
                <div class="space-y-2 flex-1">
                  <div class="h-4 bg-gray-200 rounded-lg w-1/4"></div>
                  <div class="h-3 bg-gray-200 rounded-lg w-1/3"></div>
                </div>
                <div class="flex gap-2">
                  <div class="h-8 w-20 bg-gray-200 rounded-xl"></div>
                  <div class="h-8 w-20 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && filtered().length === 0) {
        <div class="text-center py-20 bg-white rounded-2xl shadow-sm">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="text-gray-600 font-semibold mb-1">
            No {{ activeTab() === 'ALL' ? '' : activeTab().toLowerCase() + ' ' }}bookings
          </p>
          <p class="text-gray-400 text-sm">Nothing to show here right now.</p>
        </div>
      }

      <!-- Booking cards -->
      <div class="space-y-4">
        @for (b of filtered(); track b.id) {
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

                    <!-- Student info -->
                    <div class="flex items-center gap-2 mb-1">
                      <div class="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center
                                  text-xs font-bold text-red-800">
                        {{ b.student_name.charAt(0) }}
                      </div>
                      <p class="font-semibold text-gray-900 text-sm">{{ b.student_name }}</p>
                      <span class="text-xs text-gray-400">{{ b.student_email }}</span>
                    </div>

                    <div class="flex items-center gap-3 mb-3 ml-9 flex-wrap">
                      <p class="text-xs text-gray-400">
                        📅 {{ b.scheduled_date }} · {{ b.start_time }} – {{ b.end_time }}
                      </p>
                      <span class="text-xs font-medium px-2 py-0.5 rounded-lg"
                        [class.bg-blue-50]="b.consultation_type === 'ONLINE'"
                        [class.text-blue-700]="b.consultation_type === 'ONLINE'"
                        [class.bg-gray-100]="b.consultation_type === 'FACE_TO_FACE'"
                        [class.text-gray-600]="b.consultation_type === 'FACE_TO_FACE'">
                        {{ b.consultation_type === 'ONLINE' ? '🌐 Online' : '🏫 Face to Face' }}
                      </span>
                    </div>

                    <!-- Reschedule request -->
                    @if (b.reschedule_status === 'REQUESTED') {
                      <div class="ml-9 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                        <p class="text-xs font-semibold text-amber-700 mb-2">
                          ⏳ Student Requested Reschedule
                        </p>
                        <p class="text-sm text-amber-800 mb-3">
                          <span class="font-medium">New time:</span>
                          {{ b.reschedule_date }} · {{ b.reschedule_start_time }} – {{ b.reschedule_end_time }}
                        </p>
                        <div class="flex gap-2">
                          <button (click)="respondReschedule(b.id, true)"
                            [disabled]="responding() === b.id"
                            class="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50
                                   text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            Accept
                          </button>
                          <button (click)="respondReschedule(b.id, false)"
                            [disabled]="responding() === b.id"
                            class="text-xs bg-red-100 hover:bg-red-200 disabled:opacity-50
                                   text-red-700 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    }

                    <!-- Student notes -->
                    @if (b.student_notes) {
                      <div class="ml-9 bg-gray-50 rounded-xl p-3 mb-3">
                        <p class="text-xs font-semibold text-gray-500 mb-1">Student's Note</p>
                        <p class="text-sm text-gray-700 italic">"{{ b.student_notes }}"</p>
                      </div>
                    }

                    <!-- Teacher notes form -->
                    @if (b.status === 'COMPLETED' && !b.teacher_notes) {
                      <div class="ml-9 border border-dashed border-gray-200 rounded-xl p-4 mb-3">
                        <p class="text-xs font-semibold text-gray-500 mb-2">Add Consultation Notes</p>
                        <textarea [(ngModel)]="notesInput[b.id]" rows="2"
                          placeholder="Session summary, follow-ups, recommendations..."
                          class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                                 focus:outline-none focus:border-red-400 resize-none transition-colors">
                        </textarea>
                        <button (click)="saveNotes(b.id)"
                          class="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white
                                 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          Save Notes
                        </button>
                      </div>
                    }

                    @if (b.teacher_notes) {
                      <div class="ml-9 bg-green-50 border border-green-100 rounded-xl p-3">
                        <p class="text-xs font-semibold text-green-700 mb-1">📝 Your Notes</p>
                        <p class="text-sm text-green-800">{{ b.teacher_notes }}</p>
                      </div>
                    }
                  </div>

                  <!-- Status + actions -->
                  <div class="flex flex-col items-end gap-2 flex-shrink-0">
                    <app-status-badge [status]="b.status" />

                    @if (b.status === 'PENDING' && b.reschedule_status !== 'REQUESTED') {
                      <div class="flex gap-2">
                        <button (click)="updateStatus(b.id, 'APPROVED')"
                          [disabled]="acting() === b.id"
                          class="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                                 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          Approve
                        </button>
                        <button (click)="updateStatus(b.id, 'CANCELLED')"
                          [disabled]="acting() === b.id"
                          class="text-xs bg-red-100 hover:bg-red-200 disabled:opacity-50
                                 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          Reject
                        </button>
                      </div>
                    }

                    @if (b.status === 'APPROVED' && b.reschedule_status !== 'REQUESTED') {
                      <button (click)="updateStatus(b.id, 'COMPLETED')"
                        [disabled]="acting() === b.id"
                        class="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50
                               text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        Mark Completed
                      </button>
                    }
                  </div>
                </div>
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

  bookings   = signal<Booking[]>([])
  loading    = signal(true)
  acting     = signal<number | null>(null)
  responding = signal<number | null>(null)
  activeTab  = signal<string>('ALL')

  notesInput: Record<number, string> = {}

  tabs = [
    { label: 'All',       value: 'ALL'       },
    { label: 'Pending',   value: 'PENDING'   },
    { label: 'Approved',  value: 'APPROVED'  },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
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

  filtered(): Booking[] {
    const tab = this.activeTab()
    if (tab === 'ALL') return this.bookings()
    return this.bookings().filter(b => b.status === tab)
  }

  countByStatus(status: string): number {
    if (status === 'ALL') return this.bookings().length
    return this.bookings().filter(b => b.status === status).length
  }

  statCards() {
    const b = this.bookings()
    return [
      { label: 'Total',     value: b.length,                                       color: 'text-gray-800'   },
      { label: 'Pending',   value: b.filter(x => x.status === 'PENDING').length,   color: 'text-yellow-600' },
      { label: 'Approved',  value: b.filter(x => x.status === 'APPROVED').length,  color: 'text-blue-600'   },
      { label: 'Completed', value: b.filter(x => x.status === 'COMPLETED').length, color: 'text-green-600'  },
    ]
  }

  updateStatus(id: number, status: BookingStatus): void {
    this.acting.set(id)
    this.api.updateBookingStatus(id, status).subscribe({
      next:  () => { this.acting.set(null); this.load() },
      error: () => this.acting.set(null),
    })
  }

  respondReschedule(id: number, accept: boolean): void {
    this.responding.set(id)
    this.api.respondReschedule(id, accept).subscribe({
      next:  () => { this.responding.set(null); this.load() },
      error: () => this.responding.set(null),
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
