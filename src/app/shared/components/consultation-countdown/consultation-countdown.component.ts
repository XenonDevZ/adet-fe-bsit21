import { Component, Input, OnInit, OnDestroy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Booking } from '../../../core/models/index';

import { TimeFormatPipe } from '../../pipes/time-format.pipe';
@Component({
  selector: 'app-consultation-countdown',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe],
  template: `
    <div class="bg-white dark:bg-card rounded-2xl shadow-sm overflow-hidden border border-transparent dark:border-white/5">
      <div class="h-1.5 bg-gradient-to-r from-red-900 to-red-500"></div>
      <div class="p-6">
        @if (!chatReady()) {
          <!-- Countdown state -->
          <div class="text-center">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl mb-4 border border-transparent dark:border-red-900/50"
            >
              <svg
                class="w-8 h-8 text-red-700 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Consultation starts in</p>
            <p class="text-gray-400 dark:text-gray-500 text-xs mb-5">Chat will unlock 5 minutes before the session</p>

            <!-- Timer display -->
            <div class="flex items-center justify-center gap-3 mb-6">
              @for (unit of timeUnits(); track unit.label) {
                <div class="text-center">
                  <div
                    class="w-16 h-16 bg-gray-900 dark:bg-[#1e1f22] rounded-2xl flex items-center justify-center mb-1 drop-shadow-md border border-transparent dark:border-white/10"
                  >
                    <span class="text-2xl font-bold text-white font-mono">{{ unit.value }}</span>
                  </div>
                  <p class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{{ unit.label }}</p>
                </div>
                @if (!$last) {
                  <span class="text-2xl font-bold text-gray-300 dark:text-gray-600 mb-4">:</span>
                }
              }
            </div>

            <!-- Booking info -->
            <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-left space-y-2 border border-gray-100 dark:border-white/5 shadow-inner">
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-400 dark:text-gray-500 font-bold">Date</p>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ booking.scheduled_date | date:'longDate' }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-400 dark:text-gray-500 font-bold">Time</p>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {{ booking.start_time | timeFormat }} – {{ booking.end_time | timeFormat }}
                </p>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-400 dark:text-gray-500 font-bold">Type</p>
                <span class="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-transparent dark:border-blue-900/50">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Online
                  </span>
                </span>
              </div>

            </div>
          </div>
        } @else {
          <!-- Chat ready state -->
          <div class="text-center mb-4">
            <div
              class="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl mb-3 shadow-sm border border-transparent dark:border-emerald-900/50"
            >
              <svg
                class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Chat is now open!</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Your consultation session has started.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class ConsultationCountdownComponent implements OnInit, OnDestroy {
  @Input() booking!: Booking;

  chatReady = signal(false);
  chatReadyChange = output<boolean>();

  private interval: any = null;

  private days = signal(0);
  private hours = signal(0);
  private minutes = signal(0);
  private seconds = signal(0);

  ngOnInit(): void {
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  private parseDateLocal(scheduled_date: string): string {
    // If it's an ISO datetime string (e.g. '2026-04-12T16:00:00.000Z'), convert to local date
    if (scheduled_date.length > 10) {
      const d = new Date(scheduled_date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return scheduled_date; // Already 'YYYY-MM-DD'
  }

  private tick(): void {
    const now = new Date();
    const datePart = this.parseDateLocal(this.booking.scheduled_date);
    const start = new Date(`${datePart}T${this.booking.start_time}`);
    // Chat unlocks 5 min before
    const unlock = new Date(start.getTime() - 5 * 60 * 1000);
    const diff = unlock.getTime() - now.getTime();

    if (diff <= 0) {
      this.chatReady.set(true);
      this.chatReadyChange.emit(true);
      clearInterval(this.interval);
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    this.days.set(Math.floor(totalSecs / 86400));
    this.hours.set(Math.floor((totalSecs % 86400) / 3600));
    this.minutes.set(Math.floor((totalSecs % 3600) / 60));
    this.seconds.set(totalSecs % 60);
  }

  timeUnits() {
    const pad = (n: number) => String(n).padStart(2, '0');
    const units = [];

    if (this.days() > 0) {
      units.push({ label: 'Days', value: pad(this.days()) });
    }
    units.push({ label: 'Hours', value: pad(this.hours()) });
    units.push({ label: 'Minutes', value: pad(this.minutes()) });
    units.push({ label: 'Seconds', value: pad(this.seconds()) });
    return units;
  }
}
