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
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">User Management</h2>
        <span class="text-sm text-gray-400">{{ users().length }} total users</span>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="search" placeholder="Search by name or email..."
          class="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      @if (loading()) {
        <p class="text-sm text-gray-400">Loading users...</p>
      }

      @if (successMsg()) {
        <div class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
          {{ successMsg() }}
        </div>
      }

      <!-- Table -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="text-left px-4 py-3 font-medium">User</th>
              <th class="text-left px-4 py-3 font-medium">Email</th>
              <th class="text-left px-4 py-3 font-medium">Current Role</th>
              <th class="text-left px-4 py-3 font-medium">Change Role</th>
              <th class="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            @for (user of filtered; track user.id) {
              <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <img [src]="user.picture || 'https://ui-avatars.com/api/?name=' + user.name"
                      class="w-7 h-7 rounded-full" />
                    <span class="font-medium text-gray-900">{{ user.name }}</span>
                    @if (user.id === currentUserId()) {
                      <span class="text-xs text-blue-500">(you)</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ user.email }}</td>
                <td class="px-4 py-3">
                  <span [class]="roleBadge(user.role)"
                    class="px-2 py-0.5 rounded-full text-xs font-semibold">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  @if (user.id !== currentUserId()) {
                    <div class="flex items-center gap-2">
                      <select [(ngModel)]="roleChanges[user.id]"
                        class="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="STUDENT">STUDENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button (click)="applyRole(user.id)"
                        [disabled]="saving() === user.id || roleChanges[user.id] === user.role"
                        class="text-xs bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white px-2.5 py-1 rounded transition-colors">
                        {{ saving() === user.id ? '...' : 'Apply' }}
                      </button>
                    </div>
                  } @else {
                    <span class="text-xs text-gray-300 italic">N/A</span>
                  }
                </td>
                <td class="px-4 py-3 text-gray-400 text-xs">
                  {{ user.created_at | date: 'MMM d, y' }}
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (!loading() && filtered.length === 0) {
          <div class="text-center py-10 text-gray-400 text-sm">No users found.</div>
        }
      </div>
    </div>
  `,
})
export class UserManagementComponent implements OnInit {
  private api  = inject(ApiService)
  private auth = inject(AuthService)

  users      = signal<User[]>([])
  loading    = signal(true)
  saving     = signal<number | null>(null)
  successMsg = signal<string | null>(null)

  search = ''
  roleChanges: Record<number, Role> = {}
  currentUserId = signal<number | null>(null)

  ngOnInit(): void {
    this.currentUserId.set(this.auth.currentUser()?.sub ?? null)
    this.load()
  }

  load(): void {
    this.api.getUsers().subscribe({
      next: res => {
        this.users.set(res.data)
        // Pre-populate role change dropdowns with current role
        res.data.forEach(u => { this.roleChanges[u.id] = u.role })
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  get filtered(): User[] {
    const q = this.search.toLowerCase()
    if (!q) return this.users()
    return this.users().filter(
      u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }

  applyRole(userId: number): void {
    const newRole = this.roleChanges[userId]
    if (!newRole) return

    this.saving.set(userId)
    this.successMsg.set(null)

    this.api.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this.saving.set(null)
        this.successMsg.set(`Role updated successfully.`)
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
      ADMIN:   'bg-purple-100 text-purple-800',
    }
    return map[role]
  }
}