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

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Manage Schedule</h2>
        <p class="text-gray-400 text-sm mt-1">Set your weekly availability for student consultations.</p>
      </div>

      <!-- Add slot card -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div class="h-1.5 bg-gradient-to-r from-red-900 to-red-500"></div>
        <div class="p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Add New Time Slot</h3>

          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Day</label>
              <select [(ngModel)]="form.day_of_week"
                class="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors">
                @for (day of days; track day) {
                  <option [value]="day">{{ day }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Start Time</label>
              <input type="time" [(ngModel)]="form.start_time"
                class="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">End Time</label>
              <input type="time" [(ngModel)]="form.end_time"
                class="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors" />
            </div>
          </div>

          @if (formError()) {
            <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ formError() }}
            </div>
          }

          @if (formSuccess()) {
            <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              {{ formSuccess() }}
            </div>
          }

          <button (click)="addSlot()" [disabled]="adding()"
            class="flex items-center gap-2 bg-red-800 hover:bg-red-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            @if (adding()) {
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Adding...
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Slot
            }
          </button>
        </div>
      </div>

      <!-- Existing slots card -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Active Slots</h3>
          <span class="text-xs font-semibold bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
            {{ slots().length }} slots
          </span>
        </div>

        <div class="p-6">
          @if (loading()) {
            <div class="space-y-3">
              @for (i of [1,2,3]; track i) {
                <div class="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              }
            </div>
          }

          @if (!loading() && slots().length === 0) {
            <div class="text-center py-10">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-2xl mb-3">
                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p class="text-gray-500 text-sm font-medium">No slots added yet</p>
              <p class="text-gray-400 text-xs mt-1">Add your first availability slot above.</p>
            </div>
          }

          <div class="space-y-3">
            @for (slot of slots(); track slot.id) {
              <div class="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-100 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-14 bg-red-800 text-white text-xs font-bold py-1 rounded-lg">
                    {{ slot.day_of_week }}
                  </span>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ slot.start_time }} – {{ slot.end_time }}</p>
                    <p class="text-xs text-gray-400">Weekly recurring</p>
                  </div>
                </div>
                <button (click)="removeSlot(slot.id)"
                  [disabled]="removing() === slot.id"
                  class="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40">
                  @if (removing() === slot.id) {
                    Removing...
                  } @else {
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Remove
                  }
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ScheduleManagerComponent implements OnInit {
  private api  = inject(ApiService)
  private auth = inject(AuthService)

  slots    = signal<Availability[]>([])
  loading  = signal(true)
  adding   = signal(false)
  removing = signal<number | null>(null)

  formError   = signal<string | null>(null)
  formSuccess = signal<string | null>(null)

  days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  form = {
    day_of_week: 'MON' as DayOfWeek,
    start_time:  '08:00',
    end_time:    '09:00',
  }

  private teacherId: number | null = null

  ngOnInit(): void {
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
