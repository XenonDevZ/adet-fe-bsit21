import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col">

      <!-- Top half — dark maroon -->
      <div class="bg-gradient-to-r from-red-950 to-red-800 flex-none h-48 flex flex-col items-center justify-center">
        <h1 class="text-3xl font-bold text-white -mt-14 tracking-tight">Welcome to ACBS</h1>
      </div>

      <!-- Bottom half — light cream -->
      <div class="flex-1 bg-rose-50 flex justify-center">

        <!-- Card overlapping both halves -->
        <div class="w-full max-w-md -mt-16 mb-10 h-fit bg-white rounded-2xl shadow-xl overflow-hidden">

          <!-- Card header -->
          <div class="px-8 pt-7 pb-5 text-center border-b border-gray-100">
            <div class="inline-flex items-center gap-1 mb-3">
              <img src="/assets/acbs-logo.png" alt="ACBS Logo" class="w-12 h-12  object-contain" />
              <span class="font-bold text-gray-900 text-lg">ACBS</span>
            </div>
            <h2 class="text-base font-semibold text-gray-800">Complete Your Profile</h2>
            <p class="text-gray-400 text-xs mt-1">Hi {{ userName() }}! Fill in your details to get started.</p>
          </div>

          <!-- Form -->
          <div class="px-8 py-6 space-y-4">

            <!-- Name -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input type="text" [(ngModel)]="form.name"
                placeholder="e.g. Juan dela Cruz"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all bg-gray-50" />
            </div>

            <!-- Course -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Course / Program
              </label>
              <input type="text" [(ngModel)]="form.course"
                placeholder="e.g. BS Information Technology"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all bg-gray-50" />
            </div>

            <!-- Year level -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Year Level
              </label>
              <select [(ngModel)]="form.year_level"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all bg-gray-50">
                <option value="">Select year level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <!-- Department -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Department
              </label>
              <input type="text" [(ngModel)]="form.department"
                placeholder="e.g. College of Computer Studies"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all bg-gray-50" />
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ error() }}
              </div>
            }

            <!-- Submit -->
            <button (click)="submit()" [disabled]="saving()"
              class="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              @if (saving()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving...
                </span>
              } @else {
                Get Started
              }
            </button>
          </div>

          <!-- Footer -->
          <div class="px-8 pb-6 text-center">
            <p class="text-xs text-gray-400">
              © {{ year }} ACBS. Liceo de Cagayan University.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileSetupComponent implements OnInit {
  private api    = inject(ApiService)
  private auth   = inject(AuthService)
  private router = inject(Router)

  saving = signal(false)
  error  = signal<string | null>(null)
  year   = new Date().getFullYear()

  form = {
    name:       '',
    course:     '',
    year_level: '',
    department: '',
  }

  ngOnInit(): void {
    this.form.name = this.auth.currentUser()?.name ?? ''

    this.api.getProfile().subscribe({
      next: res => {
        const u = res.data
        this.form.name       = u.name       || this.form.name
        this.form.course     = u.course     || ''
        this.form.year_level = u.year_level || ''
        this.form.department = u.department || ''
      }
    })
  }

  userName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? ''
  }

  submit(): void {
    if (!this.form.name.trim())       { this.error.set('Name is required.');       return }
    if (!this.form.course.trim())     { this.error.set('Course is required.');     return }
    if (!this.form.year_level)        { this.error.set('Year level is required.'); return }
    if (!this.form.department.trim()) { this.error.set('Department is required.'); return }

    this.saving.set(true)
    this.error.set(null)

    this.api.updateProfile(this.form).subscribe({
      next: () => {
        this.saving.set(false)
        this.auth.setProfileComplete()
        this.router.navigate(['/student/teachers'])
      },
      error: (err) => {
        this.saving.set(false)
        this.error.set(err.error?.error ?? 'Failed to save profile.')
      },
    })
  }
}
