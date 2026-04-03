import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import type { Teacher, Availability } from '../../../core/models/index'

@Component({
  selector: 'app-book-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-xl mx-auto">
      <button (click)="router.navigate(['/student/teachers'])"
        class="flex items-center gap-1 text-sm text-blue-700 hover:underline mb-4">
        ← Back to Teachers
      </button>

      @if (teacher()) {
        <div class="bg-white rounded-xl shadow p-6">
          <!-- Teacher info -->
          <div class="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <img [src]="teacher()!.picture || 'https://ui-avatars.com/api/?name=' + teacher()!.name"
              class="w-14 h-14 rounded-full border-2 border-blue-100" />
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ teacher()!.name }}</h2>
              <p class="text-sm text-gray-500">{{ teacher()!.department || 'Faculty' }}</p>
            </div>
          </div>

          <!-- Availability slots -->
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select a Time Slot</label>
            @if (slots().length === 0) {
              <p class="text-sm text-gray-400 italic">No availability slots set by this teacher yet.</p>
            }
            <div class="space-y-2">
              @for (slot of slots(); track slot.id) {
                <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  [class.border-blue-500]="selectedSlot()?.id === slot.id"
                  [class.bg-blue-50]="selectedSlot()?.id === slot.id">
                  <input type="radio" name="slot" [value]="slot" [(ngModel)]="selectedSlotValue"
                    (change)="onSlotChange(slot)" class="text-blue-600" />
                  <span class="text-sm">
                    <span class="font-medium">{{ slot.day_of_week }}</span>
                    — {{ slot.start_time }} to {{ slot.end_time }}
                  </span>
                </label>
              }
            </div>
          </div>

          <!-- Date picker -->
          @if (selectedSlot()) {
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <p class="text-xs text-gray-400 mb-2">Must be a {{ selectedSlot()!.day_of_week }}</p>
              <input type="date" [(ngModel)]="scheduledDate" [min]="minDate"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              @if (dateError()) {
                <p class="text-xs text-red-500 mt-1">{{ dateError() }}</p>
              }
            </div>
          }

          <!-- Notes -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea [(ngModel)]="notes" rows="3"
              placeholder="Describe what you'd like to discuss..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">
            </textarea>
          </div>

          @if (successMsg()) {
            <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
              {{ successMsg() }}
            </div>
          }

          @if (errorMsg()) {
            <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {{ errorMsg() }}
            </div>
          }

          <button (click)="submit()"
            [disabled]="!canSubmit() || submitting()"
            class="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors">
            {{ submitting() ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class BookConsultationComponent implements OnInit {
  private api   = inject(ApiService)
  private route = inject(ActivatedRoute)
  router        = inject(Router)

  teacher       = signal<Teacher | null>(null)
  slots         = signal<Availability[]>([])
  selectedSlot  = signal<Availability | null>(null)
  selectedSlotValue: Availability | null = null

  scheduledDate = ''
  notes         = ''
  minDate       = new Date().toISOString().split('T')[0]

  submitting  = signal(false)
  successMsg  = signal<string | null>(null)
  errorMsg    = signal<string | null>(null)
  dateError   = signal<string | null>(null)

  // Day name → JS day index
  private dayMap: Record<string, number> = {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
  }

  ngOnInit(): void {
    const teacherId = Number(this.route.snapshot.paramMap.get('teacherId'))

    this.api.getTeacher(teacherId).subscribe(res => this.teacher.set(res.data))
    this.api.getAvailability(teacherId).subscribe(res => this.slots.set(res.data))
  }

  onSlotChange(slot: Availability): void {
    this.selectedSlot.set(slot)
    this.scheduledDate = ''
    this.dateError.set(null)
  }

  canSubmit(): boolean {
    return !!this.selectedSlot() && !!this.scheduledDate && !this.dateError()
  }

  submit(): void {
    const slot = this.selectedSlot()
    if (!slot || !this.scheduledDate) return

    // Validate the selected date matches the slot's day
    const selected = new Date(this.scheduledDate + 'T00:00:00')
    const expectedDay = this.dayMap[slot.day_of_week]
    if (selected.getDay() !== expectedDay) {
      this.dateError.set(`Please pick a ${slot.day_of_week} for this slot.`)
      return
    }

    this.submitting.set(true)
    this.errorMsg.set(null)

    this.api.createBooking({
      teacher_id:      this.teacher()!.teacher_id,
      availability_id: slot.id,
      scheduled_date:  this.scheduledDate,
      start_time:      slot.start_time,
      end_time:        slot.end_time,
      notes:           this.notes || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false)
        this.successMsg.set('Booking submitted! Waiting for teacher approval.')
        setTimeout(() => this.router.navigate(['/student/my-bookings']), 1500)
      },
      error: (err) => {
        this.submitting.set(false)
        this.errorMsg.set(err.error?.error ?? 'Booking failed. Please try again.')
      },
    })
  }
}