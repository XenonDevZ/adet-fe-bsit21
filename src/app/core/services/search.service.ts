import { Injectable, inject, signal, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import type { Teacher, Booking } from '../models/index';

export interface OmniSearchResult {
  type: 'PAGE' | 'TEACHER' | 'BOOKING';
  title: string;
  subtitle: string;
  icon: SafeHtml;
  url?: string;
  actionPayload?: any;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  /** The global search query typed into the header search bar */
  globalQuery = signal('');

  // Cached data
  private teachers = signal<Teacher[]>([]);
  private bookings = signal<Booking[]>([]);
  private isPrefetched = false;
  private isFetching = signal(false);

  // Static Registry
  private pageRegistry: ({ type: 'PAGE', title: string, subtitle: string, url: string, roles: string[], keywords: string[], icon: string })[] = [
    // Student Links
    { type: 'PAGE', title: 'Dashboard', subtitle: '/student/dashboard', roles: ['STUDENT'], keywords: ['home', 'start', 'overview'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>', url: '/student/dashboard' },
    { type: 'PAGE', title: 'Teacher Directory', subtitle: '/student/teachers', roles: ['STUDENT'], keywords: ['instructors', 'professors', 'find', 'book'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', url: '/student/teachers' },
    { type: 'PAGE', title: 'Schedule', subtitle: '/student/calendar', roles: ['STUDENT'], keywords: ['calendar', 'events', 'classes'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', url: '/student/calendar' },
    { type: 'PAGE', title: 'My Appointments', subtitle: '/student/my-bookings', roles: ['STUDENT'], keywords: ['bookings', 'consultations', 'meetings'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', url: '/student/my-bookings' },
    { type: 'PAGE', title: 'My Profile', subtitle: '/student/profile', roles: ['STUDENT'], keywords: ['account', 'settings', 'details'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>', url: '/student/profile' },

    // Teacher Links
    { type: 'PAGE', title: 'Dashboard', subtitle: '/teacher/dashboard', roles: ['TEACHER'], keywords: ['home', 'overview'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>', url: '/teacher/dashboard' },
    { type: 'PAGE', title: 'Consultation Requests', subtitle: '/teacher/bookings', roles: ['TEACHER'], keywords: ['bookings', 'appointments', 'meetings'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', url: '/teacher/bookings' },
    { type: 'PAGE', title: 'Manage Schedule', subtitle: '/teacher/schedule', roles: ['TEACHER'], keywords: ['calendar', 'availability'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', url: '/teacher/schedule' },
    { type: 'PAGE', title: 'My Profile', subtitle: '/teacher/profile', roles: ['TEACHER'], keywords: ['account', 'settings'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>', url: '/teacher/profile' },

    // Admin Links
    { type: 'PAGE', title: 'Dashboard', subtitle: '/admin/dashboard', roles: ['ADMIN'], keywords: ['home', 'overview'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>', url: '/admin/dashboard' },
    { type: 'PAGE', title: 'User Management', subtitle: '/admin/users', roles: ['ADMIN'], keywords: ['users', 'students', 'teachers', 'accounts'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>', url: '/admin/users' },
    { type: 'PAGE', title: 'All Bookings', subtitle: '/admin/bookings', roles: ['ADMIN'], keywords: ['bookings', 'appointments', 'reports'], icon: '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', url: '/admin/bookings' },
  ];

  omniResults = computed(() => {
    const q = this.globalQuery().toLowerCase().trim();
    const role = this.auth.currentUser()?.role || '';
    
    // 1. Pages
    let pages = this.pageRegistry.filter(item => item.roles.includes(role));
    if (q) {
      pages = pages.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.keywords.some(k => k.includes(q))
      );
    }
    const rawResults: OmniSearchResult[] = pages.map(p => ({
      ...p,
      icon: this.sanitizer.bypassSecurityTrustHtml(p.icon)
    }));
    
    if (!q) return rawResults; // Only show deep dive searches if they type something

    // 2. Teachers (Only for students)
    if (role === 'STUDENT') {
      const matchTeachers = this.teachers().filter(t => 
        t.name.toLowerCase().includes(q) || 
        (t.department && t.department.toLowerCase().includes(q))
      );
      matchTeachers.forEach(t => {
        rawResults.push({
          type: 'TEACHER',
          title: t.name,
          subtitle: `Instructor ${t.department ? '· ' + t.department : ''}`,
          icon: this.sanitizer.bypassSecurityTrustHtml('<span class="text-xs">👩‍🏫</span>'),
          actionPayload: t.teacher_id
        });
      });
    }

    // 3. Bookings
    const matchBookings = this.bookings().filter(b => 
      b.teacher_name.toLowerCase().includes(q) || 
      b.student_name.toLowerCase().includes(q) || 
      (b.student_notes && b.student_notes.toLowerCase().includes(q)) ||
      (b.teacher_notes && b.teacher_notes.toLowerCase().includes(q))
    );
    matchBookings.forEach(b => {
      const isStudent = role === 'STUDENT';
      const personName = isStudent ? b.teacher_name : b.student_name;
      rawResults.push({
        type: 'BOOKING',
        title: `Booking with ${personName}`,
        subtitle: `${b.scheduled_date} · ${b.status}`,
        icon: this.sanitizer.bypassSecurityTrustHtml('<span class="text-xs">📅</span>'),
        actionPayload: b
      });
    });

    return rawResults;
  });

  clear() {
    this.globalQuery.set('');
  }

  prefetch() {
    if (this.isPrefetched || this.isFetching()) return;
    const role = this.auth.currentUser()?.role;
    if (!role) return;

    this.isFetching.set(true);

    if (role === 'STUDENT') {
      this.api.getTeachers().subscribe(res => {
        this.teachers.set(res.data);
      });
    }

    this.api.getBookings().subscribe(res => {
      this.bookings.set(res.data);
      this.isPrefetched = true;
      this.isFetching.set(false);
    });
  }
}

