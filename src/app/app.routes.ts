import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'
import { roleGuard } from './core/guards/role.guard'

export const routes: Routes = [
  // Public
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  // Student
  {
    path: 'student',
    canActivate: [authGuard, roleGuard(['STUDENT', 'ADMIN'])],
    loadComponent: () =>
      import('./features/student/student-layout.component').then(m => m.StudentLayoutComponent),
    children: [
      {
        path: 'teachers',
        loadComponent: () =>
          import('./features/student/teachers-list/teachers-list.component').then(m => m.TeachersListComponent),
      },
      {
        path: 'book/:teacherId',
        loadComponent: () =>
          import('./features/student/book-consultation/book-consultation.component').then(m => m.BookConsultationComponent),
      },
      {
        path: 'my-bookings',
        loadComponent: () =>
          import('./features/student/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
      },
      { path: '', redirectTo: 'teachers', pathMatch: 'full' },
    ],
  },

  // Teacher
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard(['TEACHER', 'ADMIN'])],
    loadComponent: () =>
      import('./features/teacher/teacher-layout.component').then(m => m.TeacherLayoutComponent),
    children: [
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/teacher/schedule-manager/schedule-manager.component').then(m => m.ScheduleManagerComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/teacher/pending-bookings/pending-bookings.component').then(m => m.PendingBookingsComponent),
      },
      { path: '', redirectTo: 'bookings', pathMatch: 'full' },
    ],
  },

  // Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/admin/all-bookings/all-bookings.component').then(m => m.AllBookingsComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
]