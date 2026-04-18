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
    <div class="min-h-screen pb-12 animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      
      <!-- ── Elevated Hero Header ── -->
      <div class="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 px-6 pt-12 pb-24 sm:px-12 lg:px-16 rounded-[3rem] shadow-2xl overflow-hidden">
        
        <!-- Ambient Background Sweeps -->
        <div class="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-red-500/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div class="relative w-full flex flex-col md:flex-row items-center md:items-start gap-8 z-10 text-center md:text-left">
          
          <!-- Avatar Glass Container -->
          <div class="relative group">
            <div class="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div class="w-32 h-32 md:w-36 md:h-36 rounded-[2rem] bg-white/10 backdrop-blur-md flex flex-shrink-0 items-center justify-center border-4 border-white/20 overflow-hidden shadow-2xl relative z-10">
              @if (user()?.picture) {
                <img [src]="user()!.picture" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
              } @else {
                <svg class="w-14 h-14 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              }
            </div>
            
            <!-- Connection Status indicator -->
            <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 border-[3px] border-red-900 shadow-lg z-20 flex items-center justify-center" title="Account Active">
              <span class="absolute w-full h-full rounded-xl bg-emerald-400 animate-ping opacity-50"></span>
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          
          <div class="mt-2 text-white">
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-4 shadow-sm">
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Validated Identity
            </span>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-md">{{ user()?.name || 'Loading Profile...' }}</h2>
            <p class="text-base font-semibold text-red-200 tracking-wide flex items-center justify-center md:justify-start gap-2">
              <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              {{ user()?.email || 'Student Record' }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Floating Glass UI Card ── -->
      <div class="w-full -mt-16 pb-16 relative z-20">
        
        <div class="bg-white/80 dark:bg-card/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white dark:border-white/5 overflow-hidden p-8 sm:p-12 transition-all">
          
          @if (loading()) {
            <!-- Skeleton View -->
            <div class="space-y-8 animate-pulse">
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3 mb-6"></div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl w-full"></div>
                <div class="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl w-full"></div>
                <div class="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl w-full"></div>
              </div>
            </div>
          } @else {
            
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">Academic Profile</h3>
              @if (!editing()) {
                <button (click)="startEdit()" class="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 hover:bg-red-800 dark:hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm border border-red-100 dark:border-red-900/50 uppercase tracking-widest text-[10px] font-black active:scale-95 group">
                  <svg class="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit Settings
                </button>
              }
            </div>

            <!-- ── View Mode ── -->
            @if (!editing()) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                @for (field of infoFields(); track field.label) {
                  <div class="p-6 rounded-[1.5rem] bg-white dark:bg-card border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                     <div class="absolute top-0 left-0 w-1 h-full bg-red-100 dark:bg-red-900/50 group-hover:bg-red-600 dark:group-hover:bg-red-500 transition-colors duration-300"></div>
                     <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{{ field.label }}</p>
                     <p class="text-lg text-gray-900 dark:text-foreground font-black drop-shadow-sm">{{ field.value || 'Not specified' }}</p>
                  </div>
                }
              </div>
            }

            <!-- ── Edit Mode Form ── -->
            @if (editing()) {
              <div class="space-y-8 animate-in fade-in zoom-in-95 duration-300 relative">
                
                <div class="absolute inset-x-0 -top-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <!-- Full Name -->
                  <div class="group">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2 transition-colors group-focus-within:text-red-800 dark:group-focus-within:text-red-400">Full Legal Name</label>
                    <input type="text" [(ngModel)]="form.name" required
                      class="w-full border border-gray-200 dark:border-white/10 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-gray-900 dark:text-foreground bg-white dark:bg-card hover:border-red-300 dark:hover:border-red-900/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 dark:focus:ring-white/10 transition-all shadow-sm" />
                  </div>

                  <!-- Department -->
                  <div class="group">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2 transition-colors group-focus-within:text-red-800 dark:group-focus-within:text-red-400">Academic Department</label>
                    <input type="text" [(ngModel)]="form.department" required
                      class="w-full border border-gray-200 dark:border-white/10 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-gray-900 dark:text-foreground bg-white dark:bg-card hover:border-red-300 dark:hover:border-red-900/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 dark:focus:ring-white/10 transition-all shadow-sm" />
                  </div>

                  <!-- Course -->
                  <div class="group">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2 transition-colors group-focus-within:text-red-800 dark:group-focus-within:text-red-400">Course / Program</label>
                    <input type="text" [(ngModel)]="form.course" required
                      class="w-full border border-gray-200 dark:border-white/10 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-gray-900 dark:text-foreground bg-white dark:bg-card hover:border-red-300 dark:hover:border-red-900/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 dark:focus:ring-white/10 transition-all shadow-sm" />
                  </div>

                  <!-- Year Level -->
                  <div class="group">
                     <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2 transition-colors group-focus-within:text-red-800 dark:group-focus-within:text-red-400">Year Level</label>
                     <div class="relative">
                       <select [(ngModel)]="form.year_level" required
                         class="w-full border border-gray-200 dark:border-white/10 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-gray-900 dark:text-foreground bg-white dark:bg-card hover:border-red-300 dark:hover:border-red-900/50 focus:bg-white dark:focus:bg-card focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 dark:focus:ring-white/10 transition-all shadow-sm appearance-none cursor-pointer">
                         <option value="">Select current year level</option>
                         <option value="1st Year"> Freshman (1st Year)</option>
                         <option value="2nd Year"> Sophomore (2nd Year)</option>
                         <option value="3rd Year"> Junior (3rd Year)</option>
                         <option value="4th Year"> Senior (4th Year)</option>
                       </select>
                       <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                       </div>
                     </div>
                  </div>
                </div>

                <!-- Messages -->
                @if (error()) {
                  <div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-900 dark:text-red-400 text-sm font-black rounded-xl p-4 flex items-center gap-3 shadow-md animate-in slide-in-from-bottom-2">
                    <svg class="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ error() }}
                  </div>
                }

                @if (successMsg()) {
                  <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-400 text-sm font-black rounded-xl p-4 flex items-center gap-3 shadow-md animate-in slide-in-from-bottom-2">
                    <div class="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    {{ successMsg() }}
                  </div>
                }

                <!-- Actions -->
                <div class="pt-8 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-4">
                  <button (click)="cancelEdit()" [disabled]="saving()"
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-[1.25rem] transition-all disabled:opacity-50 active:scale-95">
                    Discard Changes
                  </button>
                  <button (click)="save()" [disabled]="saving()"
                    class="flex items-center gap-2 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:from-gray-200 dark:disabled:from-white/5 disabled:to-gray-200 dark:disabled:to-white/5 disabled:text-gray-400 dark:disabled:text-gray-500 text-white text-[10px] uppercase font-black tracking-widest px-8 py-4 rounded-[1.25rem] transition-all shadow-lg shadow-red-900/20 active:scale-95 disabled:active:scale-100 disabled:shadow-none">
                    @if (saving()) {
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                        Committing...
                    } @else {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Configuration
                    }
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>
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
        this.successMsg.set('Profile successfully updated.')
        this.auth.setProfileComplete()
        setTimeout(() => this.successMsg.set(null), 3000)
      },
      error: (err) => {
        this.saving.set(false)
        this.error.set(err.error?.error ?? 'Failed to safely commit profile changes.')
      },
    })
  }
}
