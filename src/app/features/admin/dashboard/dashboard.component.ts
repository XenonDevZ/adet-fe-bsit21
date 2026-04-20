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
  online:        number
  faceToFace:    number
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto pb-12 pt-4">
      <!-- Hero Header -->
      <div class="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[2rem] p-8 sm:p-10 mb-8 relative overflow-hidden shadow-2xl shadow-red-900/20">
        <div class="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p class="text-[10px] font-black text-red-200/80 uppercase tracking-widest mb-2">{{ currentDate }}</p>
            <h1 class="text-3xl font-black text-white mb-1.5 tracking-tight">{{ greeting() }}, {{ userName() }}</h1>
            <p class="text-red-100/90 text-sm font-medium">Analytics & system overview for the consultation portal.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0 shadow-inner">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </span>
              <span class="text-xs font-bold text-white tracking-wide">System Online</span>
            </div>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-white dark:bg-card rounded-2xl p-5 animate-pulse border border-white dark:border-white/5">
                <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-3"></div>
                <div class="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/3"></div>
              </div>
            }
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3]; track i) {
              <div class="bg-white dark:bg-card rounded-[2rem] h-64 animate-pulse border border-white dark:border-white/5"></div>
            }
          </div>
        </div>
      }

      @if (!loading() && stats()) {

        <!-- ── Stat Cards ─────────────────────────────────── -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 mb-8">
          @for (card of statCards(); track card.label) {
            <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[1.5rem] shadow-sm dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 transition-all duration-300 border border-white dark:border-white/5 hover:-translate-y-1 relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" [class]="card.hoverGradient"></div>
              <div class="flex items-center justify-between mb-4 relative z-10">
                <p class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{{ card.label }}</p>
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-300" [class]="card.iconBg">
                  <svg class="w-4 h-4" [class]="card.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" [attr.d]="card.icon"/>
                  </svg>
                </div>
              </div>
              <p class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-foreground tracking-tight relative z-10">{{ card.value }}</p>
              @if (card.sub) {
                <p class="text-[10px] font-bold mt-1 relative z-10" [class]="card.subColor">{{ card.sub }}</p>
              }
            </div>
          }
        </div>

        <!-- ── Row 1: Bar Chart + Type Donut ─────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <!-- 7-Day Booking Volume Bar Chart -->
          <div class="lg:col-span-2 bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm p-7 border border-white dark:border-white/5 relative overflow-hidden">
            <div class="absolute -right-16 -top-16 w-48 h-48 bg-red-50/60 dark:bg-red-900/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="flex items-start justify-between mb-6 relative z-10">
              <div>
                <h3 class="font-black text-gray-900 dark:text-foreground text-lg tracking-tight">Booking Volume</h3>
                <p class="text-xs text-gray-400 font-medium mt-0.5">Sessions booked per day — last 7 days</p>
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">7-Day View</span>
            </div>

            <!-- SVG Bar Chart -->
            <div class="relative z-10">
              <div class="flex items-end gap-2 h-36" style="align-items: flex-end;">
                @for (bar of last7Days(); track bar.label) {
                  <div class="flex-1 flex flex-col items-center gap-2 group/bar">
                    <!-- Count Label -->
                    <span class="text-[10px] font-black text-gray-500 dark:text-gray-400 opacity-0 group-hover/bar:opacity-100 transition-opacity">{{ bar.count }}</span>
                    <!-- Bar -->
                    <div class="w-full rounded-t-xl transition-all duration-700 ease-out cursor-default relative overflow-hidden"
                      [style.height]="bar.height"
                      [class.bg-gradient-to-t]="true"
                      [class.from-red-900]="bar.isToday"
                      [class.to-red-700]="bar.isToday"
                      [class.shadow-lg]="bar.isToday"
                      [class.shadow-red-900/30]="bar.isToday"
                      [class.from-gray-200]="!bar.isToday && bar.count === 0"
                      [class.to-gray-100]="!bar.isToday && bar.count === 0"
                      [class.dark:from-white/10]="!bar.isToday && bar.count === 0"
                      [class.dark:to-white/5]="!bar.isToday && bar.count === 0"
                      [class.from-red-300]="!bar.isToday && bar.count > 0"
                      [class.to-red-200]="!bar.isToday && bar.count > 0"
                      [class.dark:from-red-800/60]="!bar.isToday && bar.count > 0"
                      [class.dark:to-red-900/40]="!bar.isToday && bar.count > 0"
                      [class.group-hover/bar:from-red-800]="!bar.isToday"
                      [class.group-hover/bar:to-red-700]="!bar.isToday">
                      <div class="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                    </div>
                    <!-- Day Label -->
                    <span class="text-[10px] font-black uppercase tracking-wider"
                      [class.text-red-700]="bar.isToday"
                      [class.dark:text-red-400]="bar.isToday"
                      [class.text-gray-400]="!bar.isToday">{{ bar.label }}</span>
                  </div>
                }
              </div>
              <!-- Y-axis reference line -->
              <div class="absolute bottom-8 left-0 right-0 border-t border-dashed border-gray-200 dark:border-white/10 pointer-events-none"></div>
            </div>
          </div>

          <!-- Consultation Type Donut -->
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm p-7 border border-white dark:border-white/5 flex flex-col">
            <h3 class="font-black text-gray-900 dark:text-foreground text-lg tracking-tight mb-1">Session Types</h3>
            <p class="text-xs text-gray-400 font-medium mb-6">Online vs Face-to-Face</p>

            <!-- Donut SVG -->
            <div class="flex items-center justify-center flex-1 mb-6">
              <div class="relative">
                <svg class="w-40 h-40 -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" class="stroke-gray-100 dark:stroke-white/10" stroke-width="5"/>
                  <!-- Face to face slice -->
                  @if (typeDonut().faceToFace > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round"
                      [attr.stroke-dasharray]="typeDonut().faceToFace + ' ' + (100 - typeDonut().faceToFace)"
                      stroke-dashoffset="0"/>
                  }
                  <!-- Online slice -->
                  @if (typeDonut().online > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"
                      [attr.stroke-dasharray]="typeDonut().online + ' ' + (100 - typeDonut().online)"
                      [attr.stroke-dashoffset]="'-' + typeDonut().faceToFace"/>
                  }
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <p class="text-2xl font-black text-gray-900 dark:text-foreground">{{ stats()!.totalBookings }}</p>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-3 h-3 rounded-full bg-blue-500 shadow-inner"></div>
                  <span class="text-sm font-bold text-gray-600 dark:text-gray-400">Online</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-gray-900 dark:text-foreground">{{ stats()!.online }}</span>
                  <span class="text-[10px] font-bold text-gray-400">({{ typeDonut().online }}%)</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-inner"></div>
                  <span class="text-sm font-bold text-gray-600 dark:text-gray-400">Face-to-Face</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-gray-900 dark:text-foreground">{{ stats()!.faceToFace }}</span>
                  <span class="text-[10px] font-bold text-gray-400">({{ typeDonut().faceToFace }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Row 2: Top Teachers + Booking Breakdown + Recent ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <!-- Top Teachers Leaderboard -->
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm p-7 border border-white dark:border-white/5">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="font-black text-gray-900 dark:text-foreground text-lg tracking-tight">Top Instructors</h3>
                <p class="text-xs text-gray-400 font-medium mt-0.5">By total sessions</p>
              </div>
              <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="space-y-3">
              @for (t of topTeachers(); track t.name; let i = $index) {
                <div class="flex items-center gap-3 group p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-inner"
                    [class.bg-amber-100]="i === 0" [class.text-amber-700]="i === 0"
                    [class.bg-gray-100]="i === 1" [class.dark:bg-white/10]="i === 1" [class.text-gray-700]="i === 1" [class.dark:text-gray-300]="i === 1"
                    [class.bg-orange-50]="i === 2" [class.text-orange-600]="i === 2"
                    [class.bg-gray-50]="i > 2" [class.dark:bg-white/5]="i > 2" [class.text-gray-500]="i > 2">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-gray-900 dark:text-foreground truncate">{{ t.name }}</p>
                    <div class="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div class="h-1.5 rounded-full bg-gradient-to-r from-red-800 to-red-600 transition-all duration-1000"
                        [style.width]="(t.count / (topTeachers()[0]?.count || 1)) * 100 + '%'"></div>
                    </div>
                  </div>
                  <span class="text-sm font-black text-gray-900 dark:text-foreground shrink-0">{{ t.count }}</span>
                </div>
              }
              @if (topTeachers().length === 0) {
                <div class="py-8 text-center text-gray-400 text-sm font-bold">No data yet</div>
              }
            </div>
          </div>

          <!-- Status Breakdown -->
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm p-7 border border-white dark:border-white/5">
            <h3 class="font-black text-gray-900 dark:text-foreground text-lg tracking-tight mb-1">Status Breakdown</h3>
            <p class="text-xs text-gray-400 font-medium mb-6">All-time booking statuses</p>
            <div class="space-y-5">
              @for (row of statusRows(); track row.label) {
                <div class="group/row">
                  <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 rounded-full shadow-inner" [class]="row.dot"></div>
                      <span class="text-sm font-bold text-gray-600 dark:text-gray-400">{{ row.label }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-black text-gray-900 dark:text-foreground">{{ row.value }}</span>
                      <span class="text-[10px] font-bold text-gray-400">({{ barWidth(row.value) }}%)</span>
                    </div>
                  </div>
                  <div class="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5 shadow-inner overflow-hidden">
                    <div class="h-2.5 rounded-full transition-all duration-1000 ease-out"
                      [class]="row.barColor"
                      [style.width.%]="barWidth(row.value)">
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Success rate badge -->
            <div class="mt-6 pt-5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
              <span class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Completion Rate</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full bg-emerald-500 transition-all duration-1000" [style.width.%]="completionRate()"></div>
                </div>
                <span class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ completionRate() }}%</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm p-7 border border-white dark:border-white/5">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-black text-gray-900 dark:text-foreground text-lg tracking-tight">Recent Activity</h3>
              <a routerLink="/admin/bookings"
                class="inline-flex items-center gap-1 text-[10px] font-black text-white bg-red-900 hover:bg-red-800 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-colors shadow-sm active:scale-95">
                All
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
            <div class="space-y-3">
              @for (b of recentBookings(); track b.id) {
                <div class="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-transparent dark:border-white/5 hover:border-gray-100 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all group">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-[0.8rem] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 flex items-center justify-center text-xs font-black text-red-800 dark:text-red-400 border border-red-100/50 dark:border-red-900/50 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                      {{ b.student_name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900 dark:text-foreground leading-tight">{{ b.student_name }}</p>
                      <p class="text-[10px] font-bold text-gray-400">→ {{ b.teacher_name }}</p>
                    </div>
                  </div>
                  <span class="text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm" [class]="statusColor(b.status)">{{ b.status }}</span>
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

        <!-- ── Row 3: Weekly Heatmap + Quick Actions ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Day-of-Week Activity Heatmap -->
          <div class="lg:col-span-2 bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm p-7 border border-white dark:border-white/5">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="font-black text-gray-900 dark:text-foreground text-lg tracking-tight">Weekly Patterns</h3>
                <p class="text-xs text-gray-400 font-medium mt-0.5">Booking distribution by day of week</p>
              </div>
            </div>
            <div class="grid grid-cols-7 gap-3">
              @for (day of weekdayActivity(); track day.label) {
                <div class="flex flex-col items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">{{ day.label }}</span>
                  <div class="w-full aspect-square rounded-xl transition-all duration-500 hover:scale-105 cursor-default shadow-inner relative overflow-hidden"
                    [class.bg-red-900]="day.intensity === 'high'"
                    [class.bg-red-400]="day.intensity === 'medium'"
                    [class.bg-red-100]="day.intensity === 'low'"
                    [class.dark:bg-red-900/60]="day.intensity === 'low'"
                    [class.bg-gray-100]="day.intensity === 'none'"
                    [class.dark:bg-white/5]="day.intensity === 'none'"
                    [title]="day.count + ' bookings'">
                    @if (day.count > 0) {
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-[11px] font-black"
                          [class.text-white]="day.intensity === 'high' || day.intensity === 'medium'"
                          [class.text-red-800]="day.intensity === 'low'"
                          [class.dark:text-red-200]="day.intensity === 'low'">{{ day.count }}</span>
                      </div>
                    }
                  </div>
                  <span class="text-[10px] font-bold text-gray-500">{{ day.count }}</span>
                </div>
              }
            </div>
            <div class="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Intensity:</span>
              <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-gray-100 dark:bg-white/5"></div><span class="text-[10px] font-bold text-gray-400">None</span></div>
              <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-red-100 dark:bg-red-900/60"></div><span class="text-[10px] font-bold text-gray-400">Low</span></div>
              <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-red-400"></div><span class="text-[10px] font-bold text-gray-400">Med</span></div>
              <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-red-900"></div><span class="text-[10px] font-bold text-gray-400">High</span></div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-col gap-4">
            <a routerLink="/admin/users"
              class="group relative overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white rounded-[2rem] p-7 transition-all shadow-[0_10px_30px_-5px_rgba(153,27,27,0.3)] hover:-translate-y-1 active:scale-[0.98] flex-1">
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <div class="flex items-center justify-between mb-4 relative z-10">
                <div class="w-11 h-11 bg-white/10 backdrop-blur-sm border border-white/20 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
              <p class="font-black text-lg leading-tight mb-0.5 relative z-10">Manage Users</p>
              <p class="text-red-200/80 text-xs font-semibold relative z-10">{{ stats()?.totalUsers }} accounts</p>
            </a>

            <a routerLink="/admin/bookings"
              class="group relative overflow-hidden bg-white/80 dark:bg-card backdrop-blur-xl border border-white dark:border-white/5 text-gray-800 dark:text-foreground rounded-[2rem] p-7 transition-all shadow-sm hover:shadow-md hover:border-red-100 dark:hover:border-red-900/50 hover:-translate-y-1 active:scale-[0.98] flex-1">
              <div class="flex items-center justify-between mb-4 relative z-10">
                <div class="w-11 h-11 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-red-800 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
              <p class="font-black text-lg leading-tight mb-0.5">All Bookings</p>
              <p class="text-gray-400 text-xs font-semibold">{{ stats()?.pending }} pending approval</p>
            </a>
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
  allBookings    = signal<Booking[]>([])

  userName = computed(() => this.auth.currentUser()?.name?.split(' ')[0] || 'Admin')

  greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
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
        this.allBookings.set(b)
        this.recentBookings.set([...b].sort((x, y) => y.id - x.id).slice(0, 6))
        this.stats.update(s => ({
          ...(s ?? {} as Stats),
          totalBookings: b.length,
          pending:    b.filter(x => x.status === 'PENDING').length,
          approved:   b.filter(x => x.status === 'APPROVED').length,
          completed:  b.filter(x => x.status === 'COMPLETED').length,
          cancelled:  b.filter(x => x.status === 'CANCELLED').length,
          online:     b.filter(x => x.consultation_type === 'ONLINE').length,
          faceToFace: b.filter(x => x.consultation_type === 'FACE_TO_FACE').length,
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
          totalStudents: u.filter((x: User) => x.role === 'STUDENT').length,
          totalTeachers: u.filter((x: User) => x.role === 'TEACHER').length,
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
        label: 'Total Users', value: s.totalUsers, sub: s.totalStudents + ' students · ' + s.totalTeachers + ' teachers', subColor: 'text-gray-400',
        iconBg: 'bg-red-50/80 dark:bg-red-900/20 border border-red-100/50 dark:border-red-900/50', iconColor: 'text-red-700 dark:text-red-400',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        hoverGradient: 'from-transparent to-red-50/30 dark:to-red-900/10'
      },
      {
        label: 'Total Bookings', value: s.totalBookings, sub: 'All-time sessions', subColor: 'text-gray-400',
        iconBg: 'bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-100/50 dark:border-yellow-900/50', iconColor: 'text-yellow-700 dark:text-yellow-400',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        hoverGradient: 'from-transparent to-yellow-50/30 dark:to-yellow-900/10'
      },
      {
        label: 'Pending', value: s.pending, sub: s.pending > 0 ? 'Needs action' : 'All clear!', subColor: s.pending > 0 ? 'text-amber-500' : 'text-emerald-500',
        iconBg: 'bg-amber-50/80 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-900/50', iconColor: 'text-amber-600 dark:text-amber-400',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        hoverGradient: 'from-transparent to-amber-50/30 dark:to-amber-900/10'
      },
      {
        label: 'Approved', value: s.approved, sub: 'Active sessions', subColor: 'text-blue-400',
        iconBg: 'bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-900/50', iconColor: 'text-blue-700 dark:text-blue-400',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        hoverGradient: 'from-transparent to-blue-50/30 dark:to-blue-900/10'
      },
      {
        label: 'Completed', value: s.completed, sub: this.completionRate() + '% success rate', subColor: 'text-emerald-500',
        iconBg: 'bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-900/50', iconColor: 'text-emerald-700 dark:text-emerald-400',
        icon: 'M5 13l4 4L19 7',
        hoverGradient: 'from-transparent to-emerald-50/30 dark:to-emerald-900/10'
      },
      {
        label: 'Cancelled', value: s.cancelled, sub: s.totalBookings > 0 ? Math.round((s.cancelled / s.totalBookings) * 100) + '% of total' : '0% of total', subColor: 'text-red-400',
        iconBg: 'bg-gray-50/80 dark:bg-white/5 border border-gray-100/50 dark:border-white/5', iconColor: 'text-gray-500 dark:text-gray-400',
        icon: 'M6 18L18 6M6 6l12 12',
        hoverGradient: 'from-transparent to-gray-50/30 dark:to-white/5'
      },
    ]
  }

  // Last 7 days booking volume
  last7Days(): { label: string; count: number; height: string; isToday: boolean }[] {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const bookings = this.allBookings()
    const today = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')

    const result = []
    const maxCount = Math.max(1, ...Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const str = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
      return bookings.filter(b => b.scheduled_date?.split('T')[0] === str).length
    }))

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const str = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
      const count = bookings.filter(b => b.scheduled_date?.split('T')[0] === str).length
      const heightPx = count === 0 ? 8 : Math.max(20, Math.round((count / maxCount) * 120))
      result.push({
        label: days[d.getDay()],
        count,
        height: heightPx + 'px',
        isToday: i === 0,
      })
    }
    return result
  }

  // Top 5 teachers by booking count
  topTeachers(): { name: string; count: number }[] {
    const bookings = this.allBookings()
    const map = new Map<string, number>()
    bookings.forEach(b => {
      if (b.teacher_name) map.set(b.teacher_name, (map.get(b.teacher_name) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  // Day-of-week heatmap
  weekdayActivity(): { label: string; count: number; intensity: 'none' | 'low' | 'medium' | 'high' }[] {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = [0, 0, 0, 0, 0, 0, 0]
    this.allBookings().forEach(b => {
      if (b.scheduled_date) {
        const d = new Date(b.scheduled_date + 'T00:00:00')
        counts[d.getDay()]++
      }
    })
    const max = Math.max(1, ...counts)
    return labels.map((label, i) => ({
      label,
      count: counts[i],
      intensity: counts[i] === 0 ? 'none'
        : counts[i] / max <= 0.33 ? 'low'
        : counts[i] / max <= 0.66 ? 'medium'
        : 'high'
    }))
  }

  typeDonut(): { online: number; faceToFace: number } {
    const s = this.stats()
    if (!s || s.totalBookings === 0) return { online: 0, faceToFace: 0 }
    return {
      online:     Math.round((s.online / s.totalBookings) * 100),
      faceToFace: Math.round((s.faceToFace / s.totalBookings) * 100),
    }
  }

  statusRows() {
    const s = this.stats()
    if (!s) return []
    return [
      { label: 'Pending',   value: s.pending,   dot: 'bg-amber-400',   barColor: 'bg-amber-400' },
      { label: 'Approved',  value: s.approved,  dot: 'bg-blue-500',    barColor: 'bg-blue-500'  },
      { label: 'Completed', value: s.completed, dot: 'bg-emerald-500', barColor: 'bg-emerald-500' },
      { label: 'Cancelled', value: s.cancelled, dot: 'bg-red-400',     barColor: 'bg-red-400'   },
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
      PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      APPROVED:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return map[status] ?? 'bg-gray-100 text-gray-700'
  }
}
