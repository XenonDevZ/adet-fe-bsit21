import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { BookingStatus } from '../../../core/models/index'

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border"
          [ngClass]="badgeClass">
      <span class="w-1.5 h-1.5 rounded-full mr-1.5" [ngClass]="dotClass"></span>
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status!: BookingStatus

  get badgeClass(): string {
    const map: Record<BookingStatus, string> = {
      PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
      APPROVED:  'bg-blue-50 text-blue-700 border-blue-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-gray-50 text-gray-600 border-gray-200',
    }
    return map[this.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
  }

  get dotClass(): string {
    const map: Record<BookingStatus, string> = {
      PENDING:   'bg-amber-500',
      APPROVED:  'bg-blue-500',
      COMPLETED: 'bg-emerald-500',
      CANCELLED: 'bg-gray-400',
    }
    return map[this.status] ?? 'bg-gray-400'
  }
}