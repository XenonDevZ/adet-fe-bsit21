import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Booking, User } from '../../../core/models/index'

interface Stats {
  totalUsers:     number
  totalStudents:  number
  totalTeachers:  number
  totalBookings:  number
  pending:        number
  approved:       number
  completed:      number
  cancelled:      number
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p class="text-gray-400 text-sm mt-1">System overview for Liceo de Cagayan University</p>
      </div>

      @if (loading()) {
        <p class="text-sm text-gray-400">Loading stats...</p>
      }

      @if (!loading()) {
        <!-- Stat cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          @for (card of statCards(); track card.label) {
            <div class="bg-white rounded-xl shadow p-5">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{{ card.label }}</p>
              <p class="text-3xl font-bold" [class]="card.color">{{ card.value }}</p>
            </div>
          }
        </div>

        <!-- Booking status breakdown -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <!-- Booking status -->
          <div class="bg-white rounded-xl shadow p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Booking Status Breakdown</h3>
            <div class="space-y-3">
              @for (row of statusRows(); track row.label) {
                <div>
                  <div class="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{{ row.label }}</span>
                    <span class="font-medium">{{ row.value }}</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all"
                      [class]="row.barColor"
                      [style.width.%]="barWidth(row.value)">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent bookings -->
          <div class="bg-white rounded-xl shadow p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-700">Recent Bookings</h3>
              <a routerLink="/admin/bookings" class="text-xs text-blue-600 hover:underline">View all →</a>
            </div>
            <div class="space-y-3">
              @for (b of recentBookings(); track b.id) {
                <div class="flex items-center justify-between text-sm">
                  <div>
                    <p class="font-medium text-gray-800">{{ b.student_name }}</p>
                    <p class="text-xs text-gray-400">→ {{ b.teacher_name }} · {{ b.scheduled_date }}</p>
                  </div>
                  <span [class]="statusColor(b.status)"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full">
                    {{ b.status }}
                  </span>
                </div>
              }
              @if (recentBookings().length === 0) {
                <p class="text-xs text-gray-400 italic">No bookings yet.</p>
              }
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a routerLink="/admin/users"
            class="bg-blue-900 hover:bg-blue-800 text-white rounded-xl p-5 transition-colors">
            <p class="text-sm font-semibold">Manage Users</p>
            <p class="text-xs text-blue-300 mt-1">{{ stats()?.totalUsers }} registered users</p>
          </a>
          <a routerLink="/admin/bookings"
            class="bg-blue-700 hover:bg-blue-600 text-white rounded-xl p-5 transition-colors">
            <p class="text-sm font-semibold">All Bookings</p>
            <p class="text-xs text-blue-200 mt-1">{{ stats()?.pending }} pending review</p>
          </a>
          <div class="bg-gray-100 rounded-xl p-5">
            <p class="text-sm font-semibold text-gray-700">Completion Rate</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ completionRate() }}%</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api  = inject(ApiService)
  private auth = inject(AuthService)

  loading        = signal(true)
  stats          = signal<Stats | null>(null)
  recentBookings = signal<Booking[]>([])

  ngOnInit(): void {
    // Load both datasets in parallel
    let bookingsLoaded = false
    let usersLoaded    = false

    const tryDone = () => {
      if (bookingsLoaded && usersLoaded) this.loading.set(false)
    }

    this.api.getBookings().subscribe({
      next: res => {
        const bookings = res.data
        this.recentBookings.set(bookings.slice(0, 5))

        const current = this.stats() ?? ({} as Stats)
        this.stats.set({
          ...current,
          totalBookings: bookings.length,
          pending:   bookings.filter(b => b.status === 'PENDING').length,
          approved:  bookings.filter(b => b.status === 'APPROVED').length,
          completed: bookings.filter(b => b.status === 'COMPLETED').length,
          cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
        })
        bookingsLoaded = true
        tryDone()
      },
      error: () => { bookingsLoaded = true; tryDone() },
    })

    this.api.getUsers().subscribe({
      next: res => {
        const users = res.data
        const current = this.stats() ?? ({} as Stats)
        this.stats.set({
          ...current,
          totalUsers:    users.length,
          totalStudents: users.filter(u => u.role === 'STUDENT').length,
          totalTeachers: users.filter(u => u.role === 'TEACHER').length,
        })
        usersLoaded = true
        tryDone()
      },
      error: () => { usersLoaded = true; tryDone() },
    })
  }

  statCards() {
    const s = this.stats()
    if (!s) return []
    return [
      { label: 'Total Users',    value: s.totalUsers,    color: 'text-blue-900' },
      { label: 'Teachers',       value: s.totalTeachers, color: 'text-blue-600' },
      { label: 'Total Bookings', value: s.totalBookings, color: 'text-gray-800' },
      { label: 'Completed',      value: s.completed,     color: 'text-green-600' },
    ]
  }

  statusRows() {
    const s = this.stats()
    if (!s) return []
    return [
      { label: 'Pending',   value: s.pending,   barColor: 'bg-yellow-400' },
      { label: 'Approved',  value: s.approved,  barColor: 'bg-blue-500'   },
      { label: 'Completed', value: s.completed, barColor: 'bg-green-500'  },
      { label: 'Cancelled', value: s.cancelled, barColor: 'bg-red-400'    },
    ]
  }

  barWidth(value: number): number {
    const total = this.stats()?.totalBookings ?? 1
    return total > 0 ? Math.round((value / total) * 100) : 0
  }

  completionRate(): number {
    const s = this.stats()
    if (!s || s.totalBookings === 0) return 0
    return Math.round((s.completed / s.totalBookings) * 100)
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'bg-yellow-100 text-yellow-800',
      APPROVED:  'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return map[status] ?? 'bg-gray-100 text-gray-700'
  }
}