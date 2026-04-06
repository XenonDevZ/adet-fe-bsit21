import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../services/auth.service'
import { ApiService } from '../services/api.service'
import { map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

export const profileGuard: CanActivateFn = () => {
  const auth   = inject(AuthService)
  const api    = inject(ApiService)
  const router = inject(Router)

  // Only applies to students
  if (auth.currentUser()?.role !== 'STUDENT') return true

  // If already marked complete, skip the API call
  if (auth.isProfileComplete()) return true

  // Otherwise check with the API
  return api.getProfile().pipe(
    map(res => {
      const u = res.data
      if (u.course && u.year_level && u.department) {
        auth.setProfileComplete()
        return true
      }
      return router.createUrlTree(['/profile-setup'])

    }),
    catchError(() => of(true))
  )
}
