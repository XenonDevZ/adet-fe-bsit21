import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ChatComponent } from '../../../shared/components/chat/chat.component';
import { ConsultationCountdownComponent } from '../../../shared/components/consultation-countdown/consultation-countdown.component';
import type { Booking, BookingStatus } from '../../../core/models/index';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
@Component({
  selector: 'app-pending-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent, ChatComponent, ConsultationCountdownComponent, TimeFormatPipe],
  template: `
    <div class="min-h-screen pb-12 animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">

      <!-- ── ELEVATED HERO HEADER ── -->
      <div class="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-12 overflow-hidden shadow-2xl border border-white/10 mb-8 group">
        <!-- Ambient Background Sweeps -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-red-400/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div class="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-center justify-between">
          <div>
            <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-3 sm:mb-4 shadow-sm">
               <span class="w-1.5 h-1.5 rounded-full bg-blue-400 box-shadow-glow"></span>
               Consultation Management
            </span>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              Consultation Requests
            </h1>
            <p class="text-red-100 font-medium text-base sm:text-lg max-w-xl">
              Review, approve, and proactively manage student consultation sessions with clarity.
            </p>
          </div>
          <a routerLink="/teacher/schedule"
            class="flex items-center justify-center gap-2 bg-white dark:bg-white/10 text-red-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 group/btn
                   text-[11px] font-black uppercase tracking-widest px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.25rem] transition-all shadow-xl dark:shadow-none active:scale-95 shrink-0 border border-white dark:border-white/10 backdrop-blur-md w-full sm:w-auto">
            <svg class="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Manage Schedule
          </a>
        </div>
      </div>

      <!-- ── BODY LAYOUT ── -->
      <div class="flex flex-col lg:flex-row gap-8">

        <!-- ── MAIN LIST AREA ── -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- Glass Controls Card -->
          <div class="bg-white/80 dark:bg-card/90 backdrop-blur-2xl rounded-[2.5rem] shadow-xl shadow-red-900/5 dark:shadow-none border border-white dark:border-white/5 p-4 sm:p-6 sticky top-4 sm:top-6 z-30">
            <div class="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
              
              <!-- Filter Tabs -->
              <div class="flex bg-white/50 dark:bg-black/20 backdrop-blur p-1.5 rounded-[1.5rem] w-full 2xl:w-fit gap-1 shadow-inner dark:shadow-none border border-gray-100 dark:border-white/5 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar">
                @for (tab of tabs; track tab.value) {
                  <button
                    (click)="activeTab.set(tab.value)"
                    class="px-5 py-3 rounded-[1.25rem] text-[10px] uppercase tracking-widest font-black transition-all flex-1 whitespace-nowrap min-w-fit"
                    [class.bg-white]="activeTab() === tab.value" [class.dark:bg-white/10]="activeTab() === tab.value" [class.text-red-900]="activeTab() === tab.value" [class.dark:text-white]="activeTab() === tab.value" [class.shadow-md]="activeTab() === tab.value"
                    [class.text-gray-400]="activeTab() !== tab.value" [class.dark:text-gray-500]="activeTab() !== tab.value" [class.hover:text-gray-700]="activeTab() !== tab.value" [class.dark:hover:text-gray-300]="activeTab() !== tab.value" [class.hover:bg-white/50]="activeTab() !== tab.value" [class.dark:hover:bg-white/5]="activeTab() !== tab.value"
                  >
                    {{ tab.label }}
                    <span class="ml-1.5 px-2 py-0.5 rounded-lg text-[9px]"
                      [class.bg-red-50]="activeTab() === tab.value" [class.dark:bg-red-900/40]="activeTab() === tab.value" [class.text-red-700]="activeTab() === tab.value" [class.dark:text-red-400]="activeTab() === tab.value"
                      [class.bg-gray-100]="activeTab() !== tab.value" [class.dark:bg-white/5]="activeTab() !== tab.value">
                      {{ countByStatus(tab.value) }}
                    </span>
                  </button>
                }
              </div>

              <!-- Stat Summary Chips -->
              <div class="flex items-center gap-3 flex-wrap justify-center 2xl:justify-end">
                <div class="flex items-center gap-2 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-transparent px-4 py-2.5 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest shadow-sm dark:shadow-none">
                  <span class="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                  {{ countByStatus('PENDING') }}
                </div>
                <div class="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent px-4 py-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest shadow-sm dark:shadow-none">
                  <span class="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></span>
                  {{ countByStatus('APPROVED') }}
                </div>
                <div class="flex items-center gap-2 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-transparent px-4 py-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest shadow-sm dark:shadow-none">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                  {{ countByStatus('COMPLETED') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Loader -->
          @if (loading()) {
            <div class="space-y-6">
              @for (i of [1, 2, 3]; track i) {
                <div class="bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[2.5rem] shadow-xl p-8 animate-pulse border border-white dark:border-white/5">
                  <div class="flex items-center gap-6 mb-8">
                    <div class="w-16 h-16 bg-gray-200 dark:bg-white/5 rounded-[1.5rem]"></div>
                    <div class="space-y-3 flex-1">
                      <div class="h-6 bg-gray-200 dark:bg-white/10 rounded-lg w-1/3"></div>
                      <div class="h-3 bg-gray-200 dark:bg-white/5 rounded-md w-1/5"></div>
                    </div>
                  </div>
                  <div class="h-16 bg-gray-100/50 dark:bg-black/20 rounded-2xl"></div>
                </div>
              }
            </div>
          }

          <!-- Empty State -->
          @if (!loading() && filtered().length === 0) {
            <div class="bg-white/80 dark:bg-card backdrop-blur-2xl rounded-[3rem] shadow-2xl dark:shadow-none border border-white dark:border-white/5 py-32 text-center flex flex-col items-center">
              <div class="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent flex items-center justify-center mb-8 shadow-inner border border-gray-100 dark:border-white/10 transition-transform hover:scale-105 duration-300">
                <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h3 class="text-gray-900 dark:text-white font-black text-2xl mb-2 tracking-tight">
                No {{ activeTab() === 'ALL' ? '' : activeTab().toLowerCase() + ' ' }}bookings
              </h3>
              <p class="text-gray-400 dark:text-gray-500 font-bold text-sm">Nothing to show in this view right now.</p>
            </div>
          }

          <!-- Glass Booking Cards -->
          <div class="space-y-6">
            @for (b of filtered(); track b.id) {
              <div
                class="bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] shadow-xl dark:shadow-none hover:shadow-2xl dark:hover:bg-black/60 transition-all duration-500 overflow-hidden cursor-pointer border relative group"
                [class.ring-2]="selectedBooking()?.id === b.id"
                [class.ring-red-800]="selectedBooking()?.id === b.id" [class.shadow-red-900/10]="selectedBooking()?.id === b.id"
                [class.border-white]="selectedBooking()?.id !== b.id" [class.dark:border-white/5]="selectedBooking()?.id !== b.id"
                [class.scale-[1.02]]="selectedBooking()?.id === b.id"
                (click)="selectBooking(b)"
              >
                <!-- Status Ribbon Effect -->
                <div class="absolute left-0 top-0 bottom-0 w-2.5 transition-colors shadow-inner"
                  [class.bg-gradient-to-b]="true"
                  [class.from-amber-400]="b.status === 'PENDING'" [class.to-amber-500]="b.status === 'PENDING'"
                  [class.from-blue-400]="b.status === 'APPROVED'" [class.to-blue-600]="b.status === 'APPROVED'"
                  [class.from-emerald-400]="b.status === 'COMPLETED'" [class.to-emerald-600]="b.status === 'COMPLETED'"
                  [class.from-red-400]="b.status === 'CANCELLED'" [class.to-red-600]="b.status === 'CANCELLED'">
                </div>

                <div class="pl-10 pr-8 py-8">

                  <!-- Top Row -->
                  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                    <div class="flex items-center gap-5">
                      <div class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-inner border border-white group-hover:scale-105 group-hover:rotate-3 transition-transform shrink-0 bg-gradient-to-br relative overflow-hidden"
                        [class.from-amber-100]="b.status === 'PENDING'" [class.to-amber-50]="b.status === 'PENDING'" [class.text-amber-700]="b.status === 'PENDING'"
                        [class.from-blue-100]="b.status === 'APPROVED'" [class.to-blue-50]="b.status === 'APPROVED'" [class.text-blue-700]="b.status === 'APPROVED'"
                        [class.from-emerald-100]="b.status === 'COMPLETED'" [class.to-emerald-50]="b.status === 'COMPLETED'" [class.text-emerald-700]="b.status === 'COMPLETED'"
                        [class.from-red-100]="b.status === 'CANCELLED'" [class.to-red-50]="b.status === 'CANCELLED'" [class.text-red-600]="b.status === 'CANCELLED'">
                        @if (b.student_picture) {
                          <img [src]="b.student_picture" class="w-full h-full object-cover absolute inset-0" (error)="b.student_picture = ''" alt="Student avatar" />
                        } @else {
                          {{ b.student_name.charAt(0) }}
                        }
                      </div>
                      <div>
                        <p class="font-black text-gray-900 dark:text-foreground text-xl leading-tight tracking-tight">{{ b.student_name }}</p>
                        <div class="flex items-center gap-2 mt-1.5 opacity-70">
                          <svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          <p class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ b.student_email }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 flex-wrap">
                      <app-status-badge [status]="b.status" />
                      
                      @if (b.consultation_type === 'ONLINE' && b.status === 'APPROVED' && !b.chat_closed) {
                        <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-900/20 text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-900/50 shadow-sm animate-pulse">
                          <span class="w-2 h-2 bg-emerald-500 rounded-full shadow-glow-sm"></span>
                          Chat Active
                        </span>
                      }
                      @if (b.consultation_type === 'ONLINE' && b.chat_closed) {
                        <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 border border-gray-200 dark:border-white/10 shadow-sm">
                          <svg class="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                          Chat Closed
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Detail Chips -->
                  <div class="flex flex-wrap items-center gap-3 mb-8">
                    <div class="flex items-center gap-1.5 bg-gray-50/80 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/10 text-[11px] font-black text-gray-600 dark:text-gray-400 shadow-sm dark:shadow-none backdrop-blur-sm">
                      <svg class="w-4 h-4 text-red-800 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {{ b.scheduled_date | date:'EEEE, MMM d, y' }}
                    </div>
                    <div class="flex items-center gap-1.5 bg-gray-50/80 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/10 text-[11px] font-black text-gray-600 dark:text-gray-400 shadow-sm dark:shadow-none backdrop-blur-sm">
                      <svg class="w-4 h-4 text-red-800 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ b.start_time | timeFormat }} – {{ b.end_time | timeFormat }}
                    </div>
                    <div class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[11px] font-black shadow-sm dark:shadow-none tracking-widest uppercase backdrop-blur-sm"
                      [class.bg-blue-50/80]="b.consultation_type === 'ONLINE'" [class.dark:bg-blue-900/20]="b.consultation_type === 'ONLINE'" [class.border-blue-100]="b.consultation_type === 'ONLINE'" [class.dark:border-blue-900/50]="b.consultation_type === 'ONLINE'" [class.text-blue-800]="b.consultation_type === 'ONLINE'" [class.dark:text-blue-400]="b.consultation_type === 'ONLINE'"
                      [class.bg-gray-50/80]="b.consultation_type === 'FACE_TO_FACE'" [class.dark:bg-white/5]="b.consultation_type === 'FACE_TO_FACE'" [class.border-gray-200]="b.consultation_type === 'FACE_TO_FACE'" [class.dark:border-white/10]="b.consultation_type === 'FACE_TO_FACE'" [class.text-gray-700]="b.consultation_type === 'FACE_TO_FACE'" [class.dark:text-gray-400]="b.consultation_type === 'FACE_TO_FACE'">
                      @if (b.consultation_type === 'ONLINE') {
                        <svg class="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        Online
                      } @else {
                        <svg class="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        In-person
                      }
                    </div>
                  </div>

                  <!-- Reschedule Request Block -->
                  @if (b.reschedule_status === 'REQUESTED') {
                    <div class="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-black/40 border border-amber-200 dark:border-amber-900/50 rounded-[1.5rem] p-6 mb-8 shadow-md dark:shadow-none relative overflow-hidden group/resc">
                      <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-500/10 dark:from-amber-500/5 to-transparent"></div>
                      
                      <p class="text-[10px] font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Reschedule Requires Approval
                      </p>
                      
                      <div class="bg-white/60 dark:bg-black/40 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-4 inline-block shadow-sm">
                        <p class="text-xs font-bold text-amber-900 dark:text-amber-100 flex items-center gap-3">
                          <span class="font-black uppercase tracking-widest text-[10px] bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-md text-amber-800 dark:text-amber-400">Proposed</span>
                          {{ b.reschedule_date | date:'EEEE, MMM d, y' }} <span class="mx-1 opacity-40">|</span> {{ b.reschedule_start_time | timeFormat }} – {{ b.reschedule_end_time | timeFormat }}
                        </p>
                      </div>

                      <div class="flex gap-3 relative z-10">
                        <button
                          (click)="respondReschedule(b.id, true); $event.stopPropagation()"
                          [disabled]="responding() === b.id"
                          class="text-[10px] font-black uppercase tracking-widest bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50
                                 text-white px-6 py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-500/20 dark:shadow-none">
                          Approve Changes
                        </button>
                        <button
                          (click)="respondReschedule(b.id, false); $event.stopPropagation()"
                          [disabled]="responding() === b.id"
                          class="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 disabled:opacity-50
                                 text-red-700 dark:text-red-400 px-6 py-3 rounded-xl transition-all active:scale-95 border border-gray-200 dark:border-red-900/50 shadow-sm dark:shadow-none">
                          Keep Original
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Student Notes Block -->
                  @if (b.student_notes) {
                    <div class="bg-gray-50 dark:bg-black/20 border border-gray-100/80 dark:border-white/5 rounded-[1.5rem] p-5 mb-8 shadow-inner dark:shadow-none relative overflow-hidden">
                      <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 dark:bg-white/10"></div>
                      <p class="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                         <svg class="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                         </svg>
                         Request Description / Topic
                      </p>
                      <p class="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic ml-1">"{{ b.student_notes }}"</p>
                    </div>
                  }

                  <!-- Form: Add Teacher Notes -->
                  @if (b.status === 'COMPLETED' && !b.teacher_notes) {
                    <div class="bg-white dark:bg-card border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[1.5rem] p-6 mb-8 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group/notes">
                      <p class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 group-hover/notes:text-red-800 dark:group-hover/notes:text-red-400 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Document Session Summary
                      </p>
                      <textarea
                        [(ngModel)]="notesInput[b.id]"
                        rows="3"
                        placeholder="Type findings, recommendations, or private notes here..."
                        class="w-full border-2 border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40
                               focus:outline-none focus:border-red-400 dark:focus:border-red-500/50 focus:ring-4 focus:ring-red-100/50 dark:focus:ring-red-900/20 resize-y transition-all shadow-inner dark:shadow-none"
                      >
                      </textarea>
                      <div class="flex justify-end mt-4">
                        <button
                          (click)="saveNotes(b.id); $event.stopPropagation()"
                          class="text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white
                                 px-6 py-3 rounded-[1rem] transition-all active:scale-95 shadow-md shadow-emerald-600/20">
                          Save Documentation
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Display: Teacher Notes -->
                  @if (b.teacher_notes) {
                    <div class="bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-transparent border border-red-100 dark:border-red-900/30 rounded-[1.5rem] p-6 mb-8 shadow-inner dark:shadow-none relative overflow-hidden">
                      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-800 dark:bg-red-600"></div>
                      <p class="text-[9px] font-black text-red-800 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-2">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Private Consultation Notes
                      </p>
                      <p class="text-sm text-gray-900 dark:text-gray-300 font-bold leading-relaxed ml-2">{{ b.teacher_notes }}</p>
                    </div>
                  }

                  <!-- Actions & Toggle Row -->
                  <div class="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                    
                    <div class="flex items-center gap-3">
                      @if (b.status === 'PENDING' && b.reschedule_status !== 'REQUESTED') {
                        <button
                          (click)="updateStatus(b.id, 'APPROVED'); $event.stopPropagation()"
                          [disabled]="acting() === b.id"
                          class="text-[11px] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all active:scale-95 shadow-md shadow-blue-600/20 dark:shadow-none
                                 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 disabled:opacity-50 text-white">
                          Approve
                        </button>
                        <button
                          (click)="updateStatus(b.id, 'CANCELLED'); $event.stopPropagation()"
                          [disabled]="acting() === b.id"
                          class="text-[11px] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all active:scale-95 shadow-sm dark:shadow-none
                                 bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 text-red-700 dark:text-red-400 border border-gray-200 dark:border-red-900/50">
                          Decline
                        </button>
                      }

                      @if (b.status === 'APPROVED' && b.reschedule_status !== 'REQUESTED') {
                        <button
                          (click)="updateStatus(b.id, 'COMPLETED'); $event.stopPropagation()"
                          [disabled]="acting() === b.id"
                          class="text-[11px] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-600/20
                                 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 disabled:opacity-50 text-white flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                          Conclude Consultation
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── RIGHT INTEL PANEL (CHAT & TIMER) ── -->
        @if (
          selectedBooking() &&
          selectedBooking()!.consultation_type === 'ONLINE' &&
          (selectedBooking()!.status === 'APPROVED' || selectedBooking()!.status === 'COMPLETED')
        ) {
          <!-- Mobile Backdrop -->
          <div class="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" (click)="selectedBooking.set(null)"></div>

          <div class="fixed lg:sticky inset-x-0 bottom-0 top-16 lg:top-6 lg:w-[420px] xl:w-[480px] flex-shrink-0 z-50 lg:z-30 
                      bg-white lg:bg-white/80 lg:backdrop-blur-2xl rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl lg:shadow-xl lg:border lg:border-white transition-all transform flex flex-col h-[85vh] lg:h-[calc(100vh-3rem)]">
            
            <div class="flex flex-col h-full overflow-hidden rounded-t-[2.5rem] lg:rounded-[2.5rem]">
              
              <!-- Mobile Handle -->
              <div class="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 lg:hidden flex-shrink-0"></div>
              
              <div class="p-6 lg:p-8 flex-shrink-0 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur">
                <div class="flex items-start gap-4">
                  <div class="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 border border-red-500 relative overflow-hidden">
                    @if (selectedBooking()!.student_picture) {
                      <img [src]="selectedBooking()!.student_picture" class="w-full h-full object-cover absolute inset-0" (error)="selectedBooking()!.student_picture = ''" alt="Student avatar" />
                    } @else {
                      {{ selectedBooking()!.student_name.charAt(0) }}
                    }
                  </div>
                  <div class="flex-1 min-w-0 pt-0.5">
                    <p class="font-black text-gray-900 dark:text-foreground text-lg truncate tracking-tight">{{ selectedBooking()!.student_name }}</p>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {{ selectedBooking()!.scheduled_date | date:'EEE, MMM d' }} · {{ selectedBooking()!.start_time | timeFormat }}
                    </p>
                  </div>
                  <button (click)="selectedBooking.set(null)"
                    class="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                
                <div class="mt-4 flex flex-wrap gap-2">
                  @if (selectedBooking()!.status === 'APPROVED' && !selectedBooking()!.chat_closed) {
                    <span class="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-none">
                      <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-glow-sm"></span>
                      Live Channel
                    </span>
                  }
                  @if (selectedBooking()!.status === 'APPROVED' && selectedBooking()!.chat_closed) {
                    <span class="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 shadow-sm dark:shadow-none">
                      <svg class="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      Closed
                    </span>
                  }
                  @if (selectedBooking()!.status === 'COMPLETED') {
                    <span class="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-none">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      Read-only Archive
                    </span>
                  }
                </div>
              </div>

              <!-- Module Content Area -->
              <div class="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/20">
                @if (!chatReady[selectedBooking()!.id] && selectedBooking()!.status === 'APPROVED' && !selectedBooking()!.chat_closed) {
                  <div class="h-full flex items-center justify-center p-6">
                    <app-consultation-countdown
                      [booking]="selectedBooking()!"
                      (chatReadyChange)="onChatReady(selectedBooking()!.id, $event)" />
                  </div>
                }
                @if (selectedBooking()!.status === 'APPROVED' && !selectedBooking()!.chat_closed && chatReady[selectedBooking()!.id]) {
                  <app-chat [booking]="selectedBooking()!" class="h-full flex flex-col" />
                }
                @if (selectedBooking()!.status === 'COMPLETED' || selectedBooking()!.chat_closed) {
                  <app-chat [booking]="selectedBooking()!" class="h-full flex flex-col" />
                }
              </div>

            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class PendingBookingsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);


  bookings = signal<Booking[]>([]);
  loading = signal(true);
  acting = signal<number | null>(null);
  responding = signal<number | null>(null);
  activeTab = signal<string>('ALL');

  notesInput: Record<number, string> = {};

  selectedBooking = signal<Booking | null>(null);
  chatReady: Record<number, boolean> = {};

  tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  ngOnInit(): void {
    this.load();
  }

  selectBooking(booking: Booking): void {
    if (this.selectedBooking()?.id === booking.id) {
      this.selectedBooking.set(null);
      return;
    }
    this.selectedBooking.set(booking);
  }

  onChatReady(bookingId: number, ready: boolean): void {
    this.chatReady[bookingId] = ready;
  }

  load(): void {
    this.api.getBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filtered(): Booking[] {
    const tab = this.activeTab();
    let list = tab === 'ALL' ? this.bookings() : this.bookings().filter((b) => b.status === tab);


    return list;
  }

  countByStatus(status: string): number {
    if (status === 'ALL') return this.bookings().length;
    return this.bookings().filter((b) => b.status === status).length;
  }

  updateStatus(id: number, status: BookingStatus): void {
    this.acting.set(id);
    this.api.updateBookingStatus(id, status).subscribe({
      next: () => {
        this.acting.set(null);
        this.load();
      },
      error: () => this.acting.set(null),
    });
  }

  respondReschedule(id: number, accept: boolean): void {
    this.responding.set(id);
    this.api.respondReschedule(id, accept).subscribe({
      next: () => {
        this.responding.set(null);
        this.load();
      },
      error: () => this.responding.set(null),
    });
  }

  saveNotes(id: number): void {
    const notes = this.notesInput[id]?.trim();
    if (!notes) return;
    this.api.addBookingNotes(id, notes).subscribe({
      next: () => this.load(),
    });
  }
}
