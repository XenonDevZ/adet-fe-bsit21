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
    <div class="max-w-2xl mx-auto">

      <!-- Back -->
      <button (click)="router.navigate(['/student/teachers'])"
        class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Teachers
      </button>

      @if (teacher()) {
        <!-- Teacher info card -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
          <div class="h-1.5 bg-gradient-to-r from-red-800 to-red-500"></div>
          <div class="p-6">
            <div class="flex items-center gap-4 mb-3">
              <img
                [src]="teacher()!.picture || 'https://ui-avatars.com/api/?name=' + teacher()!.name + '&background=7f1d1d&color=fff'"
                class="w-14 h-14 rounded-full border-2 border-red-100 object-cover" />
              <div>
                <h2 class="text-lg font-bold text-gray-900">{{ teacher()!.name }}</h2>
                <p class="text-sm text-red-700 font-medium">{{ teacher()!.department || 'Faculty' }}</p>
              </div>
            </div>

            <!-- Subject tags -->
            @if (teacher()!.subjects) {
              <div class="flex flex-wrap gap-1.5">
                @for (subject of getSubjects(teacher()!.subjects); track subject) {
                  <span class="text-xs bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-lg border border-red-100">
                    {{ subject }}
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Booking form -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-50">
            <h3 class="font-semibold text-gray-900">Book a Session</h3>
            <p class="text-xs text-gray-400 mt-0.5">Fill in the details below to request a consultation.</p>
          </div>

          <div class="p-6 space-y-6">

            <!-- Step 1: Consultation type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                <span class="inline-flex items-center justify-center w-5 h-5 bg-red-800 text-white text-xs rounded-full mr-2">1</span>
                Consultation Type
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
                  [class.border-red-700]="consultationType === 'FACE_TO_FACE'"
                  [class.bg-red-50]="consultationType === 'FACE_TO_FACE'"
                  [class.border-gray-100]="consultationType !== 'FACE_TO_FACE'">
                  <input type="radio" name="type" value="FACE_TO_FACE"
                    [(ngModel)]="consultationType" class="accent-red-800" />
                  <div>
                    <p class="text-sm font-semibold text-gray-800">Face to Face</p>
                    <p class="text-xs text-gray-400">In-person meeting</p>
                  </div>
                </label>

                <label
                  class="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all"
                  [class.border-red-700]="consultationType === 'ONLINE'"
                  [class.bg-red-50]="consultationType === 'ONLINE'"
                  [class.border-gray-100]="consultationType !== 'ONLINE'">
                  <input type="radio" name="type" value="ONLINE"
                    [(ngModel)]="consultationType" class="accent-red-800" />
                  <div>
                    <p class="text-sm font-semibold text-gray-800">Online</p>
                    <p class="text-xs text-gray-400">Via Google Meet</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Step 2: Time slot -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                <span class="inline-flex items-center justify-center w-5 h-5 bg-red-800 text-white text-xs rounded-full mr-2">2</span>
                Choose a Time Slot
              </label>

              @if (slotsLoading()) {
                <div class="space-y-2">
                  @for (i of [1,2,3]; track i) {
                    <div class="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                  }
                </div>
              }

              @if (!slotsLoading() && slots().length === 0) {
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  This teacher has no available slots yet.
                </div>
              }

              <div class="space-y-2">
                @for (slot of slots(); track slot.id) {
                  <label
                    class="flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all"
                    [class.border-red-700]="selectedSlot()?.id === slot.id"
                    [class.bg-red-50]="selectedSlot()?.id === slot.id"
                    [class.border-gray-100]="selectedSlot()?.id !== slot.id">
                    <input type="radio" name="slot" [value]="slot"
                      (change)="onSlotChange(slot)" class="accent-red-800" />
                    <div class="flex-1">
                      <span class="inline-block bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-lg mr-2">
                        {{ slot.day_of_week }}
                      </span>
                      <span class="text-sm text-gray-700">{{ slot.start_time }} – {{ slot.end_time }}</span>
                    </div>
                    @if (selectedSlot()?.id === slot.id) {
                      <svg class="w-4 h-4 text-red-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    }
                  </label>
                }
              </div>
            </div>

            <!-- Step 3: Date -->
            @if (selectedSlot()) {
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  <span class="inline-flex items-center justify-center w-5 h-5 bg-red-800 text-white text-xs rounded-full mr-2">3</span>
                  Pick a Date
                  <span class="text-xs text-gray-400 font-normal ml-2">Must be a {{ selectedSlot()!.day_of_week }}</span>
                </label>
                <input type="date" [(ngModel)]="scheduledDate" [min]="minDate"
                  class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-0 focus:border-red-400 transition-colors" />
                @if (dateError()) {
                  <p class="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    {{ dateError() }}
                  </p>
                }
              </div>
            }

            <!-- Step 4: Notes -->
            @if (selectedSlot()) {
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  <span class="inline-flex items-center justify-center w-5 h-5 bg-red-800 text-white text-xs rounded-full mr-2">4</span>
                  Reason / Notes
                  <span class="text-xs text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea [(ngModel)]="notes" rows="3"
                  placeholder="What would you like to discuss?"
                  class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-0 focus:border-red-400 transition-colors resize-none">
                </textarea>
              </div>
            }

            <!-- Feedback -->
            @if (successMsg()) {
              <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-4 flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ successMsg() }}
              </div>
            }

            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ errorMsg() }}
              </div>
            }

            <!-- Submit -->
            <button (click)="submit()"
              [disabled]="!canSubmit() || submitting()"
              class="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-200
                     disabled:cursor-not-allowed text-white font-semibold py-3
                     rounded-xl transition-colors text-sm">
              @if (submitting()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Submitting...
                </span>
              } @else {
                Confirm Booking
              }
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class BookConsultationComponent implements OnInit {
  private api   = inject(ApiService)
  private route = inject(ActivatedRoute)
  router        = inject(Router)

  teacher           = signal<Teacher | null>(null)
  slots             = signal<Availability[]>([])
  selectedSlot      = signal<Availability | null>(null)
  slotsLoading      = signal(true)
  consultationType  = 'FACE_TO_FACE'

  scheduledDate = ''
  notes         = ''
  minDate       = new Date().toISOString().split('T')[0]

  submitting = signal(false)
  successMsg = signal<string | null>(null)
  errorMsg   = signal<string | null>(null)
  dateError  = signal<string | null>(null)

  private dayMap: Record<string, number> = {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
  }

  ngOnInit(): void {
    const teacherId = Number(this.route.snapshot.paramMap.get('teacherId'))
    this.api.getTeacher(teacherId).subscribe(res => this.teacher.set(res.data))
    this.api.getAvailability(teacherId).subscribe(res => {
      this.slots.set(res.data)
      this.slotsLoading.set(false)
    })
  }

  getSubjects(subjects: string | null): string[] {
    if (!subjects) return []
    return subjects.split(',').map(s => s.trim()).filter(Boolean)
  }

  onSlotChange(slot: Availability): void {
    this.selectedSlot.set(slot)
    this.scheduledDate = ''
    this.dateError.set(null)
  }

  canSubmit(): boolean {
    return !!this.selectedSlot() && !!this.scheduledDate &&
           !!this.consultationType && !this.dateError()
  }

  submit(): void {
    const slot = this.selectedSlot()
    if (!slot || !this.scheduledDate) return

    const selected    = new Date(this.scheduledDate + 'T00:00:00')
    const expectedDay = this.dayMap[slot.day_of_week]
    if (selected.getDay() !== expectedDay) {
      this.dateError.set(`Please pick a ${slot.day_of_week} for this slot.`)
      return
    }

    this.submitting.set(true)
    this.errorMsg.set(null)

    this.api.createBooking({
      teacher_id:        this.teacher()!.teacher_id,
      availability_id:   slot.id,
      scheduled_date:    this.scheduledDate,
      start_time:        slot.start_time,
      end_time:          slot.end_time,
      consultation_type: this.consultationType as 'ONLINE' | 'FACE_TO_FACE',
      notes:             this.notes || undefined,
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
