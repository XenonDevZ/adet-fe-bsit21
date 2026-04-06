import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import type { Booking, User } from '../../../core/models/index'

interface Stats {
  totalUsers:    number
  totalStudents: number
  totalTeachers: number
  totalBookings: number
  pending:       number
  approved:      number
  completed:     number
  cancelled:     number
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p class="text-gray-400 text-sm mt-1">System overview for Liceo de Cagayan University.</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          }
        </div>
      }

      @if (!loading() && stats()) {
        <!-- Stat cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          @for (card of statCards(); track card.label) {
            <div class="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ card.label }}</p>
                <div class="w-8 h-8 rounded-xl flex items-center justify-center" [class]="card.iconBg">
                  <svg class="w-4 h-4" [class]="card.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="card.icon"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ card.value }}</p>
            </div>
          }
        </div>

        <!-- Middle row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <!-- Booking status breakdown -->
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-5">Booking Breakdown</h3>
            <div class="space-y-4">
              @for (row of statusRows(); track row.label) {
                <div>
                  <div class="flex justify-between items-center mb-1.5">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full" [class]="row.dot"></div>
                      <span class="text-sm text-gray-600">{{ row.label }}</span>
                    </div>
                    <span class="text-sm font-semibold text-gray-800">{{ row.value }}</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-500"
                      [class]="row.barColor"
                      [style.width.%]="barWidth(row.value)">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent bookings -->
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-semibold text-gray-900">Recent Bookings</h3>
              <a routerLink="/admin/bookings"
                class="text-xs text-red-700 font-semibold hover:underline">View all →</a>
            </div>
            <div class="space-y-3">
              @for (b of recentBookings(); track b.id) {
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-xs font-bold text-red-800">
                      {{ b.student_name.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ b.student_name }}</p>
                      <p class="text-xs text-gray-400">→ {{ b.teacher_name }}</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold px-2 py-1 rounded-lg" [class]="statusColor(b.status)">
                    {{ b.status }}
                  </span>
                </div>
              }
              @if (recentBookings().length === 0) {
                <p class="text-sm text-gray-400 text-center py-4">No bookings yet.</p>
              }
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a routerLink="/admin/users"
            class="group bg-red-800 hover:bg-red-700 text-white rounded-2xl p-5 transition-colors shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <p class="font-semibold">User Management</p>
              <svg class="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
            <p class="text-red-200 text-sm">{{ stats()?.totalUsers }} registered users</p>
          </a>

          <a routerLink="/admin/bookings"
            class="group bg-white hover:bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl p-5 transition-colors shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <p class="font-semibold">All Bookings</p>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
            <p class="text-gray-400 text-sm">{{ stats()?.pending }} pending review</p>
          </a>

          <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p class="font-semibold text-gray-800 mb-3">Completion Rate</p>
            <div class="flex items-end gap-2">
              <p class="text-3xl font-bold text-green-600">{{ completionRate() }}%</p>
              <p class="text-xs text-gray-400 mb-1">of all bookings</p>
            </div>
            <div class="mt-3 w-full bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full bg-green-500 transition-all duration-500"
                [style.width.%]="completionRate()">
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService)

  loading        = signal(true)
  stats          = signal<Stats | null>(null)
  recentBookings = signal<Booking[]>([])

  ngOnInit(): void {
    let bookingsDone = false
    let usersDone    = false

    const tryDone = () => {
      if (bookingsDone && usersDone) this.loading.set(false)
    }

    this.api.getBookings().subscribe({
      next: res => {
        const b = res.data
        this.recentBookings.set(b.slice(0, 5))
        this.stats.update(s => ({
          ...(s ?? {} as Stats),
          totalBookings: b.length,
          pending:   b.filter(x => x.status === 'PENDING').length,
          approved:  b.filter(x => x.status === 'APPROVED').length,
          completed: b.filter(x => x.status === 'COMPLETED').length,
          cancelled: b.filter(x => x.status === 'CANCELLED').length,
        }))
        bookingsDone = true
        tryDone()
      },
      error: () => { bookingsDone = true; tryDone() },
    })

    this.api.getUsers().subscribe({
      next: res => {
        const u = res.data
        this.stats.update(s => ({
          ...(s ?? {} as Stats),
          totalUsers:    u.length,
          totalStudents: u.filter(x => x.role === 'STUDENT').length,
          totalTeachers: u.filter(x => x.role === 'TEACHER').length,
        }))
        usersDone = true
        tryDone()
      },
      error: () => { usersDone = true; tryDone() },
    })
  }

  statCards() {
    const s = this.stats()
    if (!s) return []
    return [
      {
        label: 'Total Users', value: s.totalUsers,
        iconBg: 'bg-red-50', iconColor: 'text-red-700',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      },
      {
        label: 'Teachers', value: s.totalTeachers,
        iconBg: 'bg-blue-50', iconColor: 'text-blue-700',
        icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      },
      {
        label: 'Total Bookings', value: s.totalBookings,
        iconBg: 'bg-yellow-50', iconColor: 'text-yellow-700',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      },
      {
        label: 'Completed', value: s.completed,
        iconBg: 'bg-green-50', iconColor: 'text-green-700',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
    ]
  }

  statusRows() {
    const s = this.stats()
    if (!s) return []
    return [
      { label: 'Pending',   value: s.pending,   dot: 'bg-yellow-400', barColor: 'bg-yellow-400' },
      { label: 'Approved',  value: s.approved,  dot: 'bg-blue-500',   barColor: 'bg-blue-500'   },
      { label: 'Completed', value: s.completed, dot: 'bg-green-500',  barColor: 'bg-green-500'  },
      { label: 'Cancelled', value: s.cancelled, dot: 'bg-red-400',    barColor: 'bg-red-400'    },
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
