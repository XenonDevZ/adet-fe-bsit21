import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { PresenceService } from '../../../core/services/presence.service'
import { SearchService } from '../../../core/services/search.service'
import type { Teacher } from '../../../core/models/index'
import { HlmCardImports } from '@spartan-ng/helm/card'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmCardImports, HlmButtonImports, HlmBadgeImports],
  template: `
    <div class="h-full w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex flex-col items-center">

      <!-- ── Floating Hero Header ── -->
      <div class="w-full relative z-10 mb-10 group">
        <div class="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-red-900/20 transform group-hover:scale-[1.005] transition-transform duration-700 ease-out overflow-hidden">
           <!-- Inner glow effect -->
           <div class="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-white/10 blur-[60px] rotate-[30deg] pointer-events-none"></div>
        </div>

        <div class="relative z-20 px-8 py-10 md:py-14 sm:px-12 lg:px-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div class="flex-1">
            <span class="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-4 shadow-sm">Directory Hub</span>
            <h1 class="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 leading-tight drop-shadow-md">Instructors</h1>
            <p class="text-sm md:text-base font-medium text-red-100/90 max-w-xl leading-relaxed">Find your professors and schedule academic consultation sessions online or on-campus.</p>
          </div>
          
          <!-- Search -->
          <div class="relative w-full md:w-96 shrink-0 group/search">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/search:text-red-900 dark:group-focus-within/search:text-white transition-colors pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" [(ngModel)]="search" placeholder="Search name or dept..."
              class="w-full pl-12 pr-4 py-4 bg-white/90 dark:bg-card/90 backdrop-blur-3xl rounded-2xl text-sm font-bold text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-4 focus:ring-red-100/50 dark:focus:ring-white/10 transition-all shadow-xl border border-white dark:border-white/5 focus:bg-white dark:focus:bg-card"/>
          </div>
        </div>
      </div>

      <div class="w-full pb-16 space-y-8 relative z-20">

        <!-- ── Glassmorphic Filters Card ── -->
        <div class="bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 border border-white dark:border-white/5 p-6 sm:p-8 flex flex-col gap-6 hover:shadow-red-900/10 dark:hover:shadow-white/5 transition-shadow duration-500">
          <div class="flex items-center justify-between">
            <h3 class="font-black text-gray-900 dark:text-foreground text-xs sm:text-sm uppercase tracking-widest flex items-center gap-3">
              <span class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-900/50 shadow-inner">
                <svg class="w-4 h-4 text-red-800 dark:text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
              </span>
              Filter Directory
            </h3>
            @if (search || departmentFilter) {
              <button (click)="clearFilters()"
                class="flex items-center gap-2 text-[10px] sm:text-xs text-red-800 dark:text-red-400 hover:text-white font-black uppercase tracking-widest px-4 py-2 sm:py-2.5 bg-white/50 dark:bg-white/5 hover:bg-red-800 dark:hover:bg-red-800 rounded-xl transition-all border border-red-100 dark:border-red-900/50 shadow-sm active:scale-95 group/clear">
                <svg class="w-3.5 h-3.5 group-hover/clear:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Clear Parameters
              </button>
            }
          </div>

          <div class="space-y-5">
            <!-- Department pills -->
            @if (departments().length > 0) {
              <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <span class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest w-16 shrink-0 pt-2 sm:pt-0">Depts</span>
                <div class="flex flex-wrap gap-2 text-sm sm:text-xs">
                  <button (click)="departmentFilter = ''"
                    class="px-5 py-2.5 rounded-[1rem] font-bold transition-all border shadow-sm active:scale-95 focus:outline-none"
                    [class.bg-gradient-to-r]="!departmentFilter" [class.from-red-900]="!departmentFilter" [class.to-red-800]="!departmentFilter" [class.text-white]="!departmentFilter" [class.border-transparent]="!departmentFilter"
                    [class.bg-white/50]="!!departmentFilter" [class.dark:bg-white/5]="!!departmentFilter" [class.backdrop-blur-md]="!!departmentFilter" [class.text-gray-600]="!!departmentFilter" [class.dark:text-gray-300]="!!departmentFilter" [class.border-white]="!!departmentFilter" [class.dark:border-white/5]="!!departmentFilter" [class.hover:bg-white]="!!departmentFilter" [class.dark:hover:bg-white/10]="!!departmentFilter">
                    All
                  </button>
                  @for (dept of departments(); track dept) {
                    <button (click)="departmentFilter = dept"
                      class="px-5 py-2.5 rounded-[1rem] font-bold transition-all border shadow-sm active:scale-95 focus:outline-none"
                      [class.bg-gradient-to-r]="departmentFilter === dept" [class.from-red-900]="departmentFilter === dept" [class.to-red-800]="departmentFilter === dept" [class.text-white]="departmentFilter === dept" [class.border-transparent]="departmentFilter === dept"
                      [class.bg-white/50]="departmentFilter !== dept" [class.dark:bg-white/5]="departmentFilter !== dept" [class.backdrop-blur-md]="departmentFilter !== dept" [class.text-gray-600]="departmentFilter !== dept" [class.dark:text-gray-300]="departmentFilter !== dept" [class.border-white]="departmentFilter !== dept" [class.dark:border-white/5]="departmentFilter !== dept" [class.hover:bg-white]="departmentFilter !== dept" [class.dark:hover:bg-white/10]="departmentFilter !== dept">
                      {{ dept }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Results count -->
        @if (!loading()) {
          <p class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-4 drop-shadow-sm">
            Retrieved {{ filtered().length }} {{ filtered().length === 1 ? 'Profile' : 'Profiles' }}
          </p>
        }

        <!-- Skeleton -->
        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white/50 dark:bg-card/50 rounded-[2.5rem] border border-white dark:border-white/5 overflow-hidden animate-pulse">
                <div class="h-28 bg-white/40 dark:bg-black/20"></div>
                <div class="p-8 flex flex-col items-center -mt-14">
                  <div class="w-28 h-28 bg-white/80 dark:bg-white/10 rounded-[1.5rem] border-[6px] border-white dark:border-white/5 mb-6"></div>
                  <div class="h-4 bg-white/80 dark:bg-white/10 rounded w-3/4 mb-3"></div>
                  <div class="h-3 bg-white/80 dark:bg-white/10 rounded w-1/2 mb-8"></div>
                  <div class="w-full h-14 bg-white/60 dark:bg-white/5 rounded-xl"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty state -->
        @if (!loading() && filtered().length === 0) {
          <div class="text-center py-24 bg-white/60 dark:bg-card/60 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/5 shadow-xl shadow-gray-900/5 flex flex-col items-center">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-900/20 rounded-[2rem] shadow-inner mb-6 border border-white dark:border-white/5">
              <svg class="w-12 h-12 text-red-800 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-black text-gray-900 dark:text-foreground mb-2">No Profiles Found</h3>
            <p class="text-gray-500 dark:text-gray-400 text-base font-medium mb-8">Adjust your search parameters or select a different department.</p>
            <button (click)="clearFilters()"
              class="px-8 py-4 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-card/100 text-gray-900 dark:text-foreground font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 border border-gray-100 dark:border-white/5">
              Reset Directory
            </button>
          </div>
        }

        <!-- Premium Teacher cards grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          @for (teacher of filtered(); track teacher.teacher_id) {
            <div class="bg-white/70 dark:bg-card/70 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-red-900/15 dark:hover:shadow-white/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden group/card border border-white dark:border-white/5 flex flex-col cursor-pointer"
                 (click)="book(teacher.teacher_id)">

              <!-- Dynamic Cover Strip -->
              <div class="h-28 bg-gradient-to-br from-red-900 to-red-700 relative overflow-hidden shrink-0 group-hover/card:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-40"></div>
                <div class="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-white/20 blur-[30px] rotate-[30deg] pointer-events-none group-hover/card:translate-x-full transition-transform duration-1000"></div>
              </div>

              <div class="p-8 flex-1 flex flex-col items-center text-center -mt-16 relative z-10 bg-white/30 dark:bg-black/30">
                <!-- Avatar with robust depth -->
                <div class="relative inline-block mb-5">
                  <img
                    [src]="teacher.picture || 'https://ui-avatars.com/api/?name=' + teacher.name.split(' ').join('+') + '&background=831b1b&color=fff'"
                    (error)="$any($event.target).src = 'https://ui-avatars.com/api/?name=' + teacher.name.split(' ').join('+') + '&background=831b1b&color=fff'"
                    [alt]="teacher.name"
                    class="w-28 h-28 rounded-[1.5rem] object-cover border-[6px] border-white/90 dark:border-black/50 drop-shadow-lg group-hover/card:scale-110 group-hover/card:rotate-2 transition-all duration-500 bg-white dark:bg-card"/>
                  
                  <!-- Neon Presence Indicator -->
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white dark:border-gray-800 rounded-full shadow-sm transition-colors duration-300 z-20 flex items-center justify-center p-0"
                    [class.bg-green-500]="presence.onlineUsers().has(teacher.user_id)"
                    [class.shadow-[0_0_12px_rgba(34,197,94,0.6)]]="presence.onlineUsers().has(teacher.user_id)"
                    [class.bg-gray-300]="!presence.onlineUsers().has(teacher.user_id)" [class.dark:bg-gray-600]="!presence.onlineUsers().has(teacher.user_id)">
                  </div>
                </div>

                <h3 class="font-black text-gray-900 dark:text-foreground text-xl leading-tight mb-2 group-hover/card:text-red-900 dark:group-hover/card:text-red-400 transition-colors">{{ teacher.name }}</h3>
                <p class="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest mb-5">{{ teacher.department || 'Instructor' }}</p>

                @if (teacher.bio) {
                  <p class="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-6 line-clamp-3 px-2">{{ teacher.bio }}</p>
                }

                <div class="mb-5"></div>

                <!-- Spacer to push elements down -->
                <div class="mt-auto w-full space-y-4">
                  <!-- Tag indicators -->
                  <div class="flex justify-center">
                    @if (presence.onlineUsers().has(teacher.user_id)) {
                      <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 px-3 py-1.5 rounded-xl shadow-sm">
                        <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Accepting Live Chats
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 px-3 py-1.5 rounded-xl shadow-sm">
                        Offline
                      </span>
                    }
                  </div>

                  <button class="w-full relative overflow-hidden bg-white dark:bg-transparent text-gray-900 dark:text-foreground border border-white dark:border-white/20 hover:border-transparent
                           font-black tracking-widest uppercase text-[10px] py-4 rounded-[1.25rem] transition-all duration-300 shadow-md group-hover/card:shadow-xl active:scale-95 group/btn2">
                    <!-- Gradient hover state -->
                    <div class="absolute inset-0 bg-gradient-to-r from-red-900 to-red-700 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                    <span class="relative z-10 flex items-center justify-center gap-2 group-hover/card:text-white transition-colors duration-300">
                       <svg class="w-4 h-4 opacity-70 group-hover/card:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                       </svg>
                       View Schedule
                    </span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

      </div>
    </div>
  `,
})
export class TeachersListComponent implements OnInit {
  private api    = inject(ApiService)
  private router = inject(Router)
  presence       = inject(PresenceService)
  searchService  = inject(SearchService)

  teachers         = signal<Teacher[]>([])
  loading          = signal(true)
  search           = ''
  departmentFilter = ''


  ngOnInit(): void {
    this.api.getTeachers().subscribe({
      next: res => { this.teachers.set(res.data); this.loading.set(false) },
      error: () => this.loading.set(false),
    })
  }

  departments(): string[] {
    const depts = this.teachers().map(t => t.department).filter((d): d is string => !!d)
    return [...new Set(depts)].sort()
  }



  filtered(): Teacher[] {
    const localQ = this.search.toLowerCase().trim()
    const globalQ = this.searchService.globalQuery().toLowerCase().trim()
    const q = globalQ || localQ

    return this.teachers().filter(t => {
      const matchSearch = !q || t.name.toLowerCase().includes(q) || (t.department ?? '').toLowerCase().includes(q)
      const matchDept   = !this.departmentFilter || t.department === this.departmentFilter
      return matchSearch && matchDept
    })
  }

  clearFilters(): void { this.search = ''; this.departmentFilter = ''; }
  book(teacherId: number): void { this.router.navigate(['/student/book', teacherId]) }
}
