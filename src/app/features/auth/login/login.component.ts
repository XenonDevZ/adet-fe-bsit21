import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../../core/services/auth.service'
import { environment } from '../../../../environments/environment'

// Extend Window to include Google Identity Services
declare global {
  interface Window {
    google: any
    handleGoogleCredential: (response: { credential: string }) => void
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <!-- Logo / Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-900 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">ACBS</h1>
          <p class="text-gray-500 text-sm mt-1">Academic Consultation Booking System</p>
          <p class="text-red-700 text-xs font-medium mt-1">Liceo de Cagayan University</p>
        </div>

        <!-- Error message -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 flex items-start gap-2">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {{ error() }}
          </div>
        }

        <!-- Loading -->
        @if (loading()) {
          <div class="flex items-center justify-center gap-2 text-red-700 text-sm mb-4">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Signing you in...
          </div>
        }

        <!-- Google Sign-In button rendered by GIS -->
        <div id="google-signin-btn" class="flex justify-center mb-6"></div>

        <p class="text-center text-xs text-gray-400">
          Only <span class="font-medium text-red-700">@liceo.edu.ph</span> accounts are allowed.
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService)

  error   = signal<string | null>(null)
  loading = signal(false)

  ngOnInit(): void {
    // If already logged in, redirect
    if (this.auth.isLoggedIn()) {
      this.auth.redirectByRole()
      return
    }

    // Make handler globally accessible for GIS callback
    window.handleGoogleCredential = (response) => this.handleCredential(response)

    this.loadGoogleScript()
  }

  private loadGoogleScript(): void {
    if (document.getElementById('google-gsi-script')) {
      this.initGoogle()
      return
    }
    const script = document.createElement('script')
    script.id  = 'google-gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => this.initGoogle()
    document.head.appendChild(script)
  }

  private initGoogle(): void {
    window.google?.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback:  window.handleGoogleCredential,
    })
    window.google?.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { theme: 'outline', size: 'large', width: 320, text: 'signin_with' }
    )
  }

  private handleCredential(response: { credential: string }): void {
    this.loading.set(true)
    this.error.set(null)

    this.auth.loginWithGoogle(response.credential).subscribe({
      next: () => {
        this.loading.set(false)
        this.auth.redirectByRole()
      },
      error: (err) => {
        this.loading.set(false)
        const msg = err.error?.error ?? 'Login failed. Please try again.'
        this.error.set(msg)
      },
    })
  }
}
