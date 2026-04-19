import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-white dark:bg-card rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
        <div class="flex items-center gap-2.5">
          <h3 class="font-black text-gray-900 dark:text-foreground text-sm">Notifications</h3>
          @if (service.unreadCount() > 0) {
            <span class="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {{ service.unreadCount() > 99 ? '99+' : service.unreadCount() }}
            </span>
          }
        </div>
        <div class="flex items-center gap-3">
          @if (service.loading()) {
            <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Loading...</span>
          }
          @if (service.unreadCount() > 0 && !service.loading()) {
            <button (click)="service.markAllRead()" type="button"
              class="text-[10px] font-black text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 uppercase tracking-widest transition-colors active:scale-95">
              Mark all read
            </button>
          }
        </div>
      </div>

      <!-- Notification list -->
      <div class="max-h-[440px] overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">

        <!-- Loading skeleton -->
        @if (service.loading()) {
          @for (i of [1,2,3]; track i) {
            <div class="flex items-start gap-3 px-5 py-4 animate-pulse">
              <div class="w-9 h-9 rounded-2xl bg-gray-200 dark:bg-white/10 shrink-0"></div>
              <div class="flex-1 space-y-2 pt-1">
                <div class="h-3 bg-gray-200 dark:bg-white/10 rounded-full w-3/4"></div>
                <div class="h-2 bg-gray-100 dark:bg-white/5 rounded-full w-1/2"></div>
              </div>
            </div>
          }
        }

        <!-- Empty state -->
        @if (!service.loading() && service.notifications().length === 0) {
          <div class="py-14 text-center">
            <div class="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3 mx-auto border border-dashed border-gray-200 dark:border-white/10">
              <svg class="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <p class="text-gray-700 dark:text-gray-300 font-black text-sm">All caught up!</p>
            <p class="text-gray-400 dark:text-gray-500 text-xs font-medium mt-1">No notifications yet.</p>
          </div>
        }

        <!-- Notification items -->
        @if (!service.loading()) {
          @for (notif of service.notifications(); track notif.id) {
            <div
              class="flex items-start gap-3 px-5 py-4 cursor-pointer transition-all duration-150"
              [class.bg-red-50]="!notif.is_read" [class.dark:bg-red-900/20]="!notif.is_read"
              [class.hover:bg-red-50]="!notif.is_read" [class.dark:hover:bg-red-900/20]="!notif.is_read"
              [class.hover:bg-gray-50]="notif.is_read" [class.dark:hover:bg-white/5]="notif.is_read"
              (click)="onNotifClick(notif.id, notif.is_read)">

              <!-- Icon bubble -->
              <div class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                [class.bg-red-100]="!notif.is_read" [class.dark:bg-red-900/40]="!notif.is_read"
                [class.bg-gray-100]="notif.is_read" [class.dark:bg-white/10]="notif.is_read">
                <svg class="w-4 h-4 transition-colors"
                  [class.text-red-700]="!notif.is_read" [class.dark:text-red-400]="!notif.is_read"
                  [class.text-gray-400]="notif.is_read" [class.dark:text-gray-500]="notif.is_read"
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
                  } @else if (isReschedule(notif.message)) {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  } @else if (isNewRequest(notif.message)) {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4v16m8-8H4"/>
                  } @else {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  }
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-800 dark:text-gray-100 leading-snug"
                  [class.font-bold]="!notif.is_read"
                  [class.font-medium]="notif.is_read">
                  {{ notif.message }}
                </p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
                  {{ timeAgo(notif.created_at) }}
                </p>
              </div>

              <!-- Unread indicator -->
              @if (!notif.is_read) {
                <div class="w-2 h-2 bg-red-600 rounded-full shrink-0 mt-2"></div>
              }
            </div>
          }
        }
      </div>

      <!-- Footer -->
      @if (service.notifications().length > 0 && !service.loading()) {
        <div class="px-5 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/5">
          <p class="text-[10px] text-gray-400 dark:text-gray-500 font-bold text-center uppercase tracking-widest">
            {{ service.unreadCount() > 0 ? service.unreadCount() + ' unread' : 'All caught up' }}
            · {{ service.notifications().length }} total
          </p>
        </div>
      }
    </div>
  `,
})
export class NotificationPanelComponent {
  service = inject(NotificationService)

  /** Mark as read only if currently unread — avoids redundant API calls */
  onNotifClick(id: number, isRead: boolean): void {
    if (!isRead) {
      this.service.markRead(id)
    }
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

  isReschedule(msg: string): boolean {
    return msg.toLowerCase().includes('reschedule')
  }

  isNewRequest(msg: string): boolean {
    return msg.toLowerCase().startsWith('new consultation request') ||
           msg.toLowerCase().includes('requested by')
  }

  timeAgo(dateStr: string): string {
    const now  = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60)    return 'Just now'
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }
}
