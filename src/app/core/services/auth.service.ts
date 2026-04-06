import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { jwtDecode } from 'jwt-decode'
import { tap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'
import type { JwtPayload, ApiResponse, User } from '../models/index'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'acbs_token'

  // Reactive signal — components read this directly
  currentUser = signal<JwtPayload | null>(this.loadFromStorage())

  isLoggedIn  = computed(() => this.currentUser() !== null)
  isStudent   = computed(() => this.currentUser()?.role === 'STUDENT')
  isTeacher   = computed(() => this.currentUser()?.role === 'TEACHER')
  isAdmin     = computed(() => this.currentUser()?.role === 'ADMIN')

  constructor(private http: HttpClient, private router: Router) {}

  // Called from login component with Google credential
  loginWithGoogle(idToken: string) {
    return this.http
      .post<ApiResponse<{ token: string; user: User }>>(
        `${environment.apiUrl}/auth/google`,
        { idToken }
      )
      .pipe(
        tap(res => {
          if (res.success) {
            this.saveToken(res.data.token)
          }
        })
      )
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
    this.currentUser.set(jwtDecode<JwtPayload>(token))
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem('acbs_profile_complete')
    this.currentUser.set(null)
    this.router.navigate(['/login'])
  }  

  redirectByRole(): void {
    const role = this.currentUser()?.role
    if (role === 'ADMIN')   this.router.navigate(['/admin'])
    else if (role === 'TEACHER') this.router.navigate(['/teacher'])
    else                         this.router.navigate(['/student'])
  }

  private loadFromStorage(): JwtPayload | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY)
      if (!token) return null
      const decoded = jwtDecode<JwtPayload>(token)
      // Check expiry
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem(this.TOKEN_KEY)
        return null
      }
      return decoded
    } catch {
      return null
    }
  }
  isProfileComplete(): boolean {
    // We check against the stored token — but token doesn't have course/year_level
    // So we rely on the API call after login. This is a simple flag approach.
    return !!localStorage.getItem('acbs_profile_complete')
  }
  
  setProfileComplete(): void {
    localStorage.setItem('acbs_profile_complete', 'true')
  }
  
  clearProfileComplete(): void {
    localStorage.removeItem('acbs_profile_complete')
  }  
}