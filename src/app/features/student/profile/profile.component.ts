import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { User } from '../../../core/models/index'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">My Profile</h2>
        <p class="text-gray-400 text-sm mt-1">View and update your account information.</p>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-2xl shadow-sm p-8 animate-pulse space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div class="space-y-2 flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      }

      @if (!loading() && user()) {
        <!-- Profile card -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
          <div class="h-1.5 bg-gradient-to-r from-red-900 to-red-500"></div>
          <div class="p-6">

            <!-- Avatar + name -->
            <div class="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
              <img [src]="user()!.picture || 'https://ui-avatars.com/api/?name=' + user()!.name + '&background=7f1d1d&color=fff'"
                class="w-16 h-16 rounded-2xl object-cover border-2 border-red-100" />
              <div>
                <p class="font-bold text-gray-900 text-lg">{{ user()!.name }}</p>
                <p class="text-sm text-gray-400">{{ user()!.email }}</p>
                <span class="inline-block mt-1 text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-lg">
                  {{ user()!.role }}
                </span>
              </div>
            </div>

            <!-- Info fields (view mode) -->
            @if (!editing()) {
              <div class="space-y-4">
                @for (field of infoFields(); track field.label) {
                  <div class="flex items-start justify-between">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 flex-shrink-0 mt-0.5">
                      {{ field.label }}
                    </p>
                    <p class="text-sm text-gray-800 flex-1 text-right font-medium">
                      {{ field.value || '—' }}
                    </p>
                  </div>
                }
              </div>

              <button (click)="startEdit()"
                class="mt-6 w-full flex items-center justify-center gap-2 border-2 border-red-800 text-red-800 hover:bg-red-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Profile
              </button>
            }

            <!-- Edit mode -->
            @if (editing()) {
              <div class="space-y-4">

                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input type="text" [(ngModel)]="form.name"
                    class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Course / Program</label>
                  <input type="text" [(ngModel)]="form.course"
                    class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Year Level</label>
                  <select [(ngModel)]="form.year_level"
                    class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors bg-white">
                    <option value="">Select year level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Department</label>
                  <input type="text" [(ngModel)]="form.department"
                    class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors" />
                </div>
              </div>

              @if (error()) {
                <div class="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                  {{ error() }}
                </div>
              }

              @if (successMsg()) {
                <div class="mt-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  {{ successMsg() }}
                </div>
              }

              <div class="flex gap-3 mt-6">
                <button (click)="cancelEdit()"
                  class="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Cancel
                </button>
                <button (click)="save()" [disabled]="saving()"
                  class="flex-1 bg-red-800 hover:bg-red-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  {{ saving() ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private api  = inject(ApiService)
  private auth = inject(AuthService)

  user    = signal<User | null>(null)
  loading = signal(true)
  editing = signal(false)
  saving  = signal(false)
  error   = signal<string | null>(null)
  successMsg = signal<string | null>(null)

  form = {
    name:       '',
    course:     '',
    year_level: '',
    department: '',
  }

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.api.getProfile().subscribe({
      next: res => {
        this.user.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  infoFields() {
    const u = this.user()
    if (!u) return []
    return [
      { label: 'Course',     value: u.course     },
      { label: 'Year Level', value: u.year_level },
      { label: 'Department', value: u.department },
    ]
  }

  startEdit(): void {
    const u = this.user()
    if (!u) return
    this.form = {
      name:       u.name       || '',
      course:     u.course     || '',
      year_level: u.year_level || '',
      department: u.department || '',
    }
    this.editing.set(true)
    this.error.set(null)
    this.successMsg.set(null)
  }

  cancelEdit(): void {
    this.editing.set(false)
    this.error.set(null)
  }

  save(): void {
    if (!this.form.name.trim())       { this.error.set('Name is required.');       return }
    if (!this.form.course.trim())     { this.error.set('Course is required.');     return }
    if (!this.form.year_level)        { this.error.set('Year level is required.'); return }
    if (!this.form.department.trim()) { this.error.set('Department is required.'); return }

    this.saving.set(true)
    this.error.set(null)

    this.api.updateProfile(this.form).subscribe({
      next: res => {
        this.user.set(res.data)
        this.saving.set(false)
        this.editing.set(false)
        this.successMsg.set('Profile updated successfully.')
        this.auth.setProfileComplete()
        setTimeout(() => this.successMsg.set(null), 3000)
      },
      error: (err) => {
        this.saving.set(false)
        this.error.set(err.error?.error ?? 'Failed to save profile.')
      },
    })
  }
}
