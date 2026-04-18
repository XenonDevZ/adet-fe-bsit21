import { Component, inject, signal, HostListener } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../core/services/auth.service'
import { ApiService } from '../../core/services/api.service'
import { NotificationPanelComponent } from '../../shared/components/notification-panel/notification-panel.component'
import { HeaderSearchComponent } from '../../shared/components/header-search/header-search.component'
import { NotificationService } from '../../core/services/notification.service'
import { ThemeService } from '../../core/services/theme.service'

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NotificationPanelComponent, HeaderSearchComponent],
  template: `
    <div class="min-h-screen flex font-sans bg-[#f4f6f8] dark:bg-background relative overflow-hidden">

      <!-- Ambient Background Orbs -->
      <div class="fixed top-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-900/10 dark:bg-red-900/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
      <div class="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-800/10 dark:bg-red-800/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <!-- Mobile Overlay -->
      @if (mobileMenuOpen()) {
        <div class="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden" (click)="mobileMenuOpen.set(false)"></div>
      }

      <!-- Floating Sidebar -->
      <aside class="w-[280px] fixed top-4 bottom-4 left-4 z-50 flex flex-col rounded-[2rem] 
                    bg-white/70 dark:bg-card/95 backdrop-blur-2xl border border-white dark:border-white/5 shadow-2xl shadow-red-900/5 dark:shadow-none 
                    transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0"
             [class.-translate-x-[120%]]="!mobileMenuOpen()"
             [class.translate-x-0]="mobileMenuOpen()">

        <!-- Brand -->
        <div class="px-8 py-8 border-b border-white/50 dark:border-white/5 bg-white/30 dark:bg-transparent backdrop-blur-md rounded-t-[2rem]">
          <div class="flex items-center gap-3 cursor-pointer group">
            <div class="w-12 h-12 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white dark:border-white/10 rounded-[1.25rem] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-all duration-300 p-1.5">
              <img src="/assets/acbs-logo.png" alt="ACBS" class="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div>
              <p class="font-black text-gray-900 dark:text-foreground text-[17px] tracking-tight leading-none mb-1 group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">ACBS Admin</p>
              <p class="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-widest leading-none">Liceo de Cagayan</p>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-5 py-6 space-y-2 overflow-y-auto">
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-2">Management</p>

          <a routerLink="/admin/dashboard"
             routerLinkActive="!bg-gradient-to-r !from-red-900 !to-red-800 !text-white !shadow-lg !shadow-red-900/30 font-black scale-[1.02]"
             (click)="mobileMenuOpen.set(false)"
             class="flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white hover:shadow-sm dark:hover:shadow-none hover:-translate-y-0.5 font-bold transition-all duration-300 transform active:scale-95 text-sm group">
            <svg class="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
            </svg>
            Dashboard
          </a>

          <a routerLink="/admin/users"
             routerLinkActive="!bg-gradient-to-r !from-red-900 !to-red-800 !text-white !shadow-lg !shadow-red-900/30 font-black scale-[1.02]"
             (click)="mobileMenuOpen.set(false)"
             class="flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white hover:shadow-sm dark:hover:shadow-none hover:-translate-y-0.5 font-bold transition-all duration-300 transform active:scale-95 text-sm group">
            <svg class="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            User Management
          </a>

          <a routerLink="/admin/bookings"
             routerLinkActive="!bg-gradient-to-r !from-red-900 !to-red-800 !text-white !shadow-lg !shadow-red-900/30 font-black scale-[1.02]"
             (click)="mobileMenuOpen.set(false)"
             class="flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white hover:shadow-sm dark:hover:shadow-none hover:-translate-y-0.5 font-bold transition-all duration-300 transform active:scale-95 text-sm group">
            <svg class="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            All Bookings
            @if (pendingCount() > 0) {
              <span class="ml-auto bg-gradient-to-br from-red-600 to-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm shadow-red-500/50">
                {{ pendingCount() > 99 ? '99+' : pendingCount() }}
              </span>
            }
          </a>
        </nav>

        <!-- User card -->
        <div class="px-5 py-5 border-t border-white/50 dark:border-white/5 bg-white/40 dark:bg-transparent backdrop-blur-md rounded-b-[2rem]">
          <div class="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] p-3 flex items-center justify-between border border-white dark:border-white/5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300">
            <div class="flex items-center gap-3 min-w-0">
              <img [src]="auth.currentUser()?.picture || 'https://ui-avatars.com/api/?name=' + (auth.currentUser()?.name || 'Admin')"
                class="w-10 h-10 rounded-[0.8rem] object-cover border-2 border-white dark:border-white/10 shadow-sm"
                (error)="$any($event.target).src='https://ui-avatars.com/api/?name=' + (auth.currentUser()?.name || 'Admin') + '&background=7f1d1d&color=fff'" />
              <div class="min-w-0">
                <p class="text-xs font-black text-gray-900 dark:text-foreground truncate">{{ (auth.currentUser()?.name || 'Admin').split(' ')[0] }}</p>
                <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Administrator</p>
              </div>
            </div>
            <button (click)="auth.logout()"
              class="p-2.5 text-gray-400 hover:text-white hover:bg-red-800 rounded-xl transition-all duration-300 shrink-0 active:scale-95 shadow-sm bg-white dark:bg-white/5 dark:border dark:border-white/5" title="Sign Out">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content wrapper -->
      <div class="flex-1 flex flex-col min-h-screen lg:pl-[296px] relative z-10 w-full transition-all">

        <!-- Floating Top bar -->
        <header class="sticky top-4 z-40 mx-4 lg:mx-8 px-5 py-3 
                       rounded-[1.5rem] bg-white/70 dark:bg-card/90 backdrop-blur-2xl border border-white dark:border-white/5 
                       shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex items-center justify-between lg:justify-end gap-4 
                       transition-all">

          <!-- Mobile hamburger -->
          <button (click)="mobileMenuOpen.set(true)"
                  class="lg:hidden p-2.5 rounded-xl bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:-translate-y-0.5 active:scale-95 transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <div class="flex items-center gap-4">

            <app-header-search />

            <!-- Theme toggle -->
            <button (click)="themeService.toggleTheme()" title="Toggle Dark Mode"
              class="relative p-2.5 rounded-xl bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
              @if (themeService.isDark()) {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>

            <!-- Notification bell -->
            <div class="relative flex items-center">
              <button (click)="togglePanel()"
                class="relative p-2.5 rounded-xl bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                @if (notifService.unreadCount() > 0) {
                  <span class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-red-600 to-red-500 border border-white text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm shadow-red-500/50 animate-pulse">
                    {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
                  </span>
                }
              </button>

              <!-- Panel dropdown -->
              @if (showPanel()) {
                <div class="absolute right-0 top-[120%] mt-2 w-80 lg:w-96 z-[60]" (click)="$event.stopPropagation()">
                  <div class="animate-in fade-in slide-in-from-top-4 duration-200">
                     <app-notification-panel />
                  </div>
                </div>
              }
            </div>

            <!-- Avatar -->
            <div class="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>
            
            <button class="relative group outline-none cursor-default">
              <div class="absolute inset-0 bg-red-900 rounded-[1rem] blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <img [src]="auth.currentUser()?.picture || 'https://ui-avatars.com/api/?name=' + (auth.currentUser()?.name || 'Admin')"
                class="relative w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm transition-transform duration-300"
                (error)="$any($event.target).src='https://ui-avatars.com/api/?name=' + (auth.currentUser()?.name || 'Admin') + '&background=7f1d1d&color=fff'" />
            </button>
          </div>
        </header>

        <!-- Close panel backdrop -->
        @if (showPanel()) {
          <div class="fixed inset-0 z-30" (click)="showPanel.set(false)"></div>
        }

        <!-- Router outlet -->
        <main class="flex-1 flex flex-col relative w-full pt-6 pb-8 lg:pr-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  auth = inject(AuthService)
  notifService = inject(NotificationService)
  themeService = inject(ThemeService)
  private api = inject(ApiService)

  showPanel = signal(false)
  mobileMenuOpen = signal(false)
  pendingCount = signal(0)

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 1024) {
      this.mobileMenuOpen.set(false)
    }
  }

  constructor() {
    this.loadPendingCount()
    setInterval(() => this.loadPendingCount(), 30_000)

    this.api.bookingsChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadPendingCount())
  }

  loadPendingCount(): void {
    this.api.getBookings().subscribe({
      next: res => {
        this.pendingCount.set(res.data.filter(b => b.status === 'PENDING').length)
      },
      error: () => { },
    })
  }

  togglePanel(): void {
    this.showPanel.update(v => !v)
    if (this.showPanel()) {
      this.notifService.refresh()
    }
  }
}
