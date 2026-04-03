import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component'
import type { Booking, BookingStatus } from '../../../core/models/index'

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">All Bookings</h2>
        <span class="text-sm text-gray-400">{{ bookings().length }} total</span>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-5">
        <input type="text" [(ngModel)]="search" placeholder="Search student or teacher..."
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56" />

        <select [(ngModel)]="statusFilter"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input type="date" [(ngModel)]="dateFilter"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />

        <button (click)="clearFilters()"
          class="text-sm text-gray-500 hover:text-gray-700 underline">
          Clear
        </button>
      </div>

      @if (loading()) {
        <p class="text-sm text-gray-400">Loading...</p>
      }

      <!-- Table -->
      <div class="bg-white rounded-xl shadow overflow-x-auto">
        <table class="w-full text-sm min-w-[700px]">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="text-left px-4 py-3 font-medium">#</th>
              <th class="text-left px-4 py-3 font-medium">Student</th>
              <th class="text-left px-4 py-3 font-medium">Teacher</th>
              <th class="text-left px-4 py-3 font-medium">Date & Time</th>
              <th class="text-left px-4 py-3 font-medium">Status</th>
              <th class="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (b of filtered; track b.id) {
              <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-gray-400">{{ b.id }}</td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ b.student_name }}</p>
                  <p class="text-xs text-gray-400">{{ b.student_email }}</p>
                </td>
                <td class="px-4 py-3 text-gray-700">{{ b.teacher_name }}</td>
                <td class="px-4 py-3 text-gray-600">
                  {{ b.scheduled_date }}<br />
                  <span class="text-xs text-gray-400">{{ b.start_time }} – {{ b.end_time }}</span>
                </td>
                <td class="px-4 py-3">
                  <app-status-badge [status]="b.status" />
                </td>
                <td class="px-4 py-3">
                  @if (b.status === 'PENDING' || b.status === 'APPROVED') {
                    <button (click)="cancel(b.id)"
                      [disabled]="acting() === b.id"
                      class="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-40">
                      Cancel
                    </button>
                  } @else {
                    <span class="text-xs text-gray-300">—</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (!loading() && filtered.length === 0) {
          <div class="text-center py-10 text-gray-400 text-sm">No bookings match your filters.</div>
        }
      </div>
    </div>
  `,
})
export class AllBookingsComponent implements OnInit {
  private api = inject(ApiService)

  bookings     = signal<Booking[]>([])
  loading      = signal(true)
  acting       = signal<number | null>(null)

  search       = ''
  statusFilter = ''
  dateFilter   = ''

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

  get filtered(): Booking[] {
    return this.bookings().filter(b => {
      const q = this.search.toLowerCase()
      const matchSearch = !q ||
        b.student_name.toLowerCase().includes(q) ||
        b.teacher_name.toLowerCase().includes(q)
      const matchStatus = !this.statusFilter || b.status === this.statusFilter
      const matchDate   = !this.dateFilter  || b.scheduled_date === this.dateFilter
      return matchSearch && matchStatus && matchDate
    })
  }

  clearFilters(): void {
    this.search = ''
    this.statusFilter = ''
    this.dateFilter   = ''
  }

  cancel(id: number): void {
    if (!confirm('Cancel this booking?')) return
    this.acting.set(id)
    this.api.updateBookingStatus(id, 'CANCELLED').subscribe({
      next: () => {
        this.acting.set(null)
        this.load()
      },
      error: () => this.acting.set(null),
    })
  }
}