import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../../core/services/presence.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ChatComponent } from '../../../shared/components/chat/chat.component';
import { ConsultationCountdownComponent } from '../../../shared/components/consultation-countdown/consultation-countdown.component';
import { SearchService } from '../../../core/services/search.service';
import type { Booking, Availability, Feedback } from '../../../core/models/index';
import { BookingDetailComponent } from '../../../shared/components/booking-detail/booking-detail.component';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    ChatComponent,
    ConsultationCountdownComponent,
    DatePickerModule,
    TimeFormatPipe,
  ],
  template: `
    <div class="min-h-screen pb-12 animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">

      <!-- ── Floating Hero Header ── -->
      <div class="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-red-900/20 overflow-hidden mb-8 group">
        <!-- Dynamic light beam -->
        <div class="absolute top-0 left-[-20%] w-[50%] h-full bg-white/10 blur-[60px] -skew-x-12 transform group-hover:translate-x-[300%] transition-transform duration-1000"></div>
        <!-- Ambient Glow -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]"></div>

        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <span class="inline-block px-3 py-1 bg-white/20 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-4 shadow-inner backdrop-blur-md">Consultation Records</span>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-md">My Appointments</h1>
            <p class="text-sm font-medium text-red-100/90 leading-relaxed max-w-xl text-balance">Track and manage your upcoming consultation sessions.</p>
          </div>
          <button
            (click)="router.navigate(['/student/teachers'])"
            class="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] text-white text-[11px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-md active:scale-95 shrink-0 w-full sm:w-auto">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Book New Session
          </button>
        </div>
      </div>

      <!-- ── Body ── -->
      <div class="flex flex-col lg:flex-row gap-8 relative z-10">

        <!-- ── Main List ── -->
        <div class="flex-1 min-w-0 space-y-6">

          <!-- Controls Glass Card -->
          <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-red-900/5 border border-white dark:border-white/5 p-6">
            <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <!-- Upcoming / Past toggle -->
              <div class="flex bg-white/40 dark:bg-black/20 border border-white dark:border-white/5 p-1 rounded-2xl w-fit gap-1 shadow-inner">
                <button (click)="view.set('upcoming')"
                  class="px-6 py-2.5 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all"
                  [class.bg-white]="view() === 'upcoming'" [class.dark:bg-white/10]="view() === 'upcoming'"
                  [class.text-red-900]="view() === 'upcoming'" [class.dark:text-white]="view() === 'upcoming'"
                  [class.shadow-sm]="view() === 'upcoming'"
                  [class.border]="view() === 'upcoming'"
                  [class.border-white]="view() === 'upcoming'" [class.dark:border-white/5]="view() === 'upcoming'"
                  [class.text-gray-500]="view() !== 'upcoming'" [class.dark:text-gray-400]="view() !== 'upcoming'"
                  [class.hover:text-gray-900]="view() !== 'upcoming'" [class.dark:hover:text-white]="view() !== 'upcoming'">
                  Upcoming
                  <span class="ml-1 opacity-60">({{ upcomingCount() }})</span>
                </button>
                <button (click)="view.set('past')"
                  class="px-6 py-2.5 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all"
                  [class.bg-white]="view() === 'past'" [class.dark:bg-white/10]="view() === 'past'"
                  [class.text-red-900]="view() === 'past'" [class.dark:text-white]="view() === 'past'"
                  [class.shadow-sm]="view() === 'past'"
                  [class.border]="view() === 'past'"
                  [class.border-white]="view() === 'past'" [class.dark:border-white/5]="view() === 'past'"
                  [class.text-gray-500]="view() !== 'past'" [class.dark:text-gray-400]="view() !== 'past'"
                  [class.hover:text-gray-900]="view() !== 'past'" [class.dark:hover:text-white]="view() !== 'past'">
                  Past
                  <span class="ml-1 opacity-60">({{ pastCount() }})</span>
                </button>
              </div>

              <!-- Status filter pills -->
              @if (view() === 'upcoming') {
                <div class="flex gap-2 flex-wrap">
                  <button (click)="statusFilter.set('ALL')"
                    class="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border shadow-sm active:scale-95"
                    [class.bg-gradient-to-br]="statusFilter() === 'ALL'" [class.from-red-900]="statusFilter() === 'ALL'" [class.to-red-800]="statusFilter() === 'ALL'" [class.text-white]="statusFilter() === 'ALL'" [class.border-transparent]="statusFilter() === 'ALL'"
                    [class.bg-white/60]="statusFilter() !== 'ALL'" [class.dark:bg-white/5]="statusFilter() !== 'ALL'" [class.backdrop-blur-md]="statusFilter() !== 'ALL'" [class.text-gray-600]="statusFilter() !== 'ALL'" [class.dark:text-gray-400]="statusFilter() !== 'ALL'" [class.border-white]="statusFilter() !== 'ALL'" [class.dark:border-white/5]="statusFilter() !== 'ALL'" [class.hover:bg-white]="statusFilter() !== 'ALL'" [class.dark:hover:bg-white/10]="statusFilter() !== 'ALL'">
                    All <span class="ml-1 opacity-60">({{ upcomingCount() }})</span>
                  </button>
                  <button (click)="statusFilter.set('PENDING')"
                    class="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border shadow-sm active:scale-95"
                    [class.bg-gradient-to-br]="statusFilter() === 'PENDING'" [class.from-red-900]="statusFilter() === 'PENDING'" [class.to-red-800]="statusFilter() === 'PENDING'" [class.text-white]="statusFilter() === 'PENDING'" [class.border-transparent]="statusFilter() === 'PENDING'"
                    [class.bg-white/60]="statusFilter() !== 'PENDING'" [class.dark:bg-white/5]="statusFilter() !== 'PENDING'" [class.backdrop-blur-md]="statusFilter() !== 'PENDING'" [class.text-gray-600]="statusFilter() !== 'PENDING'" [class.dark:text-gray-400]="statusFilter() !== 'PENDING'" [class.border-white]="statusFilter() !== 'PENDING'" [class.dark:border-white/5]="statusFilter() !== 'PENDING'" [class.hover:bg-white]="statusFilter() !== 'PENDING'" [class.dark:hover:bg-white/10]="statusFilter() !== 'PENDING'">
                    Pending <span class="ml-1 opacity-60">({{ pendingCount() }})</span>
                  </button>
                  <button (click)="statusFilter.set('APPROVED')"
                    class="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border shadow-sm active:scale-95"
                    [class.bg-gradient-to-br]="statusFilter() === 'APPROVED'" [class.from-red-900]="statusFilter() === 'APPROVED'" [class.to-red-800]="statusFilter() === 'APPROVED'" [class.text-white]="statusFilter() === 'APPROVED'" [class.border-transparent]="statusFilter() === 'APPROVED'"
                    [class.bg-white/60]="statusFilter() !== 'APPROVED'" [class.dark:bg-white/5]="statusFilter() !== 'APPROVED'" [class.backdrop-blur-md]="statusFilter() !== 'APPROVED'" [class.text-gray-600]="statusFilter() !== 'APPROVED'" [class.dark:text-gray-400]="statusFilter() !== 'APPROVED'" [class.border-white]="statusFilter() !== 'APPROVED'" [class.dark:border-white/5]="statusFilter() !== 'APPROVED'" [class.hover:bg-white]="statusFilter() !== 'APPROVED'" [class.dark:hover:bg-white/10]="statusFilter() !== 'APPROVED'">
                    Approved <span class="ml-1 opacity-60">({{ approvedCount() }})</span>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Skeleton -->
          @if (loading()) {
            <div class="space-y-6">
              @for (i of [1, 2, 3]; track i) {
                <div class="bg-white/40 dark:bg-card/50 backdrop-blur-md rounded-[2.5rem] shadow-sm p-8 animate-pulse border border-white dark:border-white/5">
                  <div class="flex items-center gap-5 mb-6">
                    <div class="w-14 h-14 bg-white/60 dark:bg-white/10 rounded-2xl"></div>
                    <div class="space-y-3 flex-1">
                      <div class="h-4 bg-white/60 dark:bg-white/10 rounded w-1/3"></div>
                      <div class="h-2 bg-white/60 dark:bg-white/10 rounded w-1/5"></div>
                    </div>
                  </div>
                  <div class="h-14 bg-white/40 dark:bg-white/5 rounded-2xl"></div>
                </div>
              }
            </div>
          }

          <!-- Empty State -->
          @if (!loading() && displayed().length === 0) {
            <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[3rem] shadow-xl shadow-red-900/5 border border-white dark:border-white/5 py-24 text-center">
              <div class="w-20 h-20 rounded-[1.5rem] bg-white/80 dark:bg-white/5 flex items-center justify-center mb-6 mx-auto border border-white dark:border-white/5 shadow-sm">
                <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-gray-900 dark:text-foreground font-black text-2xl mb-2">
                No {{ view() === 'upcoming' ? 'upcoming' : 'past' }} appointments
              </h3>
              @if (view() === 'upcoming') {
                <p class="text-gray-500 dark:text-gray-400 font-medium text-sm mb-8">Book a session with one of our instructors to get started.</p>
                <button (click)="router.navigate(['/student/teachers'])"
                  class="bg-gray-900 dark:bg-white/5 hover:bg-black dark:hover:bg-white/10 text-white text-[10px] uppercase tracking-widest font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-black/10 active:scale-95 border border-gray-800 dark:border-white/5">
                  Browse Instructors
                </button>
              } @else {
                <p class="text-gray-500 dark:text-gray-400 font-medium text-sm">Your completed and cancelled sessions will appear here.</p>
              }
            </div>
          }

          <!-- Booking Cards -->
          <div class="space-y-6 pb-12 lg:pb-0">
            @for (b of displayed(); track b.id) {
              <div
                class="bg-white/70 dark:bg-card/70 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-red-900/5 hover:shadow-2xl hover:shadow-red-900/10 dark:hover:shadow-white/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer border relative group"
                [class.border-red-400]="selectedBooking()?.id === b.id"
                [class.ring-4]="selectedBooking()?.id === b.id"
                [class.ring-red-100]="selectedBooking()?.id === b.id" [class.dark:ring-red-900/40]="selectedBooking()?.id === b.id"
                [class.border-white]="selectedBooking()?.id !== b.id" [class.dark:border-white/5]="selectedBooking()?.id !== b.id"
                (click)="selectBooking(b)">

                <!-- Status Ribbon -->
                <div class="absolute left-0 top-0 bottom-0 w-2.5 transition-colors shadow-inner"
                  [class.bg-amber-400]="b.status === 'PENDING'"
                  [class.bg-blue-500]="b.status === 'APPROVED'"
                  [class.bg-emerald-500]="b.status === 'COMPLETED'"
                  [class.bg-red-400]="b.status === 'CANCELLED'">
                </div>

                <div class="pl-10 pr-8 py-8">

                  <!-- Top Row -->
                  <div class="flex items-start justify-between gap-4 mb-6">
                    <div class="flex items-center gap-5">
                      <img
                        [src]="b.teacher_picture || 'https://ui-avatars.com/api/?name=' + b.teacher_name + '&background=831b1b&color=fff'"
                        [alt]="b.teacher_name"
                        class="w-16 h-16 rounded-[1.25rem] object-cover border-[4px] border-white dark:border-black/50 shadow-lg group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500"/>
                      <div>
                        <p class="font-black text-gray-900 dark:text-foreground text-xl leading-tight">{{ b.teacher_name }}</p>
                        <p class="text-[10px] font-black uppercase tracking-widest mt-1.5"
                          [class.text-blue-600]="b.consultation_type === 'ONLINE'"
                          [class.text-gray-400]="b.consultation_type !== 'ONLINE'">
                          @if (b.consultation_type === 'ONLINE') {
                            <span class="inline-flex items-center gap-1.5">
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                              </svg>
                              Online Session
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1.5">
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              Face to Face
                            </span>
                          }
                        </p>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-3 shrink-0">
                      <app-status-badge [status]="b.status"/>
                      @if (b.consultation_type === 'ONLINE' && b.status === 'APPROVED' && !b.chat_closed && isLive(b.scheduled_date, b.start_time, b.end_time)) {
                        <span class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 flex items-center gap-2 border border-emerald-200 shadow-sm">
                          <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                          Chat Live
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Detail Chips -->
                  <div class="flex flex-wrap items-center gap-3 mb-6">
                    <div class="flex items-center gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white dark:border-white/5 text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                      <svg class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {{ b.scheduled_date | date:'EEE, MMM d, y' }}
                    </div>
                    <div class="flex items-center gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white dark:border-white/5 text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                      <svg class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ b.start_time | timeFormat }} – {{ b.end_time | timeFormat }}
                    </div>
                    @if (selectedBooking()?.id === b.id && b.consultation_type === 'ONLINE' && b.status === 'APPROVED') {
                      <span class="flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-widest text-red-800 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                        Chat Active
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
                        </svg>
                      </span>
                    }
                  </div>

                  <!-- Reschedule Request -->
                  @if (b.reschedule_status === 'REQUESTED') {
                    <div class="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-[1.5rem] p-5 mb-6 shadow-sm">
                      <p class="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1.5">⏳ Reschedule Pending</p>
                      <p class="text-xs font-bold text-amber-700">Proposed: {{ b.reschedule_date | date:'MMM d, y' }} · {{ b.reschedule_start_time | timeFormat }} – {{ b.reschedule_end_time | timeFormat }}</p>
                    </div>
                  }

                  <!-- Notes -->
                  @if (b.student_notes || b.teacher_notes) {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      @if (b.student_notes) {
                        <div class="bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white dark:border-white/5 rounded-[1.5rem] p-5 shadow-inner">
                          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                             <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                             </svg>
                             My Notes
                          </p>
                          <p class="text-sm text-gray-700 dark:text-gray-300 font-medium italic leading-relaxed">"{{ b.student_notes }}"</p>
                        </div>
                      }
                      @if (b.teacher_notes) {
                        <div class="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-100 dark:border-red-900/50 rounded-[1.5rem] p-5 shadow-inner">
                          <p class="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                             <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                             Teacher Reply
                          </p>
                          <p class="text-sm text-red-900 dark:text-red-200 font-bold leading-relaxed">{{ b.teacher_notes }}</p>
                        </div>
                      }
                    </div>
                  }

                  <!-- ── Feedback Section (Completed Bookings Only) ── -->
                  @if (b.status === 'COMPLETED') {
                    <div class="mb-6">
                      @if (feedbackMap[b.id]?.submitted) {
                        <!-- Already Submitted - Read Only -->
                        <div class="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 dark:from-amber-900/20 dark:to-yellow-900/10 backdrop-blur-sm border border-amber-200/60 dark:border-amber-800/30 rounded-[1.5rem] p-5 shadow-sm">
                          <div class="flex items-center gap-3 mb-3">
                            <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center shadow-inner">
                              <svg class="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </div>
                            <div>
                              <p class="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Your Rating</p>
                              <div class="flex gap-0.5 mt-0.5">
                                @for (star of [1,2,3,4,5]; track star) {
                                  <svg class="w-4 h-4 transition-colors" [class.text-amber-400]="star <= (feedbackMap[b.id]?.rating ?? 0)" [class.text-gray-200]="star > (feedbackMap[b.id]?.rating ?? 0)" [class.dark:text-gray-700]="star > (feedbackMap[b.id]?.rating ?? 0)" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                }
                              </div>
                            </div>
                            <span class="ml-auto text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">{{ feedbackMap[b.id]?.rating }}/5</span>
                          </div>
                          @if (feedbackMap[b.id]?.comment) {
                            <p class="text-sm text-amber-900 dark:text-amber-200 font-medium italic leading-relaxed pl-12">"{{ feedbackMap[b.id]?.comment }}"</p>
                          }
                        </div>
                      } @else if (!feedbackMap[b.id]?.loading) {
                        <!-- Rating Form -->
                        <div class="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white dark:border-white/5 rounded-[1.5rem] p-5 shadow-inner" (click)="$event.stopPropagation()">
                          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                            Rate this consultation
                          </p>
                          <!-- Stars -->
                          <div class="flex items-center gap-1.5 mb-4">
                            @for (star of [1,2,3,4,5]; track star) {
                              <button
                                (click)="setRating(b.id, star); $event.stopPropagation()"
                                (mouseenter)="setHoverRating(b.id, star)"
                                (mouseleave)="setHoverRating(b.id, 0)"
                                class="p-1 rounded-lg transition-all duration-200 hover:scale-125 active:scale-90 focus:outline-none"
                                [class.scale-110]="star <= (feedbackMap[b.id]?.hoverRating || feedbackMap[b.id]?.pendingRating || 0)">
                                <svg class="w-7 h-7 transition-all duration-200 drop-shadow-sm"
                                  [class.text-amber-400]="star <= (feedbackMap[b.id]?.hoverRating || feedbackMap[b.id]?.pendingRating || 0)"
                                  [class.drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]]="star <= (feedbackMap[b.id]?.hoverRating || feedbackMap[b.id]?.pendingRating || 0)"
                                  [class.text-gray-200]="star > (feedbackMap[b.id]?.hoverRating || feedbackMap[b.id]?.pendingRating || 0)"
                                  [class.dark:text-gray-700]="star > (feedbackMap[b.id]?.hoverRating || feedbackMap[b.id]?.pendingRating || 0)"
                                  viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </button>
                            }
                            @if (feedbackMap[b.id]?.pendingRating) {
                              <span class="ml-2 text-sm font-black text-amber-600 dark:text-amber-400">{{ ratingLabel(feedbackMap[b.id]?.pendingRating ?? 0) }}</span>
                            }
                          </div>
                          <!-- Comment -->
                          @if (feedbackMap[b.id]?.pendingRating) {
                            <textarea
                              [value]="feedbackMap[b.id]?.pendingComment ?? ''"
                              (input)="setComment(b.id, $any($event.target).value)"
                              (click)="$event.stopPropagation()"
                              placeholder="Share your experience (optional)..."
                              rows="2"
                              class="w-full bg-white/60 dark:bg-white/5 border border-white dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-800 focus:border-amber-300 transition-all resize-none mb-3 shadow-inner"></textarea>
                            <button
                              (click)="submitFeedback(b); $event.stopPropagation()"
                              [disabled]="feedbackMap[b.id]?.submitting"
                              class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                              @if (feedbackMap[b.id]?.submitting) {
                                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                Submitting...
                              } @else {
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                Submit Rating
                              }
                            </button>
                          }
                        </div>
                      }
                    </div>
                  }

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end gap-3 pt-5 border-t border-white/50 dark:border-white/10">
                    @if (b.status === 'PENDING' && b.reschedule_status !== 'REQUESTED') {
                      <button
                        (click)="promptCancel(b); $event.stopPropagation()"
                        class="text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:text-white dark:hover:text-white hover:bg-red-600 hover:border-red-600 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm active:scale-95 shadow-sm">
                        Cancel Event
                      </button>
                    }
                    @if ((b.status === 'PENDING' || b.status === 'APPROVED') && b.reschedule_status !== 'REQUESTED') {
                      <button
                        (click)="openReschedule(b); $event.stopPropagation()"
                        class="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-5 py-3 rounded-xl transition-all border border-white dark:border-white/10 hover:bg-white dark:hover:bg-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm active:scale-95 shadow-sm">
                        Reschedule
                      </button>
                    }
                    @if (b.consultation_type === 'ONLINE' && (b.status === 'APPROVED' || b.status === 'COMPLETED')) {
                      <button (click)="selectBooking(b); $event.stopPropagation()"
                        class="text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg border"
                        [class.bg-gradient-to-r]="b.status === 'APPROVED'" [class.from-emerald-600]="b.status === 'APPROVED'" [class.to-emerald-500]="b.status === 'APPROVED'" [class.text-white]="b.status === 'APPROVED'" [class.border-transparent]="b.status === 'APPROVED'"
                        [class.bg-white]="b.status === 'COMPLETED'" [class.dark:bg-card/80]="b.status === 'COMPLETED'" [class.hover:bg-gray-50]="b.status === 'COMPLETED'" [class.dark:hover:bg-card]="b.status === 'COMPLETED'" [class.text-gray-700]="b.status === 'COMPLETED'" [class.dark:text-gray-300]="b.status === 'COMPLETED'" [class.border-gray-200]="b.status === 'COMPLETED'" [class.dark:border-white/10]="b.status === 'COMPLETED'">
                        <svg class="w-4 h-4" font-bold fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        {{ b.status === 'APPROVED' ? 'Open Module' : 'Transcript' }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Side Chat Panel (Responsive via Fixed overlay on Mobile, Sticky Column on Desktop) ── -->
        @if (selectedBooking() && selectedBooking()!.consultation_type === 'ONLINE' && (selectedBooking()!.status === 'APPROVED' || selectedBooking()!.status === 'COMPLETED')) {
          <!-- Overlay background for Mobile to act as modal backstop -->
          <div class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" (click)="selectedBooking.set(null)"></div>
          
          <div class="fixed lg:sticky inset-x-0 bottom-0 top-16 lg:top-6 lg:w-[400px] xl:w-[450px] flex-shrink-0 z-50 lg:z-auto bg-gray-50 lg:bg-transparent rounded-t-[3rem] lg:rounded-none shadow-2xl lg:shadow-none overflow-hidden lg:overflow-visible transition-transform duration-300 flex flex-col">
            <div class="space-y-4 p-4 lg:p-0 flex flex-col h-full lg:h-auto overflow-y-auto lg:overflow-visible">

              <!-- Chat Header Glass Card -->
              <div class="bg-white/80 dark:bg-card/90 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-red-900/5 border border-white dark:border-white/5 overflow-hidden">
                <!-- Mobile drag handle visual -->
                <div class="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 lg:hidden"></div>
                <div class="h-1 bg-red-900 hidden lg:block"></div>
                
                <div class="p-6">
                  <div class="flex items-center gap-4 mb-4">
                    <img
                      [src]="selectedBooking()!.teacher_picture || 'https://ui-avatars.com/api/?name=' + selectedBooking()!.teacher_name + '&background=831b1b&color=fff'"
                      [alt]="selectedBooking()!.teacher_name"
                      class="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-black/50 shadow-md"/>
                    <div class="flex-1 min-w-0">
                      <p class="font-black text-gray-900 dark:text-foreground text-base truncate">{{ selectedBooking()!.teacher_name }}</p>
                      <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                        {{ selectedBooking()!.scheduled_date | date:'EEE, MMM d' }} · {{ selectedBooking()!.start_time | timeFormat }}
                      </p>
                    </div>
                    <button (click)="selectedBooking.set(null)"
                      class="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-card/100 rounded-xl transition-all shadow-sm active:scale-95 bg-white dark:bg-card border dark:border-white/5">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  @if (selectedBooking()!.status === 'APPROVED' && !selectedBooking()!.chat_closed) {
                    <div class="flex items-center gap-2 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl px-4 py-2.5 shadow-inner">
                      <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      <p class="text-[11px] font-black uppercase tracking-widest text-emerald-800">Live Session Active</p>
                    </div>
                  }
                  @if (selectedBooking()!.status === 'APPROVED' && selectedBooking()!.chat_closed) {
                    <div class="flex items-center gap-2 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-2.5 shadow-inner">
                      <span class="text-sm">🔒</span>
                      <p class="text-[11px] font-black uppercase tracking-widest text-gray-600">Consultation Ended</p>
                    </div>
                  }
                  @if (selectedBooking()!.status === 'COMPLETED') {
                    <div class="flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl px-4 py-2.5 shadow-inner">
                      <span class="text-sm">📋</span>
                      <p class="text-[11px] font-black uppercase tracking-widest text-blue-800">Chat Transcript</p>
                    </div>
                  }
                </div>
              </div>

              @if (!chatReady[selectedBooking()!.id] && selectedBooking()!.status === 'APPROVED' && !selectedBooking()!.chat_closed) {
                <app-consultation-countdown
                  [booking]="selectedBooking()!"
                  (chatReadyChange)="onChatReady(selectedBooking()!.id, $event)"/>
              }
              @if (selectedBooking()!.status === 'APPROVED' && !selectedBooking()!.chat_closed && chatReady[selectedBooking()!.id]) {
                <app-chat [booking]="selectedBooking()!"/>
              }
              @if (selectedBooking()!.status === 'COMPLETED' || selectedBooking()!.chat_closed) {
                <app-chat [booking]="selectedBooking()!"/>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- ── Cancel Confirmation Modal ── -->
    @if (cancelTarget()) {
      <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white/90 dark:bg-card/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white dark:border-white/5 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
          <div class="h-1.5 bg-red-900"></div>
          <div class="p-8">
            <div class="flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 shadow-inner rounded-3xl mx-auto mb-6">
              <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-black text-gray-900 dark:text-foreground text-center mb-2">Cancel Appointment?</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center font-medium mb-2">You're about to cancel your session with</p>
            <p class="text-base font-black text-red-800 dark:text-red-400 text-center mb-6">{{ cancelTarget()!.teacher_name }}</p>
            
            <div class="bg-white dark:bg-white/5 rounded-2xl p-5 mb-8 text-center border border-gray-100 dark:border-white/5 shadow-sm">
              <p class="text-xs font-black text-gray-900 dark:text-foreground">{{ cancelTarget()!.scheduled_date | date:'fullDate' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1.5">{{ cancelTarget()!.start_time | timeFormat }} – {{ cancelTarget()!.end_time | timeFormat }}</p>
            </div>
            
            <div class="flex gap-4">
              <button (click)="cancelTarget.set(null)"
                class="flex-1 bg-white dark:bg-card border-2 border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm font-black text-xs uppercase tracking-widest py-4 rounded-[1.25rem] transition-all active:scale-95">
                Keep It
              </button>
              <button (click)="confirmCancel()" [disabled]="cancelling() !== null"
                class="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-[1.25rem] transition-all active:scale-95 shadow-md shadow-red-600/20">
                {{ cancelling() !== null ? 'Wait...' : 'Yes, Cancel' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ── Reschedule Modal ── -->
    @if (rescheduleTarget()) {
      <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white/95 dark:bg-card/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white dark:border-white/5 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
          <div class="h-1.5 bg-red-900"></div>
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="font-black text-gray-900 dark:text-foreground text-xl tracking-tight">Request Reschedule</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">Propose a new time to your teacher</p>
              </div>
              <button (click)="closeReschedule()"
                class="p-2.5 bg-white dark:bg-card text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-card/100 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-white/5 active:scale-95">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-sm">
              <div class="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-red-900 to-red-800 text-white flex items-center justify-center font-black text-xl shadow-inner">
                {{ rescheduleTarget()!.teacher_name.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-black text-gray-900 dark:text-foreground">{{ rescheduleTarget()!.teacher_name }}</p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-1">
                  Current: {{ rescheduleTarget()!.scheduled_date | date:'MMM d, y' }} · {{ rescheduleTarget()!.start_time | timeFormat }}
                </p>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5 ml-1">New Date</label>
                <p-datepicker
                    [(ngModel)]="rescheduleDateObj"
                    [minDate]="minDateObj"
                    (ngModelChange)="onRescheduleDateChange($event)"
                    styleClass="w-full"
                    inputStyleClass="w-full border-2 border-gray-100 dark:border-white/5 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold text-gray-900 dark:text-foreground focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-white/10 transition-all bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm cursor-pointer"
                    [showIcon]="true"
                    dateFormat="mm/dd/yy"
                    placeholder="Choose a date"
                    appendTo="body"
                  ></p-datepicker>
              </div>
              
              <div [class.opacity-50]="!rescheduleForm.date" [class.pointer-events-none]="!rescheduleForm.date" class="transition-opacity duration-300">
                <label class="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Available Time Slots</label>
                @if (!rescheduleForm.date) {
                    <div class="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-6 text-center shadow-sm">
                      <p class="text-sm text-gray-400 font-bold">Select a date first.</p>
                    </div>
                } @else if (fetchingSlots()) {
                    <div class="grid grid-cols-2 gap-3">
                      @for (i of [1,2,3,4]; track i) { <div class="h-14 bg-gray-100 dark:bg-white/10 rounded-2xl animate-pulse"></div> }
                    </div>
                } @else if (availableSlotsForDate().length === 0) {
                    <div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-5 text-center shadow-inner">
                      <p class="font-black text-red-900 dark:text-red-400 text-sm">No slots on this day</p>
                      <p class="text-xs text-red-700 dark:text-red-300 font-medium mt-1">Try selecting another date.</p>
                    </div>
                } @else {
                  <div class="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 pb-1">
                    @for (slot of availableSlotsForDate(); track slot.id) {
                      <label class="flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all shadow-sm bg-white dark:bg-card hover:shadow-md"
                        [class.border-red-600]="selectedSlot?.id === slot.id"
                        [class.bg-red-50/50]="selectedSlot?.id === slot.id" [class.dark:bg-red-900/20]="selectedSlot?.id === slot.id"
                        [class.shadow-red-600/10]="selectedSlot?.id === slot.id" [class.dark:shadow-white/5]="selectedSlot?.id === slot.id"
                        [class.border-gray-100]="selectedSlot?.id !== slot.id" [class.dark:border-white/5]="selectedSlot?.id !== slot.id"
                        [class.hover:border-red-200]="selectedSlot?.id !== slot.id" [class.dark:hover:border-white/20]="selectedSlot?.id !== slot.id">
                        <input type="radio" name="r_slot" [value]="slot" (change)="selectedSlot = slot" class="accent-red-800 dark:accent-red-500 w-4 h-4"/>
                        <span class="font-black text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">{{ slot.start_time | timeFormat }}</span>
                      </label>
                    }
                  </div>
                }
              </div>
            </div>

            @if (rescheduleError()) {
              <div class="mt-5 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <svg class="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ rescheduleError() }}
              </div>
            }

            <div class="flex gap-4 mt-8">
              <button (click)="closeReschedule()"
                class="flex-1 bg-white dark:bg-card border-2 border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm font-black text-xs uppercase tracking-widest py-4 rounded-[1.25rem] transition-all active:scale-95">
                Cancel
              </button>
              <button (click)="submitReschedule()" [disabled]="rescheduling() || !selectedSlot"
                class="flex-[1.5] bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 dark:disabled:from-white/10 dark:disabled:to-white/10 dark:disabled:text-gray-500
                       text-white font-black text-xs uppercase tracking-widest py-4 rounded-[1.25rem] transition-all shadow-xl shadow-red-900/20 active:scale-95 disabled:scale-100 disabled:shadow-none">
                @if (rescheduling()) {
                  <svg class="animate-spin w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                } @else {
                  Submit Request
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class MyBookingsComponent implements OnInit {
  private api = inject(ApiService);
  router = inject(Router);
  searchService = inject(SearchService);

  bookings        = signal<Booking[]>([]);
  loading         = signal(true);
  cancelling      = signal<number | null>(null);
  cancelTarget    = signal<Booking | null>(null);
  view            = signal<'upcoming' | 'past'>('upcoming');
  statusFilter    = signal<string>('ALL');
  selectedBooking = signal<Booking | null>(null);

  rescheduleTarget = signal<Booking | null>(null);
  rescheduling     = signal(false);
  rescheduleError  = signal<string | null>(null);
  
  // Rescheduling primeNG Date & Slots
  rescheduleDateObj: Date | null = null;
  minDateObj = new Date();
  rescheduleForm = { date: '', start_time: '', end_time: '' };
  teacherSlots = signal<Availability[]>([]);
  fetchingSlots = signal(false);
  selectedSlot: Availability | null = null;

  private dayMap: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

  chatReady: Record<number, boolean> = {};

  // ── Feedback state ────────────────────────────
  feedbackMap: Record<number, {
    loading: boolean;
    submitted: boolean;
    rating: number | null;
    comment: string | null;
    pendingRating: number;
    pendingComment: string;
    hoverRating: number;
    submitting: boolean;
  }> = {};

  // ── Signals for highly efficient computed state ──
  upcoming = computed(() => this.bookings().filter(b => b.status === 'PENDING' || b.status === 'APPROVED'));
  past     = computed(() => this.bookings().filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED'));
  
  upcomingCount = computed(() => this.upcoming().length);
  pastCount     = computed(() => this.past().length);
  pendingCount  = computed(() => this.upcoming().filter(b => b.status === 'PENDING').length);
  approvedCount = computed(() => this.upcoming().filter(b => b.status === 'APPROVED').length);
  
  displayed = computed(() => {
    let list = this.view() === 'past' ? this.past() : this.upcoming();
    const f = this.statusFilter();
    if (this.view() === 'upcoming' && f !== 'ALL') {
      list = list.filter(b => b.status === f);
    }
    
    // Global Search integration
    const globalQ = this.searchService.globalQuery().toLowerCase().trim();
    if (globalQ) {
       list = list.filter(b => 
         b.teacher_name.toLowerCase().includes(globalQ) || 
         (b.student_notes && b.student_notes.toLowerCase().includes(globalQ)) ||
         (b.teacher_notes && b.teacher_notes.toLowerCase().includes(globalQ))
       );
    }
    
    return list;
  });

  presence = inject(PresenceService);

  ngOnInit(): void {
    this.load();
    this.presence.refreshEvents.subscribe(() => {
      this.load();
    });
  }

  load(): void {
    this.api.getBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.loading.set(false);
        // Auto-load feedback for completed bookings
        res.data.filter(b => b.status === 'COMPLETED').forEach(b => this.loadFeedback(b.id));
      },
      error: () => this.loading.set(false),
    });
  }

  // ── Feedback Methods ─────────────────────────
  loadFeedback(bookingId: number): void {
    if (this.feedbackMap[bookingId]) return;
    this.feedbackMap[bookingId] = {
      loading: true, submitted: false, rating: null, comment: null,
      pendingRating: 0, pendingComment: '', hoverRating: 0, submitting: false,
    };
    this.api.getBookingFeedback(bookingId).subscribe({
      next: (res) => {
        const mine = res.data.find((f: Feedback) => f.reviewer_id !== undefined);
        if (mine) {
          this.feedbackMap[bookingId] = {
            ...this.feedbackMap[bookingId],
            loading: false, submitted: true,
            rating: mine.rating, comment: mine.comment,
          };
        } else {
          this.feedbackMap[bookingId] = { ...this.feedbackMap[bookingId], loading: false };
        }
      },
      error: () => {
        this.feedbackMap[bookingId] = { ...this.feedbackMap[bookingId], loading: false };
      },
    });
  }

  setRating(bookingId: number, rating: number): void {
    if (!this.feedbackMap[bookingId]) return;
    this.feedbackMap[bookingId] = { ...this.feedbackMap[bookingId], pendingRating: rating };
  }

  setHoverRating(bookingId: number, rating: number): void {
    if (!this.feedbackMap[bookingId]) return;
    this.feedbackMap[bookingId] = { ...this.feedbackMap[bookingId], hoverRating: rating };
  }

  setComment(bookingId: number, comment: string): void {
    if (!this.feedbackMap[bookingId]) return;
    this.feedbackMap[bookingId] = { ...this.feedbackMap[bookingId], pendingComment: comment };
  }

  ratingLabel(rating: number): string {
    const labels: Record<number, string> = {
      1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent',
    };
    return labels[rating] ?? '';
  }

  submitFeedback(booking: Booking): void {
    const fb = this.feedbackMap[booking.id];
    if (!fb || !fb.pendingRating) return;
    this.feedbackMap[booking.id] = { ...fb, submitting: true };

    this.api.submitFeedback(booking.id, {
      rating: fb.pendingRating,
      comment: fb.pendingComment || undefined,
    }).subscribe({
      next: () => {
        this.feedbackMap[booking.id] = {
          ...this.feedbackMap[booking.id],
          submitting: false, submitted: true,
          rating: fb.pendingRating, comment: fb.pendingComment || null,
        };
      },
      error: () => {
        this.feedbackMap[booking.id] = { ...this.feedbackMap[booking.id], submitting: false };
      },
    });
  }

  selectBooking(booking: Booking): void {
    if (this.selectedBooking()?.id === booking.id) { this.selectedBooking.set(null); return; }
    this.selectedBooking.set(booking);
  }

  onChatReady(bookingId: number, ready: boolean): void { this.chatReady[bookingId] = ready; }

  // Safe time calculation using Date constructors directly
  isLive(scheduledDate: string, startTime: string, endTime: string): boolean {
    const start  = new Date(`${scheduledDate.split('T')[0]}T${startTime}`);
    const end    = new Date(`${scheduledDate.split('T')[0]}T${endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

    const unlock = new Date(start.getTime() - 5 * 60 * 1000);
    const now    = new Date();
    return now >= unlock && now <= end;
  }

  // ── Cancel ──────────────────────────────────────
  promptCancel(booking: Booking): void { this.cancelTarget.set(booking); }

  confirmCancel(): void {
    const target = this.cancelTarget();
    if (!target) return;
    this.cancelling.set(target.id);
    this.api.updateBookingStatus(target.id, 'CANCELLED').subscribe({
      next: () => {
        this.cancelling.set(null);
        this.cancelTarget.set(null);
        if (this.selectedBooking()?.id === target.id) this.selectedBooking.set(null);
        this.load();
      },
      error: () => { this.cancelling.set(null); this.cancelTarget.set(null); },
    });
  }

  // ── Reschedule ────────────────────────────────
  openReschedule(booking: Booking): void {
    this.rescheduleTarget.set(booking);
    this.rescheduleDateObj = null;
    this.rescheduleForm = { date: '', start_time: '', end_time: '' };
    this.rescheduleError.set(null);
    this.selectedSlot = null;
    
    // Auto-fetch teacher slots
    this.fetchingSlots.set(true);
    this.api.getAvailability(booking.teacher_id).subscribe({
      next: (res) => {
        this.teacherSlots.set(res.data);
        this.fetchingSlots.set(false);
      },
      error: () => {
        this.teacherSlots.set([]);
        this.fetchingSlots.set(false);
      }
    });
  }

  closeReschedule(): void { 
    this.rescheduleTarget.set(null); 
    this.rescheduleError.set(null); 
    this.teacherSlots.set([]);
  }

  onRescheduleDateChange(date: Date | null): void {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.rescheduleForm.date = `${year}-${month}-${day}`;
    } else {
      this.rescheduleForm.date = '';
    }
    this.selectedSlot = null;
    this.rescheduleError.set(null);
  }

  getDayName(dateStr: string): string {
    if (!dateStr) return '';
    const dayNum = new Date(dateStr + 'T00:00:00').getDay();
    const entry  = Object.entries(this.dayMap).find(([, v]) => v === dayNum);
    return entry ? entry[0] : '';
  }

  availableSlotsForDate(): Availability[] {
    if (!this.rescheduleForm.date) return [];
    const dayStr = this.getDayName(this.rescheduleForm.date);
    return this.teacherSlots().filter(s => s.day_of_week === dayStr);
  }

  submitReschedule(): void {
    if (!this.rescheduleForm.date) { this.rescheduleError.set('Please select a date.'); return; }
    if (!this.selectedSlot) { this.rescheduleError.set('Please select a time slot.'); return; }

    this.rescheduling.set(true);
    this.rescheduleError.set(null);

    this.api.requestReschedule(this.rescheduleTarget()!.id, {
      reschedule_date:       this.rescheduleForm.date,
      reschedule_start_time: this.selectedSlot.start_time,
      reschedule_end_time:   this.selectedSlot.end_time,
    }).subscribe({
      next: () => { this.rescheduling.set(false); this.closeReschedule(); this.load(); },
      error: (err) => { this.rescheduling.set(false); this.rescheduleError.set(err.error?.error ?? 'Failed to request reschedule.'); },
    });
  }
}
