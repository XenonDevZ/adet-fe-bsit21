import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { BookingStatus } from '../../../core/models/index'

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass" class="px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status!: BookingStatus

  get badgeClass(): string {
    const map: Record<BookingStatus, string> = {
      PENDING:   'bg-yellow-100 text-yellow-800',
      APPROVED:  'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return map[this.status] ?? 'bg-gray-100 text-gray-800'
  }
}