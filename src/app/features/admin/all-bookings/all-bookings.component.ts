import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component'
import type { Booking } from '../../../core/models/index'

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">All Bookings</h2>
          <p class="text-gray-400 text-sm mt-1">Monitor and manage all consultation bookings.</p>
        </div>
        <span class="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1.5 rounded-xl">
          {{ bookings().length }} total
        </span>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" [(ngModel)]="search" placeholder="Search student or teacher..."
            class="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all w-64" />
        </div>

        <select [(ngModel)]="statusFilter"
          class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input type="date" [(ngModel)]="dateFilter"
          class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all" />

        @if (search || statusFilter || dateFilter) {
          <button (click)="clearFilters()"
            class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-700 font-medium px-3 py-2.5 hover:bg-red-50 rounded-xl transition-all">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Clear
          </button>
        }
      </div>

      @if (loading()) {
        <div class="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
          Loading bookings...
        </div>
      }

      <!-- Table -->
      @if (!loading()) {
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm min-w-[700px]">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teacher</th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (b of filtered(); track b.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-4 text-gray-400 text-xs font-mono">#{{ b.id }}</td>
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-xs font-bold text-red-800">
                          {{ b.student_name.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{{ b.student_name }}</p>
                          <p class="text-xs text-gray-400">{{ b.student_email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-gray-700 font-medium">{{ b.teacher_name }}</td>
                    <td class="px-5 py-4">
                      <p class="text-gray-800 font-medium">{{ b.scheduled_date }}</p>
                      <p class="text-xs text-gray-400">{{ b.start_time }} – {{ b.end_time }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <app-status-badge [status]="b.status" />
                    </td>
                    <td class="px-5 py-4">
                      @if (b.status === 'PENDING' || b.status === 'APPROVED') {
                        <button (click)="cancel(b.id)"
                          [disabled]="acting() === b.id"
                          class="text-xs text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40">
                          {{ acting() === b.id ? '...' : 'Cancel' }}
                        </button>
                      } @else {
                        <span class="text-xs text-gray-300">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (filtered().length === 0) {
            <div class="p-10 text-center">
              <p class="text-gray-500 font-medium">No bookings match your filters</p>
              <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          }
        </div>
      }
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

  filtered(): Booking[] {
    return this.bookings().filter(b => {
      const q = this.search.toLowerCase()
      const matchSearch = !q || b.student_name.toLowerCase().includes(q) || b.teacher_name.toLowerCase().includes(q)
      const matchStatus = !this.statusFilter || b.status === this.statusFilter
      const matchDate   = !this.dateFilter   || b.scheduled_date === this.dateFilter
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
