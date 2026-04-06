import { Component, inject, signal } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../core/services/auth.service'
import { ApiService } from '../../core/services/api.service'
import { NotificationPanelComponent } from '../../shared/components/notification-panel/notification-panel.component'

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NotificationPanelComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex">

      <!-- Sidebar -->
      <aside class="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm fixed top-0 left-0 z-20">

        <!-- Brand -->
        <div class="px-6 py-5 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-red-900 to-red-600 rounded-xl flex items-center justify-center shadow">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
            </div>
            <div>
              <p class="font-bold text-gray-900 text-sm leading-tight">ACBS</p>
              <p class="text-xs text-gray-400 leading-tight">Liceo de Cagayan</p>
            </div>
          </div>
        </div>

        <!-- Nav links -->
        <nav class="flex-1 px-3 py-4 space-y-1">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>

          <a routerLink="/teacher/bookings" routerLinkActive="bg-red-50 text-red-800 font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Consultation Requests
            @if (pendingCount() > 0) {
              <span class="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {{ pendingCount() }}
              </span>
            }
          </a>

          <a routerLink="/teacher/schedule" routerLinkActive="bg-red-50 text-red-800 font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Manage Schedule
          </a>
        </nav>

        <!-- User profile -->
        <div class="px-3 py-4 border-t border-gray-100">
          <div class="flex items-center gap-3 px-3 py-2 rounded-xl">
            <img [src]="auth.currentUser()?.picture || 'https://ui-avatars.com/api/?name=' + auth.currentUser()?.name"
              class="w-8 h-8 rounded-full object-cover border-2 border-red-100" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ auth.currentUser()?.name }}</p>
              <p class="text-xs text-red-700 font-medium">Teacher</p>
            </div>
          </div>
          <button (click)="auth.logout()"
            class="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-700 transition-all text-sm">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 ml-64">

        <!-- Top bar -->
        <header class="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 class="text-lg font-bold text-gray-900">Hi, {{ firstName() }}! 👋</h1>
            <p class="text-xs text-gray-400">Teacher Dashboard — ACBS</p>
          </div>

          <div class="flex items-center gap-3">
            <!-- Notification bell -->
            <div class="relative">
              <button (click)="togglePanel()"
                class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                @if (unreadCount() > 0) {
                  <span class="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                  </span>
                }
              </button>

              @if (showPanel()) {
                <app-notification-panel (click)="$event.stopPropagation()" />
              }
            </div>

            <img [src]="auth.currentUser()?.picture"
              class="w-9 h-9 rounded-xl object-cover border-2 border-red-100" />
          </div>
        </header>

        <!-- Click outside to close panel -->
        @if (showPanel()) {
          <div class="fixed inset-0 z-40" (click)="showPanel.set(false)"></div>
        }

        <main class="p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class TeacherLayoutComponent {
  auth        = inject(AuthService)
  private api = inject(ApiService)

  showPanel   = signal(false)
  unreadCount = signal(0)
  pendingCount = signal(0)

  constructor() {
    this.loadUnreadCount()
    this.loadPendingCount()
    setInterval(() => {
      this.loadUnreadCount()
      this.loadPendingCount()
    }, 60000)
  }

  loadUnreadCount(): void {
    this.api.getUnreadNotifications().subscribe({
      next: res => this.unreadCount.set(res.data.length),
      error: () => {},
    })
  }

  loadPendingCount(): void {
    this.api.getBookings().subscribe({
      next: res => {
        const pending = res.data.filter(b => b.status === 'PENDING').length
        this.pendingCount.set(pending)
      },
      error: () => {},
    })
  }

  togglePanel(): void {
    this.showPanel.update(v => !v)
  }

  firstName(): string {
    const name = this.auth.currentUser()?.name ?? ''
    return name.split(' ')[0]
  }
}
