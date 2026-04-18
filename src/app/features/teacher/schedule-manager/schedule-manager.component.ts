import { Component, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Availability, DayOfWeek } from '../../../core/models/index'
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';

@Component({
  selector: 'app-schedule-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeFormatPipe],
  styles: [`
    .time-picker-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .time-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .time-spinner-btn {
      width: 36px;
      height: 28px;
      border-radius: 8px;
      border: 1.5px solid #e5e7eb;
      background: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
      color: #6b7280;
    }
    .time-spinner-btn:hover {
      background: #7f1d1d;
      border-color: #7f1d1d;
      color: #fff;
    }
    .time-spinner-btn:active {
      transform: scale(0.93);
    }
    .time-spinner-value {
      width: 52px;
      height: 44px;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      background: #fff;
      text-align: center;
      font-size: 1.25rem;
      font-weight: 800;
      color: #111827;
      letter-spacing: 0.02em;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      cursor: text;
      -moz-appearance: textfield;
    }
    .time-spinner-value::-webkit-inner-spin-button,
    .time-spinner-value::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .time-spinner-value:focus {
      border-color: #991b1b;
      box-shadow: 0 0 0 3px rgba(153,27,27,0.12);
    }
    .time-colon {
      font-size: 1.5rem;
      font-weight: 900;
      color: #d1d5db;
      margin-bottom: 2px;
      line-height: 1;
      padding: 0 2px;
    }
    .period-toggle {
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
    }
    .period-btn {
      width: 42px;
      height: 32px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
      color: #9ca3af;
      background: transparent;
      border: none;
    }
    .period-btn.selected {
      background: #7f1d1d;
      color: #fff;
    }

    /* Dark Mode Extensions for Time Picker Components */
    .dark .time-spinner-btn {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
    }
    .dark .time-spinner-btn:hover {
      background: #7f1d1d;
      border-color: #7f1d1d;
      color: #fff;
    }
    .dark .time-spinner-value {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .dark .time-spinner-value:focus {
      border-color: #f87171;
      box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.2);
    }
    .dark .time-colon {
      color: rgba(255, 255, 255, 0.2);
    }
    .dark .period-toggle {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .dark .period-btn {
      color: rgba(255, 255, 255, 0.5);
    }
    .dark .period-btn.selected {
      background: #7f1d1d;
      color: #fff;
    }
    .day-tab {
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s;
      border: 2px solid transparent;
      background: #f3f4f6;
      color: #9ca3af;
      white-space: nowrap;
    }
    .day-tab.selected {
      background: #7f1d1d;
      color: #fff;
      border-color: #7f1d1d;
      box-shadow: 0 4px 12px rgba(127,29,29,0.25);
    }
    .day-tab:hover:not(.selected) {
      background: #fef2f2;
      color: #7f1d1d;
      border-color: #fecaca;
    }
    .slot-card {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-radius: 16px;
      border: 2px solid #f1f5f9;
      background: #fff;
      transition: all 0.2s;
    }
    .slot-card:hover {
      border-color: #fecaca;
      box-shadow: 0 4px 16px rgba(127,29,29,0.08);
      transform: translateY(-1px);
    }
    .slot-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
      flex-shrink: 0;
    }
    .pulse-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #22c55e;
      animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      opacity: 0.35;
    }
    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }
    .remove-btn {
      opacity: 0;
      transition: opacity 0.15s, background 0.15s;
      padding: 7px;
      border-radius: 10px;
      color: #9ca3af;
    }
    .slot-card:hover .remove-btn {
      opacity: 1;
    }
    .remove-btn:hover {
      background: #fef2f2;
      color: #dc2626;
    }
    .day-section {
      border-radius: 24px;
      overflow: hidden;
      background: #fff;
      border: 1.5px solid #f1f5f9;
      box-shadow: 0 1px 6px rgba(0,0,0,0.04);
      transition: box-shadow 0.2s;
    }
    .day-section:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    }
    .day-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 22px;
      border-bottom: 1.5px solid #f8fafc;
      background: #fafafa;
    }
    .day-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      border-radius: 14px;
      font-size: 0.72rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .badge-active {
      background: linear-gradient(135deg, #7f1d1d, #dc2626);
      color: #fff;
      box-shadow: 0 4px 12px rgba(127,29,29,0.3);
    }
    .badge-inactive {
      background: #f3f4f6;
      color: #d1d5db;
      border: 1.5px solid #e5e7eb;
    }
    .slot-count-badge {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .count-active {
      background: #dcfce7;
      color: #15803d;
      border: 1.5px solid #bbf7d0;
    }
    .count-inactive {
      background: #f3f4f6;
      color: #9ca3af;
      border: 1.5px solid #e5e7eb;
    }
    .add-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #7f1d1d, #991b1b);
      color: #fff;
      font-size: 0.875rem;
      font-weight: 800;
      padding: 14px 24px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(127,29,29,0.3);
      letter-spacing: 0.01em;
    }
    .add-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #991b1b, #b91c1c);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(127,29,29,0.35);
    }
    .add-btn:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
    }
    .add-btn:disabled {
      background: #e5e7eb;
      color: #9ca3af;
      box-shadow: none;
      cursor: not-allowed;
    }
    .form-card {
      background: #fff;
      border-radius: 24px;
      border: 1.5px solid #f1f5f9;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      overflow: hidden;
      position: sticky;
      top: 88px;
    }
    .select-styled {
      width: 100%;
      padding: 12px 16px;
      border-radius: 14px;
      border: 2px solid #e5e7eb;
      background: #f9fafb;
      font-size: 0.875rem;
      font-weight: 700;
      color: #111827;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
    }
    .select-styled:focus {
      outline: none;
      border-color: #991b1b;
      background-color: #fff;
      box-shadow: 0 0 0 4px rgba(153,27,27,0.1);
    }
    .section-label {
      font-size: 0.65rem;
      font-weight: 900;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
      margin-left: 2px;
      display: block;
    }
  `],
  template: `
    <div class="min-h-screen pb-12 animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">

      <!-- ── ELEVATED HERO HEADER ── -->
      <div class="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-2xl border border-white/10 mb-8 group">
        <!-- Ambient Background Sweeps -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-red-400/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div class="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div>
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-4 shadow-sm">
               <span class="w-1.5 h-1.5 rounded-full bg-blue-400 box-shadow-glow"></span>
               Configuration
            </span>
            <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              Schedule Manager
            </h1>
            <p class="text-red-100 font-medium text-lg max-w-xl">
              Define your weekly availability so students know exactly when they can book a consultation with you.
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col xl:flex-row gap-8 relative">

        <!-- ── Left: Add Slot Form ── -->
        <div class="w-full xl:w-[420px] flex-shrink-0 relative">
          <div class="bg-white/80 dark:bg-card/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl dark:shadow-none border border-white dark:border-white/5 p-8 sticky top-6 z-30 transition-all hover:shadow-red-900/10">
            <!-- Header -->
            <div class="flex items-center gap-5 mb-8">
              <div class="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center shadow-lg border border-red-500/30 flex-shrink-0 group-hover:rotate-6 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              </div>
              <div>
                <h3 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight mb-1">Add Time Slot</h3>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Set Availability Window</p>
              </div>
            </div>

            <div class="space-y-6">

              <!-- Day of Week -->
              <div>
                <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Day of Week</span>
                <div class="relative">
                  <select [(ngModel)]="form.day_of_week" class="w-full border-2 border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-gray-700 dark:text-foreground bg-gray-50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 focus:outline-none focus:border-red-400 dark:focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20 shadow-inner dark:shadow-none appearance-none cursor-pointer transition-all">
                    @for (day of days; track day) {
                      <option [value]="day" class="dark:bg-card">{{ dayName(day) }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <!-- Start Time -->
              <div>
                <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Time</span>
                <div class="bg-gray-50/80 dark:bg-black/20 rounded-2xl p-4 border-2 border-gray-100 dark:border-white/10 shadow-inner dark:shadow-none flex justify-center">
                  <div class="time-picker-wrap">
                    <!-- Hour -->
                    <div class="time-spinner">
                      <button class="time-spinner-btn" (click)="adjustTime('start','hour',1)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 15l-6-6-6 6"/></svg>
                      </button>
                      <input type="number" class="time-spinner-value"
                        [value]="padTwo(startHour())"
                        min="1" max="12" maxlength="2"
                        (focus)="$any($event.target).select()"
                        (blur)="onHourBlur('start', $event)" />
                      <button class="time-spinner-btn" (click)="adjustTime('start','hour',-1)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                    </div>

                    <span class="time-colon">:</span>

                    <!-- Minute -->
                    <div class="time-spinner">
                      <button class="time-spinner-btn" (click)="adjustTime('start','minute',5)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 15l-6-6-6 6"/></svg>
                      </button>
                      <input type="number" class="time-spinner-value"
                        [value]="padTwo(startMinute())"
                        min="0" max="59" maxlength="2"
                        (focus)="$any($event.target).select()"
                        (blur)="onMinuteBlur('start', $event)" />
                      <button class="time-spinner-btn" (click)="adjustTime('start','minute',-5)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                    </div>

                    <!-- AM/PM -->
                    <div class="ml-2 period-toggle shadow-sm">
                      <button class="period-btn" [class.selected]="startPeriod()==='AM'" (click)="startPeriod.set('AM')" type="button">AM</button>
                      <button class="period-btn" [class.selected]="startPeriod()==='PM'" (click)="startPeriod.set('PM')" type="button">PM</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- End Time -->
              <div>
                <span class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">End Time</span>
                <div class="bg-gray-50/80 dark:bg-black/20 rounded-2xl p-4 border-2 border-gray-100 dark:border-white/10 shadow-inner dark:shadow-none flex justify-center">
                  <div class="time-picker-wrap">
                    <!-- Hour -->
                    <div class="time-spinner">
                      <button class="time-spinner-btn" (click)="adjustTime('end','hour',1)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 15l-6-6-6 6"/></svg>
                      </button>
                      <input type="number" class="time-spinner-value"
                        [value]="padTwo(endHour())"
                        min="1" max="12" maxlength="2"
                        (focus)="$any($event.target).select()"
                        (blur)="onHourBlur('end', $event)" />
                      <button class="time-spinner-btn" (click)="adjustTime('end','hour',-1)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                    </div>

                    <span class="time-colon">:</span>

                    <!-- Minute -->
                    <div class="time-spinner">
                      <button class="time-spinner-btn" (click)="adjustTime('end','minute',5)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 15l-6-6-6 6"/></svg>
                      </button>
                      <input type="number" class="time-spinner-value"
                        [value]="padTwo(endMinute())"
                        min="0" max="59" maxlength="2"
                        (focus)="$any($event.target).select()"
                        (blur)="onMinuteBlur('end', $event)" />
                      <button class="time-spinner-btn" (click)="adjustTime('end','minute',-5)" type="button">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                    </div>

                    <!-- AM/PM -->
                    <div class="ml-2 period-toggle shadow-sm">
                      <button class="period-btn" [class.selected]="endPeriod()==='AM'" (click)="endPeriod.set('AM')" type="button">AM</button>
                      <button class="period-btn" [class.selected]="endPeriod()==='PM'" (click)="endPeriod.set('PM')" type="button">PM</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Time Summary Preview -->
              <div class="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-transparent border border-amber-100 dark:border-amber-900/50 rounded-[1.25rem] p-4 flex flex-col items-center gap-1 shadow-sm dark:shadow-none relative overflow-hidden group">
                 <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
                 <p class="text-[9px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest text-center mt-1">Proposed Slot</p>
                 <span class="text-sm font-black text-amber-900 dark:text-amber-100 tracking-wide">{{ previewTime() }}</span>
              </div>

              <!-- Error & Success -->
              @if (formError()) {
                <div class="bg-red-50 border border-red-100 text-red-900 text-[11px] font-black tracking-widest uppercase rounded-xl p-4 flex items-center gap-3 shadow-sm animate-in slide-in-from-bottom-2">
                  <svg class="w-4 h-4 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  {{ formError() }}
                </div>
              }
              @if (formSuccess()) {
                <div class="bg-emerald-50 border border-emerald-100 text-emerald-900 text-[11px] font-black tracking-widest uppercase rounded-xl p-4 flex items-center gap-3 shadow-sm animate-in slide-in-from-bottom-2">
                  <svg class="w-4 h-4 flex-shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  {{ formSuccess() }}
                </div>
              }

              <!-- Submit -->
              <button class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-200 disabled:text-gray-500 text-white text-[11px] font-black uppercase tracking-widest px-6 py-5 rounded-[1.25rem] transition-all shadow-md active:scale-95 border border-red-700 disabled:border-transparent mt-2" (click)="addSlot()" [disabled]="adding()" type="button">
                @if (adding()) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving Slot...
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                  Save Time Slot
                }
              </button>
            </div>
          </div>
        </div>

        <!-- ── Right: Weekly Schedule ── -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- Day Filter Tabs Glass -->
          <div class="bg-white/50 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-[1.5rem] w-full flex gap-1 shadow-inner dark:shadow-none border border-white dark:border-white/5 overflow-x-auto no-scrollbar">
            <button
              class="px-5 py-3 rounded-[1.25rem] text-[10px] uppercase tracking-widest font-black transition-all flex-1 whitespace-nowrap min-w-fit"
              [class.bg-white]="selectedDayFilter() === 'ALL'" [class.dark:bg-white/10]="selectedDayFilter() === 'ALL'" [class.text-red-900]="selectedDayFilter() === 'ALL'" [class.dark:text-white]="selectedDayFilter() === 'ALL'" [class.shadow-md]="selectedDayFilter() === 'ALL'"
              [class.text-gray-400]="selectedDayFilter() !== 'ALL'" [class.dark:text-gray-500]="selectedDayFilter() !== 'ALL'" [class.hover:text-gray-700]="selectedDayFilter() !== 'ALL'" [class.dark:hover:text-gray-300]="selectedDayFilter() !== 'ALL'" [class.hover:bg-white/50]="selectedDayFilter() !== 'ALL'" [class.dark:hover:bg-white/5]="selectedDayFilter() !== 'ALL'"
              (click)="selectedDayFilter.set('ALL')">
              All Days
            </button>
            @for (day of days; track day) {
              <button
                class="px-5 py-3 rounded-[1.25rem] text-[10px] uppercase tracking-widest font-black transition-all flex-1 whitespace-nowrap min-w-fit"
                [class.bg-white]="selectedDayFilter() === day" [class.dark:bg-white/10]="selectedDayFilter() === day" [class.text-red-900]="selectedDayFilter() === day" [class.dark:text-white]="selectedDayFilter() === day" [class.shadow-md]="selectedDayFilter() === day"
                [class.text-gray-400]="selectedDayFilter() !== day" [class.dark:text-gray-500]="selectedDayFilter() !== day" [class.hover:text-gray-700]="selectedDayFilter() !== day" [class.dark:hover:text-gray-300]="selectedDayFilter() !== day" [class.hover:bg-white/50]="selectedDayFilter() !== day" [class.dark:hover:bg-white/5]="selectedDayFilter() !== day"
                (click)="selectedDayFilter.set(day)">
                {{ day }}
              </button>
            }
          </div>

          @if (loading()) {
            <div class="space-y-6">
              @for (i of [1,2,3]; track i) {
                <div class="h-32 bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2.5rem] animate-pulse border border-white dark:border-white/5 shadow-sm p-6"></div>
              }
            </div>
          }

          @if (!loading()) {
            @if (slots().length === 0) {
              <div class="bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[3rem] shadow-2xl dark:shadow-none border border-white dark:border-white/5 py-32 text-center flex flex-col items-center">
                <div class="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent flex items-center justify-center mb-8 shadow-inner border border-gray-100 dark:border-white/10 hover:scale-105 transition-transform duration-300">
                  <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-gray-900 dark:text-white font-black text-2xl mb-2 tracking-tight">Your schedule is empty</h3>
                <p class="text-gray-400 dark:text-gray-500 font-bold text-sm max-w-sm leading-relaxed">You haven't defined any availability yet. Students won't be able to book consultations until you add time slots.</p>
              </div>
            }

            <div class="space-y-6">
              @for (day of filteredDays(); track day) {
                <div class="bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[2.5rem] border border-white dark:border-white/5 shadow-xl dark:shadow-none hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  
                  <div class="flex items-center justify-between p-6 sm:px-8 sm:py-6 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur">
                    <div class="flex items-center gap-5">
                      <div class="w-14 h-14 rounded-[1.25rem] shadow-inner flex items-center justify-center text-sm font-black tracking-widest shrink-0"
                           [class.bg-gradient-to-br]="getSlotsForDay(day).length > 0"
                           [class.from-red-900]="getSlotsForDay(day).length > 0"
                           [class.to-red-700]="getSlotsForDay(day).length > 0"
                           [class.text-white]="getSlotsForDay(day).length > 0"
                           [class.border]="getSlotsForDay(day).length > 0"
                           [class.border-red-500]="getSlotsForDay(day).length > 0"
                           [class.dark:border-red-500/30]="getSlotsForDay(day).length > 0"
                           
                           [class.bg-gray-50]="getSlotsForDay(day).length === 0"
                           [class.dark:bg-black/20]="getSlotsForDay(day).length === 0"
                           [class.text-gray-400]="getSlotsForDay(day).length === 0"
                           [class.border-2]="getSlotsForDay(day).length === 0"
                           [class.border-gray-100]="getSlotsForDay(day).length === 0"
                           [class.dark:border-white/5]="getSlotsForDay(day).length === 0">
                        {{ day.substring(0, 3) }}
                      </div>
                      <div>
                        <h3 class="text-lg font-black text-gray-900 dark:text-foreground tracking-tight">{{ dayName(day) }}</h3>
                        <p class="text-[10px] font-black uppercase tracking-widest mt-1" [class.text-red-700]="getSlotsForDay(day).length > 0" [class.dark:text-red-400]="getSlotsForDay(day).length > 0" [class.text-gray-400]="getSlotsForDay(day).length === 0">
                          @if (getSlotsForDay(day).length > 0) {
                            {{ totalMinutes(day) }} MIN TOTAL
                          } @else {
                            OFF DUTY
                          }
                        </p>
                      </div>
                    </div>
                    
                    <span class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm dark:shadow-none"
                          [class.bg-emerald-50]="getSlotsForDay(day).length > 0"
                          [class.dark:bg-emerald-900/20]="getSlotsForDay(day).length > 0"
                          [class.border-emerald-200]="getSlotsForDay(day).length > 0"
                          [class.dark:border-emerald-900/50]="getSlotsForDay(day).length > 0"
                          [class.text-emerald-700]="getSlotsForDay(day).length > 0"
                          [class.dark:text-emerald-400]="getSlotsForDay(day).length > 0"
                          [class.bg-gray-50]="getSlotsForDay(day).length === 0"
                          [class.dark:bg-white/5]="getSlotsForDay(day).length === 0"
                          [class.border-gray-200]="getSlotsForDay(day).length === 0"
                          [class.dark:border-white/10]="getSlotsForDay(day).length === 0"
                          [class.text-gray-500]="getSlotsForDay(day).length === 0"
                          [class.dark:text-gray-400]="getSlotsForDay(day).length === 0">
                      {{ getSlotsForDay(day).length }} {{ getSlotsForDay(day).length === 1 ? 'SLOT' : 'SLOTS' }}
                    </span>
                  </div>

                  <div class="p-6 sm:p-8">
                    @if (getSlotsForDay(day).length === 0) {
                      <div class="flex items-center gap-3 py-4 opacity-60">
                        <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span class="text-sm font-bold text-gray-400 italic">No time slots scheduled for this day.</span>
                      </div>
                    } @else {
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @for (slot of getSlotsForDay(day); track slot.id) {
                          <div class="bg-gray-50/80 dark:bg-white/5 backdrop-blur border border-gray-100 dark:border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between group hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-md transition-all">
                            <div class="flex items-center gap-4">
                              <div class="relative w-2.5 h-2.5 flex shrink-0">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-glow-sm"></span>
                              </div>
                              <div>
                                <p class="text-[14px] font-black text-gray-900 dark:text-foreground tracking-tight">{{ slot.start_time | timeFormat }} – {{ slot.end_time | timeFormat }}</p>
                                <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Recurring Weekly</p>
                              </div>
                            </div>

                            @if (confirmingRemove() === slot.id) {
                              <div class="flex items-center gap-2">
                                <span class="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mr-1">Sure?</span>
                                <button (click)="confirmRemoveSlot(slot.id)" [disabled]="removing() === slot.id"
                                  class="text-[9px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center shadow-sm">
                                  @if (removing() === slot.id) {
                                    <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                  } @else { Yes }
                                </button>
                                <button (click)="confirmingRemove.set(null)"
                                  class="text-[9px] font-black uppercase tracking-widest bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm dark:shadow-none">
                                  No
                                </button>
                              </div>
                            } @else {
                              <button (click)="promptRemoveSlot(slot.id)" class="p-2 text-gray-300 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ScheduleManagerComponent implements OnInit {
  private api = inject(ApiService)
  private auth = inject(AuthService)

  slots = signal<Availability[]>([])
  loading = signal(true)
  adding = signal(false)
  removing = signal<number | null>(null)
  confirmingRemove = signal<number | null>(null)

  formError = signal<string | null>(null)
  formSuccess = signal<string | null>(null)

  selectedDayFilter = signal<DayOfWeek | 'ALL'>('ALL')

  days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  // Custom time picker signals for Start Time (12h format)
  startHour = signal(8)
  startMinute = signal(0)
  startPeriod = signal<'AM' | 'PM'>('AM')

  // Custom time picker signals for End Time (12h format)
  endHour = signal(9)
  endMinute = signal(0)
  endPeriod = signal<'AM' | 'PM'>('AM')

  form = {
    day_of_week: 'MON' as DayOfWeek,
    start_time: '08:00',
    end_time: '09:00',
  }

  private teacherId: number | null = null

  previewTime = computed(() => {
    const s = `${this.padTwo(this.startHour())}:${this.padTwo(this.startMinute())} ${this.startPeriod()}`
    const e = `${this.padTwo(this.endHour())}:${this.padTwo(this.endMinute())} ${this.endPeriod()}`
    return `${s}  →  ${e}`
  })

  filteredDays = computed<DayOfWeek[]>(() => {
    const filter = this.selectedDayFilter()
    return filter === 'ALL' ? this.days : [filter as DayOfWeek]
  })

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.sub
    this.api.getTeachers().subscribe(res => {
      const profile = res.data.find(t => t.user_id === userId)
      if (profile) {
        this.teacherId = profile.teacher_id
        this.loadSlots()
      } else {
        this.loading.set(false)
      }
    })
  }

  loadSlots(): void {
    if (!this.teacherId) return
    this.api.getAvailability(this.teacherId).subscribe({
      next: res => {
        this.slots.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  adjustTime(which: 'start' | 'end', part: 'hour' | 'minute', delta: number): void {
    if (which === 'start') {
      if (part === 'hour') {
        let h = this.startHour() + delta
        if (h > 12) h = 1
        if (h < 1) h = 12
        this.startHour.set(h)
      } else {
        let m = this.startMinute() + delta
        if (m >= 60) m = 0
        if (m < 0) m = 55
        this.startMinute.set(m)
      }
    } else {
      if (part === 'hour') {
        let h = this.endHour() + delta
        if (h > 12) h = 1
        if (h < 1) h = 12
        this.endHour.set(h)
      } else {
        let m = this.endMinute() + delta
        if (m >= 60) m = 0
        if (m < 0) m = 55
        this.endMinute.set(m)
      }
    }
  }

  onHourBlur(which: 'start' | 'end', event: Event): void {
    const input = event.target as HTMLInputElement
    let val = parseInt(input.value, 10)
    if (isNaN(val) || val < 1) val = 1
    if (val > 12) val = 12
    if (which === 'start') this.startHour.set(val)
    else this.endHour.set(val)
    input.value = this.padTwo(val)
  }

  onMinuteBlur(which: 'start' | 'end', event: Event): void {
    const input = event.target as HTMLInputElement
    let val = parseInt(input.value, 10)
    if (isNaN(val) || val < 0) val = 0
    if (val > 59) val = 59
    // Snap to nearest 5-minute mark
    val = Math.round(val / 5) * 5
    if (val >= 60) val = 55
    if (which === 'start') this.startMinute.set(val)
    else this.endMinute.set(val)
    input.value = this.padTwo(val)
  }

  to24h(hour: number, minute: number, period: 'AM' | 'PM'): string {
    let h = hour
    if (period === 'AM' && h === 12) h = 0
    if (period === 'PM' && h !== 12) h += 12
    return `${this.padTwo(h)}:${this.padTwo(minute)}`
  }

  padTwo(n: number): string {
    return n.toString().padStart(2, '0')
  }

  addSlot(): void {
    this.formError.set(null)
    this.formSuccess.set(null)

    const startTime = this.to24h(this.startHour(), this.startMinute(), this.startPeriod())
    const endTime = this.to24h(this.endHour(), this.endMinute(), this.endPeriod())

    if (startTime >= endTime) {
      this.formError.set('End time must be after start time.')
      return
    }

    this.form.start_time = startTime
    this.form.end_time = endTime

    this.adding.set(true)
    this.api.createAvailability(this.form).subscribe({
      next: res => {
        this.slots.update(s => [...s, res.data])
        this.formSuccess.set('Time slot added successfully!')
        this.adding.set(false)
        this.form = { day_of_week: 'MON', start_time: '08:00', end_time: '09:00' }
        this.startHour.set(8); this.startMinute.set(0); this.startPeriod.set('AM')
        this.endHour.set(9); this.endMinute.set(0); this.endPeriod.set('AM')
        setTimeout(() => this.formSuccess.set(null), 3000)
      },
      error: (err) => {
        this.formError.set(err.error?.error ?? 'Failed to add slot.')
        this.adding.set(false)
      },
    })
  }

  promptRemoveSlot(id: number): void {
    this.confirmingRemove.set(id)
  }

  confirmRemoveSlot(id: number): void {
    this.removing.set(id)
    this.api.deleteAvailability(id).subscribe({
      next: () => {
        this.slots.update(s => s.filter(sl => sl.id !== id))
        this.removing.set(null)
        this.confirmingRemove.set(null)
      },
      error: () => {
        this.removing.set(null)
        this.confirmingRemove.set(null)
      },
    })
  }

  getSlotsForDay(day: DayOfWeek): Availability[] {
    return this.slots().filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  totalMinutes(day: DayOfWeek): number {
    return this.getSlotsForDay(day).reduce((acc, sl) => {
      const [sh, sm] = sl.start_time.split(':').map(Number)
      const [eh, em] = sl.end_time.split(':').map(Number)
      return acc + ((eh * 60 + em) - (sh * 60 + sm))
    }, 0)
  }

  dayName(day: DayOfWeek): string {
    const map: Record<DayOfWeek, string> = {
      MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday'
    }
    return map[day]
  }
}
