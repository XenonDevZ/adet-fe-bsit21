import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../services/auth.service'
import { ApiService } from '../services/api.service'
import { map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

/**
 * Blocks access to teacher routes that require a department to be set by an admin.
 * Redirects to /teacher/dashboard if the teacher's department is not yet assigned.
 */
export const departmentGuard: CanActivateFn = () => {
  const auth   = inject(AuthService)
  const api    = inject(ApiService)
  const router = inject(Router)

  const userId = auth.currentUser()?.sub
  if (!userId) return router.createUrlTree(['/teacher/dashboard'])

  return api.getTeachers().pipe(
    map(res => {
      const me = res.data.find(t => t.user_id === userId)
      const hasDept = !!(me?.department && me.department.trim())
      if (hasDept) return true
      // No department → block access, redirect to dashboard
      return router.createUrlTree(['/teacher/dashboard'])
    }),
    catchError(() => of(router.createUrlTree(['/teacher/dashboard'])))
  )
}
