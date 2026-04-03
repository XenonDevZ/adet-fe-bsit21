import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../services/auth.service'
import type { Role } from '../models/index'

export const roleGuard = (allowed: Role[]): CanActivateFn =>
  () => {
    const auth   = inject(AuthService)
    const router = inject(Router)
    const user   = auth.currentUser()

    if (user && allowed.includes(user.role)) return true
    return router.createUrlTree(['/login'])
  }