import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import { PresenceService } from '../../../core/services/presence.service'
import type { User, Role, Teacher } from '../../../core/models/index'

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto pb-12 pt-4">
      <!-- Hero Header -->
      <div class="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-[2rem] p-8 sm:p-10 mb-8 overflow-hidden shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-[20px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="relative z-10">
          <h2 class="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">User Management</h2>
          <p class="text-red-100/90 text-sm font-medium">Govern roles and departments for perfectly tailored access.</p>
        </div>
        <div class="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.25rem] p-5 flex flex-col items-center justify-center min-w-[140px] shadow-inner group-hover:bg-white/15 transition-colors">
          <span class="text-[10px] text-red-200 font-extrabold uppercase tracking-widest mb-1">Total Network</span>
          <span class="text-4xl font-black text-white drop-shadow-md leading-none">{{ users().length }}</span>
        </div>
      </div>

      <!-- Controls Rack -->
      <div class="px-4 pb-10 sm:px-6 lg:px-10">

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white/80 dark:bg-card backdrop-blur-xl p-5 rounded-[2rem] shadow-sm dark:shadow-none border border-white dark:border-white/5 relative overflow-hidden">
        
        <!-- Search bar -->
        <div class="relative w-full lg:w-[400px]">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" [(ngModel)]="search" placeholder="Search by name or email..."
            class="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/10 placeholder-gray-400 text-gray-900 dark:text-foreground text-sm font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-900/10 dark:focus:ring-red-900/20 focus:border-red-200 dark:focus:border-red-500/50 focus:bg-white dark:focus:bg-black/40 transition-all shadow-inner dark:shadow-none" />
        </div>

        <!-- Pill Filters -->
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Filter Role</span>
          
          <button (click)="roleFilter = ''"
            class="px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300"
            [class]="!roleFilter ? 'bg-gradient-to-r from-red-900 to-red-800 text-white shadow-[0_4px_14px_rgba(153,27,27,0.3)] transform scale-105' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10'">
            All
          </button>
          <button (click)="roleFilter = 'STUDENT'"
            class="px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300"
            [class]="roleFilter === 'STUDENT' ? 'bg-gradient-to-r from-red-900 to-red-800 text-white shadow-[0_4px_14px_rgba(153,27,27,0.3)] transform scale-105' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10'">
            Students
          </button>
          <button (click)="roleFilter = 'TEACHER'"
            class="px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300"
            [class]="roleFilter === 'TEACHER' ? 'bg-gradient-to-r from-red-900 to-red-800 text-white shadow-[0_4px_14px_rgba(153,27,27,0.3)] transform scale-105' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10'">
            Teachers
          </button>
          <button (click)="roleFilter = 'ADMIN'"
            class="px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300"
            [class]="roleFilter === 'ADMIN' ? 'bg-gradient-to-r from-red-900 to-red-800 text-white shadow-[0_4px_14px_rgba(153,27,27,0.3)] transform scale-105' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10'">
            Admins
          </button>
        </div>
      </div>

      @if (successMsg()) {
        <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          {{ successMsg() }}
        </div>
      }

      <!-- Table -->
      <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm dark:shadow-none border border-white dark:border-white/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[900px]">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th class="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[30%]">User Identity</th>
                <th class="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[30%]">Access Role</th>
                <th class="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%]">Department</th>
                <th class="text-left px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%]">Joined Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-white/5">
              @for (user of filtered(); track user.id) {
                <tr class="hover:bg-white dark:hover:bg-white/5 transition-colors group relative">
                  <!-- Identity -->
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-4">
                      <div class="relative">
                        <img [src]="user.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=7f1d1d&color=fff'"
                          class="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                          (error)="$any($event.target).src='https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=7f1d1d&color=fff'" />
                         <div class="absolute -bottom-1 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full transition-colors duration-300 shadow-sm"
                              [class.bg-green-400]="presence.onlineUsers().has(user.id)"
                              [class.bg-gray-300]="!presence.onlineUsers().has(user.id)"
                              [class.shadow-[0_0_8px_rgba(74,222,128,0.8)]]="presence.onlineUsers().has(user.id)">
                         </div>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                           <p class="font-black text-gray-900 dark:text-foreground tracking-tight">{{ user.name }}</p>
                           @if (user.id === currentUserId()) {
                             <span class="text-[9px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-md uppercase tracking-widest">You</span>
                           }
                        </div>
                        <p class="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wide">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Capabilities & Role -->
                  <td class="px-8 py-5">
                    @if (user.id === currentUserId()) {
                      <!-- Current user: show "Super Admin" badge -->
                      <div class="flex items-center gap-2 pl-1">
                        <div class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                          <svg class="w-4 h-4 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <span class="text-[11px] font-black text-red-800 uppercase tracking-widest leading-none">Super Admin</span>
                      </div>
                    } @else {
                      <!-- Regular user: allow role editing -->
                      <div class="flex items-center gap-3">
                        <select [(ngModel)]="roleChanges[user.id]"
                          class="appearance-none bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20 focus:border-red-400 dark:focus:border-red-500/50 transition-all cursor-pointer hover:bg-white dark:hover:bg-black/40 shadow-inner dark:shadow-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[right_8px_center]">
                          <option class="font-bold dark:bg-card" value="STUDENT">STUDENT</option>
                          <option class="font-bold dark:bg-card" value="TEACHER">TEACHER</option>
                          <option class="font-bold dark:bg-card" value="ADMIN">ADMIN</option>
                        </select>

                        <button (click)="applyRole(user.id)"
                          [disabled]="saving() === user.id || roleChanges[user.id] === user.role"
                          class="flex items-center justify-center min-w-[70px] text-[10px] uppercase tracking-widest disabled:opacity-0 disabled:-translate-x-4
                                 bg-gradient-to-r from-red-900 to-red-800 text-white font-black px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm active:scale-95">
                          {{ saving() === user.id ? '...' : 'Save' }}
                        </button>
                      </div>
                    }
                  </td>

                  <!-- Department Assignment (Teachers only) -->
                  <td class="px-8 py-5">
                    @if (user.role === 'TEACHER') {
                      @if (deptEditing[user.id]) {
                        <div class="flex items-center gap-2 max-w-sm animate-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
                          <div class="relative flex-1 group/input">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                               <svg class="w-4 h-4 text-gray-400 group-focus-within/input:text-red-800 dark:group-focus-within/input:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                               </svg>
                            </div>
                            <input type="text" [(ngModel)]="deptChanges[user.id]"
                              placeholder="Type department..."
                              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-foreground bg-gray-50/50 dark:bg-black/40 focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-400 focus:bg-white dark:focus:bg-black/60 transition-all shadow-inner dark:shadow-none" />
                          </div>
                          <button (click)="saveDepartment(user.id)" [disabled]="savingDept() === user.id"
                            class="shrink-0 w-9 h-9 flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white rounded-xl shadow-lg shadow-red-900/20 active:scale-95 disabled:opacity-50 transition-all group/btn" 
                            title="Save">
                            @if (savingDept() === user.id) {
                              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                            } @else {
                              <svg class="w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                              </svg>
                            }
                          </button>
                          <button (click)="deptEditing[user.id] = false"
                            class="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Cancel">
                            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      } @else {
                        <div class="flex items-center gap-2 group/dept">
                          @if (getTeacherDept(user.id)) {
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-lg">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                              {{ getTeacherDept(user.id) }}
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              Not Set
                            </span>
                          }
                          <button (click)="openDeptEdit(user.id)"
                            class="opacity-0 group-hover/dept:opacity-100 p-1.5 text-gray-400 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                        </div>
                      }
                    } @else {
                      <span class="text-gray-300 dark:text-gray-700 text-xs font-bold">—</span>
                    }
                  </td>

                  <td class="px-8 py-5">
                    <span class="inline-flex items-center gap-2 text-gray-500 text-xs font-bold">
                       <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                       </svg>
                       {{ user.created_at | date: 'mediumDate' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (loading()) {
          <div class="divide-y divide-gray-100 dark:divide-white/5">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="px-6 py-5 flex items-center gap-4 animate-pulse">
                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/4"></div>
                  <div class="h-2 bg-gray-100 dark:bg-white/5 rounded w-1/3"></div>
                </div>
                <div class="h-8 bg-gray-100 dark:bg-white/5 rounded-xl w-24"></div>
              </div>
            }
          </div>
        }

        @if (!loading() && filtered().length === 0) {
          <div class="p-10 text-center">
            <p class="text-gray-500 font-medium">No users found</p>
            <p class="text-gray-400 text-sm mt-1">Try a different search or filter.</p>
          </div>
        }
      </div>
      </div>
    </div>
  `,
})
export class UserManagementComponent implements OnInit {
  private api  = inject(ApiService)
  private auth = inject(AuthService)
  presence     = inject(PresenceService)

  users         = signal<User[]>([])
  teachers      = signal<Teacher[]>([])
  loading       = signal(true)
  saving        = signal<number | null>(null)
  savingDept    = signal<number | null>(null)
  successMsg    = signal<string | null>(null)
  currentUserId = signal<number | null>(null)

  search        = ''
  roleFilter    = ''
  roleChanges:  Record<number, Role>   = {}
  deptChanges:  Record<number, string> = {}
  deptEditing:  Record<number, boolean> = {}


  ngOnInit(): void {
    this.currentUserId.set(this.auth.currentUser()?.sub ?? null)
    this.load()
  }

  load(): void {
    this.api.getUsers().subscribe({
      next: res => {
        this.users.set(res.data)
        res.data.forEach(u => {
          this.roleChanges[u.id] = u.role
        })
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
    // Load teachers to get department info
    this.api.getTeachers().subscribe({
      next: res => this.teachers.set(res.data),
      error: () => {},
    })
  }

  getTeacherDept(userId: number): string | null {
    return this.teachers().find(t => t.user_id === userId)?.department ?? null
  }

  openDeptEdit(userId: number): void {
    this.deptChanges[userId] = this.getTeacherDept(userId) ?? ''
    this.deptEditing[userId] = true
  }

  saveDepartment(userId: number): void {
    const dept = (this.deptChanges[userId] ?? '').trim()
    if (!dept) return
    this.savingDept.set(userId)
    this.api.setTeacherDepartment(userId, dept).subscribe({
      next: () => {
        this.savingDept.set(null)
        this.deptEditing[userId] = false
        this.successMsg.set('Department assigned successfully.')
        setTimeout(() => this.successMsg.set(null), 3000)
        this.load()
      },
      error: () => this.savingDept.set(null),
    })
  }

  filtered(): User[] {
    return this.users().filter(u => {
      const q = this.search.toLowerCase()
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchRole   = !this.roleFilter || u.role === this.roleFilter
      return matchSearch && matchRole
    })
  }

  applyRole(userId: number): void {
    const newRole = this.roleChanges[userId]
    if (!newRole) return
    this.saving.set(userId)
    this.successMsg.set(null)
    this.api.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this.saving.set(null)
        this.successMsg.set('Role updated successfully.')
        setTimeout(() => this.successMsg.set(null), 3000)
        this.load()
      },
      error: () => this.saving.set(null),
    })
  }



  roleBadge(role: Role): string {
    const map: Record<Role, string> = {
      STUDENT: 'bg-gray-100 text-gray-700',
      TEACHER: 'bg-blue-100 text-blue-800',
      ADMIN:   'bg-red-100 text-red-800',
    }
    return map[role]
  }

  encodeURIComponent = encodeURIComponent
}
