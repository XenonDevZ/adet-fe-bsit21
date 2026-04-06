import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { ApiService } from '../../../core/services/api.service'
import type { Teacher } from '../../../core/models/index'

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Booking System</h2>
        <p class="text-gray-400 text-sm mt-1">Find a teacher and book a consultation session.</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" [(ngModel)]="search" placeholder="Search teachers..."
            class="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400
                   transition-all w-52" />
        </div>

        <!-- Department filter -->
        <select [(ngModel)]="departmentFilter"
          class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white
                 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400
                 transition-all">
          <option value="">All Departments</option>
          @for (dept of departments(); track dept) {
            <option [value]="dept">{{ dept }}</option>
          }
        </select>

        <!-- Subject filter -->
        <select [(ngModel)]="subjectFilter"
          class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white
                 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400
                 transition-all">
          <option value="">All Subjects</option>
          @for (subject of allSubjects(); track subject) {
            <option [value]="subject">{{ subject }}</option>
          }
        </select>

        <!-- Clear filters -->
        @if (search || departmentFilter || subjectFilter) {
          <button (click)="clearFilters()"
            class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-700
                   font-medium px-3 py-2.5 hover:bg-red-50 rounded-xl transition-all">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Clear
          </button>
        }
      </div>

      <!-- Results count -->
      @if (!loading()) {
        <p class="text-xs text-gray-400 mb-4">
          Showing {{ filtered().length }} of {{ teachers().length }} teachers
        </p>
      }

      <!-- Skeleton -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div class="space-y-2 flex-1">
                  <div class="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                  <div class="h-3 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
              </div>
              <div class="h-3 bg-gray-200 rounded-lg w-full mb-2"></div>
              <div class="h-3 bg-gray-200 rounded-lg w-2/3"></div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && filtered().length === 0) {
        <div class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <p class="text-gray-500 font-medium">No teachers found</p>
          <p class="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
          <button (click)="clearFilters()"
            class="mt-4 text-sm text-red-700 hover:underline font-medium">
            Clear all filters
          </button>
        </div>
      }

      <!-- Teacher cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (teacher of filtered(); track teacher.teacher_id) {
          <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">

            <div class="h-1.5 bg-gradient-to-r from-red-800 to-red-500"></div>

            <div class="p-5">
              <!-- Avatar + name -->
              <div class="flex items-center gap-3 mb-3">
                <div class="relative">
                  <img
                    [src]="teacher.picture || 'https://ui-avatars.com/api/?name=' + teacher.name + '&background=7f1d1d&color=fff'"
                    [alt]="teacher.name"
                    class="w-12 h-12 rounded-full object-cover border-2 border-red-100" />
                  <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{ teacher.name }}</p>
                  <p class="text-xs text-red-700 font-medium">{{ teacher.department || 'Faculty' }}</p>
                </div>
              </div>

              <!-- Bio -->
              @if (teacher.bio) {
                <p class="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{{ teacher.bio }}</p>
              }

              <!-- Subject tags -->
              @if (teacher.subjects) {
                <div class="flex flex-wrap gap-1.5 mb-4">
                  @for (subject of getSubjects(teacher.subjects); track subject) {
                    <span class="text-xs bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded-lg border border-red-100">
                      {{ subject }}
                    </span>
                  }
                </div>
              } @else {
                <div class="mb-4"></div>
              }

              <button (click)="book(teacher.teacher_id)"
                class="w-full bg-red-800 hover:bg-red-700 text-white text-sm font-medium
                       py-2.5 rounded-xl transition-colors">
                Book Consultation
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TeachersListComponent implements OnInit {
  private api    = inject(ApiService)
  private router = inject(Router)

  teachers         = signal<Teacher[]>([])
  loading          = signal(true)
  search           = ''
  departmentFilter = ''
  subjectFilter    = ''

  ngOnInit(): void {
    this.api.getTeachers().subscribe({
      next: res => {
        this.teachers.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  // Unique departments from all teachers
  departments(): string[] {
    const depts = this.teachers()
      .map(t => t.department)
      .filter((d): d is string => !!d)
    return [...new Set(depts)].sort()
  }

  // All unique subjects across all teachers
  allSubjects(): string[] {
    const subjects = this.teachers()
      .flatMap(t => this.getSubjects(t.subjects))
    return [...new Set(subjects)].sort()
  }

  getSubjects(subjects: string | null): string[] {
    if (!subjects) return []
    return subjects.split(',').map(s => s.trim()).filter(Boolean)
  }

  filtered(): Teacher[] {
    const q = this.search.toLowerCase().trim()
    return this.teachers().filter(t => {
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        (t.department ?? '').toLowerCase().includes(q)
      const matchDept = !this.departmentFilter ||
        t.department === this.departmentFilter
      const matchSubject = !this.subjectFilter ||
        this.getSubjects(t.subjects).includes(this.subjectFilter)
      return matchSearch && matchDept && matchSubject
    })
  }

  clearFilters(): void {
    this.search = ''
    this.departmentFilter = ''
    this.subjectFilter = ''
  }

  book(teacherId: number): void {
    this.router.navigate(['/student/book', teacherId])
  }
}
