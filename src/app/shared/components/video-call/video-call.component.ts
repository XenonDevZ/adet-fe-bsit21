import { Component, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCallService } from '../../../core/services/video-call.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  template: `
    <!-- Permission Prompt Modal -->
    @if (videoCall.callState() === 'permission-prompt') {
      <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
        <div class="bg-white/95 dark:bg-[#1e1f22]/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white dark:border-white/5 p-10 max-w-md w-full mx-4 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

          <!-- Camera icon with glow -->
          <div class="relative w-24 h-24 mx-auto mb-6">
            <div class="absolute inset-0 rounded-full bg-red-100 animate-pulse"></div>
            <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center shadow-xl shadow-red-900/30 z-10">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>

          <h3 class="text-2xl font-black text-gray-900 dark:text-foreground tracking-tight mb-2">Start Video Call</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed">
            To start a video call, your browser will need access to your <strong class="text-gray-700 dark:text-gray-200">camera</strong> and <strong class="text-gray-700 dark:text-gray-200">microphone</strong>. Please allow access when prompted.
          </p>

          <!-- Permission items -->
          <div class="space-y-3 mb-8">
            <div class="flex items-center gap-3 bg-gray-50 dark:bg-card rounded-2xl px-5 py-3.5 border border-gray-100 dark:border-white/5">
              <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="text-left">
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200">Camera Access</p>
                <p class="text-[11px] text-gray-400 font-medium">For video during the call</p>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-gray-50 dark:bg-card rounded-2xl px-5 py-3.5 border border-gray-100 dark:border-white/5">
              <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                </svg>
              </div>
              <div class="text-left">
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200">Microphone Access</p>
                <p class="text-[11px] text-gray-400 font-medium">For audio during the call</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button (click)="videoCall.cancelCall()"
              class="flex-1 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black text-sm tracking-wide transition-all active:scale-95 border border-gray-200 dark:border-white/5">
              Cancel
            </button>
            <button (click)="videoCall.confirmCall()"
              class="flex-1 h-14 rounded-2xl bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-black text-sm tracking-wide transition-all active:scale-95 shadow-xl shadow-red-900/30 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Allow & Call
            </button>
          </div>

          <p class="text-[10px] text-gray-300 font-medium mt-4">You can revoke access at any time from browser settings</p>
        </div>
      </div>
    }

    <!-- Incoming Call Modal -->
    @if (videoCall.callState() === 'incoming' && videoCall.incomingCall()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
        <div class="bg-white/90 dark:bg-[#1e1f22]/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white dark:border-white/5 p-10 max-w-sm w-full mx-4 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

          <!-- Pulsing ring animation -->
          <div class="relative w-28 h-28 mx-auto mb-6">
            <div class="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
            <div class="absolute inset-2 rounded-full bg-emerald-400/10 animate-[ping_1.5s_ease-in-out_infinite_0.5s]"></div>
            <img
              [src]="videoCall.incomingCall()!.callerPicture || 'https://ui-avatars.com/api/?name=' + videoCall.incomingCall()!.callerName + '&background=831b1b&color=fff'"
              class="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl z-10"
            />
          </div>

          <h3 class="text-2xl font-black text-gray-900 dark:text-foreground tracking-tight mb-1">Incoming Video Call</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-bold mb-8">{{ videoCall.incomingCall()!.callerName }}</p>

          <div class="flex items-center justify-center gap-4">
            <!-- Reject -->
            <button (click)="videoCall.rejectCall()"
              class="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/30 hover:scale-110 active:scale-95 transition-all">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <!-- Accept -->
            <button (click)="videoCall.acceptCall()"
              class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all animate-bounce">
              <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Active Call UI (calling, connecting, connected) -->
    @if (videoCall.callState() === 'calling' || videoCall.callState() === 'connecting' || videoCall.callState() === 'connected') {
      
      <!-- Full-screen solid backdrop that prevents website interaction and scrolling -->
      <div class="fixed inset-0 z-[200] bg-gray-950 pointer-events-auto">

        <!-- Inner wrapper that shrinks to make room for chat -->
        <div class="absolute top-0 bottom-0 left-0 bg-gray-950 flex flex-col animate-in fade-in duration-300 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-10"
             [class.w-full]="!videoCall.isChatOpen()"
             [class.w-[calc(100%-26rem)]]="videoCall.isChatOpen()">

        <!-- Remote video (full background) -->
        <div class="flex-1 relative overflow-hidden">
          <video #remoteVideo autoplay playsinline
            class="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            [class.hidden]="!videoCall.remoteStream()">
          </video>

          <!-- Placeholder when no remote stream yet -->
          @if (!videoCall.remoteStream()) {
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black">
              <!-- Animated rings -->
              <div class="relative w-32 h-32 mb-8">
                <div class="absolute inset-0 rounded-full border-2 border-white/10 animate-[ping_2s_ease-in-out_infinite]"></div>
                <div class="absolute inset-4 rounded-full border-2 border-white/5 animate-[ping_2s_ease-in-out_infinite_0.5s]"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                    <svg class="w-10 h-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <p class="text-white/80 text-lg font-black tracking-tight mb-1">
                {{ videoCall.callState() === 'calling' ? 'Calling...' : 'Connecting...' }}
              </p>
              <p class="text-white/30 text-xs font-bold uppercase tracking-widest">Waiting for response</p>
            </div>
          }

          <!-- Call duration badge -->
          @if (videoCall.callState() === 'connected') {
            <div class="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2 z-30">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
              </span>
              <span class="text-white/90 text-xs font-black tracking-wider font-mono">{{ formatDuration(videoCall.callDuration()) }}</span>
            </div>

            <!-- Remote talking indicator -->
            @if (videoCall.isRemoteTalking()) {
              <div class="absolute top-6 right-6 w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center z-30 transition-all">
                <div class="flex items-center gap-[3px]">
                  <div class="w-1 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style="height: 12px"></div>
                  <div class="w-1 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" style="height: 20px"></div>
                  <div class="w-1 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" style="height: 12px"></div>
                </div>
              </div>
            }
          }

          <!-- Local video PiP -->
          @if (videoCall.localStream()) {
            <div class="absolute bottom-24 right-6 w-40 h-[7.5rem] sm:w-48 sm:h-36 rounded-2xl overflow-hidden border-2 shadow-2xl z-20 hover:scale-105 transition-all duration-300 cursor-move bg-gray-900"
                 [class.border-emerald-500]="videoCall.isLocalTalking()"
                 [class.shadow-emerald-500/30]="videoCall.isLocalTalking()"
                 [class.border-white/20]="!videoCall.isLocalTalking()">
              <video #localVideo autoplay playsinline muted
                class="w-full h-full object-cover scale-x-[-1]"
                [class.hidden]="videoCall.isCameraOff()">
              </video>
              @if (videoCall.isCameraOff()) {
                <div class="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <svg class="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636"/>
                  </svg>
                </div>
              }
              <!-- Muted indicator -->
              @if (videoCall.isMuted()) {
                <div class="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-600/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-red-500 z-30">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                  </svg>
                </div>
              } @else if (videoCall.isLocalTalking()) {
                <!-- Local talking indicator -->
                <div class="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 z-30">
                  <div class="flex items-center gap-[2px]">
                    <div class="w-[3px] bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style="height: 6px"></div>
                    <div class="w-[3px] bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" style="height: 10px"></div>
                    <div class="w-[3px] bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" style="height: 6px"></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Control bar -->
        <div class="flex items-center justify-center gap-4 py-6 px-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-30">
          <!-- Mute toggle -->
          <button (click)="videoCall.toggleMute()"
            class="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg"
            [class.bg-white/15]="!videoCall.isMuted()"
            [class.backdrop-blur-xl]="!videoCall.isMuted()"
            [class.border]="!videoCall.isMuted()"
            [class.border-white/10]="!videoCall.isMuted()"
            [class.hover:bg-white/25]="!videoCall.isMuted()"
            [class.bg-red-600]="videoCall.isMuted()"
            [class.hover:bg-red-700]="videoCall.isMuted()">
            @if (!videoCall.isMuted()) {
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
              </svg>
            } @else {
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
              </svg>
            }
          </button>

          <!-- Camera toggle -->
          <button (click)="videoCall.toggleCamera()"
            class="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg"
            [class.bg-white/15]="!videoCall.isCameraOff()"
            [class.backdrop-blur-xl]="!videoCall.isCameraOff()"
            [class.border]="!videoCall.isCameraOff()"
            [class.border-white/10]="!videoCall.isCameraOff()"
            [class.hover:bg-white/25]="!videoCall.isCameraOff()"
            [class.bg-red-600]="videoCall.isCameraOff()"
            [class.hover:bg-red-700]="videoCall.isCameraOff()">
            @if (!videoCall.isCameraOff()) {
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            } @else {
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
            }
          </button>

          <!-- Chat toggle -->
          <button (click)="videoCall.isChatOpen.update(v => !v)"
            class="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg hidden lg:flex"
            [class.bg-white/15]="!videoCall.isChatOpen()"
            [class.backdrop-blur-xl]="!videoCall.isChatOpen()"
            [class.border]="!videoCall.isChatOpen()"
            [class.border-white/10]="!videoCall.isChatOpen()"
            [class.hover:bg-white/25]="!videoCall.isChatOpen()"
            [class.bg-white]="videoCall.isChatOpen()"
            [class.text-gray-900]="videoCall.isChatOpen()">
            <svg class="w-6 h-6" [class.text-white]="!videoCall.isChatOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </button>

          <!-- End call -->
          <button (click)="videoCall.endCall()"
            class="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/40 hover:scale-110 active:scale-90 transition-all">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" transform="rotate(135 12 12)"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- In-Call Chat Overlay (Slides in from right) -->
      <div class="absolute top-0 bottom-0 right-0 w-[26rem] bg-white dark:bg-[#1e1f22] border-l border-gray-100 dark:border-white/5 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20"
           [class.translate-x-full]="!videoCall.isChatOpen()"
           [class.translate-x-0]="videoCall.isChatOpen()">
        @if (videoCall.bookingId()) {
           <app-chat class="h-full block" [booking]="$any({ id: videoCall.bookingId(), chat_closed: false, consultation_type: 'ONLINE' })"></app-chat>
        }
      </div>
      
      </div>
    }

    <!-- Error toast -->
    @if (videoCall.errorMessage()) {
      <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[250] bg-red-600 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-xl shadow-red-600/30 animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        {{ videoCall.errorMessage() }}
      </div>
    }
  `,
})
export class VideoCallComponent {
  localVideoEl = viewChild<ElementRef<HTMLVideoElement>>('localVideo');
  remoteVideoEl = viewChild<ElementRef<HTMLVideoElement>>('remoteVideo');

  videoCall = inject(VideoCallService);

  constructor() {
    // Reactively bind streams to video elements once they mount
    effect(() => {
      const local = this.videoCall.localStream();
      const el = this.localVideoEl()?.nativeElement;
      if (local && el) {
        el.srcObject = local;
        el.muted = true;
        el.volume = 0;
      }
    });

    effect(() => {
      const remote = this.videoCall.remoteStream();
      const el = this.remoteVideoEl()?.nativeElement;
      if (remote && el) {
        el.srcObject = remote;
      }
    });
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
