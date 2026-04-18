import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
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
    <div class="min-h-screen flex flex-col lg:flex-row bg-[#fafafa] overflow-hidden relative">

      <!-- ── LEFT: Brand Showcase Panel ── -->
      <div class="relative hidden lg:flex lg:w-[55%] h-screen sticky top-0 flex-col items-center justify-center overflow-hidden">

        <!-- Animated mesh gradient background -->
        <div class="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-red-800"></div>

        <!-- Animated gradient orbs -->
        <div class="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-gradient-to-br from-red-600/30 to-transparent rounded-full blur-[120px] animate-[drift_20s_ease-in-out_infinite]"></div>
        <div class="absolute bottom-[-20%] right-[-15%] w-[45rem] h-[45rem] bg-gradient-to-tl from-amber-500/10 to-red-500/20 rounded-full blur-[100px] animate-[drift_25s_ease-in-out_infinite_reverse]"></div>
        <div class="absolute top-[30%] right-[10%] w-[20rem] h-[20rem] bg-white/[0.04] rounded-full blur-[60px] animate-[drift_15s_ease-in-out_infinite]"></div>

        <!-- Pattern overlay -->
        <div class="absolute inset-0 opacity-[0.03]"
             style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 32px 32px;"></div>

        <!-- Subtle geometric lines -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-[15%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div class="absolute top-[85%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div class="absolute left-[15%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
          <div class="absolute right-[15%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        </div>

        <!-- Floating particle dots -->
        <div class="absolute w-1.5 h-1.5 bg-white/20 rounded-full top-[20%] left-[25%] animate-[float_6s_ease-in-out_infinite]"></div>
        <div class="absolute w-1 h-1 bg-white/15 rounded-full top-[60%] left-[15%] animate-[float_8s_ease-in-out_infinite_1s]"></div>
        <div class="absolute w-2 h-2 bg-white/10 rounded-full top-[40%] right-[20%] animate-[float_7s_ease-in-out_infinite_2s]"></div>
        <div class="absolute w-1 h-1 bg-red-300/20 rounded-full top-[75%] right-[30%] animate-[float_9s_ease-in-out_infinite_0.5s]"></div>
        <div class="absolute w-1.5 h-1.5 bg-white/10 rounded-full top-[30%] left-[60%] animate-[float_10s_ease-in-out_infinite_3s]"></div>

        <!-- Content -->
        <div class="relative z-10 w-full max-w-lg px-12 flex flex-col items-center">

          <!-- Logo cluster -->
          <div class="flex items-center gap-4 mb-12 group cursor-default">
            <div class="w-16 h-16 rounded-[1.25rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl shadow-red-950/50 p-2.5 group-hover:scale-105 group-hover:rotate-1 transition-all duration-500">
              <img src="/assets/acbs-logo.png" alt="ACBS Logo" class="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <div class="text-left">
              <p class="text-white font-black text-2xl tracking-tight leading-none">ACBS</p>
              <p class="text-red-300/80 text-[10px] font-bold tracking-[0.25em] uppercase mt-1">Academic Consultation</p>
            </div>
          </div>

          <!-- Headline with gradient text -->
          <div class="text-center mb-10">
            <h1 class="text-5xl xl:text-[3.5rem] font-black text-white leading-[1.1] tracking-tight mb-5">
              Where Students<br/>
              <span class="bg-gradient-to-r from-red-300 via-amber-200 to-red-300 bg-clip-text text-transparent">Meet Instructors</span>
            </h1>
            <p class="text-red-100/50 text-sm font-medium leading-relaxed max-w-sm mx-auto">
              A unified platform for scheduling consultations, tracking appointments, and connecting in real-time.
            </p>
          </div>

          <!-- Premium feature cards -->
          <div class="grid grid-cols-3 gap-3 w-full mb-10">
            @for (feat of features; track feat.title) {
              <div class="group/card bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-2xl px-4 py-5 text-center hover:bg-white/[0.12] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 cursor-default">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/10 group-hover/card:scale-110 group-hover/card:bg-white/20 transition-all duration-500" [innerHTML]="feat.icon"></div>
                <p class="text-white font-bold text-[11px] leading-tight">{{ feat.title }}</p>
                <p class="text-red-200/40 text-[9px] font-medium mt-1 leading-tight">{{ feat.desc }}</p>
              </div>
            }
          </div>

          <!-- Stats row -->
          <div class="flex items-center justify-center gap-6 mb-8">
            <div class="text-center">
              <p class="text-white font-black text-xl leading-none">24/7</p>
              <p class="text-red-200/40 text-[9px] font-bold uppercase tracking-widest mt-1">Access</p>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <p class="text-white font-black text-xl leading-none">Live</p>
              <p class="text-red-200/40 text-[9px] font-bold uppercase tracking-widest mt-1">Chat & Call</p>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <p class="text-white font-black text-xl leading-none">Secure</p>
              <p class="text-red-200/40 text-[9px] font-bold uppercase tracking-widest mt-1">Google SSO</p>
            </div>
          </div>

          <!-- Bottom badge -->
          <div class="flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-full px-5 py-2.5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
            </span>
            <span class="text-white/50 text-[10px] font-bold tracking-wide">Liceo de Cagayan University &middot; Official Platform</span>
          </div>

        </div>
      </div>

      <!-- ── RIGHT: Authentication Panel ── -->
      <div class="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 sm:px-12 relative">

        <!-- Background ambient -->
        <div class="absolute top-[-20%] right-[-20%] w-[40rem] h-[40rem] bg-red-50/50 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-red-100/30 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Mobile logo (lg:hidden) -->
        <div class="lg:hidden flex flex-col items-center mb-10">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center shadow-xl shadow-red-900/30 mb-4 p-2.5">
            <img src="/assets/acbs-logo.png" alt="ACBS Logo" class="w-full h-full object-contain" />
          </div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">ACBS</h1>
          <p class="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Liceo de Cagayan University</p>
        </div>

        <!-- Auth Card -->
        <div class="w-full max-w-[24rem] relative z-10">

          <!-- Glass card wrapper -->
          <div class="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white p-8 sm:p-10">

            <!-- Header -->
            <div class="text-center mb-8">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/20 lg:hidden">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight mb-1.5">Welcome Back</h2>
              <p class="text-sm text-gray-400 font-medium">
                Sign in with your university account to continue.
              </p>
            </div>

            <!-- Error banner -->
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl p-4 flex items-start gap-3 mb-6 shadow-sm">
                <div class="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="pt-1">{{ error() }}</span>
              </div>
            }

            <!-- Loading banner -->
            @if (loading()) {
              <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-blue-700 mb-6 shadow-sm">
                <div class="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
                Verifying your credentials...
              </div>
            }

            <!-- Divider -->
            <div class="relative mb-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-100"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="bg-white/80 px-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Sign in with Google</span>
              </div>
            </div>

            <!-- Google Sign-In button -->
            <div class="flex justify-center mb-6">
              <div id="google-signin-btn"></div>
            </div>

            <!-- Domain restriction -->
            <div class="flex items-center justify-center gap-2 bg-gray-50/80 border border-gray-100 rounded-2xl px-5 py-3.5 shadow-inner">
              <div class="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-[11px] text-gray-400 font-medium">Restricted to</span>
              <span class="text-[11px] font-black text-red-800 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">&#64;liceo.edu.ph</span>
            </div>

          </div>

          <!-- Footer -->
          <p class="text-center text-[10px] text-gray-300 font-medium mt-6 tracking-wide">
            &copy; {{ year }} Academic Consultation Booking System &middot; Liceo de Cagayan
          </p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @keyframes drift {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(20px, -30px) scale(1.05); }
      50% { transform: translate(-10px, 20px) scale(0.95); }
      75% { transform: translate(15px, 10px) scale(1.02); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
      50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
    }
  `],
})
export class LoginComponent implements OnInit {
  private auth      = inject(AuthService)
  private sanitizer = inject(DomSanitizer)

  error   = signal<string | null>(null)
  loading = signal(false)
  year    = new Date().getFullYear()

  features: { title: string; desc: string; icon: SafeHtml }[] = [
    {
      title: 'Book Sessions',
      desc: 'Schedule with instructors',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-4 h-4 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'),
    },
    {
      title: 'Live Chat',
      desc: 'Real-time messaging',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-4 h-4 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>'),
    },
    {
      title: 'Video Call',
      desc: 'Built-in video call',
      icon: this.sanitizer.bypassSecurityTrustHtml('<svg class="w-4 h-4 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>'),
    },
  ]

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
