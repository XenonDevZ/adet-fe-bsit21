import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Availability, DayOfWeek } from '../../../core/models/index'

@Component({
  selector: 'app-schedule-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Manage Availability</h2>

      <!-- Add slot form -->
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h3 class="text-base font-semibold text-gray-700 mb-4">Add New Time Slot</h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <!-- Day -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Day</label>
            <select [(ngModel)]="form.day_of_week"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              @for (day of days; track day) {
                <option [value]="day">{{ day }}</option>
              }
            </select>
          </div>

          <!-- Start time -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
            <input type="time" [(ngModel)]="form.start_time"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- End time -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">End Time</label>
            <input type="time" [(ngModel)]="form.end_time"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        @if (formError()) {
          <p class="text-sm text-red-600 mb-3">{{ formError() }}</p>
        }
        @if (formSuccess()) {
          <p class="text-sm text-green-600 mb-3">{{ formSuccess() }}</p>
        }

        <button (click)="addSlot()"
          [disabled]="adding()"
          class="bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          {{ adding() ? 'Adding...' : '+ Add Slot' }}
        </button>
      </div>

      <!-- Existing slots -->
      <div class="bg-white rounded-xl shadow p-6">
        <h3 class="text-base font-semibold text-gray-700 mb-4">
          Current Slots
          <span class="text-xs text-gray-400 font-normal ml-2">({{ slots().length }} active)</span>
        </h3>

        @if (loading()) {
          <p class="text-sm text-gray-400">Loading slots...</p>
        }

        @if (!loading() && slots().length === 0) {
          <p class="text-sm text-gray-400 italic">No availability slots yet. Add one above.</p>
        }

        <div class="space-y-2">
          @for (slot of slots(); track slot.id) {
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div class="flex items-center gap-3">
                <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                  {{ slot.day_of_week }}
                </span>
                <span class="text-sm text-gray-700">
                  {{ slot.start_time }} – {{ slot.end_time }}
                </span>
              </div>
              <button (click)="removeSlot(slot.id)"
                [disabled]="removing() === slot.id"
                class="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-40 transition-colors">
                {{ removing() === slot.id ? 'Removing...' : 'Remove' }}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ScheduleManagerComponent implements OnInit {
  private api  = inject(ApiService)
  private auth = inject(AuthService)

  slots   = signal<Availability[]>([])
  loading = signal(true)
  adding  = signal(false)
  removing = signal<number | null>(null)

  formError   = signal<string | null>(null)
  formSuccess = signal<string | null>(null)

  days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  form = {
    day_of_week: 'MON' as DayOfWeek,
    start_time:  '08:00',
    end_time:    '09:00',
  }

  // Teacher ID is resolved server-side from JWT — we load from /me -> teacher profile
  private teacherId: number | null = null

  ngOnInit(): void {
    this.loadTeacherAndSlots()
  }

  private loadTeacherAndSlots(): void {
    // Get current user's teacher profile id via /me
    // The backend GET /teachers returns all teachers; we match by user id
    const userId = this.auth.currentUser()?.sub
    this.api.getTeachers().subscribe(res => {
      const profile = res.data.find(t => t.user_id === userId)
      if (profile) {
        this.teacherId = profile.teacher_id
        this.loadSlots()
      } else {
        this.loading.set(false)
      }
    })
  }

  loadSlots(): void {
    if (!this.teacherId) return
    this.api.getAvailability(this.teacherId).subscribe({
      next: res => {
        this.slots.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  addSlot(): void {
    this.formError.set(null)
    this.formSuccess.set(null)

    if (!this.form.start_time || !this.form.end_time) {
      this.formError.set('Please fill in all fields.')
      return
    }

    if (this.form.start_time >= this.form.end_time) {
      this.formError.set('End time must be after start time.')
      return
    }

    this.adding.set(true)

    this.api.createAvailability(this.form).subscribe({
      next: res => {
        this.slots.update(s => [...s, res.data])
        this.formSuccess.set('Slot added successfully.')
        this.adding.set(false)
        // reset
        this.form = { day_of_week: 'MON', start_time: '08:00', end_time: '09:00' }
        setTimeout(() => this.formSuccess.set(null), 3000)
      },
      error: (err) => {
        this.formError.set(err.error?.error ?? 'Failed to add slot.')
        this.adding.set(false)
      },
    })
  }

  removeSlot(id: number): void {
    if (!confirm('Remove this availability slot?')) return
    this.removing.set(id)
    this.api.deleteAvailability(id).subscribe({
      next: () => {
        this.slots.update(s => s.filter(sl => sl.id !== id))
        this.removing.set(null)
      },
      error: () => this.removing.set(null),
    })
  }
}