import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import type { Booking } from '../../../core/models/index';

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
@Component({
  selector: 'app-student-calendar',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe],
  template: `
    <div class="min-h-screen pb-12 animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-gray-900 dark:text-foreground relative">
      
      <!-- ── Floating Hero Header ── -->
      <div class="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-red-900/20 overflow-hidden mb-8 group">
         <!-- Dynamic light beam -->
         <div class="absolute top-0 left-[-20%] w-[50%] h-full bg-white/10 blur-[60px] -skew-x-12 transform group-hover:translate-x-[300%] transition-transform duration-1000"></div>
         <!-- Ambient Glow -->
         <div class="absolute -right-20 -top-20 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span class="inline-block px-3 py-1 bg-white/20 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-4 shadow-inner backdrop-blur-md">Schedule</span>
            <h2 class="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-md">My Calendar</h2>
            <p class="text-sm font-medium text-red-100/90 leading-relaxed max-w-xl">
              Track and manage your upcoming consultations easily inside the temporal matrix.
            </p>
          </div>
          
          <!-- Controls -->
          <div class="flex items-center gap-3">
            <button (click)="goToToday()"
              class="px-5 py-2.5 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-white rounded-xl hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] dark:hover:shadow-white/5 transition-all active:scale-95">
              Today
            </button>
            <div class="flex items-center bg-white/90 dark:bg-card/90 backdrop-blur-xl rounded-xl border border-white/50 dark:border-white/5 shadow-xl overflow-hidden p-1">
              <button (click)="prevMonth()" class="p-2.5 text-red-900 dark:text-red-400 hover:text-white dark:hover:text-white hover:bg-red-800 dark:hover:bg-red-800 rounded-lg transition-all active:scale-95">
                <svg class="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div class="px-5 py-1.5 min-w-[170px] text-center font-black text-gray-900 dark:text-foreground text-[13px] tracking-wider uppercase">
                {{ currentMonthName() }} <span class="text-red-800 dark:text-red-400">{{ currentYear() }}</span>
              </div>
              <button (click)="nextMonth()" class="p-2.5 text-red-900 dark:text-red-400 hover:text-white dark:hover:text-white hover:bg-red-800 dark:hover:bg-red-800 rounded-lg transition-all active:scale-95">
                <svg class="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Calendar Glass Container ── -->
      <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[3rem] shadow-xl shadow-red-900/5 border border-white dark:border-white/5 overflow-hidden p-2 sm:p-4 mb-8">
          
        <!-- Desktop/Tablet Grid View (hidden on very small mobile) -->
        <div class="hidden sm:block overflow-x-auto rounded-[2rem] border border-white/50 dark:border-white/5 bg-white/30 dark:bg-white/5 backdrop-blur-sm">
          <div class="min-w-[700px]">
            <!-- Days of week -->
            <div class="grid grid-cols-7 border-b border-white/50 dark:border-white/10 bg-white/40 dark:bg-card/40">
              @for (day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track day) {
                <div class="py-4 px-2 text-center text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {{ day }}
                </div>
              }
            </div>

            @if (loading()) {
              <div class="h-[600px] flex items-center justify-center">
                 <div class="flex flex-col items-center gap-4">
                   <div class="relative w-16 h-16 flex items-center justify-center">
                     <div class="absolute inset-0 bg-red-900 rounded-full blur-[20px] animate-pulse opacity-20"></div>
                     <svg class="animate-spin w-10 h-10 text-red-800 dark:text-red-400 relative z-10" fill="none" viewBox="0 0 24 24">
                       <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                       <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                     </svg>
                   </div>
                   <span class="text-xs font-black uppercase tracking-widest text-red-800 dark:text-red-400 animate-pulse bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white dark:border-white/5">Calculating Temporal Data</span>
                 </div>
              </div>
            } @else {
              <!-- Calendar Grid -->
              <div class="grid grid-cols-7 auto-rows-fr" role="grid">
                @for (day of calendarDays(); track day.date.getTime()) {
                  <div 
                    class="min-h-[140px] lg:min-h-[160px] p-3 border-b border-r border-white/40 dark:border-white/5 transition-all duration-500 relative group/cell"
                    role="gridcell"
                    [tabindex]="day.isCurrentMonth ? 0 : -1"
                    [class.bg-white/20]="!day.isCurrentMonth" [class.dark:bg-white/0]="!day.isCurrentMonth"
                    [class.bg-white/60]="day.isCurrentMonth" [class.dark:bg-white/5]="day.isCurrentMonth"
                    [class.hover:bg-white]="day.isCurrentMonth" [class.dark:hover:bg-card]="day.isCurrentMonth"
                    [class.hover:shadow-[inset_0_0_30px_rgba(153,27,27,0.03)]]="day.isCurrentMonth" [class.dark:hover:shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]]="day.isCurrentMonth"
                    (click)="onDayClick(day)">
                    
                    <!-- Plus Icon on Hover (for future dates to add booking) -->
                    @if (isFutureOrToday(day.date) && day.isCurrentMonth) {
                      <div class="absolute top-3 right-3 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300 z-10">
                        <button class="w-8 h-8 flex items-center justify-center rounded-[1rem] bg-white/90 dark:bg-card/90 text-red-800 dark:text-red-400 hover:bg-red-800 dark:hover:bg-red-500 hover:text-white shadow-lg shadow-red-900/10 dark:shadow-white/5 transition-all active:scale-95 border border-white dark:border-white/5" title="Book Consultation">
                          <svg class="w-4 h-4 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                          </svg>
                        </button>
                      </div>
                    }

                    <!-- Date Number -->
                    <div class="flex items-center justify-between mb-3">
                      <span 
                        class="flex items-center justify-center w-8 h-8 rounded-[1rem] text-sm font-black shadow-sm transition-colors duration-300"
                        [class.bg-gradient-to-br]="day.isToday"
                        [class.from-red-900]="day.isToday" [class.dark:from-red-700]="day.isToday"
                        [class.to-red-700]="day.isToday" [class.dark:to-red-500]="day.isToday"
                        [class.text-white]="day.isToday"
                        [class.shadow-red-900/30]="day.isToday"
                        [class.bg-white]="!day.isToday && day.isCurrentMonth" [class.dark:bg-card]="!day.isToday && day.isCurrentMonth"
                        [class.border]="!day.isToday"
                        [class.border-white]="!day.isToday && day.isCurrentMonth" [class.dark:border-white/5]="!day.isToday && day.isCurrentMonth"
                        [class.border-transparent]="!day.isToday && !day.isCurrentMonth"
                        [class.text-gray-900]="!day.isToday && day.isCurrentMonth" [class.dark:text-foreground]="!day.isToday && day.isCurrentMonth"
                        [class.text-gray-400]="!day.isCurrentMonth" [class.dark:text-gray-500]="!day.isCurrentMonth">
                        {{ day.date.getDate() }}
                      </span>
                    </div>

                    <!-- Bookings -->
                    <div class="flex flex-col gap-2 relative z-0">
                      <!-- Show max 3 bookings to prevent overflow -->
                      @for (b of day.bookings.slice(0, 3); track b.id) {
                        <div (click)="goToBooking(b.id, $event)"
                          class="px-2.5 py-2 rounded-[1rem] border backdrop-blur-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 relative overflow-hidden group/booking"
                          [class.bg-amber-50/80]="b.status === 'PENDING'" [class.dark:bg-amber-900/20]="b.status === 'PENDING'"
                          [class.border-amber-200/50]="b.status === 'PENDING'" [class.dark:border-amber-900/50]="b.status === 'PENDING'"
                          
                          [class.bg-blue-50/80]="b.status === 'APPROVED'" [class.dark:bg-blue-900/20]="b.status === 'APPROVED'"
                          [class.border-blue-200/50]="b.status === 'APPROVED'" [class.dark:border-blue-900/50]="b.status === 'APPROVED'"
                          
                          [class.bg-emerald-50/80]="b.status === 'COMPLETED'" [class.dark:bg-emerald-900/20]="b.status === 'COMPLETED'"
                          [class.border-emerald-200/50]="b.status === 'COMPLETED'" [class.dark:border-emerald-900/50]="b.status === 'COMPLETED'"
                          
                          [class.bg-gray-50/80]="b.status === 'CANCELLED'" [class.dark:bg-white/5]="b.status === 'CANCELLED'"
                          [class.border-white]="b.status === 'CANCELLED'" [class.dark:border-white/5]="b.status === 'CANCELLED'"
                          [class.opacity-60]="b.status === 'CANCELLED'">
                          
                          <p class="text-[10px] font-black leading-tight flex items-center justify-between relative z-10"
                            [class.text-amber-800]="b.status === 'PENDING'" [class.dark:text-amber-400]="b.status === 'PENDING'"
                            [class.text-blue-800]="b.status === 'APPROVED'" [class.dark:text-blue-400]="b.status === 'APPROVED'"
                            [class.text-emerald-800]="b.status === 'COMPLETED'" [class.dark:text-emerald-400]="b.status === 'COMPLETED'"
                            [class.text-gray-500]="b.status === 'CANCELLED'" [class.dark:text-gray-400]="b.status === 'CANCELLED'">
                            <span>{{ b.start_time | timeFormat }}</span>
                            <span *ngIf="b.status === 'APPROVED'" class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse"></span>
                          </p>
                          <p class="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate mt-1 relative z-10 group-hover/booking:text-gray-900 dark:group-hover/booking:text-white transition-colors">
                            {{ b.teacher_name }}
                          </p>
                        </div>
                      }
                      
                      @if (day.bookings.length > 3) {
                        <div class="flex items-center justify-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-red-800 dark:hover:text-red-400 cursor-pointer text-center bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-lg py-1 border border-white dark:border-white/5 hover:border-red-100 dark:hover:border-red-900/50 hover:shadow-sm transition-all"
                             (click)="onMoreClick(day, $event)">
                          <span>+ {{ day.bookings.length - 3 }}</span>
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                      }
                    </div>

                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Mobile List View (visible only on small screens) -->
        <div class="sm:hidden">
          @if (loading()) {
             <div class="h-64 flex items-center justify-center">
                <div class="flex flex-col items-center gap-4">
                   <div class="relative w-16 h-16 flex items-center justify-center">
                     <div class="absolute inset-0 bg-red-900 rounded-full blur-[20px] animate-pulse opacity-20"></div>
                     <svg class="animate-spin w-10 h-10 text-red-800 relative z-10" fill="none" viewBox="0 0 24 24">
                       <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                       <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                     </svg>
                   </div>
                </div>
             </div>
          } @else {
            <div class="divide-y divide-white/50 dark:divide-white/10">
              @for (day of calendarDays(); track day.date.getTime()) {
                @if (day.isCurrentMonth && day.bookings.length > 0) {
                  <div class="p-4" [class.bg-red-50/50]="day.isToday" [class.dark:bg-red-900/20]="day.isToday" [class.rounded-2xl]="day.isToday" [class.border]="day.isToday" [class.border-red-100]="day.isToday" [class.dark:border-red-900/50]="day.isToday">
                    <h3 class="text-xs font-black text-gray-900 dark:text-foreground mb-3 flex items-center gap-3">
                      <span class="flex items-center justify-center w-8 h-8 rounded-[1rem] text-[11px] font-bold shadow-sm"
                            [class.bg-gradient-to-br]="day.isToday" [class.from-red-900]="day.isToday" [class.dark:from-red-700]="day.isToday" [class.to-red-700]="day.isToday" [class.dark:to-red-500]="day.isToday" [class.text-white]="day.isToday" [class.shadow-red-900/30]="day.isToday"
                            [class.bg-white]="!day.isToday" [class.dark:bg-card]="!day.isToday" [class.border]="!day.isToday" [class.border-white]="!day.isToday" [class.dark:border-white/5]="!day.isToday" [class.text-gray-900]="!day.isToday" [class.dark:text-foreground]="!day.isToday">
                        {{ day.date.getDate() }}
                      </span>
                      <span class="uppercase tracking-widest text-[10px] text-gray-500 dark:text-gray-400">{{ day.date | date:'EEEE' }}</span>
                    </h3>
                    <div class="space-y-3 pl-11">
                      @for (b of day.bookings; track b.id) {
                        <div (click)="goToBooking(b.id, $event)"
                          class="flex items-center justify-between p-3.5 rounded-2xl border border-white dark:border-white/5 bg-white/70 dark:bg-card/70 backdrop-blur-md active:scale-[0.98] transition-all shadow-sm">
                          <div>
                            <p class="text-xs font-black text-gray-900 dark:text-foreground mb-1">{{ b.start_time | timeFormat }} - {{ b.end_time || 'End' }}</p>
                            <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ b.teacher_name }}</p>
                          </div>
                          <span class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border"
                            [class.bg-amber-50]="b.status === 'PENDING'" [class.dark:bg-amber-900/20]="b.status === 'PENDING'" [class.text-amber-800]="b.status === 'PENDING'" [class.dark:text-amber-400]="b.status === 'PENDING'" [class.border-amber-200]="b.status === 'PENDING'" [class.dark:border-amber-900/50]="b.status === 'PENDING'"
                            [class.bg-blue-50]="b.status === 'APPROVED'" [class.dark:bg-blue-900/20]="b.status === 'APPROVED'" [class.text-blue-800]="b.status === 'APPROVED'" [class.dark:text-blue-400]="b.status === 'APPROVED'" [class.border-blue-200]="b.status === 'APPROVED'" [class.dark:border-blue-900/50]="b.status === 'APPROVED'"
                            [class.bg-emerald-50]="b.status === 'COMPLETED'" [class.dark:bg-emerald-900/20]="b.status === 'COMPLETED'" [class.text-emerald-800]="b.status === 'COMPLETED'" [class.dark:text-emerald-400]="b.status === 'COMPLETED'" [class.border-emerald-200]="b.status === 'COMPLETED'" [class.dark:border-emerald-900/50]="b.status === 'COMPLETED'"
                            [class.bg-gray-50]="b.status === 'CANCELLED'" [class.dark:bg-white/5]="b.status === 'CANCELLED'" [class.text-gray-500]="b.status === 'CANCELLED'" [class.dark:text-gray-400]="b.status === 'CANCELLED'" [class.border-white]="b.status === 'CANCELLED'" [class.dark:border-white/5]="b.status === 'CANCELLED'">
                            {{ b.status }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                }
              }
              <!-- If no bookings in the month on mobile -->
              @if (mobileHasNoBookings()) {
                <div class="px-4 py-16 text-center">
                  <div class="relative w-16 h-16 bg-white/60 dark:bg-card/60 border border-white dark:border-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-sm backdrop-blur-md">
                    <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <p class="text-sm font-black text-gray-900 dark:text-foreground mb-1">No Consultations</p>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">You don't have any bookings this month.</p>
                  <button (click)="router.navigate(['/student/teachers'])" class="mt-6 text-[10px] font-black uppercase tracking-widest text-white bg-gray-900 dark:bg-card px-6 py-3 rounded-xl hover:bg-black dark:hover:bg-card/80 transition-colors shadow-lg active:scale-95 border border-gray-800 dark:border-white/5">
                    Find an Instructor
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
      
      <!-- ── Floating Legend ── -->
      <div class="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-[2rem] border border-white dark:border-white/5 p-4 shadow-sm inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 mx-4 sm:mx-0">
         <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_2px_8px_rgba(251,191,36,0.4)] border border-amber-300"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Pending</span>
         </div>
         <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_2px_8px_rgba(59,130,246,0.4)] border border-blue-400"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Approved</span>
         </div>
         <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_2px_8px_rgba(16,185,129,0.4)] border border-emerald-400"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Completed</span>
         </div>
         <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 rounded-full bg-gray-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-gray-400"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Cancelled</span>
         </div>
      </div>

    </div>
  `
})
export class CalendarComponent implements OnInit {
  private api = inject(ApiService);
  router = inject(Router);

  loading = signal(true);
  bookings = signal<Booking[]>([]);

  // Pre-processed dictionary of bookings by Date string (YYYY-MM-DD) for O(1) lookups
  bookingsDict = computed<Record<string, Booking[]>>(() => {
    const dict: Record<string, Booking[]> = {};
    const bks = this.bookings();
    for (const b of bks) {
      if (!b.scheduled_date) continue;
      const dateKey = b.scheduled_date.split('T')[0];
      if (!dict[dateKey]) dict[dateKey] = [];
      dict[dateKey].push(b);
    }
    // Sort each day's bookings by start_time
    for (const key in dict) {
      dict[key].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return dict;
  });

  currentDate = signal(new Date());

  currentMonthName = computed(() => {
    return this.currentDate().toLocaleString('default', { month: 'long' });
  });

  currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  calendarDays = computed(() => {
    return this.generateCalendar(this.currentDate());
  });

  ngOnInit(): void {
    // If backend supported date ranges, we would pass them here.
    // E.g.: this.api.getBookings({ start, end })
    // For now, we process all bookings efficiently in the computed signal.
    this.api.getBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  prevMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMonth(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  goToBooking(id: number, event: Event): void {
    event.stopPropagation(); // Prevent triggering cell click
    this.router.navigate(['/student/my-bookings'], { queryParams: { expanded: id }});
  }

  onDayClick(day: CalendarDay): void {
    // Only navigate to booking creation if it's the current month and a future/today date.
    if (day.isCurrentMonth && this.isFutureOrToday(day.date)) {
      this.router.navigate(['/student/teachers']);
    }
  }

  onMoreClick(day: CalendarDay, event: Event): void {
    event.stopPropagation();
    // In a full implementation, you'd open a dialog displaying all the day's bookings.
    // For now, route to my bookings or a dedicated day view.
    this.router.navigate(['/student/my-bookings']);
  }

  isFutureOrToday(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  mobileHasNoBookings(): boolean {
    const days = this.calendarDays();
    return !days.some(d => d.isCurrentMonth && d.bookings.length > 0);
  }

  private generateCalendar(date: Date): CalendarDay[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    const dict = this.bookingsDict();

    // Helper to build a day
    const createDay = (d: Date, isCurrentMonth: boolean): CalendarDay => {
      // Create standardized YYYY-MM-DD string explicitly
      const ys = d.getFullYear();
      const ms = String(d.getMonth() + 1).padStart(2, '0');
      const ds = String(d.getDate()).padStart(2, '0');
      const dateString = `${ys}-${ms}-${ds}`;

      return {
        date: d,
        dateString,
        isCurrentMonth,
        isToday: this.isSameDate(d, today),
        bookings: dict[dateString] || [] // O(1) lookup!
      };
    };

    // Previous month padding
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(createDay(new Date(year, month - 1, prevMonthLastDate - i), false));
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
       days.push(createDay(new Date(year, month, i), true));
    }

    // Next month padding (to fill grid to multiple of 7, 6 rows = 42 slots max, or 5 rows = 35)
    // We will render up to 42 slots to keep height consistent.
    const remainingSlots = 42 - days.length; 
    for (let i = 1; i <= remainingSlots; i++) {
        days.push(createDay(new Date(year, month + 1, i), false));
    }

    return days;
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}
