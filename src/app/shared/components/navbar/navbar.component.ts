import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { AuthService } from '../../../core/services/auth.service'
import { ApiService } from '../../../core/services/api.service'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <span class="font-bold text-lg tracking-tight">ACBS</span>
        <span class="text-blue-300 text-sm hidden sm:block">Liceo de Cagayan University</span>
      </div>

      <!-- Nav links -->
      <div class="flex items-center gap-4 text-sm">
        @if (auth.isStudent() || auth.isAdmin()) {
          <a routerLink="/student/teachers"   routerLinkActive="text-yellow-300" class="hover:text-yellow-300 transition-colors">Teachers</a>
          <a routerLink="/student/my-bookings" routerLinkActive="text-yellow-300" class="hover:text-yellow-300 transition-colors">My Bookings</a>
        }
        @if (auth.isTeacher() || auth.isAdmin()) {
          <a routerLink="/teacher/schedule"  routerLinkActive="text-yellow-300" class="hover:text-yellow-300 transition-colors">Schedule</a>
          <a routerLink="/teacher/bookings"  routerLinkActive="text-yellow-300" class="hover:text-yellow-300 transition-colors">Sessions</a>
        }
        @if (auth.isAdmin()) {
          <a routerLink="/admin/dashboard"   routerLinkActive="text-yellow-300" class="hover:text-yellow-300 transition-colors">Dashboard</a>
          <a routerLink="/admin/users"       routerLinkActive="text-yellow-300" class="hover:text-yellow-300 transition-colors">Users</a>
        }
      </div>

      <!-- User info + logout -->
      <div class="flex items-center gap-3">
        <!-- Notification bell -->
        <button (click)="loadNotifications()" class="relative hover:text-yellow-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          @if (unreadCount() > 0) {
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {{ unreadCount() }}
            </span>
          }
        </button>

        <img [src]="auth.currentUser()?.picture" [alt]="auth.currentUser()?.name"
          class="h-8 w-8 rounded-full border-2 border-blue-400" />

        <span class="text-sm hidden sm:block">{{ auth.currentUser()?.name }}</span>

        <span class="text-xs bg-blue-700 px-2 py-0.5 rounded-full">
          {{ auth.currentUser()?.role }}
        </span>

        <button (click)="auth.logout()"
          class="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors">
          Logout
        </button>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  auth       = inject(AuthService)
  private api = inject(ApiService)

  unreadCount = signal(0)

  loadNotifications() {
    this.api.getUnreadNotifications().subscribe(res => {
      this.unreadCount.set(res.data.length)
    })
  }
}