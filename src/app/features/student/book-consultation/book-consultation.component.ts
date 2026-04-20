import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import type { Teacher, Availability } from '../../../core/models/index'
import { HlmCardImports } from '@spartan-ng/helm/card'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { DatePickerModule } from 'primeng/datepicker'

import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
@Component({
  selector: 'app-book-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmCardImports, HlmButtonImports, HlmBadgeImports, DatePickerModule, TimeFormatPipe],
  template: `
    <div class="h-full w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex flex-col items-center">

      <!-- ── Floating Hero Header ── -->
      <div class="w-full relative z-10 mb-10 group">
        <div class="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-red-900/20 transform group-hover:scale-[1.005] transition-transform duration-700 ease-out overflow-hidden">
           <!-- Inner glow effect -->
           <div class="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-white/10 blur-[60px] rotate-[30deg] pointer-events-none"></div>
        </div>

        <div class="relative z-20 px-8 py-10 md:py-14 sm:px-12 lg:px-16 flex flex-col gap-6">
          <div>
            <button (click)="router.navigate(['/student/teachers'])"
              class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-6 shadow-sm transition-all active:scale-95 group/back">
              <svg class="w-3.5 h-3.5 group-hover/back:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
              </svg>
              Return to Instructors
            </button>
            <h1 class="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 leading-tight drop-shadow-md">Consultation Request</h1>
            <p class="text-sm md:text-base font-medium text-red-100/90 max-w-xl leading-relaxed">Follow the steps below to schedule a session. The instructor will review your request and confirm shortly.</p>
          </div>
        </div>
      </div>

      @if (teacher()) {
        <div class="w-full pb-16 relative z-20">
          <div class="flex flex-col lg:flex-row gap-8 items-start">

            <!-- ── LEFT: Teacher info + Summary ── -->
            <div class="w-full lg:w-[360px] shrink-0 space-y-8 lg:sticky lg:top-24 z-10">

              <!-- Teacher Glass Card -->
              <div class="bg-white/70 dark:bg-card/70 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 overflow-hidden group hover:shadow-2xl hover:shadow-red-900/10 dark:hover:shadow-white/5 hover:-translate-y-1 transition-all duration-500">
                <div class="h-20 bg-gradient-to-r from-red-900 to-red-700 relative overflow-hidden">
                   <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
                </div>
                <div class="px-8 pb-8 pt-4">
                  <div class="flex flex-col items-center -mt-14 mb-4 relative z-10">
                    <img
                      [src]="teacher()!.picture || 'https://ui-avatars.com/api/?name=' + teacher()!.name.split(' ').join('+') + '&background=831b1b&color=fff'"
                      (error)="$any($event.target).src = 'https://ui-avatars.com/api/?name=' + teacher()!.name.split(' ').join('+') + '&background=831b1b&color=fff'"
                      class="w-20 h-20 rounded-2xl border-[4px] border-white/90 dark:border-black/50 object-cover shadow-lg group-hover:scale-110 group-hover:rotate-2 transition-all duration-500 bg-white dark:bg-card"/>
                  </div>
                  <div class="text-center">
                    <h2 class="text-xl font-black text-gray-900 dark:text-foreground leading-tight group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">{{ teacher()!.name }}</h2>
                    <p class="text-[10px] text-red-700 dark:text-red-400 font-bold uppercase tracking-widest mt-2 bg-red-50 dark:bg-red-900/20 inline-block px-3 py-1 rounded-lg border border-red-100 dark:border-red-900/50 shadow-inner">{{ teacher()!.department || 'Instructor' }}</p>
                  </div>
                </div>
              </div>

              <!-- Booking Summary Glass Card -->
              <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 p-8">
                <h3 class="font-black text-gray-900 dark:text-foreground text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-900/50 shadow-inner">
                    <svg class="w-4 h-4 text-red-800 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </span>
                  Booking Summary
                </h3>
                
                <div class="space-y-6">
                  <!-- Type -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Mode</span>
                    <span class="text-xs font-black text-gray-900 dark:text-foreground bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                      @if (consultationType === 'ONLINE') {
                        <span class="inline-flex items-center gap-2">
                          <svg class="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          Online
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-2">
                          <svg class="w-3.5 h-3.5 text-red-800 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          Face to Face
                        </span>
                      }
                    </span>
                  </div>
                  
                  <!-- Date -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</span>
                    <span class="text-xs font-black px-4 py-2 rounded-xl border shadow-sm transition-colors duration-300"
                          [class.bg-white]="scheduledDate" [class.dark:bg-white/5]="scheduledDate" [class.text-gray-900]="scheduledDate" [class.dark:text-foreground]="scheduledDate" [class.border-gray-100]="scheduledDate" [class.dark:border-white/5]="scheduledDate"
                          [class.bg-red-50/50]="!scheduledDate" [class.dark:bg-red-900/20]="!scheduledDate" [class.text-red-700/50]="!scheduledDate" [class.dark:text-red-400/50]="!scheduledDate" [class.border-red-100/50]="!scheduledDate" [class.dark:border-red-900/50]="!scheduledDate">
                      {{ scheduledDate ? (scheduledDate | date:'MMM d, y') : 'Not selected' }}
                    </span>
                  </div>
                  
                  <!-- Time -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Time</span>
                    <span class="text-xs font-black px-4 py-2 rounded-xl border shadow-sm transition-colors duration-300"
                          [class.bg-white]="selectedSlot()" [class.dark:bg-white/5]="selectedSlot()" [class.text-gray-900]="selectedSlot()" [class.dark:text-foreground]="selectedSlot()" [class.border-gray-100]="selectedSlot()" [class.dark:border-white/5]="selectedSlot()"
                          [class.bg-red-50/50]="!selectedSlot()" [class.dark:bg-red-900/20]="!selectedSlot()" [class.text-red-700/50]="!selectedSlot()" [class.dark:text-red-400/50]="!selectedSlot()" [class.border-red-100/50]="!selectedSlot()" [class.dark:border-red-900/50]="!selectedSlot()">
                      {{ selectedSlot() ? (selectedSlot()!.start_time + ' – ' + selectedSlot()!.end_time) : 'Not selected' }}
                    </span>
                  </div>
                </div>

                <!-- Submit Button Area -->
                <div class="mt-8 pt-6 border-t border-white/50 dark:border-white/10">
                  @if (successMsg()) {
                    <div class="bg-green-50 dark:bg-green-900/20 backdrop-blur-sm border border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-400 font-bold text-xs rounded-xl p-4 flex items-center gap-3 mb-5 shadow-sm">
                      <svg class="w-5 h-5 shrink-0 text-green-600 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      {{ successMsg() }}
                    </div>
                  }
                  @if (errorMsg()) {
                    <div class="bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 font-bold text-xs rounded-xl p-4 flex items-center gap-3 mb-5 shadow-sm">
                      <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      {{ errorMsg() }}
                    </div>
                  }
                  <button (click)="submit()" [disabled]="!canSubmit() || submitting()"
                    class="w-full relative overflow-hidden disabled:bg-gray-200/50 disabled:text-gray-400 disabled:shadow-none
                           text-white font-black tracking-widest text-[11px] uppercase py-4 rounded-[1.25rem] transition-all shadow-md
                           hover:shadow-xl hover:shadow-red-900/20 disabled:cursor-not-allowed group border border-transparent disabled:border-white">
                    
                    <!-- Gradient background for enabled state -->
                    <div class="absolute inset-0 bg-gradient-to-r from-red-900 to-red-700 transition-opacity duration-300"
                         [class.opacity-0]="!canSubmit() || submitting()"></div>
                    
                    <!-- Subtle glow on hover for active state -->
                    <div class="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-white/20 blur-[30px] rotate-[30deg] pointer-events-none group-hover:translate-x-[250%] transition-transform duration-1000"
                         [class.hidden]="!canSubmit() || submitting()"></div>
                         
                    <span class="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                      @if (submitting()) {
                        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Scheduling...
                      } @else {
                        Confirm & Schedule
                      }
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- ── RIGHT: Booking Steps Glass Engine ── -->
            <div class="flex-1 bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[3.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 overflow-hidden">

              <div class="p-8 sm:p-10 border-b border-white/50 dark:border-white/5 bg-white/40 dark:bg-card/40">
                <h2 class="font-black text-gray-900 dark:text-foreground text-2xl flex items-center gap-3">
                  <span class="w-2 h-8 bg-red-800 dark:bg-red-500 rounded-full inline-block"></span>
                  Booking Parameters
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium ml-5">Configure your consultation setup sequentially.</p>
              </div>

              <div class="p-8 sm:p-10 space-y-12">

                <!-- STEP 1: Consultation Mode -->
                <div class="group/step1">
                  <label class="flex items-center gap-4 text-xs font-black text-gray-900 dark:text-foreground uppercase tracking-widest mb-6">
                    <span class="w-10 h-10 rounded-[1rem] bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-900/50 shrink-0 shadow-inner group-hover/step1:scale-110 transition-transform duration-300">1</span>
                    Consultation Mode
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pl-14">
                    <label
                      class="flex items-center gap-4 p-5 sm:p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden group/opt"
                      [class.border-red-600]="consultationType === 'FACE_TO_FACE'" [class.dark:border-red-500]="consultationType === 'FACE_TO_FACE'" [class.bg-white]="consultationType === 'FACE_TO_FACE'" [class.dark:bg-card]="consultationType === 'FACE_TO_FACE'" [class.shadow-md]="consultationType === 'FACE_TO_FACE'" [class.shadow-red-900/10]="consultationType === 'FACE_TO_FACE'" [class.dark:shadow-white/5]="consultationType === 'FACE_TO_FACE'"
                      [class.border-white]="consultationType !== 'FACE_TO_FACE'" [class.dark:border-white/5]="consultationType !== 'FACE_TO_FACE'" [class.bg-white/40]="consultationType !== 'FACE_TO_FACE'" [class.dark:bg-white/5]="consultationType !== 'FACE_TO_FACE'" [class.hover:border-red-200]="consultationType !== 'FACE_TO_FACE'" [class.dark:hover:border-white/20]="consultationType !== 'FACE_TO_FACE'" [class.hover:bg-white/60]="consultationType !== 'FACE_TO_FACE'" [class.dark:hover:bg-white/10]="consultationType !== 'FACE_TO_FACE'">
                      
                      @if (consultationType === 'FACE_TO_FACE') {
                        <div class="absolute inset-0 bg-red-50/50 dark:bg-red-900/20 pointer-events-none"></div>
                      }
                      
                      <input type="radio" name="type" value="FACE_TO_FACE" [(ngModel)]="consultationType" class="accent-red-800 dark:accent-red-500 w-4 h-4 shrink-0 relative z-10"/>
                        <div class="relative z-10">
                          <p class="font-black text-gray-900 dark:text-foreground text-base flex items-center gap-2 group-hover/opt:text-red-900 dark:group-hover/opt:text-red-400 transition-colors">
                            <svg class="w-5 h-5 text-red-800 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            Face to Face
                          </p>
                          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">On-campus face-to-face meeting</p>
                        </div>
                    </label>
                    <label
                      class="flex items-center gap-4 p-5 sm:p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden group/opt"
                      [class.border-red-600]="consultationType === 'ONLINE'" [class.dark:border-red-500]="consultationType === 'ONLINE'" [class.bg-white]="consultationType === 'ONLINE'" [class.dark:bg-card]="consultationType === 'ONLINE'" [class.shadow-md]="consultationType === 'ONLINE'" [class.shadow-red-900/10]="consultationType === 'ONLINE'" [class.dark:shadow-white/5]="consultationType === 'ONLINE'"
                      [class.border-white]="consultationType !== 'ONLINE'" [class.dark:border-white/5]="consultationType !== 'ONLINE'" [class.bg-white/40]="consultationType !== 'ONLINE'" [class.dark:bg-white/5]="consultationType !== 'ONLINE'" [class.hover:border-red-200]="consultationType !== 'ONLINE'" [class.dark:hover:border-white/20]="consultationType !== 'ONLINE'" [class.hover:bg-white/60]="consultationType !== 'ONLINE'" [class.dark:hover:bg-white/10]="consultationType !== 'ONLINE'">
                      
                      @if (consultationType === 'ONLINE') {
                        <div class="absolute inset-0 bg-red-50/50 dark:bg-red-900/20 pointer-events-none"></div>
                      }

                      <input type="radio" name="type" value="ONLINE" [(ngModel)]="consultationType" class="accent-red-800 dark:accent-red-500 w-4 h-4 shrink-0 relative z-10"/>
                        <div class="relative z-10">
                          <p class="font-black text-gray-900 dark:text-foreground text-base flex items-center gap-2 group-hover/opt:text-red-900 dark:group-hover/opt:text-red-400 transition-colors">
                            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            Online
                          </p>
                          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Remote connection via Web / Chat</p>
                        </div>
                    </label>
                  </div>
                </div>

                <div class="border-t border-white dark:border-white/5 pl-14"></div>

                <!-- STEP 2: Date -->
                <div class="group/step2">
                  <label class="flex items-center gap-4 text-xs font-black text-gray-900 dark:text-foreground uppercase tracking-widest mb-6">
                    <span class="w-10 h-10 rounded-[1rem] bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-900/50 shrink-0 shadow-inner group-hover/step2:scale-110 transition-transform duration-300">2</span>
                    Select a Date
                  </label>
                  <div class="pl-14">
                    <p-datepicker
                      [(ngModel)]="scheduledDateObj"
                      [minDate]="minDateObj"
                      (ngModelChange)="onDateChangeObj($event)"
                      styleClass="w-full sm:max-w-[400px]"
                      appendTo="body"
                      inputStyleClass="w-full border-2 border-white dark:border-white/5 rounded-[1.25rem] pl-5 pr-10 py-4 text-sm font-bold text-gray-800 dark:text-foreground focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all bg-white/70 dark:bg-card/70 backdrop-blur-md shadow-sm cursor-pointer hover:bg-white dark:hover:bg-card"
                      [showIcon]="true"
                      dateFormat="mm/dd/yy"
                      placeholder="Provide a requested date"
                    ></p-datepicker>
                  </div>
                </div>

                <div class="border-t border-white dark:border-white/5 pl-14"></div>

                <!-- STEP 3: Time Slot -->
                <div [class.opacity-50]="!scheduledDate" [class.pointer-events-none]="!scheduledDate" class="group/step3 transition-opacity duration-500">
                  <label class="flex items-center gap-4 text-xs font-black text-gray-900 dark:text-foreground uppercase tracking-widest mb-6">
                    <span class="w-10 h-10 rounded-[1rem] flex items-center justify-center border dark:border-white/5 shrink-0 shadow-inner transition-colors duration-500 group-hover/step3:scale-110"
                      [class.bg-red-50]="scheduledDate" [class.dark:bg-red-900/20]="scheduledDate" [class.text-red-800]="scheduledDate" [class.dark:text-red-400]="scheduledDate" [class.border-red-100]="scheduledDate" [class.dark:border-red-900/50]="scheduledDate"
                      [class.bg-white]="!scheduledDate" [class.dark:bg-white/5]="!scheduledDate" [class.text-gray-400]="!scheduledDate" [class.dark:text-gray-500]="!scheduledDate" [class.border-white]="!scheduledDate" [class.dark:border-white/5]="!scheduledDate">3</span>
                    Available Time Slots
                  </label>

                  <div class="pl-14">
                    @if (!scheduledDate) {
                      <div class="bg-white/40 dark:bg-white/5 border border-white dark:border-white/5 rounded-[1.5rem] p-8 flex flex-col items-center text-center shadow-inner">
                        <div class="w-14 h-14 bg-white/80 dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm mb-4 border border-white dark:border-white/5">
                           <span class="text-2xl">⏳</span>
                        </div>
                        <p class="font-black text-gray-800 dark:text-gray-300 text-base">Waiting for date selection</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2">Select a date above to load available slots.</p>
                      </div>
                    } @else if (slotsLoading()) {
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        @for (i of [1,2,3,4]; track i) {
                          <div class="h-20 bg-white/40 dark:bg-white/10 rounded-[1.5rem] animate-pulse border border-white dark:border-white/5"></div>
                        }
                      </div>
                    } @else if (availableSlotsForDate().length === 0) {
                      <div class="bg-red-50/80 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-[1.5rem] p-8 flex flex-col items-center text-center shadow-inner">
                        <div class="w-14 h-14 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm border border-red-100 dark:border-red-900/50 mb-4">
                           <span class="text-2xl">🚫</span>
                        </div>
                        <p class="font-black text-red-900 dark:text-red-400 text-base">No availability</p>
                        <p class="text-xs text-red-700 dark:text-red-300 font-medium mt-2 max-w-sm">This instructor has no available slots for {{ getDayName(scheduledDate) }}s. Please pick another date.</p>
                      </div>
                    } @else {
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        @for (slot of availableSlotsForDate(); track slot.id) {
                          <label
                            class="flex flex-col gap-2 p-5 border-2 rounded-[1.5rem] cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden group/slot"
                            [class.border-red-600]="selectedSlot()?.id === slot.id" [class.dark:border-red-500]="selectedSlot()?.id === slot.id"
                            [class.bg-white]="selectedSlot()?.id === slot.id" [class.dark:bg-card]="selectedSlot()?.id === slot.id"
                            [class.shadow-md]="selectedSlot()?.id === slot.id"
                            [class.shadow-red-900/10]="selectedSlot()?.id === slot.id" [class.dark:shadow-white/5]="selectedSlot()?.id === slot.id"
                            
                            [class.border-white]="selectedSlot()?.id !== slot.id" [class.dark:border-white/5]="selectedSlot()?.id !== slot.id"
                            [class.bg-white/50]="selectedSlot()?.id !== slot.id" [class.dark:bg-white/5]="selectedSlot()?.id !== slot.id"
                            [class.hover:border-red-200]="selectedSlot()?.id !== slot.id" [class.dark:hover:border-white/20]="selectedSlot()?.id !== slot.id"
                            [class.hover:bg-white/80]="selectedSlot()?.id !== slot.id" [class.dark:hover:bg-white/10]="selectedSlot()?.id !== slot.id">
                            
                            @if (selectedSlot()?.id === slot.id) {
                              <div class="absolute inset-0 bg-red-50/30 dark:bg-red-900/20 pointer-events-none"></div>
                            }
                            
                            <div class="flex items-center justify-between relative z-10 w-full mb-1">
                               <p class="text-[10px] font-black tracking-widest uppercase transition-colors"
                                  [class.text-red-800]="selectedSlot()?.id === slot.id" [class.dark:text-red-400]="selectedSlot()?.id === slot.id"
                                  [class.text-gray-400]="selectedSlot()?.id !== slot.id" [class.dark:text-gray-500]="selectedSlot()?.id !== slot.id">
                                  {{ getDayName(scheduledDate) }} SLOT
                               </p>
                               <input type="radio" name="slot" [value]="slot"
                                (change)="onSlotChange(slot)" class="accent-red-800 dark:accent-red-500 w-3.5 h-3.5"/>
                            </div>
                            <div class="relative z-10 w-full text-center py-1">
                              <p class="font-black tracking-tight text-base sm:text-base transition-colors"
                                 [class.text-red-900]="selectedSlot()?.id === slot.id" [class.dark:text-red-300]="selectedSlot()?.id === slot.id"
                                 [class.text-gray-800]="selectedSlot()?.id !== slot.id" [class.dark:text-gray-200]="selectedSlot()?.id !== slot.id">
                                {{ slot.start_time | timeFormat }}<br><span class="text-xs text-gray-400 dark:text-gray-500">to</span> <br>{{ slot.end_time | timeFormat }}
                              </p>
                            </div>
                          </label>
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="border-t border-white dark:border-white/5 pl-14"></div>

                <!-- STEP 4: Notes -->
                <div [class.opacity-50]="!selectedSlot()" [class.pointer-events-none]="!selectedSlot()" class="group/step4 transition-opacity duration-500">
                  <div class="flex items-center justify-between mb-6">
                    <label class="flex items-center gap-4 text-xs font-black text-gray-900 dark:text-foreground uppercase tracking-widest">
                      <span class="w-10 h-10 rounded-[1rem] flex items-center justify-center border dark:border-white/5 shrink-0 shadow-inner transition-colors duration-500 group-hover/step4:scale-110"
                        [class.bg-red-50]="selectedSlot()" [class.dark:bg-red-900/20]="selectedSlot()" [class.text-red-800]="selectedSlot()" [class.dark:text-red-400]="selectedSlot()" [class.border-red-100]="selectedSlot()" [class.dark:border-red-900/50]="selectedSlot()"
                        [class.bg-white]="!selectedSlot()" [class.dark:bg-white/5]="!selectedSlot()" [class.text-gray-400]="!selectedSlot()" [class.dark:text-gray-500]="!selectedSlot()" [class.border-white]="!selectedSlot()" [class.dark:border-white/5]="!selectedSlot()">4</span>
                      Reason / Notes
                    </label>
                    <span class="text-[9px] bg-white/80 dark:bg-white/5 border border-white dark:border-white/5 text-gray-500 dark:text-gray-400 font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">Optional</span>
                  </div>
                  
                  <div class="pl-14 relative">
                    <div class="absolute left-14 top-4 text-gray-400 dark:text-gray-500 group-focus-within/step4:text-red-700 dark:group-focus-within/step4:text-red-400 transition-colors pointer-events-none">
                       <svg class="w-5 h-5 ml-4 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </div>
                    <textarea [(ngModel)]="notes" rows="4"
                      placeholder="Help the teacher prepare by outlining what you'd like to discuss..."
                      class="w-full border-2 border-white dark:border-white/5 rounded-[1.5rem] pl-14 pr-6 py-5 text-sm text-gray-800 dark:text-foreground font-medium
                             focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-white/10 transition-all
                             resize-none bg-white/60 dark:bg-card/60 backdrop-blur-md shadow-sm focus:bg-white dark:focus:bg-card"></textarea>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      } @else {
        <!-- Premium Loading skeleton -->
        <div class="w-full -mt-6 py-6 pb-16 relative z-20">
          <div class="h-[600px] bg-white/40 dark:bg-card/40 backdrop-blur-3xl rounded-[3.5rem] animate-pulse border border-white dark:border-white/5 shadow-xl shadow-gray-900/5"></div>
        </div>
      }

    </div>
  `,
})
export class BookConsultationComponent implements OnInit {
  private api   = inject(ApiService)
  private route = inject(ActivatedRoute)
  router        = inject(Router)

  teacher           = signal<Teacher | null>(null)
  slots             = signal<Availability[]>([])
  selectedSlot      = signal<Availability | null>(null)
  slotsLoading      = signal(true)
  consultationType  = 'FACE_TO_FACE'

  scheduledDateObj: Date | null = null
  scheduledDate = ''
  notes         = ''
  minDateObj    = new Date()

  submitting = signal(false)
  successMsg = signal<string | null>(null)
  errorMsg   = signal<string | null>(null)

  private dayMap: Record<string, number> = {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
  }

  ngOnInit(): void {
    const teacherId = Number(this.route.snapshot.paramMap.get('teacherId'))
    this.api.getTeacher(teacherId).subscribe(res => this.teacher.set(res.data))
    this.api.getAvailability(teacherId).subscribe(res => {
      this.slots.set(res.data)
      this.slotsLoading.set(false)
    })
  }



  getDayName(dateStr: string): string {
    if (!dateStr) return ''
    const dayNum = new Date(dateStr + 'T00:00:00').getDay()
    const entry  = Object.entries(this.dayMap).find(([, v]) => v === dayNum)
    return entry ? entry[0] : ''
  }

  availableSlotsForDate(): Availability[] {
    if (!this.scheduledDate) return []
    const dayStr = this.getDayName(this.scheduledDate)
    return this.slots().filter(s => s.day_of_week === dayStr)
  }

  onDateChangeObj(date: Date | null): void {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      this.scheduledDate = `${year}-${month}-${day}`
    } else {
      this.scheduledDate = ''
    }
    this.selectedSlot.set(null); this.errorMsg.set(null)
  }
  
  onSlotChange(slot: Availability): void { this.selectedSlot.set(slot); this.errorMsg.set(null) }
  
  canSubmit(): boolean  { return !!this.selectedSlot() && !!this.scheduledDate && !!this.consultationType }

  submit(): void {
    const slot = this.selectedSlot()
    if (!slot || !this.scheduledDate) return
    this.submitting.set(true)
    this.errorMsg.set(null)

    this.api.createBooking({
      teacher_id:        this.teacher()!.teacher_id,
      availability_id:   slot.id,
      scheduled_date:    this.scheduledDate,
      start_time:        slot.start_time,
      end_time:          slot.end_time,
      consultation_type: this.consultationType as 'ONLINE' | 'FACE_TO_FACE',
      notes:             this.notes || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false)
        this.successMsg.set('Request securely submitted! Awaiting instructor approval.')
        setTimeout(() => this.router.navigate(['/student/my-bookings']), 2000)
      },
      error: (err) => {
        this.submitting.set(false)
        this.errorMsg.set(err.error?.error ?? 'Booking failed to submit. Please try again.')
      },
    })
  }
}
