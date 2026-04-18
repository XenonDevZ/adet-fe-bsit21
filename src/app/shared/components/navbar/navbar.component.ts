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
    <div class="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl font-bold tracking-tight text-primary">
          ACBS
          <span class="text-sm font-normal hidden sm:inline opacity-70 ml-2 text-base-content">Liceo de Cagayan University</span>
        </a>
      </div>
      
      <div class="flex-none gap-2">
        <!-- Nav links -->
        <ul class="menu menu-horizontal px-1 font-medium z-10">
          @if (auth.isStudent() || auth.isAdmin()) {
            <li><a routerLink="/student/teachers" routerLinkActive="active text-primary">Teachers</a></li>
            <li><a routerLink="/student/my-bookings" routerLinkActive="active text-primary">My Bookings</a></li>
          }
          @if (auth.isTeacher() || auth.isAdmin()) {
            <li><a routerLink="/teacher/schedule" routerLinkActive="active text-primary">Schedule</a></li>
            <li><a routerLink="/teacher/bookings" routerLinkActive="active text-primary">Sessions</a></li>
          }
          @if (auth.isAdmin()) {
            <li><a routerLink="/admin/dashboard" routerLinkActive="active text-primary">Dashboard</a></li>
            <li><a routerLink="/admin/users" routerLinkActive="active text-primary">Users</a></li>
          }
        </ul>

        <div class="flex items-center gap-1">
          <!-- Notification bell -->
          <button (click)="loadNotifications()" class="btn btn-ghost btn-circle">
            <div class="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              @if (unreadCount() > 0) {
                <span class="badge badge-xs badge-error indicator-item">{{ unreadCount() }}</span>
              }
            </div>
          </button>

          <!-- User Profile Dropdown -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar m-1 border-primary border-2 border-opacity-50">
              <div class="w-9 rounded-full">
                <img [src]="auth.currentUser()?.picture" [alt]="auth.currentUser()?.name" onerror="this.src='https://ui-avatars.com/api/?name=User&background=random'" />
              </div>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-20 p-2 shadow bg-base-100 rounded-box w-60 border border-base-200">
              <li class="px-4 py-3 border-b border-base-200 pointer-events-none">
                <div class="flex flex-col gap-1 p-0">
                  <span class="font-bold text-base">{{ auth.currentUser()?.name }}</span>
                  <span class="badge badge-primary badge-sm uppercase font-semibold">{{ auth.currentUser()?.role }}</span>
                </div>
              </li>
              <li class="mt-2 text-error"><a (click)="auth.logout()" class="font-semibold">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
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