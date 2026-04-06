import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { User, Role } from '../../../core/models/index'

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
          <p class="text-gray-400 text-sm mt-1">Manage roles for all registered users.</p>
        </div>
        <span class="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1.5 rounded-xl">
          {{ users().length }} users
        </span>
      </div>

      <!-- Search + filter -->
      <div class="flex flex-wrap gap-3 mb-6">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" [(ngModel)]="search" placeholder="Search name or email..."
            class="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all w-64" />
        </div>

        <select [(ngModel)]="roleFilter"
          class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all">
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="TEACHER">Teachers</option>
          <option value="ADMIN">Admins</option>
        </select>
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
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Change Role</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subjects</th>
                <th class="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (user of filtered(); track user.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <img [src]="user.picture || 'https://ui-avatars.com/api/?name=' + user.name + '&background=7f1d1d&color=fff'"
                        class="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <p class="font-semibold text-gray-900">{{ user.name }}</p>
                        @if (user.id === currentUserId()) {
                          <p class="text-xs text-red-600 font-medium">You</p>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-gray-500 text-xs">{{ user.email }}</td>
                  <td class="px-5 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-xs font-semibold" [class]="roleBadge(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    @if (user.id !== currentUserId()) {
                      <div class="flex items-center gap-2">
                        <select [(ngModel)]="roleChanges[user.id]"
                          class="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-400 transition-colors bg-white">
                          <option value="STUDENT">STUDENT</option>
                          <option value="TEACHER">TEACHER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button (click)="applyRole(user.id)"
                          [disabled]="saving() === user.id || roleChanges[user.id] === user.role"
                          class="text-xs bg-red-800 hover:bg-red-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          {{ saving() === user.id ? '...' : 'Apply' }}
                        </button>
                      </div>
                    } @else {
                      <span class="text-xs text-gray-300 italic">N/A</span>
                    }
                  </td>

                  <!-- Subjects column (teachers only) -->
                  <td class="px-5 py-4">
                    @if (user.role === 'TEACHER') {
                      <div class="flex items-center gap-2">
                        <input type="text" [(ngModel)]="subjectInputs[user.id]"
                          placeholder="e.g. Math, Thesis"
                          class="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-400 transition-colors w-40" />
                        <button (click)="applySubjects(user.id)"
                          [disabled]="savingSubjects() === user.id"
                          class="text-xs bg-gray-700 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          {{ savingSubjects() === user.id ? '...' : 'Set' }}
                        </button>
                      </div>
                    } @else {
                      <span class="text-xs text-gray-300 italic">—</span>
                    }
                  </td>

                  <td class="px-5 py-4 text-gray-400 text-xs">
                    {{ user.created_at | date: 'MMM d, y' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (loading()) {
          <div class="p-8 text-center text-gray-400 text-sm">Loading users...</div>
        }

        @if (!loading() && filtered().length === 0) {
          <div class="p-10 text-center">
            <p class="text-gray-500 font-medium">No users found</p>
            <p class="text-gray-400 text-sm mt-1">Try a different search or filter.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class UserManagementComponent implements OnInit {
  private api  = inject(ApiService)
  private auth = inject(AuthService)

  users         = signal<User[]>([])
  loading       = signal(true)
  saving        = signal<number | null>(null)
  savingSubjects = signal<number | null>(null)
  successMsg    = signal<string | null>(null)
  currentUserId = signal<number | null>(null)

  search        = ''
  roleFilter    = ''
  roleChanges:  Record<number, Role>   = {}
  subjectInputs: Record<number, string> = {}

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

  applySubjects(userId: number): void {
    const subjects = this.subjectInputs[userId]?.trim()
    if (!subjects) return
    this.savingSubjects.set(userId)
    this.successMsg.set(null)
    this.api.updateTeacherSubjects(userId, subjects).subscribe({
      next: () => {
        this.savingSubjects.set(null)
        this.successMsg.set('Subjects updated successfully.')
        setTimeout(() => this.successMsg.set(null), 3000)
      },
      error: () => this.savingSubjects.set(null),
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
}
