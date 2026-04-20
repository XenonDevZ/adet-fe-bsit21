import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  inject,
  signal,
  Input,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { VideoCallService } from '../../../core/services/video-call.service';
import { environment } from '../../../../environments/environment';
import type { ChatMessage, Booking } from '../../../core/models/index';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle' 
             ? 'fixed z-[9999] right-0 top-0 bottom-0 w-[340px] shadow-[-20px_0_60px_rgba(0,0,0,0.6)] transition-all animate-in slide-in-from-right duration-300 pointer-events-auto bg-[#111213] border-l border-white/5 overflow-hidden flex flex-col' 
             : 'flex flex-col h-full overflow-hidden'">
      <div class="flex flex-col h-full overflow-hidden"
           [style.background]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle' ? '#111213' : 'transparent'">
      
      <!-- Chat header -->
      <div class="flex items-center justify-between px-4 py-3.5 flex-shrink-0 z-30 relative overflow-hidden"
           [style.background]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle' ? '#1a1b1e' : 'linear-gradient(to right, #7f1d1d, #991b1b)'"
           [class.border-b]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle'"
           [class.border-white/5]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle'"
           [class.shadow-none]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle'"
           [class.shadow-lg]="!(videoCallService.isChatOpen() && videoCallService.callState() !== 'idle')"
           [class.text-white]="true">

        <!-- Light sweep (normal mode only) -->
        @if (!(videoCallService.isChatOpen() && videoCallService.callState() !== 'idle')) {
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite_ease-in-out]"></div>
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-red-400/20 rounded-full blur-[50px] animate-pulse"></div>
          <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-red-950/40 rounded-full blur-[40px]"></div>
        }

        <div class="flex items-center gap-3 relative z-10">
           <!-- Avatar -->
           <div class="relative">
             <div class="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg">
               @if (currentUserId() === booking.teacher_id) {
                 <img [src]="booking.student_picture || 'https://ui-avatars.com/api/?name=' + booking.student_name + '&background=7f1d1d&color=fff&bold=true'" class="w-full h-full object-cover" />
               } @else {
                 <img [src]="booking.teacher_picture || 'https://ui-avatars.com/api/?name=' + booking.teacher_name + '&background=7f1d1d&color=fff&bold=true'" class="w-full h-full object-cover" />
               }
             </div>
             <!-- Status dot -->
             <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 shadow-sm"
                  [class.bg-emerald-500]="connected()"
                  [class.bg-red-500]="!connected()"
                  [class.border-[#1a1b1e]]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle'"
                  [class.border-red-900]="!(videoCallService.isChatOpen() && videoCallService.callState() !== 'idle')">
               <span *ngIf="connected()" class="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60"></span>
             </div>
           </div>

          <div>
            <p class="text-sm font-black tracking-tight leading-tight"
               [class.text-white]="true">
              {{ currentUserId() === booking.teacher_id ? booking.student_name : booking.teacher_name }}
            </p>
            <p class="text-[10px] font-bold tracking-widest mt-0.5 flex items-center gap-1"
               [class.text-emerald-400]="connected()"
               [class.text-red-400]="!connected()">
              <span class="inline-block w-1.5 h-1.5 rounded-full" [class.bg-emerald-400]="connected()" [class.bg-red-400]="!connected()"></span>
              {{ connected() ? 'Live' : 'Reconnecting…' }}
            </p>
          </div>
        </div>

        <!-- Video call button -->
        @if (connected() && !booking.chat_closed) {
          <button (click)="startVideoCall()" title="Start Video Call"
            class="relative z-10 w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
        }
      </div>

      <!-- Drag & Drop overlay state -->
      @if (isDraggingOver) {
        <div class="absolute inset-0 z-40 bg-red-900/10 dark:bg-red-900/20 backdrop-blur-md border-[3px] border-dashed border-red-800/50 dark:border-red-500/50 rounded-2xl flex items-center justify-center animate-in fade-in duration-200">
          <div class="bg-white/90 dark:bg-card/90 backdrop-blur-xl px-8 py-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-3 border border-white dark:border-white/5 transform scale-105">
            <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center shadow-inner">
              <svg class="w-8 h-8 text-red-800 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <p class="font-black text-gray-900 dark:text-foreground text-lg uppercase tracking-wider">Drop to Attach</p>
          </div>
        </div>
      }

      <!-- Messages Area -->
      <div class="flex-1 min-h-0 relative">
      <div #scrollContainer 
           (dragover)="onDragOver($event)" 
           (dragleave)="onDragLeave($event)" 
           (drop)="onDrop($event)"
           (scroll)="onScroll()"
           class="h-full overflow-y-auto px-3 py-4 space-y-1 bg-transparent relative z-0 scroll-smooth">
        
        @if (messages().length === 0 && connected()) {
          <div class="flex flex-col items-center justify-center h-full text-center p-8 space-y-5 animate-in fade-in zoom-in-95 duration-700">
            <div class="relative w-32 h-32 bg-white/60 dark:bg-card/60 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-red-900/5 dark:shadow-white/5 border border-white dark:border-white/5 group/empty overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-tr from-red-50 to-transparent dark:from-red-900/10 dark:to-transparent opacity-50 group-hover/empty:scale-110 transition-transform duration-700"></div>
               <div class="absolute -top-10 -right-10 w-24 h-24 bg-red-200/40 dark:bg-red-900/20 rounded-full blur-[20px]"></div>
               <svg class="w-14 h-14 text-red-800 dark:text-red-400 relative z-10 drop-shadow-md group-hover/empty:-translate-y-1 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
               </svg>
            </div>
            <div>
              <p class="text-gray-900 dark:text-foreground font-black text-2xl drop-shadow-sm mb-2">Workspace Open</p>
              <p class="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed mx-auto">This channel is secure.<br>Messages and files are encrypted.</p>
            </div>
          </div>
        }

        @for (msg of messages(); track msg.id; let i = $index) {
          @if (i === 0 || !isSameDay(msg.created_at, messages()[i-1].created_at)) {
            <div class="flex items-center gap-3 my-4">
              <div class="flex-1 h-px bg-white/8 dark:bg-white/5"></div>
              <span class="text-[10px] font-bold text-gray-500 dark:text-gray-500 px-2 tracking-widest uppercase">
                {{ formatDayHeader(msg.created_at) }}
              </span>
              <div class="flex-1 h-px bg-white/8 dark:bg-white/5"></div>
            </div>
          }

          <!-- System message -->
          @if (msg.is_system && msg.message) {
            <div class="flex justify-center my-3">
              <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-black/20 dark:bg-white/5 px-3 py-1 rounded-full tracking-wide">
                {{ msg.message }}
              </span>
            </div>
          } @else {
            <!-- Regular message -->
            <div class="flex gap-2 group"
                 [class.flex-row-reverse]="msg.sender_id === currentUserId()"
                 [class.mb-0.5]="true">

              <!-- Avatar — hide if same sender as previous non-system msg -->
              @if (i === 0 || messages()[i-1].sender_id !== msg.sender_id || messages()[i-1].is_system) {
                <img
                  [src]="msg.sender_picture || 'https://ui-avatars.com/api/?name=' + msg.sender_name + '&background=' + (msg.sender_id === currentUserId() ? '7f1d1d' : '374151') + '&color=fff&bold=true'"
                  class="w-7 h-7 rounded-lg object-cover flex-shrink-0 self-end shadow-sm opacity-90"
                />
              } @else {
                <div class="w-7 flex-shrink-0"></div>
              }

              <div class="max-w-[78%]" style="display:flex;flex-direction:column"
                   [class.items-end]="msg.sender_id === currentUserId()">

                <!-- Sender name (only first in a group, incoming only) -->
                @if (msg.sender_id !== currentUserId() && (i === 0 || messages()[i-1].sender_id !== msg.sender_id || messages()[i-1].is_system)) {
                  <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 ml-1 tracking-wide">
                    {{ msg.sender_name.split(' ')[0] }}
                  </p>
                }

                <!-- Bubble -->
                <div class="px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm"
                     [class.bg-red-700]="msg.sender_id === currentUserId()"
                     [class.text-white]="msg.sender_id === currentUserId()"
                     [class.rounded-2xl]="true"
                     [class.rounded-br-sm]="msg.sender_id === currentUserId()"
                     [class.rounded-bl-sm]="msg.sender_id !== currentUserId()"
                     [class.bg-[#2a2b2f]]="msg.sender_id !== currentUserId()"
                     [class.text-gray-100]="msg.sender_id !== currentUserId()">
                  @if (msg.message) {
                    <p class="whitespace-pre-wrap break-words">{{ msg.message }}</p>
                  }
                  <!-- File/image attachment -->
                  @if (msg.file_url) {
                    @if (isImage(msg.file_type)) {
                      <img
                        [src]="fileBaseUrl + msg.file_url"
                        [alt]="msg.file_name"
                        class="max-w-[200px] w-full rounded-xl mt-2 cursor-pointer hover:opacity-90 transition-opacity"
                        (click)="openImage(fileBaseUrl + msg.file_url)"
                      />
                    } @else {
                      <a
                        [href]="fileBaseUrl + msg.file_url"
                        target="_blank"
                        class="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-black/15 hover:bg-black/25 transition-colors"
                      >
                        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span class="text-xs font-semibold truncate">{{ msg.file_name }}</span>
                      </a>
                    }
                  }
                </div>

                <!-- Timestamp on hover -->
                <p class="text-[10px] text-gray-500 dark:text-gray-600 mt-0.5 mx-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   [class.text-right]="msg.sender_id === currentUserId()">
                  {{ formatTime(msg.created_at) }}
                </p>
              </div>
            </div>
          }
        }

        <!-- Typing indicator -->
        @if (someoneTyping()) {
          <div class="flex gap-2 items-end mt-1 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div class="w-7 h-7 rounded-lg bg-white/5 flex-shrink-0"></div>
            <div class="bg-[#2a2b2f] px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center h-9">
              <div class="flex gap-1">
                <div class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay:0ms"></div>
                <div class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay:150ms"></div>
                <div class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay:300ms"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Scroll to bottom FAB -->
      @if (showScrollBtn()) {
        <button
          (click)="scrollToBottomSmooth()"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white dark:bg-[#2b2d31] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-800 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-900/50 transition-all active:scale-95 animate-in slide-in-from-bottom-2 duration-200">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
          </svg>
          New messages
        </button>
      }
      </div>

      <!-- Image preview modal -->
      @if (previewImage()) {
        <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in" (click)="previewImage.set(null)">
          <button class="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-[1.25rem] active:scale-95">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <img [src]="previewImage()!" class="max-w-full max-h-[90vh] rounded-3xl shadow-2xl border border-white/10 object-contain transition-transform transform scale-100 animate-in zoom-in-95 duration-300" />
        </div>
      }

      <!-- Chat closed banner -->
      @if (booking.chat_closed) {
        <div class="px-5 py-3 bg-black/30 border-t border-white/5 text-gray-500 text-[11px] text-center flex-shrink-0 font-semibold uppercase tracking-widest">
          🔒 Session Concluded
        </div>
      }

      <!-- Input area -->
      @if (!booking.chat_closed) {
        <div class="px-3 pb-3 pt-2 flex-shrink-0 z-20 border-t"
             [class.border-white/5]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle'"
             [class.border-white/30]="!(videoCallService.isChatOpen() && videoCallService.callState() !== 'idle')"
             [style.background]="videoCallService.isChatOpen() && videoCallService.callState() !== 'idle' ? '#111213' : 'transparent'">

          <!-- File preview badge -->
          @if (selectedFile()) {
            <div class="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-2 animate-in slide-in-from-bottom-2">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-gray-200 truncate">{{ selectedFile()!.name }}</p>
                  <p class="text-[10px] text-gray-500">{{ (selectedFile()!.size / 1024 / 1024).toFixed(2) }} MB</p>
                </div>
              </div>
              <button (click)="selectedFile.set(null)" class="text-gray-500 hover:text-white p-1.5 rounded-lg transition-all active:scale-95">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          }

          <div class="flex items-end gap-2 bg-[#1e2024] rounded-2xl border border-white/8 px-2 py-1.5 focus-within:border-white/15 transition-all">
            <!-- Attachment -->
            <label class="flex-shrink-0 p-2.5 text-gray-500 hover:text-gray-300 rounded-xl transition-all cursor-pointer active:scale-95">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              <input type="file" class="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" (change)="onFileSelected($event)" />
            </label>

            <!-- Textarea -->
            <textarea
              #chatInput
              [(ngModel)]="text"
              (keydown.enter)="onEnter($any($event))"
              (input)="onTyping(); autoGrow(chatInput)"
              placeholder="Message..."
              rows="1"
              class="flex-1 bg-transparent px-1 py-2.5 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none resize-none max-h-28 overflow-y-auto w-full leading-tight"
              style="min-height:40px;"
            ></textarea>

            <!-- Send -->
            <button
              (click)="send()"
              [disabled]="(!text.trim() && !selectedFile()) || !connected() || sending()"
              class="flex-shrink-0 w-9 h-9 bg-red-700 hover:bg-red-600 disabled:bg-white/5 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all active:scale-95 flex items-center justify-center mb-0.5 shadow-md shadow-red-900/30"
            >
              @if (sending()) {
                <svg class="animate-spin w-5 h-5 mx-0.5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              } @else {
                <svg class="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              }
            </button>
          </div>
        </div>
      }
    </div>
    </div>
  `,
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  @Input() booking!: Booking;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private auth = inject(AuthService);
  private api = inject(ApiService);
  videoCallService = inject(VideoCallService);

  messages = signal<ChatMessage[]>([]);
  connected = signal(false);
  sending = signal(false);
  someoneTyping = signal(false);
  previewImage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isDraggingOver = false;

  text = '';
  fileBaseUrl = environment.apiUrl;
  showScrollBtn = signal(false);
  private ws: WebSocket | null = null;
  private typingTimer: any = null;
  private shouldScroll = false;
  private userScrolledUp = false;
  private retryLimit = 5;
  private retries = 0;

  currentUserId(): number {
    return this.auth.currentUser()?.sub ?? 0;
  }

  ngOnInit(): void {
    this.api.getChatHistory(this.booking.id).subscribe({
      next: (res) => {
        this.messages.set(res.data);
        this.shouldScroll = true;
      },
    });

    if (!this.booking.chat_closed) {
      this.connectWebSocket();

      // Connect video call signaling for online bookings
      if (this.booking.consultation_type === 'ONLINE') {
        this.videoCallService.connectSignaling(this.booking.id);
      }
    }
  }

  startVideoCall(): void {
    this.videoCallService.showPermissionPrompt();
  }

  ngAfterViewInit(): void {
    // Attach scroll listener after view is ready
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      el.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      // Only auto-scroll if the user hasn't manually scrolled up
      if (!this.userScrolledUp) {
        this.scrollToBottom();
      } else {
        // Show the "new messages" button instead
        this.showScrollBtn.set(true);
      }
      this.shouldScroll = false;
    }
  }

  onScroll(): void {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Consider "scrolled up" if more than 120px from the bottom
    this.userScrolledUp = distanceFromBottom > 120;
    if (!this.userScrolledUp) {
      this.showScrollBtn.set(false);
    }
  }

  scrollToBottomSmooth(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      this.showScrollBtn.set(false);
      this.userScrolledUp = false;
    } catch { }
  }

  ngOnDestroy(): void {
    this.ws?.close();
    this.videoCallService.endCall();
    this.videoCallService.disconnectSignaling();
  }

  private connectWebSocket(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return; 
    }

    const token = this.auth.getToken();
    const wsBase = environment.apiUrl.replace('http', 'ws');
    const url = `${wsBase}/ws/chat?token=${token}&bookingId=${this.booking.id}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.connected.set(true);
      this.retries = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'history') {
        this.messages.set(data.messages);
        this.shouldScroll = true;
        return;
      }
      

      if (data.type === 'message') {
        this.messages.update((m) => [...m, data.message]);
        this.shouldScroll = true;
        return;
      }

      if (data.type === 'typing') {
        if (data.userId !== this.currentUserId()) {
          this.someoneTyping.set(true);
          clearTimeout(this.typingTimer);
          this.typingTimer = setTimeout(() => this.someoneTyping.set(false), 2000);
          this.shouldScroll = true;
        }
        return;
      }

      if (data.type === 'closed') {
        this.connected.set(false);
        setTimeout(() => window.location.reload(), 1000);
        return;
      }

      if (data.type === 'system') {
        this.messages.update((m) => [
          ...m,
          {
            id: Date.now(),
            booking_id: this.booking.id,
            sender_id: 0,
            message: data.message,
            file_url: null,
            file_name: null,
            file_type: null,
            is_system: true,
            created_at: new Date().toISOString(),
            sender_name: 'System',
            sender_picture: '',
            sender_role: 'SYSTEM',
          },
        ]);
        this.shouldScroll = true;
      }
    };

    this.ws.onclose = () => {
      this.connected.set(false);
      this.attemptReconnect();
    };
    
    this.ws.onerror = () => {
      this.connected.set(false);
    };
  }

  private attemptReconnect(): void {
    if (this.booking.chat_closed) return;
    if (this.retries < this.retryLimit) {
      setTimeout(() => {
        this.retries++;
        this.connectWebSocket();
      }, 3000 * Math.pow(1.5, this.retries)); // Exponential backoff retry
    }
  }

  autoGrow(el: HTMLTextAreaElement): void {
    el.style.height = '44px';
    el.style.height = (el.scrollHeight) + 'px';
  }

  onEnter(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  onTyping(): void {
    this.ws?.send(JSON.stringify({ type: 'typing', userId: this.currentUserId() }));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.selectedFile.set(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.booking.chat_closed) {
      this.isDraggingOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver = false;
    if (this.booking.chat_closed) return;
    
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
      if (allowed.includes(file.type)) {
        this.selectedFile.set(file);
      } else {
        alert("Unsupported file type. Please upload images, PDFs, or Word Docs.");
      }
    }
  }

  async send(): Promise<void> {
    if ((!this.text.trim() && !this.selectedFile()) || !this.connected()) return;

    this.sending.set(true);

    try {
      const file = this.selectedFile();

      if (file) {
        const base64 = await this.toBase64(file);
        this.ws?.send(
          JSON.stringify({
            type: 'file',
            base64,
            fileName: file.name,
            fileType: file.type,
          }),
        );
        this.selectedFile.set(null);
      }

      if (this.text.trim()) {
        this.ws?.send(
          JSON.stringify({
            type: 'message',
            text: this.text.trim(),
          }),
        );
        this.text = '';
      }
    } finally {
      this.sending.set(false);
    }
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  openImage(url: string): void {
    this.previewImage.set(url);
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch { }
  }

  private scrollToBottomFn(): void {
    this.scrollToBottom();
  }

  isImage(type: string | null): boolean {
    return !!type?.startsWith('image/');
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isSameDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  formatDayHeader(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (this.isSameDay(dateStr, today.toISOString())) {
      return 'Today';
    } else if (this.isSameDay(dateStr, yesterday.toISOString())) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }
}
