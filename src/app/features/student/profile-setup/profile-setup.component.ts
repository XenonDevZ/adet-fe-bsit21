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
    <div class="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">

      <!-- ── LEFT: Brand/Info Panel ── -->
      <div class="relative hidden lg:flex lg:w-[42%] h-screen sticky top-0 bg-gradient-to-br from-red-950 via-red-900 to-red-800 flex-col items-center justify-center p-14 overflow-hidden">

        <!-- Decorative background -->
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.04]"
             style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 28px 28px;"></div>

        <div class="relative z-10 w-full max-w-sm text-center flex flex-col items-center">

          <!-- Logo -->
          <div class="w-20 h-20 rounded-[1.5rem] bg-white/10 border border-white/20 flex items-center justify-center shadow-inner backdrop-blur-sm p-3 mb-8">
            <img src="/assets/acbs-logo.png" alt="ACBS Logo" class="w-full h-full object-contain" />
          </div>

          <!-- Welcome heading -->
          <h1 class="text-3xl font-black text-white leading-tight tracking-tight mb-3">
            Almost there,<br/>
            <span class="text-red-300">{{ firstName() }}!</span>
          </h1>
          <p class="text-red-100/70 text-sm font-medium leading-relaxed mb-10">
            Fill in your academic details so we can personalize your consultation experience.
          </p>

          <!-- Steps -->
          <div class="w-full space-y-3">
            @for (step of steps; track step.label; let i = $index) {
              <div class="flex items-center gap-4 bg-white/[0.08] border border-white/10 rounded-2xl px-4 py-3.5 backdrop-blur-sm">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                     [class]="i < currentStep ? 'bg-green-400/90 text-white' : i === currentStep ? 'bg-white text-red-900' : 'bg-white/10 text-white/40'">
                  @if (i < currentStep) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <div class="text-left">
                  <p class="text-xs font-bold" [class]="i <= currentStep ? 'text-white' : 'text-white/40'">{{ step.label }}</p>
                  <p class="text-[10px] font-medium" [class]="i <= currentStep ? 'text-red-200/60' : 'text-white/20'">{{ step.desc }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Badge -->
          <div class="mt-8 flex items-center gap-2 bg-white/[0.08] border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-white/70 text-xs font-medium">One-time setup · Takes under a minute</span>
          </div>
        </div>
      </div>

      <!-- ── RIGHT: Form Panel ── -->
      <div class="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 sm:px-12 bg-gray-50">

        <!-- Mobile header -->
        <div class="lg:hidden flex flex-col items-center mb-10">
          <div class="w-14 h-14 rounded-2xl bg-red-900 flex items-center justify-center shadow-lg mb-3 p-1.5">
            <img src="/assets/acbs-logo.png" alt="ACBS Logo" class="w-full h-full object-contain" />
          </div>
          <h1 class="text-xl font-black text-gray-900">Complete Your Profile</h1>
          <p class="text-xs text-gray-400 font-medium mt-1">Hi {{ firstName() }}, fill in your details to get started.</p>
        </div>

        <div class="w-full max-w-[26rem]">

          <!-- Heading -->
          <div class="mb-8">
            <div class="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-4">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Profile Setup
            </div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Complete Your Profile</h2>
            <p class="text-sm text-gray-400 font-medium mt-1.5">
              This information helps teachers identify and prepare for your consultations.
            </p>
          </div>

          <!-- Form fields -->
          <div class="space-y-5">

            <!-- Full Name -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" [(ngModel)]="form.name"
                placeholder="e.g. Juan dela Cruz"
                (input)="syncStep()"
                class="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-900 bg-white hover:border-gray-200 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all shadow-sm placeholder:text-gray-300" />
            </div>

            <!-- Course -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Course / Program</label>
              <input type="text" [(ngModel)]="form.course"
                placeholder="e.g. BS Information Technology"
                (input)="syncStep()"
                class="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-900 bg-white hover:border-gray-200 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all shadow-sm placeholder:text-gray-300" />
            </div>

            <!-- Year Level -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Year Level</label>
              <select [(ngModel)]="form.year_level"
                (change)="syncStep()"
                class="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-900 bg-white hover:border-gray-200 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all shadow-sm appearance-none cursor-pointer">
                <option value="">Select your year level</option>
                <option value="1st Year">Freshman — 1st Year</option>
                <option value="2nd Year">Sophomore — 2nd Year</option>
                <option value="3rd Year">Junior — 3rd Year</option>
                <option value="4th Year">Senior — 4th Year</option>
              </select>
            </div>

            <!-- Department -->
            <div>
              <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Department / College</label>
              <input type="text" [(ngModel)]="form.department"
                placeholder="e.g. College of Computer Studies"
                (input)="syncStep()"
                class="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-900 bg-white hover:border-gray-200 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all shadow-sm placeholder:text-gray-300" />
            </div>
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="mt-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3.5 flex items-start gap-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ error() }}
            </div>
          }

          <!-- Submit -->
          <button (click)="submit()" [disabled]="saving()"
            class="mt-6 w-full relative overflow-hidden disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none text-white font-black tracking-wide py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed active:scale-[0.98]">
            <div class="absolute inset-0 bg-gradient-to-r from-red-900 to-red-700 transition-opacity"
                 [class.opacity-0]="saving()"></div>
            <span class="relative z-10 flex items-center justify-center gap-2 text-sm">
              @if (saving()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Saving your profile...
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
                Get Started
              }
            </span>
          </button>

          <p class="text-center text-[10px] text-gray-300 font-medium mt-6">
            &copy; {{ year }} ACBS &middot; Liceo de Cagayan University
          </p>
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
  currentStep = 0

  form = {
    name:       '',
    course:     '',
    year_level: '',
    department: '',
  }

  steps = [
    { label: 'Personal Info', desc: 'Your full name' },
    { label: 'Academic Details', desc: 'Course & year level' },
    { label: 'Department', desc: 'Your college / department' },
  ]

  ngOnInit(): void {
    this.form.name = this.auth.currentUser()?.name ?? ''
    this.syncStep()

    this.api.getProfile().subscribe({
      next: res => {
        const u = res.data
        this.form.name       = u.name       || this.form.name
        this.form.course     = u.course     || ''
        this.form.year_level = u.year_level || ''
        this.form.department = u.department || ''
        this.syncStep()
      }
    })
  }

  firstName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? 'there'
  }

  syncStep(): void {
    if (!this.form.name.trim()) { this.currentStep = 0; return }
    if (!this.form.course.trim() || !this.form.year_level) { this.currentStep = 1; return }
    this.currentStep = this.form.department.trim() ? 3 : 2
  }

  submit(): void {
    if (!this.form.name.trim())       { this.error.set('Full name is required.');       return }
    if (!this.form.course.trim())     { this.error.set('Course / program is required.');     return }
    if (!this.form.year_level)        { this.error.set('Please select your year level.'); return }
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
        this.error.set(err.error?.error ?? 'Failed to save profile. Please try again.')
      },
    })
  }
}
