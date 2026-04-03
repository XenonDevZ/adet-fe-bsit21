import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import type { Teacher } from '../../../core/models/index'

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Browse Teachers</h2>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white rounded-xl p-5 shadow animate-pulse">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div class="space-y-2 flex-1">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading() && teachers().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p>No teachers available yet.</p>
        </div>
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (teacher of teachers(); track teacher.teacher_id) {
          <div class="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-5">
            <div class="flex items-center gap-3 mb-3">
              <img [src]="teacher.picture || 'https://ui-avatars.com/api/?name=' + teacher.name"
                [alt]="teacher.name"
                class="w-12 h-12 rounded-full object-cover border-2 border-blue-100" />
              <div>
                <p class="font-semibold text-gray-900">{{ teacher.name }}</p>
                <p class="text-xs text-gray-500">{{ teacher.department || 'Faculty' }}</p>
              </div>
            </div>

            @if (teacher.bio) {
              <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ teacher.bio }}</p>
            }

            <button
              (click)="book(teacher.teacher_id)"
              class="w-full bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
              Book Consultation
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class TeachersListComponent implements OnInit {
  private api    = inject(ApiService)
  private router = inject(Router)

  teachers = signal<Teacher[]>([])
  loading  = signal(true)

  ngOnInit(): void {
    this.api.getTeachers().subscribe({
      next: res => {
        this.teachers.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  book(teacherId: number): void {
    this.router.navigate(['/student/book', teacherId])
  }
}