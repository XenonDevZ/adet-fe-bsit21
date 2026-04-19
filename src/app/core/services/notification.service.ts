import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Notification } from '../models/index';
import { interval, startWith, switchMap, catchError, of } from 'rxjs';

import { PresenceService } from './presence.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = inject(ApiService);
  private presence = inject(PresenceService);

  notifications = signal<Notification[]>([]);
  loading       = signal(false);

  unreadCount = computed(() =>
    this.notifications().filter(n => !n.is_read).length
  );

  constructor() {
    // Real-time Push hook! Instantly fetches new notifications upon server ping.
    this.presence.refreshEvents.subscribe(() => {
      this.refresh();
    });

    // Fallback Background Poll every 60s
    interval(60_000).pipe(
      startWith(0),
      switchMap(() =>
        this.api.getAllNotifications().pipe(
          catchError(() => of(null))
        )
      )
    ).subscribe(res => {
      if (res) this.notifications.set(this.normalize(res.data));
    });
  }

  /** Force an immediate re-fetch (called on layout init and when panel opens). */
  refresh(): void {
    this.loading.set(true);
    this.api.getAllNotifications().subscribe({
      next:  res => { this.notifications.set(this.normalize(res.data)); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  /** Mark a single notification as read. Optimistic — no revert on failure. */
  markRead(id: number): void {
    // Avoid redundant calls if already read
    const notif = this.notifications().find(n => n.id === id);
    if (!notif || notif.is_read) return;

    // Optimistic update — immediate UI response
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    // Fire-and-forget: swallow errors so optimistic update persists
    this.api.markNotificationRead(id).subscribe({
      error: (e: unknown) => console.warn('[Notif] markRead error (ignored):', e)
    });
  }

  /** Mark all notifications as read. Optimistic — no revert on failure. */
  markAllRead(): void {
    if (!this.notifications().some(n => !n.is_read)) return;

    // Optimistic update
    this.notifications.update(list =>
      list.map(n => ({ ...n, is_read: true }))
    );

    // Fire-and-forget
    this.api.markNotificationsRead().subscribe({
      error: (e: unknown) => console.warn('[Notif] markAllRead error (ignored):', e)
    });
  }

  /**
   * Normalize server data: MySQL2 may return is_read as 0/1 (number) instead of
   * a proper boolean, depending on the driver version and column metadata.
   * Boolean() coerces 0 → false, 1 → true, false → false, true → true.
   */
  private normalize(data: Notification[]): Notification[] {
    return data.map(n => ({ ...n, is_read: Boolean(n.is_read) }));
  }
}
