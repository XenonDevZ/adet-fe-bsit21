import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pb-12 animate-in fade-in zoom-in-95 duration-500 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      
      <!-- ── ELEVATED HERO HEADER ── -->
      <div class="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[3rem] p-8 lg:p-12 overflow-hidden shadow-2xl border border-white/10 mb-8 group">
        <!-- Ambient Background Sweeps -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-red-400/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div class="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 z-10 text-center md:text-left">
          
          <!-- Avatar Glass Container -->
          <div class="relative group/avatar">
            <div class="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl group-hover/avatar:blur-2xl transition-all duration-500 opacity-0 group-hover/avatar:opacity-100"></div>
            <div class="w-32 h-32 md:w-36 md:h-36 rounded-[2rem] bg-white/10 backdrop-blur-md flex flex-shrink-0 items-center justify-center border-4 border-white/20 overflow-hidden shadow-2xl relative z-10">
              @if (picture()) {
                <img [src]="picture()" class="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700 ease-in-out" />
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
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 box-shadow-glow"></span> Identity Verified
            </span>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-md">{{ form.name || 'Loading Profile...' }}</h2>
            <p class="text-base font-semibold text-red-200 tracking-wide flex items-center justify-center md:justify-start gap-2">
              <svg class="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Faculty Staff
            </p>
          </div>
        </div>
      </div>

      <!-- ── Floating Glass UI Card ── -->
      <div class="max-w-5xl mx-auto relative z-20">
        <div class="bg-white/80 dark:bg-card/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl dark:shadow-none border border-white dark:border-white/5 overflow-hidden p-8 sm:p-12 transition-all">
          
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h3 class="text-2xl font-black text-gray-900 dark:text-foreground tracking-tight">Professional Profile</h3>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Manage your public presence</p>
            </div>
            
            @if (!editing() && !loading()) {
              <button (click)="startEdit()" class="flex items-center gap-2 px-6 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 hover:bg-red-800 dark:hover:bg-red-800 hover:text-white rounded-xl transition-all shadow-sm border border-red-100 dark:border-red-900/50 uppercase tracking-widest text-[10px] font-black active:scale-95 group">
                <svg class="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Modify Information
              </button>
            }
          </div>

          @if (loading()) {
            <!-- Skeleton View -->
            <div class="space-y-8 animate-pulse">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="h-28 bg-white/50 dark:bg-white/5 backdrop-blur border border-white dark:border-white/5 rounded-[1.5rem] shadow-sm w-full"></div>
                <div class="h-28 bg-white/50 dark:bg-white/5 backdrop-blur border border-white dark:border-white/5 rounded-[1.5rem] shadow-sm w-full"></div>
              </div>
              <div class="h-40 bg-white/50 dark:bg-white/5 backdrop-blur border border-white dark:border-white/5 rounded-[1.5rem] shadow-sm w-full"></div>
            </div>
          } @else {
            
            <!-- ── View Mode ── -->
            @if (!editing()) {
              <div class="animate-in fade-in duration-300 space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  @for (field of infoFields(); track field.label) {
                    <div class="p-6 rounded-[1.5rem] bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                       <div class="absolute top-0 left-0 w-1 h-full bg-red-100 dark:bg-red-900/30 group-hover:bg-red-600 transition-colors duration-300"></div>
                       <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ field.label }}</p>
                       <p class="text-lg text-gray-900 dark:text-foreground font-black drop-shadow-sm dark:drop-shadow-none">{{ field.value || 'Not specified' }}</p>
                    </div>
                  }
                </div>

                <!-- Bio section -->
                @if (form.bio) {
                   <div class="p-6 sm:p-8 rounded-[1.5rem] bg-gray-50/80 dark:bg-black/40 backdrop-blur border border-gray-100 dark:border-white/5 shadow-inner dark:shadow-none group">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <svg class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-red-300 dark:group-hover:text-red-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       Biography
                    </p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-4xl">{{ form.bio }}</p>
                  </div>
                }
              </div>
            }

            <!-- ── Edit Mode Form ── -->
            @if (editing()) {
              <form (ngSubmit)="saveProfile()" #profileForm="ngForm" class="space-y-8 animate-in fade-in zoom-in-95 duration-300 relative">
                
                <div class="absolute inset-x-0 -top-10 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Name -->
                  <div class="group">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2 transition-colors group-focus-within:text-red-800 dark:group-focus-within:text-red-500">Full Legal Name</label>
                    <input type="text" name="name" [(ngModel)]="form.name" required
                      class="w-full border border-gray-200 dark:border-white/10 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-gray-900 dark:text-foreground bg-white dark:bg-black/20 hover:border-red-300 dark:hover:border-white/20 focus:bg-white dark:focus:bg-black/40 focus:outline-none focus:border-red-500 dark:focus:border-red-500/50 focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/20 transition-all shadow-sm dark:shadow-none"
                      placeholder="e.g., Dr. John Doe" />
                  </div>

                  <!-- Department -->
                  <div class="group">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2 transition-colors group-focus-within:text-red-800 dark:group-focus-within:text-red-500">Department</label>
                    <input type="text" name="department" [(ngModel)]="form.department" required
                      class="w-full border border-gray-200 dark:border-white/10 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-gray-900 dark:text-foreground bg-white dark:bg-black/20 hover:border-red-300 dark:hover:border-white/20 focus:bg-white dark:focus:bg-black/40 focus:outline-none focus:border-red-500 dark:focus:border-red-500/50 focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/20 transition-all shadow-sm dark:shadow-none"
                      placeholder="e.g., College of Engineering" />
                  </div>
                </div>

                <!-- Bio -->
                <div class="group">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2 transition-colors group-focus-within:text-red-800 dark:group-focus-within:text-red-500">Biography</label>
                  <textarea name="bio" [(ngModel)]="form.bio" rows="5" maxlength="1000"
                    class="w-full border border-gray-200 dark:border-white/10 rounded-[1.25rem] px-5 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-black/20 hover:border-red-300 dark:hover:border-white/20 focus:bg-white dark:focus:bg-black/40 focus:outline-none focus:border-red-500 dark:focus:border-red-500/50 focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/20 transition-all shadow-sm dark:shadow-none resize-y"
                    placeholder="Tell your students a bit about your background, your teaching philosophy, or anything else you'd like them to know..."></textarea>
                  <div class="flex justify-end mt-2">
                    <span class="text-[10px] font-black text-gray-400 px-3 bg-gray-100 dark:bg-white/5 rounded-full py-1">{{ form.bio.length || 0 }} / 1000 MAX</span>
                  </div>
                </div>

                <!-- Status Messages -->
                @if (errorMsg()) {
                  <div class="bg-red-50 border border-red-100 text-red-900 text-[11px] font-black tracking-widest uppercase rounded-xl p-4 flex items-center gap-3 shadow-md animate-in slide-in-from-bottom-2">
                    <svg class="w-5 h-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {{ errorMsg() }}
                  </div>
                }

                @if (successMsg()) {
                  <div class="bg-emerald-50 border border-emerald-100 text-emerald-900 text-[11px] font-black tracking-widest uppercase rounded-xl p-4 flex items-center gap-3 shadow-md animate-in slide-in-from-bottom-2">
                    <div class="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-emerald-700" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    </div>
                    {{ successMsg() }}
                  </div>
                }

                <!-- Actions -->
                <div class="pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-4">
                  <button type="button" (click)="cancelEdit()" [disabled]="saving()"
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-[1.25rem] transition-all disabled:opacity-50 active:scale-95">
                    Discard Changes
                  </button>
                  <button type="submit" [disabled]="profileForm.invalid || saving()"
                    class="flex items-center gap-2 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-200 disabled:text-gray-500 text-white text-[10px] uppercase font-black tracking-widest px-8 py-4 rounded-[1.25rem] transition-all shadow-lg shadow-red-900/20 dark:shadow-none active:scale-95 disabled:active:scale-100 disabled:shadow-none">
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

              </form>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ProfileSettingsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  editing = signal(false);

  picture = signal<string | null>(null);

  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  originalData: any = {};

  form = {
    name: '',
    department: '',
    bio: ''
  };

  ngOnInit(): void {
    this.picture.set(this.auth.currentUser()?.picture || null);
    this.loadData();
  }

  infoFields() {
    return [
      { label: 'Full Name', value: this.form.name },
      { label: 'Department', value: this.form.department }
    ];
  }

  loadData(): void {
    const userId = this.auth.currentUser()?.sub;
    if (!userId) return;

    let userDone = false;
    let teacherDone = false;

    const tryDone = () => {
      if (userDone && teacherDone) {
        this.originalData = { ...this.form };
        this.loading.set(false);
      }
    };

    this.api.getProfile().subscribe({
      next: (res) => {
        this.form.name = res.data.name || '';
        userDone = true;
        tryDone();
      },
      error: () => {
        userDone = true;
        tryDone();
      }
    });

    this.api.getTeachers().subscribe({
      next: (res) => {
        const profile = res.data.find(t => t.user_id === userId);
        if (profile) {
          this.form.department = profile.department || '';
          this.form.bio = profile.bio || '';
        }
        teacherDone = true;
        tryDone();
      },
      error: () => {
        teacherDone = true;
        tryDone();
      }
    });
  }

  startEdit(): void {
    this.originalData = { ...this.form };
    this.editing.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);
  }

  cancelEdit(): void {
    this.form = { ...this.originalData };
    this.editing.set(false);
    this.errorMsg.set(null);
    this.successMsg.set(null);
  }

  saveProfile(): void {
    this.errorMsg.set(null);
    this.successMsg.set(null);

    if (!this.form.name || !this.form.department) {
      this.errorMsg.set('Name and Department are required.');
      return;
    }

    this.saving.set(true);

    this.api.updateProfile({
      name: this.form.name,
      department: this.form.department,
      bio: this.form.bio
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMsg.set('Profile successfully updated!');
        this.originalData = { ...this.form };
        this.editing.set(false);
        setTimeout(() => this.successMsg.set(null), 4000);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err.error?.error || 'Failed to save profile. Please try again.');
      }
    });
  }
}
