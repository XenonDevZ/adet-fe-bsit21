import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Booking, User } from '../../../core/models/index'

interface StudentStats {
  total:     number
  pending:   number
  approved:  number
  completed: number
  cancelled: number
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- Page header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p class="text-gray-400 text-sm mt-1">Here's what's going on with your consultations.</p>
        </div>
        <button (click)="router.navigate(['/student/teachers'])"
          class="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white
                 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Book Consultation
        </button>
      </div>

      @if (loading()) {
        <!-- Skeleton row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div class="h-8 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div class="grid grid-cols-3 gap-2">
                @for (j of [1,2,3]; track j) {
                  <div class="h-12 bg-gray-200 rounded-xl"></div>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (!loading()) {
        <!-- ── Row 1: Overview + Booking progress + Status breakdown ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          <!-- Overview card (dark) -->
          <div class="bg-gray-900 rounded-2xl p-6 text-white">
            <div class="flex items-center justify-between mb-5">
              <p class="font-semibold text-sm text-gray-300">Overall Information</p>
              <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>

            <!-- Big numbers -->
            <div class="flex items-end gap-6 mb-6">
              <div>
                <p class="text-4xl font-bold text-white">{{ stats()?.total ?? 0 }}</p>
                <p class="text-xs text-gray-400 mt-1">Total bookings</p>
              </div>
              <div>
                <p class="text-4xl font-bold text-gray-500">{{ stats()?.completed ?? 0 }}</p>
                <p class="text-xs text-gray-600 mt-1">Completed</p>
              </div>
            </div>

            <!-- Mini stat cards -->
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-gray-800 rounded-xl p-3 text-center">
                <p class="text-xl font-bold text-yellow-400">{{ stats()?.pending ?? 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Pending</p>
              </div>
              <div class="bg-gray-800 rounded-xl p-3 text-center">
                <p class="text-xl font-bold text-blue-400">{{ stats()?.approved ?? 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Approved</p>
              </div>
              <div class="bg-gray-800 rounded-xl p-3 text-center">
                <p class="text-xl font-bold text-red-400">{{ stats()?.cancelled ?? 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Cancelled</p>
              </div>
            </div>
          </div>

          <!-- Booking Progress (bar chart) -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-5">
              <div>
                <p class="font-semibold text-gray-900 text-sm">Booking Progress</p>
                <div class="flex items-center gap-3 mt-1">
                  <div class="flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span class="text-xs text-gray-400">Pending</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span class="text-xs text-gray-400">Approved</span>
                  </div>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
              </svg>
            </div>

            <!-- Bars -->
            <div class="flex items-end justify-between gap-2 h-32 mb-3">
              @for (bar of chartBars(); track bar.label) {
                <div class="flex flex-col items-center gap-1 flex-1">
                  <div class="w-full flex flex-col justify-end gap-0.5 h-24">
                    @if (bar.approvedPct > 0) {
                      <div class="w-full bg-blue-500 rounded-sm transition-all duration-700"
                        [style.height.%]="bar.approvedPct">
                      </div>
                    }
                    @if (bar.pendingPct > 0) {
                      <div class="w-full bg-yellow-400 rounded-sm transition-all duration-700"
                        [style.height.%]="bar.pendingPct">
                      </div>
                    }
                    @if (bar.completedPct > 0) {
                      <div class="w-full bg-green-500 rounded-sm transition-all duration-700"
                        [style.height.%]="bar.completedPct">
                      </div>
                    }
                    @if (bar.cancelledPct > 0) {
                      <div class="w-full bg-red-400 rounded-sm transition-all duration-700"
                        [style.height.%]="bar.cancelledPct">
                      </div>
                    }
                  </div>
                  <span class="text-xs text-gray-400">{{ bar.label }}</span>
                </div>
              }
            </div>

            @if ((stats()?.total ?? 0) > 0) {
              <div class="bg-green-50 rounded-xl px-3 py-2 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-xs text-green-700 font-medium">
                  {{ completionRate() }}% of your sessions completed
                </span>
              </div>
            } @else {
              <div class="bg-gray-50 rounded-xl px-3 py-2 text-center">
                <span class="text-xs text-gray-400">No bookings yet — book your first session!</span>
              </div>
            }
          </div>

          <!-- Status breakdown (donut) -->
          <div class="bg-white rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-5">
              <p class="font-semibold text-gray-900 text-sm">Status Breakdown</p>
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>

            <!-- Donut -->
            <div class="flex items-center justify-center mb-5">
              <div class="relative">
                <svg class="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" stroke-width="3.5"/>
                  @if (donut().completed > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#22c55e" stroke-width="3.5"
                      [attr.stroke-dasharray]="donut().completed + ' ' + (100 - donut().completed)"
                      stroke-dashoffset="0"/>
                  }
                  @if (donut().approved > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#3b82f6" stroke-width="3.5"
                      [attr.stroke-dasharray]="donut().approved + ' ' + (100 - donut().approved)"
                      [attr.stroke-dashoffset]="'-' + donut().completed"/>
                  }
                  @if (donut().pending > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#facc15" stroke-width="3.5"
                      [attr.stroke-dasharray]="donut().pending + ' ' + (100 - donut().pending)"
                      [attr.stroke-dashoffset]="'-' + (donut().completed + donut().approved)"/>
                  }
                  @if (donut().cancelled > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#f87171" stroke-width="3.5"
                      [attr.stroke-dasharray]="donut().cancelled + ' ' + (100 - donut().cancelled)"
                      [attr.stroke-dashoffset]="'-' + (donut().completed + donut().approved + donut().pending)"/>
                  }
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  @if ((stats()?.total ?? 0) > 0) {
                    <p class="text-xl font-bold text-gray-900">{{ completionRate() }}%</p>
                    <p class="text-xs text-gray-400">done</p>
                  } @else {
                    <p class="text-xs text-gray-400 text-center px-2">No data</p>
                  }
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="space-y-2">
              @for (item of donutLegend(); track item.label) {
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full" [style.background]="item.color"></div>
                    <span class="text-xs text-gray-500">{{ item.label }}</span>
                  </div>
                  <span class="text-xs font-semibold text-gray-700">{{ item.value }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── Row 2: Recent appointments + Profile card + Goals ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <!-- Recent appointments (spans 2 cols) -->
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <p class="font-semibold text-gray-900 text-sm">Recent Appointments</p>
              <a routerLink="/student/my-bookings"
                class="text-xs text-red-700 font-semibold hover:underline flex items-center gap-1">
                View all
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            <div class="divide-y divide-gray-50">
              @for (b of recentBookings(); track b.id) {
                <div class="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center
                                text-sm font-bold text-red-800 flex-shrink-0">
                      {{ b.teacher_name.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ b.teacher_name }}</p>
                      <p class="text-xs text-gray-400">
                        {{ b.scheduled_date }} · {{ b.start_time }} – {{ b.end_time }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs"
                      [class]="b.consultation_type === 'ONLINE' ? 'text-blue-500' : 'text-gray-400'">
                      {{ b.consultation_type === 'ONLINE' ? '🌐' : '🏫' }}
                    </span>
                    <span class="text-xs font-medium px-2.5 py-1 rounded-lg"
                      [class.bg-yellow-100]="b.status === 'PENDING'"
                      [class.text-yellow-800]="b.status === 'PENDING'"
                      [class.bg-blue-100]="b.status === 'APPROVED'"
                      [class.text-blue-800]="b.status === 'APPROVED'"
                      [class.bg-green-100]="b.status === 'COMPLETED'"
                      [class.text-green-800]="b.status === 'COMPLETED'"
                      [class.bg-red-100]="b.status === 'CANCELLED'"
                      [class.text-red-800]="b.status === 'CANCELLED'">
                      {{ b.status }}
                    </span>
                  </div>
                </div>
              }

              @if (recentBookings().length === 0) {
                <div class="px-6 py-12 text-center">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-red-50 rounded-2xl mb-3">
                    <svg class="w-6 h-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <p class="text-gray-500 font-medium text-sm">No appointments yet</p>
                  <p class="text-gray-400 text-xs mt-1 mb-4">Book your first consultation session.</p>
                  <button (click)="router.navigate(['/student/teachers'])"
                    class="text-xs bg-red-800 hover:bg-red-700 text-white font-semibold
                           px-4 py-2 rounded-xl transition-colors">
                    Browse Teachers
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Right column -->
          <div class="space-y-4">

            <!-- Profile card -->
            <div class="bg-white rounded-2xl shadow-sm p-5">
              <div class="flex items-center gap-3 mb-4">
                <img [src]="profile()?.picture || 'https://ui-avatars.com/api/?name=' + profile()?.name + '&background=7f1d1d&color=fff'"
                  class="w-12 h-12 rounded-2xl object-cover border-2 border-red-100" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 text-sm truncate">{{ profile()?.name }}</p>
                  <p class="text-xs text-red-700 font-medium">Student</p>
                </div>
              </div>

              <div class="space-y-2">
                @for (field of profileFields(); track field.label) {
                  <div class="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <p class="text-xs text-gray-400">{{ field.label }}</p>
                    <p class="text-xs font-medium text-gray-700 text-right max-w-36 truncate">
                      {{ field.value || '—' }}
                    </p>
                  </div>
                }
              </div>

              <a routerLink="/student/profile"
                class="mt-4 w-full flex items-center justify-center gap-2 border border-gray-200
                       text-gray-600 hover:bg-gray-50 text-xs font-semibold py-2 rounded-xl transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Profile
              </a>
            </div>

            <!-- Quick actions -->
            <div class="bg-white rounded-2xl shadow-sm p-5">
              <p class="font-semibold text-gray-900 text-sm mb-3">Quick Actions</p>
              <div class="space-y-2">
                <button (click)="router.navigate(['/student/teachers'])"
                  class="w-full flex items-center justify-between p-3 rounded-xl
                         hover:bg-red-50 transition-colors group">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <svg class="w-3.5 h-3.5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 4v16m8-8H4"/>
                      </svg>
                    </div>
                    <span class="text-xs font-medium text-gray-700">Book Consultation</span>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <button (click)="router.navigate(['/student/my-bookings'])"
                  class="w-full flex items-center justify-between p-3 rounded-xl
                         hover:bg-blue-50 transition-colors group">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <svg class="w-3.5 h-3.5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <span class="text-xs font-medium text-gray-700">My Appointments</span>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <button (click)="router.navigate(['/student/profile'])"
                  class="w-full flex items-center justify-between p-3 rounded-xl
                         hover:bg-gray-50 transition-colors group">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <svg class="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <span class="text-xs font-medium text-gray-700">My Profile</span>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class StudentDashboardComponent implements OnInit {
  private api = inject(ApiService)
  private auth = inject(AuthService)
  router       = inject(Router)

  loading        = signal(true)
  stats          = signal<StudentStats | null>(null)
  recentBookings = signal<Booking[]>([])
  profile        = signal<User | null>(null)

  ngOnInit(): void {
    let bookingsDone = false
    let profileDone  = false

    const tryDone = () => {
      if (bookingsDone && profileDone) this.loading.set(false)
    }

    this.api.getBookings().subscribe({
      next: res => {
        const b = res.data
        this.recentBookings.set(b.slice(0, 5))
        this.stats.set({
          total:     b.length,
          pending:   b.filter(x => x.status === 'PENDING').length,
          approved:  b.filter(x => x.status === 'APPROVED').length,
          completed: b.filter(x => x.status === 'COMPLETED').length,
          cancelled: b.filter(x => x.status === 'CANCELLED').length,
        })
        bookingsDone = true
        tryDone()
      },
      error: () => { bookingsDone = true; tryDone() },
    })

    this.api.getProfile().subscribe({
      next: res => {
        this.profile.set(res.data)
        profileDone = true
        tryDone()
      },
      error: () => { profileDone = true; tryDone() },
    })
  }

  completionRate(): number {
    const s = this.stats()
    if (!s || s.total === 0) return 0
    return Math.round((s.completed / s.total) * 100)
  }

  profileFields() {
    const p = this.profile()
    if (!p) return []
    return [
      { label: 'Course',      value: p.course     },
      { label: 'Year Level',  value: p.year_level },
      { label: 'Department',  value: p.department },
      { label: 'Email',       value: p.email      },
    ]
  }

  chartBars() {
    const s = this.stats()
    if (!s || s.total === 0) {
      return ['Pend','Appr','Comp','Canc'].map(label => ({
        label, pendingPct: 0, approvedPct: 0, completedPct: 0, cancelledPct: 0
      }))
    }
    const t = s.total
    return [
      { label: 'Pend',  pendingPct: Math.round((s.pending   / t) * 100), approvedPct: 0, completedPct: 0, cancelledPct: 0 },
      { label: 'Appr',  pendingPct: 0, approvedPct: Math.round((s.approved  / t) * 100), completedPct: 0, cancelledPct: 0 },
      { label: 'Comp',  pendingPct: 0, approvedPct: 0, completedPct: Math.round((s.completed / t) * 100), cancelledPct: 0 },
      { label: 'Canc',  pendingPct: 0, approvedPct: 0, completedPct: 0, cancelledPct: Math.round((s.cancelled / t) * 100) },
    ]
  }

  donut() {
    const s = this.stats()
    if (!s || s.total === 0) return { completed: 0, approved: 0, pending: 0, cancelled: 0 }
    const t = s.total
    return {
      completed: Math.round((s.completed / t) * 100),
      approved:  Math.round((s.approved  / t) * 100),
      pending:   Math.round((s.pending   / t) * 100),
      cancelled: Math.round((s.cancelled / t) * 100),
    }
  }

  donutLegend() {
    const s = this.stats()
    if (!s) return []
    return [
      { label: 'Completed', value: s.completed, color: '#22c55e' },
      { label: 'Approved',  value: s.approved,  color: '#3b82f6' },
      { label: 'Pending',   value: s.pending,   color: '#facc15' },
      { label: 'Cancelled', value: s.cancelled, color: '#f87171' },
    ]
  }
}
