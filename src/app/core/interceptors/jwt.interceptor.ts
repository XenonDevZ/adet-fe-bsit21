import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { AuthService } from '../services/auth.service'

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService)
  const token = auth.getToken()

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req

  return next(cloned).pipe(
    catchError(err => {
      // Auto-logout on 401
      if (err.status === 401) {
        auth.logout()
      }
      return throwError(() => err)
    })
  )
}