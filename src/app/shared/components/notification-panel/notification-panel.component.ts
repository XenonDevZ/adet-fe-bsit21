import { Component, OnInit, inject, signal, output, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../core/services/api.service'
import type { Notification } from '../../../core/models/index'

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-gray-900 text-sm">Notifications</h3>
          @if (unreadCount() > 0) {
            <span class="bg-red-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {{ unreadCount() }}
            </span>
          }
        </div>
        @if (unreadCount() > 0) {
          <button (click)="markAllRead()"
            class="text-xs text-red-700 hover:text-red-900 font-medium transition-colors">
            Mark all read
          </button>
        }
      </div>

      <!-- Notification list -->
      <div class="max-h-96 overflow-y-auto">
        @if (loading()) {
          <div class="p-4 space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse flex gap-3">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        }

        @if (!loading() && notifications().length === 0) {
          <div class="py-10 text-center">
            <div class="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <p class="text-gray-500 text-sm font-medium">No notifications</p>
            <p class="text-gray-400 text-xs mt-1">You're all caught up!</p>
          </div>
        }

        @for (notif of notifications(); track notif.id) {
          <div
            class="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
            [class.bg-red-50]="!notif.is_read"
            (click)="markRead(notif)">

            <!-- Icon -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              [class.bg-red-100]="!notif.is_read"
              [class.bg-gray-100]="notif.is_read">
              <svg class="w-4 h-4"
                [class.text-red-700]="!notif.is_read"
                [class.text-gray-400]="notif.is_read"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (isReminder(notif.message)) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                } @else if (isApproval(notif.message)) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                } @else if (isCancellation(notif.message)) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                }
              </svg>
            </div>

            <!-- Message -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-800 leading-snug"
                [class.font-medium]="!notif.is_read">
                {{ notif.message }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ timeAgo(notif.created_at) }}
              </p>
            </div>

            <!-- Unread dot -->
            @if (!notif.is_read) {
              <div class="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class NotificationPanelComponent implements OnInit {
  private api = inject(ApiService)

  notifications = signal<Notification[]>([])
  loading       = signal(true)

  unreadCount(): number {
    return this.notifications().filter(n => !n.is_read).length
  }

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.api.getAllNotifications().subscribe({
      next: res => {
        this.notifications.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  markRead(notif: Notification): void {
    if (notif.is_read) return
    this.api.markNotificationRead(notif.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        )
      }
    })
  }

  markAllRead(): void {
    this.api.markNotificationsRead().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, is_read: true }))
        )
      }
    })
  }

  isReminder(msg: string): boolean {
    return msg.includes('⏰') || msg.toLowerCase().includes('reminder')
  }

  isApproval(msg: string): boolean {
    return msg.toLowerCase().includes('approved') || msg.toLowerCase().includes('accepted')
  }

  isCancellation(msg: string): boolean {
    return msg.toLowerCase().includes('cancelled') || msg.toLowerCase().includes('rejected')
  }

  timeAgo(dateStr: string): string {
    const now  = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60)   return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }
}
