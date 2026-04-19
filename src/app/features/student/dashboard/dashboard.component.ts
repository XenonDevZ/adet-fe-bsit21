import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Booking } from '../../../core/models/index'
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component'

interface StudentStats {
  total: number
  pending: number
  approved: number
  completed: number
  cancelled: number
}

import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe'

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, TimeFormatPipe],
  template: `
    <div class="h-full w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex flex-col items-center">

      <!-- ── Floating Hero Header ─────────────────────────────────── -->
      <div class="w-full relative z-10 mb-4 lg:mb-20 group">
        <div class="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-red-900/20 transform group-hover:scale-[1.005] transition-transform duration-700 ease-out overflow-hidden">
           <!-- Subtle inner glow effects -->
           <div class="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-white/10 blur-[60px] rotate-[30deg] pointer-events-none"></div>
        </div>

        <div class="relative z-20 px-5 pt-7 pb-4 sm:px-8 sm:pt-10 sm:pb-6 lg:px-16 lg:pt-14 lg:pb-28">
           <div class="flex flex-col gap-5 sm:gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span class="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-3 sm:mb-4 shadow-sm">Academic Portal</span>
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2 sm:mb-3 leading-tight drop-shadow-md">
                {{ greeting() }}, <span class="text-red-200">{{ firstName() }}!</span>
              </h1>
              <p class="max-w-lg text-sm md:text-base text-red-100/90 font-medium leading-relaxed">{{ dynamicSubtitle() }}</p>
            </div>
            <button class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/90 backdrop-blur-md border border-white/40 text-red-900 font-black tracking-wider text-xs uppercase hover:bg-white hover:scale-105 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-black/10 active:scale-95 shrink-0 group/btn"
              (click)="router.navigate(['/student/teachers'])">
              <svg class="w-5 h-5 group-hover/btn:-rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              Book New Session
            </button>
          </div>
        </div>

        <!-- ── Stat tiles: inline on mobile, floating on desktop ── -->
        <!-- Mobile/tablet inline (hidden on lg) -->
        <div class="relative z-20 lg:hidden px-4 sm:px-6 pb-5 sm:pb-6">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-2xl bg-white/90 dark:bg-card/80 backdrop-blur-xl shadow-lg border border-white dark:border-white/5 py-4 px-2 flex flex-col items-center justify-center text-center">
              <p class="text-3xl font-black text-gray-900 dark:text-foreground">{{ stats()?.total ?? 0 }}</p>
              <p class="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1.5">Total</p>
            </div>
            <div class="rounded-2xl bg-white/90 dark:bg-card/80 backdrop-blur-xl shadow-lg border border-white dark:border-white/5 py-4 px-2 flex flex-col items-center justify-center text-center">
              <p class="text-3xl font-black text-emerald-600">{{ stats()?.completed ?? 0 }}</p>
              <p class="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1.5">Done</p>
            </div>
            <div class="rounded-2xl bg-white/90 dark:bg-card/80 backdrop-blur-xl shadow-lg border border-white dark:border-white/5 py-4 px-2 flex flex-col items-center justify-center text-center">
              <p class="text-3xl font-black text-blue-600">{{ stats()?.approved ?? 0 }}</p>
              <p class="text-[9px] font-black uppercase tracking-widest text-blue-500 mt-1.5">Approved</p>
            </div>
            <div class="rounded-2xl bg-white/90 dark:bg-card/80 backdrop-blur-xl shadow-lg border border-white dark:border-white/5 py-4 px-2 flex flex-col items-center justify-center text-center">
              <p class="text-3xl font-black text-amber-500">{{ stats()?.pending ?? 0 }}</p>
              <p class="text-[9px] font-black uppercase tracking-widest text-amber-500 mt-1.5">Pending</p>
            </div>
          </div>
        </div>

        <!-- Desktop floating (hidden below lg) -->
        <div class="hidden lg:block absolute left-12 right-12 -bottom-12 z-30">
          <div class="w-full mx-auto grid grid-cols-4 gap-6">
            <div class="rounded-3xl bg-white/70 dark:bg-card/60 backdrop-blur-3xl shadow-xl shadow-red-900/10 border border-white dark:border-white/5 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 hover:bg-white dark:hover:bg-card/80 transition-all duration-500 group/stat cursor-default">
              <p class="text-4xl font-black text-gray-900 dark:text-foreground group-hover/stat:scale-110 transition-transform duration-300">{{ stats()?.total ?? 0 }}</p>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-2">Total Tickets</p>
            </div>
            <div class="rounded-3xl bg-white/70 dark:bg-card/60 backdrop-blur-3xl shadow-xl shadow-emerald-900/10 border border-white dark:border-white/5 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 hover:bg-white dark:hover:bg-card/80 transition-all duration-500 group/stat cursor-default">
              <p class="text-4xl font-black text-emerald-600 group-hover/stat:scale-110 transition-transform duration-300 drop-shadow-sm">{{ stats()?.completed ?? 0 }}</p>
              <p class="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-2">Completed</p>
            </div>
            <div class="rounded-3xl bg-white/70 dark:bg-card/60 backdrop-blur-3xl shadow-xl shadow-blue-900/10 border border-white dark:border-white/5 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 hover:bg-white dark:hover:bg-card/80 transition-all duration-500 group/stat cursor-default">
              <p class="text-4xl font-black text-blue-600 group-hover/stat:scale-110 transition-transform duration-300 drop-shadow-sm">{{ stats()?.approved ?? 0 }}</p>
              <p class="text-[10px] font-black uppercase tracking-widest text-blue-500 mt-2">Approved</p>
            </div>
            <div class="rounded-3xl bg-white/70 dark:bg-card/60 backdrop-blur-3xl shadow-xl shadow-amber-900/10 border border-white dark:border-white/5 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-2 hover:bg-white dark:hover:bg-card/80 transition-all duration-500 group/stat cursor-default">
              <p class="text-4xl font-black text-amber-500 group-hover/stat:scale-110 transition-transform duration-300 drop-shadow-sm">{{ stats()?.pending ?? 0 }}</p>
              <p class="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-2">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Body ─────────────────────────────────────────── -->
      <div class="w-full space-y-8 mt-0 lg:mt-2 relative z-20 pb-20">

        @if (loading()) {
          <div class="space-y-6 animate-pulse">
            <div class="h-32 rounded-[2.5rem] bg-white/50 dark:bg-card/50 border border-white dark:border-white/5"></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="h-64 rounded-[2.5rem] bg-white/50 dark:bg-card/50 border border-white dark:border-white/5 md:col-span-2"></div>
              <div class="h-64 rounded-[2.5rem] bg-white/50 dark:bg-card/50 border border-white dark:border-white/5"></div>
            </div>
          </div>
        }

        @if (!loading()) {

          <!-- ── Next Session Banner ──────────────────────── -->
          @if (nextBooking()) {
            <div class="rounded-[2rem] border border-white dark:border-white/5 bg-white/60 dark:bg-card/60 backdrop-blur-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xl shadow-red-900/5 hover:-translate-y-1 transition-all duration-500">
              <div class="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center shrink-0 shadow-lg shadow-red-900/30">
                <svg class="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0 space-y-1.5">
                <p class="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Incoming Session
                </p>
                <p class="text-xl font-black text-gray-900 dark:text-foreground truncate tracking-tight">{{ nextBooking()!.teacher_name }}</p>
                <p class="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {{ nextBooking()!.scheduled_date | date:'fullDate' }} &nbsp;·&nbsp; {{ nextBooking()!.start_time | timeFormat }}
                  &nbsp;·&nbsp;
                  @if (nextBooking()!.consultation_type === 'ONLINE') {
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 text-[10px] uppercase font-black tracking-widest">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      Online
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 text-[10px] uppercase font-black tracking-widest">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Face-to-Face
                    </span>
                  }
                </p>
              </div>
              <button class="w-full sm:w-auto px-6 py-3 bg-white dark:bg-card/80 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-50 dark:hover:bg-card/100 hover:shadow-md transition-all shadow-sm active:scale-95 shrink-0"
                (click)="router.navigate(['/student/my-bookings'])">
                View Ticket Details
              </button>
            </div>
          }

          <!-- ── Row 1: Table (2/3) + Week (1/3) ─────────── -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Recent Appointments (Raw Table) -->
            <div class="lg:col-span-2 bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 overflow-hidden flex flex-col hover:border-red-100 dark:hover:border-white/10 hover:shadow-red-900/10 transition-all duration-500">
              <div class="p-8 border-b border-white/50 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">Recent Appointments</h2>
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Your last {{ recentBookings().length }} consultation records</p>
                </div>
                <button (click)="router.navigate(['/student/my-bookings'])" class="text-[10px] font-black tracking-widest text-red-700 dark:text-red-400 hover:text-white uppercase flex items-center gap-1.5 transition-all px-4 py-2 bg-white dark:bg-white/5 hover:bg-red-800 dark:hover:bg-red-800 border border-white dark:border-white/5 shadow-sm hover:shadow-lg rounded-xl active:scale-95">
                  View All History
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              <div class="flex-1 overflow-x-auto p-2 sm:p-4 pt-1">
                <table class="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</th>
                      <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (b of recentBookings(); track b.id) {
                      <tr class="border-b border-white dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group cursor-default">
                        <td class="px-6 py-5 rounded-l-2xl">
                          <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/50 text-red-800 dark:text-red-200 flex items-center justify-center font-black text-sm shrink-0 border border-white dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                              {{ b.teacher_name.charAt(0) }}
                            </div>
                            <span class="font-bold text-gray-900 dark:text-foreground group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">{{ b.teacher_name }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-5 text-gray-500 dark:text-gray-400 font-semibold text-xs">{{ b.scheduled_date | date:'MMM d, y' }}</td>
                        <td class="px-6 py-5 text-gray-600 dark:text-gray-300 font-bold text-xs">
                          @if (b.consultation_type === 'ONLINE') {
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50/50 text-blue-700 rounded-lg text-[10px] uppercase font-black tracking-widest">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                              </svg>
                              Online
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50/50 text-emerald-700 rounded-lg text-[10px] uppercase font-black tracking-widest">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              F2F
                            </span>
                          }
                        </td>
                        <td class="px-6 py-5 rounded-r-2xl">
                          <app-status-badge [status]="b.status" />
                        </td>
                      </tr>
                    }
                    @if (recentBookings().length === 0) {
                      <tr>
                        <td colspan="4">
                          <div class="py-20 text-center flex flex-col items-center">
                            <div class="mb-5 w-20 h-20 rounded-[2rem] bg-white dark:bg-card/50 shadow-sm flex items-center justify-center border border-dashed border-gray-200 dark:border-white/10">
                              <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                            <p class="font-black text-gray-900 dark:text-foreground text-base">No appointments yet</p>
                            <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 mb-6">Start by booking your first academic consultation.</p>
                            <button (click)="router.navigate(['/student/teachers'])" class="text-xs font-black uppercase tracking-widest text-white bg-gray-900 dark:bg-white/10 hover:bg-red-800 dark:hover:bg-red-800 hover:scale-105 active:scale-95 px-8 py-3.5 rounded-xl transition-all shadow-md">Browse Directory</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Upcoming This Week -->
            <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 overflow-hidden flex flex-col hover:border-red-100 dark:hover:border-white/10 hover:shadow-red-900/10 transition-all duration-500">
              <div class="p-8 border-b border-white/50 dark:border-white/10">
                <h2 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">This Week</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{{ weekRange() }}</p>
              </div>
              <div class="flex-1 p-4 overflow-y-auto">
                @if (upcomingThisWeek().length === 0) {
                  <div class="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div class="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-card/50 flex items-center justify-center mb-4 border border-white dark:border-white/5 shadow-md">
                      <span class="text-3xl opacity-80">⛵</span>
                    </div>
                    <p class="font-black text-gray-900 dark:text-foreground text-base">All clear!</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">No sessions scheduled this week.</p>
                  </div>
                }
                <div class="space-y-2">
                  @for (b of upcomingThisWeek(); track b.id) {
                    <div class="px-5 py-4 rounded-2xl border border-transparent hover:bg-white dark:hover:bg-white/5 hover:border-white dark:hover:border-white/10 hover:shadow-sm transition-all duration-300 cursor-pointer flex items-center gap-4 group"
                      (click)="router.navigate(['/student/my-bookings'])">
                      <div class="w-12 h-12 rounded-[1rem] flex items-center justify-center text-sm font-black shrink-0 text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/30 border border-white dark:border-white/5 shadow-sm group-hover:scale-110 group-hover:bg-red-800 dark:group-hover:bg-red-800 group-hover:text-white transition-all duration-300">
                        {{ b.teacher_name.charAt(0) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm text-gray-900 dark:text-foreground truncate group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">{{ b.teacher_name }}</p>
                        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{{ b.scheduled_date | date:'EEE, MMM d' }} · {{ b.start_time | timeFormat }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div class="p-4 border-t border-white/50 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md">
                <a routerLink="/student/calendar" class="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-red-800 dark:hover:text-red-400 py-3 transition-colors bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl shadow-sm">
                  Open Master Calendar
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- ── Row 2: Donut (1/3) + Calendar (1/3) + Quick CTA (1/3) ── -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">

            <!-- Status Donut -->
            <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden hover:border-red-100 dark:hover:border-white/10 hover:shadow-red-900/10 transition-all duration-500">
              <h2 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight self-start w-full">Resolution Status</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium self-start w-full mb-10">Overall completion {{ completionRate() }}%</p>
              
              <div class="relative mb-10 group hover:scale-[1.03] transition-transform duration-500">
                <svg class="w-48 h-48 -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" class="text-white stroke-current drop-shadow-sm border-white" stroke-width="4"/>
                  @if (donut().completed > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"
                      [attr.stroke-dasharray]="donut().completed + ' ' + (100 - donut().completed)" stroke-dashoffset="0"/>
                  }
                  @if (donut().approved > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"
                      [attr.stroke-dasharray]="donut().approved + ' ' + (100 - donut().approved)"
                      [attr.stroke-dashoffset]="'-' + donut().completed"/>
                  }
                  @if (donut().pending > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"
                      [attr.stroke-dasharray]="donut().pending + ' ' + (100 - donut().pending)"
                      [attr.stroke-dashoffset]="'-' + (donut().completed + donut().approved)"/>
                  }
                  @if (donut().cancelled > 0) {
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round"
                      [attr.stroke-dasharray]="donut().cancelled + ' ' + (100 - donut().cancelled)"
                      [attr.stroke-dashoffset]="'-' + (donut().completed + donut().approved + donut().pending)"/>
                  }
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/30 dark:bg-black/30 backdrop-blur-[2px] rounded-full m-[10px]">
                  <p class="text-4xl font-black text-gray-900 dark:text-foreground drop-shadow-sm">{{ completionRate() }}%</p>
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Yield</p>
                </div>
              </div>
              
              <div class="w-full space-y-3 px-4">
                @for (item of donutLegend(); track item.label) {
                  <div class="flex items-center justify-between text-xs font-semibold">
                    <div class="flex items-center gap-3">
                      <span class="w-4 h-4 rounded-xl shrink-0 shadow-inner border border-white dark:border-white/5" [style.background]="item.color"></span>
                      <span class="text-gray-600 dark:text-gray-300 font-bold">{{ item.label }}</span>
                    </div>
                    <span class="font-black text-gray-900 dark:text-foreground text-sm">{{ item.value }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Mini Calendar -->
            <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 flex flex-col hover:border-red-100 dark:hover:border-white/10 hover:shadow-red-900/10 transition-all duration-500">
              <div class="p-8 pb-4 border-b border-white/50 dark:border-white/10">
                <h2 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">Timeline</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ currentMonthName() }}</p>
              </div>
              <div class="px-6 pt-4 flex-1">
                <div class="grid grid-cols-7 gap-1 mb-2">
                  @for (d of ['S','M','T','W','T','F','S']; track $index) {
                    <div class="text-center text-[10px] font-black text-gray-400 dark:text-gray-500 py-2">{{ d }}</div>
                  }
                  @for (pad of calendarPadding(); track $index) { <div></div> }
                  @for (day of calendarDays(); track day.date) {
                    <div class="aspect-square flex items-center justify-center rounded-xl text-[11px] font-bold relative transition-colors"
                      [class.bg-red-800]="day.isToday"
                      [class.text-white]="day.isToday"
                      [class.text-gray-700]="!day.isToday && !day.hasBooking" [class.dark:text-gray-300]="!day.isToday && !day.hasBooking"
                      [class.text-red-900]="!day.isToday && day.hasBooking" [class.dark:text-red-400]="!day.isToday && day.hasBooking"
                      [class.bg-white]="!day.isToday && day.hasBooking" [class.dark:bg-white/10]="!day.isToday && day.hasBooking"
                      [class.shadow-md]="day.isToday || day.hasBooking"
                      [class.border]="day.hasBooking && !day.isToday"
                      [class.border-white]="day.hasBooking && !day.isToday" [class.dark:border-white/5]="day.hasBooking && !day.isToday">
                      {{ day.date }}
                      @if (day.hasBooking && !day.isToday) {
                        <span class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500"></span>
                      }
                    </div>
                  }
                </div>
              </div>
              <div class="p-6 pt-2">
                <div class="grid grid-cols-2 gap-4 mt-2">
                  <div class="rounded-2xl bg-white dark:bg-card/50 shadow-sm border border-gray-100 dark:border-white/5 p-4 text-center hover:-translate-y-1 transition-transform">
                    <p class="text-2xl font-black text-gray-900 dark:text-foreground">{{ thisMonthCount() }}</p>
                    <p class="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">This Month</p>
                  </div>
                  <div class="rounded-2xl bg-red-800 shadow-md shadow-red-900/20 border border-red-700 p-4 text-center hover:-translate-y-1 transition-transform">
                    <p class="text-2xl font-black text-white">{{ upcomingCount() }}</p>
                    <p class="text-[9px] font-black text-red-200 uppercase tracking-widest mt-1">Upcoming</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions CTA -->
            <div class="sm:col-span-2 lg:col-span-1 rounded-[2.5rem] bg-gray-900/90 backdrop-blur-3xl p-6 sm:p-8 flex flex-col shadow-2xl shadow-gray-900/20 border border-gray-700 relative overflow-hidden group/cta hover:border-gray-600 transition-all duration-500">
               <!-- Decorative elements -->
               <div class="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-[40px] pointer-events-none group-hover/cta:scale-110 transition-transform duration-700"></div>
               <div class="absolute -left-12 -bottom-12 w-48 h-48 bg-red-600/10 rounded-full blur-[50px] pointer-events-none group-hover/cta:bg-red-500/20 transition-colors duration-700"></div>
               
               <h2 class="text-xl font-black text-white tracking-tight relative z-10 flex items-center gap-2">
                 <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                 </svg>
                 Command Center
               </h2>
               <p class="text-xs text-gray-400 font-medium mb-8 relative z-10 mt-1">Fast navigation portals</p>
               
               <div class="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                 <button class="w-full flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 p-4 text-left group active:scale-95 shadow-lg shadow-black/20"
                   (click)="router.navigate(['/student/teachers'])">
                   <div class="w-12 h-12 rounded-[1rem] bg-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-white/5">
                     <svg class="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                     </svg>
                   </div>
                   <div>
                     <p class="text-sm font-black text-white tracking-wide">Book a Session</p>
                     <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Find an Instructor</p>
                   </div>
                 </button>
                 
                 <button class="w-full flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 p-4 text-left group active:scale-95 shadow-lg shadow-black/20"
                   (click)="router.navigate(['/student/my-bookings'])">
                   <div class="w-12 h-12 rounded-[1rem] bg-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-white/5">
                     <svg class="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                     </svg>
                   </div>
                   <div>
                     <p class="text-sm font-black text-white tracking-wide">My Appointments</p>
                     <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">View all tickets</p>
                   </div>
                 </button>
                 
                 <button class="w-full flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 p-4 text-left group active:scale-95 shadow-lg shadow-black/20"
                   (click)="router.navigate(['/student/calendar'])">
                   <div class="w-12 h-12 rounded-[1rem] bg-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-white/5">
                     <svg class="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                     </svg>
                   </div>
                   <div>
                     <p class="text-sm font-black text-white tracking-wide">Calendar</p>
                     <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Monthly overview</p>
                   </div>
                 </button>
               </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class StudentDashboardComponent implements OnInit {
  private api = inject(ApiService)
  private auth = inject(AuthService)
  router = inject(Router)

  loading = signal(true)
  stats = signal<StudentStats | null>(null)
  bookings = signal<Booking[]>([])
  recentBookings = signal<Booking[]>([])

  ngOnInit(): void {
    this.api.getBookings().subscribe({
      next: res => {
        const b = res.data
        this.bookings.set(b)
        // Sort descending by date & time implicitly via ID or Date string
        const sorted = [...b].sort((x, y) => {
          const dX = x.scheduled_date + 'T' + x.start_time
          const dY = y.scheduled_date + 'T' + y.start_time
          return dY.localeCompare(dX)
        })
        
        this.recentBookings.set(sorted.slice(0, 5))
        this.stats.set({
          total: b.length,
          pending: b.filter(x => x.status === 'PENDING').length,
          approved: b.filter(x => x.status === 'APPROVED').length,
          completed: b.filter(x => x.status === 'COMPLETED').length,
          cancelled: b.filter(x => x.status === 'CANCELLED').length,
        })
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  firstName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Student'
  }

  greeting(): string {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  dynamicSubtitle(): string {
    const s = this.stats()
    if (!s) return 'Welcome back to your academic portal.'
    if (this.nextBooking()) return 'You have an incoming session scheduled. Make sure to prepare!'
    if (s.pending > 0) return `Waiting on ${s.pending} consultation ${s.pending === 1 ? 'request' : 'requests'} to be approved.`
    if (s.total === 0) return 'Ready for your first consultation? Book an instructor today.'
    return "You're all caught up! Take a breather or safely book a new session."
  }

  nextBooking(): Booking | null {
    if (!this.stats()) return null
    // Ideally find the *closest upcoming* APPROVED booking, not just the first one
    const nowStr = new Date().toISOString().split('T')[0]
    const upcoming = this.bookings()
       .filter(b => b.status === 'APPROVED' && b.scheduled_date.split('T')[0] >= nowStr)
       .sort((a,b) => (a.scheduled_date + 'T' + a.start_time).localeCompare(b.scheduled_date + 'T' + b.start_time))
    return upcoming[0] ?? null
  }

  completionRate(): number {
    const s = this.stats()
    if (!s || s.total === 0) return 0
    return Math.round((s.completed / s.total) * 100)
  }

  donut() {
    const s = this.stats()
    if (!s || s.total === 0) return { completed: 0, approved: 0, pending: 0, cancelled: 0 }
    const t = s.total
    return {
      completed: Math.round((s.completed / t) * 100),
      approved: Math.round((s.approved / t) * 100),
      pending: Math.round((s.pending / t) * 100),
      cancelled: Math.round((s.cancelled / t) * 100),
    }
  }

  donutLegend() {
    const s = this.stats()
    if (!s) return []
    return [
      { label: 'Completed', value: s.completed, color: '#10b981' },
      { label: 'Approved', value: s.approved, color: '#3b82f6' },
      { label: 'Pending', value: s.pending, color: '#f59e0b' },
      { label: 'Cancelled', value: s.cancelled, color: '#ef4444' },
    ]
  }

  currentMonthName(): string {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  calendarPadding(): number[] {
    const d = new Date(); d.setDate(1)
    return Array(d.getDay()).fill(0)
  }

  calendarDays(): { date: number; isToday: boolean; hasBooking: boolean }[] {
    const today = new Date()
    const year = today.getFullYear(); const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const pad = (n: number) => String(n).padStart(2, '0')
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
      return {
        date: day,
        isToday: day === today.getDate(),
        hasBooking: this.bookings().some(b => b.scheduled_date.split('T')[0] === dateStr),
      }
    })
  }

  thisMonthCount(): number {
    const today = new Date()
    const prefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    return this.bookings().filter(b => b.scheduled_date.startsWith(prefix)).length
  }

  upcomingCount(): number {
    const nowStr = new Date().toISOString().split('T')[0]
    return this.bookings().filter(b => (b.status === 'APPROVED' || b.status === 'PENDING') && b.scheduled_date.split('T')[0] >= nowStr).length
  }

  upcomingThisWeek(): Booking[] {
    const today = new Date(); const todayDay = today.getDay()
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - todayDay); weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7)
    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const startStr = fmt(weekStart); const endStr = fmt(weekEnd)
    return this.bookings()
      .filter(b => {
        const ds = b.scheduled_date.split('T')[0]
        return (b.status === 'APPROVED' || b.status === 'PENDING') && ds >= startStr && ds < endStr
      })
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.start_time.localeCompare(b.start_time))
      .slice(0, 5)
  }

  weekRange(): string {
    const today = new Date(); const todayDay = today.getDay()
    const mon = new Date(today); mon.setDate(today.getDate() - todayDay + 1)
    const sun = new Date(today); sun.setDate(today.getDate() - todayDay + 7)
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${mon.toLocaleDateString('en-US', opts)} – ${sun.toLocaleDateString('en-US', opts)}`
  }
}
