import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../../core/services/auth.service'
import { environment } from '../../../../environments/environment'

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
    <div class="min-h-screen flex flex-col">

      <!-- Top half — dark maroon -->
      <div class="bg-gradient-to-r from-red-950 to-red-800 flex-none h-48 flex flex-col items-center justify-center">
        <h1 class="text-3xl font-bold text-white tracking-tight">Welcome to ACBS</h1>
        <p class="text-red-300 text-sm mt-2">Liceo de Cagayan University</p>
      </div>

      <!-- Bottom half — light cream -->
      <div class="flex-1 bg-rose-50 flex justify-center">

        <!-- Card overlapping both halves -->
        <div class="w-full max-w-md -mt-14 mb-10 h-fit bg-white rounded-2xl shadow-xl overflow-hidden">

          <!-- Card header -->
          <div class="px-8 pt-7 pb-5 text-center border-b border-gray-100">
            <div class="inline-flex items-center gap-1 mb-3">
              <img src="/assets/acbs-logo.png" alt="ACBS Logo" class="w-12 h-12  object-contain" />
              <span class="font-bold text-gray-900 text-lg">ACBS</span>
            </div>
            <h2 class="text-base font-semibold text-gray-800">Academic Consultation Booking System</h2>
            <p class="text-gray-400 text-xs mt-1">Sign in with your university account to continue.</p>
          </div>

          <!-- Body -->
          <div class="px-8 py-6 space-y-4">

            <!-- Error -->
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ error() }}
              </div>
            }

            <!-- Loading -->
            @if (loading()) {
              <div class="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3 text-sm text-green-700">
                <svg class="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing you in...
              </div>
            }

            <!-- Google button -->
<div class="flex justify-center py-2">
  <div id="google-signin-btn"></div>
</div>


            <!-- Domain notice -->
            <div class="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              Only <span class="font-semibold text-red-700 mx-1">@liceo.edu.ph</span> accounts are allowed
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 pb-6 text-center">
            <p class="text-xs text-gray-400">
              © {{ year }} ACBS. Liceo de Cagayan University.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService)

  error   = signal<string | null>(null)
  loading = signal(false)
  year    = new Date().getFullYear()

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.redirectByRole()
      return
    }
    window.handleGoogleCredential = (response) => this.handleCredential(response)
    this.loadGoogleScript()
  }

  private loadGoogleScript(): void {
    if (document.getElementById('google-gsi-script')) {
      this.initGoogle()
      return
    }
    const script  = document.createElement('script')
    script.id     = 'google-gsi-script'
    script.src    = 'https://accounts.google.com/gsi/client'
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
      { theme: 'outline', size: 'large', width: 300, text: 'signin_with' }
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
        this.error.set(err.error?.error ?? 'Login failed. Please try again.')
      },
    })
  }
}
