import { Component, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
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
    <div class="px-4 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto pb-12 pt-4">
      <!-- Hero Header -->
      <div class="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[2rem] p-8 sm:p-10 mb-8 relative overflow-hidden shadow-sm">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-[20px] pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p class="text-[10px] font-black text-red-200/80 uppercase tracking-widest mb-2">{{ currentDate }}</p>
            <h2 class="text-3xl font-black text-white mb-1.5 tracking-tight">{{ greeting() }}, {{ userName() }}</h2>
            <p class="text-red-100/90 text-sm font-medium">Here's what's happening across the booking system today.</p>
          </div>
          <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0 self-start sm:self-auto shadow-inner">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span class="text-xs font-bold text-white tracking-wide">System Online</span>
          </div>
        </div>
      </div>

      <div class="px-4 pb-10 sm:px-6 lg:px-10">

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white dark:bg-card rounded-2xl p-5 shadow-sm dark:shadow-none animate-pulse">
              <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/3"></div>
            </div>
          }
        </div>
      }

      @if (!loading() && stats()) {
        <!-- Premium Stat Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 mb-8">
          @for (card of statCards(); track card.label) {
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[1.5rem] shadow-sm dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-none p-5 transition-all duration-300 border border-white dark:border-white/5 hover:-translate-y-1 relative overflow-hidden group">
              
              <!-- Subtle card background gradient on hover -->
              <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 dark:group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" [class]="card.hoverGradient"></div>

              <div class="flex items-center justify-between mb-5 relative z-10">
                <p class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{{ card.label }}</p>
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-300" [class]="card.iconBg">
                  <svg class="w-4 h-4" [class]="card.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" [attr.d]="card.icon"/>
                  </svg>
                </div>
              </div>
              <div class="relative z-10 flex items-end justify-between">
                <p class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-foreground tracking-tight">{{ card.value }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Middle row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <!-- Booking status breakdown -->
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm dark:shadow-none p-7 sm:p-8 border border-white dark:border-white/5 relative overflow-hidden group hover:shadow-md dark:hover:shadow-none transition-all">
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-red-50/50 dark:group-hover:bg-red-900/10 transition-colors duration-700"></div>
            
            <h3 class="font-black text-gray-900 dark:text-foreground text-lg mb-6 tracking-tight relative z-10">Booking Analytics</h3>
            <div class="space-y-5 relative z-10">
              @for (row of statusRows(); track row.label) {
                <div class="group/row">
                  <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 rounded-full shadow-inner" [class]="row.dot"></div>
                      <span class="text-sm font-bold text-gray-600 dark:text-gray-400 tracking-wide">{{ row.label }}</span>
                    </div>
                    <span class="text-sm font-black text-gray-900 dark:text-foreground">{{ row.value }}</span>
                  </div>
                  <div class="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5 shadow-inner overflow-hidden">
                    <div class="h-2.5 rounded-full transition-all duration-1000 ease-out group-hover/row:opacity-90"
                      [class]="row.barColor"
                      [style.width.%]="barWidth(row.value)">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent bookings -->
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm dark:shadow-none p-7 sm:p-8 border border-white dark:border-white/5 relative overflow-hidden hover:shadow-md dark:hover:shadow-none transition-all">
            <div class="flex items-center justify-between mb-6 relative z-10">
              <h3 class="font-black text-gray-900 dark:text-foreground text-lg tracking-tight">Recent Activity</h3>
              <a routerLink="/admin/bookings"
                class="inline-flex items-center gap-1 text-[10px] font-black text-white bg-red-900 hover:bg-red-800 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-colors shadow-sm active:scale-95">
                View all 
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
            <div class="space-y-4 relative z-10">
              @for (b of recentBookings(); track b.id) {
                <div class="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-transparent dark:border-white/5 hover:border-gray-100 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none transition-all group">
                  <div class="flex items-center gap-3.5">
                    <div class="relative">
                      <div class="w-10 h-10 rounded-[1rem] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 flex items-center justify-center text-sm font-black text-red-800 dark:text-red-400 shrink-0 border border-red-100/50 dark:border-red-900/50 shadow-inner group-hover:scale-105 transition-transform">
                        {{ b.student_name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900 dark:text-foreground leading-tight">{{ b.student_name }}</p>
                      <div class="flex items-center gap-1 mt-0.5 text-xs text-gray-400 font-medium tracking-wide">
                        <span>To:</span>
                        <span class="text-gray-600 dark:text-gray-300 font-semibold">{{ b.teacher_name }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-sm" [class]="statusColor(b.status)">
                    {{ b.status }}
                  </span>
                </div>
              }
              @if (recentBookings().length === 0) {
                <div class="py-6 text-center bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  <p class="text-sm font-bold text-gray-400">No recent activity.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <h3 class="font-black text-gray-900 dark:text-foreground text-lg mb-4 tracking-tight px-2">Quick Actions</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <a routerLink="/admin/users"
            class="group relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white rounded-[2rem] p-7 sm:p-8 transition-all shadow-[0_10px_30px_-5px_rgba(153,27,27,0.3)] hover:-translate-y-1 active:scale-[0.98]">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <div class="flex items-center justify-between mb-8 relative z-10">
              <div class="w-12 h-12 bg-white/10 backdrop-blur-sm shadow-inner border border-white/20 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
            <p class="font-black text-xl leading-tight mb-1 relative z-10 tracking-tight">Manage Users</p>
            <p class="text-red-200/90 text-xs font-semibold tracking-wide relative z-10">{{ stats()?.totalUsers }} registered accounts</p>
          </a>

          <a routerLink="/admin/bookings"
             class="group relative overflow-hidden bg-white/80 dark:bg-card backdrop-blur-xl border border-white dark:border-white/5 text-gray-800 dark:text-foreground rounded-[2rem] p-7 sm:p-8 transition-all shadow-sm dark:shadow-none hover:shadow-md hover border hover:border-red-100 dark:hover:border-red-900/50 hover:-translate-y-1 active:scale-[0.98]">
            <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-red-50/50 dark:bg-red-900/10 rounded-full blur-2xl group-hover:bg-red-100/50 dark:group-hover:bg-red-900/20 transition-colors"></div>
            <div class="flex items-center justify-between mb-8 relative z-10">
              <div class="w-12 h-12 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-[1.25rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-red-800 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
            <p class="font-black text-xl leading-tight mb-1 relative z-10 tracking-tight">Oversight</p>
            <p class="text-gray-400 dark:text-gray-500 text-xs font-semibold tracking-wide relative z-10">{{ stats()?.pending }} requests pending</p>
          </a>

          <div class="group relative overflow-hidden bg-white/80 dark:bg-card backdrop-blur-xl border border-white dark:border-white/5 rounded-[2rem] p-7 sm:p-8 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-all">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-full blur-2xl transition-colors"></div>
            <div class="flex items-center justify-between mb-8 relative z-10">
              <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-[1.25rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{{ completionRate() }}%</span>
            </div>
            <p class="font-black text-xl text-gray-800 dark:text-foreground leading-tight mb-3 tracking-tight relative z-10">Success Rate</p>
            <div class="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5 shadow-inner overflow-hidden relative z-10">
              <div class="h-2.5 rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                [style.width.%]="completionRate()">
              </div>
            </div>
          </div>
        </div>
      }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService)
  private auth = inject(AuthService)

  loading        = signal(true)
  stats          = signal<Stats | null>(null)
  recentBookings = signal<Booking[]>([])

  userName = computed(() => this.auth.currentUser()?.name?.split(' ')[0] || 'Admin')

  greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

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
        iconBg: 'bg-red-50/80 border border-red-100/50', iconColor: 'text-red-700',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        hoverGradient: 'from-transparent to-red-50/30'
      },
      {
        label: 'Students', value: s.totalStudents,
        iconBg: 'bg-purple-50/80 border border-purple-100/50', iconColor: 'text-purple-700',
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        hoverGradient: 'from-transparent to-purple-50/30'
      },
      {
        label: 'Teachers', value: s.totalTeachers,
        iconBg: 'bg-blue-50/80 border border-blue-100/50', iconColor: 'text-blue-700',
        icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
        hoverGradient: 'from-transparent to-blue-50/30'
      },
      {
        label: 'Total Bookings', value: s.totalBookings,
        iconBg: 'bg-yellow-50/80 border border-yellow-100/50', iconColor: 'text-yellow-700',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        hoverGradient: 'from-transparent to-yellow-50/30'
      },
      {
        label: 'Completed', value: s.completed,
        iconBg: 'bg-emerald-50/80 border border-emerald-100/50', iconColor: 'text-emerald-700',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        hoverGradient: 'from-transparent to-emerald-50/30'
      },
      {
        label: 'Pending', value: s.pending,
        iconBg: 'bg-amber-50/80 border border-amber-100/50', iconColor: 'text-amber-600',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        hoverGradient: 'from-transparent to-amber-50/30'
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
