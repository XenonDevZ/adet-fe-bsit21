import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresenceService } from '../../../core/services/presence.service';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import type { Booking, BookingStatus } from '../../../core/models/index';

import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TimeFormatPipe],
  template: `
    <div class="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in zoom-in-95 duration-500">

      <!-- ── ELEVATED HERO GREETING ── -->
      <div class="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xl border border-white/10 group">
        
        <!-- Ambient Background Sweeps -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-red-400/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
          <div>
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-3 sm:mb-4 shadow-sm">
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 box-shadow-glow"></span>
               Teacher Dashboard
            </span>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              {{ greeting() }}, <span class="bg-gradient-to-r from-red-200 to-white bg-clip-text text-transparent">{{ firstName() }}!</span>
            </h2>
            <p class="text-red-100 font-medium text-base sm:text-lg flex items-center gap-2">
              <svg class="w-5 h-5 opacity-75 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ dynamicSubtitle() }}
            </p>
          </div>

          <!-- Quick actions -->
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <a routerLink="/teacher/bookings"
              class="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-black uppercase tracking-widest px-5 sm:px-6 py-3.5 sm:py-4 rounded-[1.25rem] transition-all backdrop-blur-sm active:scale-95 shadow-lg relative overflow-hidden group/btn">
              <div class="absolute inset-x-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent top-0 group-hover/btn:opacity-100 opacity-50 transition-opacity"></div>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              All Requests
            </a>
            <a routerLink="/teacher/schedule"
              class="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-900 text-[11px] font-black uppercase tracking-widest px-5 sm:px-6 py-3.5 sm:py-4 rounded-[1.25rem] transition-all shadow-xl active:scale-95 border border-white group/btn2">
              <svg class="w-5 h-5 group-hover/btn2:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Manage Schedule
            </a>
          </div>
        </div>
      </div>

      <!-- ── GLASSMORPHIC STAT CARDS ── -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white/80 dark:bg-card rounded-[2rem] p-6 animate-pulse h-32 border border-white dark:border-white/5 shadow-xl dark:shadow-none"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          @for (card of statCards(); track card.label) {
            <div class="bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[2rem] p-6 border border-white dark:border-white/5 shadow-xl shadow-red-900/5 dark:shadow-none hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="flex items-center justify-between mb-4 relative z-10">
                <div class="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-sm" [class]="card.iconBg">
                  <svg class="w-6 h-6" [class]="card.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" [attr.d]="card.icon"/>
                  </svg>
                </div>
                @if (card.badge) {
                  <span class="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl shadow-sm" [class]="card.badgeClass">
                    {{ card.badge }}
                  </span>
                }
              </div>
              <p class="text-[2rem] font-black leading-none drop-shadow-sm relative z-10" [class]="card.valueColor">{{ card.value }}</p>
              <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest relative z-10">{{ card.label }}</p>
            </div>
          }
        </div>
      }

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">

        <!-- ── TODAY'S SCHEDULE ── -->
        <div class="xl:col-span-2 bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-none border border-white dark:border-white/5 overflow-hidden flex flex-col hover:shadow-red-900/10 dark:hover:border-white/10 transition-all duration-500 min-h-[400px]">
          <div class="h-1.5 w-full bg-gradient-to-r from-red-900 via-red-800 to-red-500"></div>
          <div class="p-8 flex-1">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="text-2xl font-black text-gray-900 dark:text-foreground tracking-tight">Today's Schedule</h3>
                <p class="text-xs text-gray-400 dark:text-gray-500 font-bold mt-1 uppercase tracking-widest">{{ todayLabel() }}</p>
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                {{ todayBookings().length }} session{{ todayBookings().length !== 1 ? 's' : '' }}
              </span>
            </div>

            @if (loading()) {
              <div class="space-y-4 animate-pulse">
                @for (i of [1,2]; track i) {
                  <div class="h-20 bg-gray-100 dark:bg-white/5 rounded-[1.25rem]"></div>
                }
              </div>
            } @else if (todayBookings().length === 0) {
              <div class="py-16 flex flex-col items-center justify-center text-center">
                <div class="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner border border-gray-100 dark:border-white/10">
                  <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <p class="font-black text-gray-900 dark:text-gray-300 text-lg mb-1">No sessions today</p>
                <p class="text-sm font-medium text-gray-400 dark:text-gray-500 max-w-xs">Enjoy your free day or update your schedule options!</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (b of todayBookings(); track b.id) {
                  <div class="flex items-center gap-5 p-5 rounded-[1.5rem] bg-white dark:bg-[#1e1f22] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                    (click)="goToBookings()">
                    <div class="w-14 h-14 rounded-[1.25rem] flex-shrink-0 flex items-center justify-center font-black text-lg shadow-inner bg-gradient-to-br"
                      [class.from-emerald-100]="b.status === 'APPROVED'" [class.to-emerald-50]="b.status === 'APPROVED'"
                      [class.text-emerald-700]="b.status === 'APPROVED'"
                      [class.from-blue-100]="b.status === 'COMPLETED'" [class.to-blue-50]="b.status === 'COMPLETED'"
                      [class.text-blue-700]="b.status === 'COMPLETED'">
                      {{ b.student_name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-gray-900 dark:text-gray-200 text-base truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{{ b.student_name }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <p class="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{{ b.start_time | timeFormat }} – {{ b.end_time | timeFormat }}</p>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                       <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border"
                          [class.bg-blue-50]="b.consultation_type === 'ONLINE'" [class.dark:bg-blue-900/20]="b.consultation_type === 'ONLINE'"
                          [class.text-blue-700]="b.consultation_type === 'ONLINE'" [class.dark:text-blue-400]="b.consultation_type === 'ONLINE'" [class.border-blue-100]="b.consultation_type === 'ONLINE'" [class.dark:border-blue-900/50]="b.consultation_type === 'ONLINE'"
                          [class.bg-gray-50]="b.consultation_type === 'FACE_TO_FACE'" [class.dark:bg-white/5]="b.consultation_type === 'FACE_TO_FACE'" [class.border-gray-200]="b.consultation_type === 'FACE_TO_FACE'" [class.dark:border-white/10]="b.consultation_type === 'FACE_TO_FACE'"
                          [class.text-gray-700]="b.consultation_type === 'FACE_TO_FACE'" [class.dark:text-gray-300]="b.consultation_type === 'FACE_TO_FACE'">
                          @if (b.consultation_type === 'ONLINE') {
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            Online
                          } @else {
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            In-person
                          }
                       </span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- ── PENDING APPROVALS PANEL ── -->
        <div class="bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-none border border-white dark:border-white/5 overflow-hidden flex flex-col hover:shadow-red-900/10 dark:hover:border-white/10 transition-all duration-500">
          <div class="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-400"></div>
          <div class="p-8 flex-1 flex flex-col">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">Action Needed</h3>
              @if (pendingBookings().length > 0) {
                <span class="w-8 h-8 flex items-center justify-center text-[11px] font-black bg-amber-100 text-amber-700 rounded-xl shadow-sm border border-amber-200 animate-pulse">
                  {{ pendingBookings().length }}
                </span>
              }
            </div>

            @if (loading()) {
              <div class="space-y-4 animate-pulse flex-1">
                @for (i of [1,2,3]; track i) {
                  <div class="h-24 bg-gray-100 dark:bg-white/5 rounded-[1.25rem]"></div>
                }
              </div>
            } @else if (pendingBookings().length === 0) {
              <div class="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div class="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/10 rounded-[1.5rem] flex items-center justify-center mb-5 shadow-inner border border-emerald-100 dark:border-emerald-900/20">
                  <svg class="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p class="font-black text-gray-900 dark:text-gray-300 text-lg mb-1">Queue is empty</p>
                <p class="text-sm font-medium text-gray-400 dark:text-gray-500">No pending requests require attention.</p>
              </div>
             } @else {
              <div class="space-y-4 overflow-y-auto pr-2 max-h-[22rem] flex-1">
                @for (b of pendingBookings(); track b.id) {
                  <div class="p-4 rounded-[1.25rem] border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:shadow-sm dark:hover:shadow-none transition-all group">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-sm font-black flex-shrink-0 shadow-inner border border-amber-200 dark:border-amber-900/50">
                        {{ b.student_name.charAt(0) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-bold text-gray-900 dark:text-gray-200 text-sm truncate">{{ b.student_name }}</p>
                        <p class="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-0.5">
                          {{ b.scheduled_date | date:'MMM d' }} · {{ b.start_time | timeFormat }}
                        </p>
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <button (click)="quickApprove(b.id)"
                        [disabled]="acting() === b.id"
                        class="flex-1 text-[10px] uppercase tracking-widest font-black bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-200 disabled:text-gray-400 text-white py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-emerald-500/20">
                        @if (acting() === b.id) { ... } @else { Approve }
                      </button>
                      <button (click)="quickReject(b.id)"
                        [disabled]="acting() === b.id"
                        class="flex-1 text-[10px] uppercase tracking-widest font-black bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 text-red-700 dark:text-red-400 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm dark:shadow-none">
                        Reject
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- View all link -->
            <a routerLink="/teacher/bookings"
              class="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-red-800 dark:hover:text-red-400 transition-colors pt-5 border-t border-gray-100 dark:border-white/5 focus:outline-none group/link">
              Review all requests
              <svg class="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- ── WEEKLY ACTIVITY CHART ── -->
      <div class="bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[2.5rem] shadow-2xl dark:shadow-none border border-white dark:border-white/5 p-8 lg:p-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">Weekly Activity</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Consultations scheduled this week</p>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-red-900 bg-red-50 px-4 py-2 rounded-xl border border-red-100 shadow-sm">
            {{ weeklyTotal() }} total this week
          </span>
        </div>

        <!-- CSS Bar Chart -->
        <div class="flex items-end gap-1.5 sm:gap-4 h-40 sm:h-48 mt-4 overflow-x-auto pb-1">
          @for (day of weeklyActivity(); track day.label) {
            <div class="flex-1 flex flex-col items-center gap-3 relative group">
              <!-- Tooltip style count -->
              <span class="text-xs font-black text-white bg-gray-900 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 pointer-events-none shadow-xl transform group-hover:-translate-y-1">{{ day.count }}</span>
              
                <div class="w-full max-w-[3rem] rounded-t-[1rem] transition-all duration-700 ease-out relative overflow-hidden flex-1 flex flex-col justify-end"
                [class.bg-gradient-to-t]="day.count > 0"
                [class.from-red-900]="day.isToday && day.count > 0" [class.to-red-600]="day.isToday && day.count > 0"
                [class.from-red-100]="!day.isToday && day.count > 0" [class.to-red-50]="!day.isToday && day.count > 0"
                [class.dark:from-red-900/50]="!day.isToday && day.count > 0" [class.dark:to-red-900/20]="!day.isToday && day.count > 0"
                [class.bg-gray-50]="day.count === 0" [class.dark:bg-[#1e1f22]]="day.count === 0" [class.border]="day.count === 0" [class.border-gray-100]="day.count === 0" [class.dark:border-white/5]="day.count === 0">
                <div class="w-full bg-transparent transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                     [style.height]="day.height">
                  @if (day.isToday && day.count > 0) {
                    <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                  }
                </div>
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest mt-1"
                [class.text-red-800]="day.isToday"
                [class.text-gray-400]="!day.isToday">
                {{ day.label }}
              </span>
            </div>
          }
        </div>
        <div class="flex items-center gap-6 mt-8 pt-6 border-t border-gray-100 dark:border-white/5 justify-center sm:justify-start">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-md bg-gradient-to-br from-red-900 to-red-600 shadow-inner"></div>
            <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Today</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-md bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/50 dark:to-red-900/20 border border-red-100 dark:border-red-900/50 shadow-inner dark:shadow-none"></div>
            <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Past/Upcoming</span>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class TeacherDashboardComponent implements OnInit {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private router = inject(Router);

  bookings = signal<Booking[]>([]);
  loading  = signal(true);
  acting   = signal<number | null>(null);

  presence = inject(PresenceService);

  ngOnInit(): void {
    this.load();
    this.presence.refreshEvents.subscribe(() => {
      this.load();
    });
  }

  load(): void {
    this.api.getBookings().subscribe({
      next: (res) => { this.bookings.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  firstName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? 'Teacher';
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  dynamicSubtitle(): string {
    const p = this.pendingBookings().length;
    const t = this.todayBookings().length;
    if (p > 0) return `You have ${p} pending ${p === 1 ? 'request' : 'requests'} waiting for your approval.`;
    if (t > 0) return `You have ${t} scheduled ${t === 1 ? 'session' : 'sessions'} today. Have a productive day!`;
    return "You're all clear — no pending requests or sessions today!";
  }

  todayLabel(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  todayBookings = computed(() => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    return this.bookings()
      .filter(b => b.status === 'APPROVED' && b.scheduled_date.split('T')[0] === todayStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  pendingBookings = computed(() =>
    this.bookings().filter(b => b.status === 'PENDING')
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
  );

  statCards = computed(() => {
    const b = this.bookings();
    const pending   = b.filter(x => x.status === 'PENDING').length;
    const approved  = b.filter(x => x.status === 'APPROVED').length;
    const completed = b.filter(x => x.status === 'COMPLETED').length;
    const total     = b.length;
    return [
      {
        label: 'Total Requests', value: total, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        iconBg: 'bg-gray-100 dark:bg-white/10', iconColor: 'text-gray-600 dark:text-gray-300', valueColor: 'text-gray-900 dark:text-foreground',
        badge: null, badgeClass: '',
      },
      {
        label: 'Pending', value: pending, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        iconBg: 'bg-yellow-50 dark:bg-yellow-900/20', iconColor: 'text-yellow-600 dark:text-yellow-400', valueColor: 'text-yellow-600 dark:text-yellow-400',
        badge: pending > 0 ? 'Action needed' : null, badgeClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
      },
      {
        label: 'Approved', value: approved, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400', valueColor: 'text-blue-600 dark:text-blue-400',
        badge: null, badgeClass: '',
      },
      {
        label: 'Completed', value: completed, icon: 'M5 13l4 4L19 7',
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400', valueColor: 'text-emerald-600 dark:text-emerald-400',
        badge: null, badgeClass: '',
      },
    ];
  });

  weeklyActivity = computed(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const todayDay = today.getDay();

    // Get start of current week (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - todayDay);

    const counts = days.map((label, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const pad = (n: number) => String(n).padStart(2, '0');
      const dayStr = `${day.getFullYear()}-${pad(day.getMonth()+1)}-${pad(day.getDate())}`;
      const count = this.bookings().filter(b => b.scheduled_date.split('T')[0] === dayStr).length;
      return { label, count, isToday: i === todayDay };
    });

    const max = Math.max(...counts.map(d => d.count), 1);
    return counts.map(d => ({
      ...d,
      height: d.count === 0 ? '4px' : `${Math.max(16, Math.round((d.count / max) * 140))}px`,
    }));
  });

  weeklyTotal = computed(() => this.weeklyActivity().reduce((s, d) => s + d.count, 0));

  quickApprove(id: number): void {
    this.acting.set(id);
    this.api.updateBookingStatus(id, 'APPROVED').subscribe({
      next: () => { this.acting.set(null); this.load(); },
      error: () => this.acting.set(null),
    });
  }

  quickReject(id: number): void {
    this.acting.set(id);
    this.api.updateBookingStatus(id, 'CANCELLED').subscribe({
      next: () => { this.acting.set(null); this.load(); },
      error: () => this.acting.set(null),
    });
  }

  goToBookings(): void {
    this.router.navigate(['/teacher/bookings']);
  }
}
