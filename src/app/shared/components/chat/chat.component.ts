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
             ? 'fixed z-[9999] right-0 top-0 bottom-0 w-[24rem] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-all animate-in slide-in-from-right duration-300 pointer-events-auto bg-gray-50 dark:bg-[#1e1f22] border-l border-gray-200 dark:border-white/5 overflow-hidden flex flex-col' 
             : 'flex flex-col h-full overflow-hidden'">
      <div class="flex flex-col h-full bg-transparent overflow-hidden">
      
      <!-- Chat header -->
      <div class="flex items-center justify-between px-6 py-4 lg:py-5 bg-gradient-to-r from-red-900 to-red-800 text-white flex-shrink-0 z-30 shadow-[0_10px_30px_-10px_rgba(153,27,27,0.3)] relative overflow-hidden">
        <!-- Premium Animated Light Sweep -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite_ease-in-out]"></div>
        
        <!-- Ambient Header Glows -->
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-red-400/20 rounded-full blur-[50px] animate-pulse"></div>
        <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-red-950/40 rounded-full blur-[40px]"></div>

        <div class="flex items-center gap-4 relative z-10">
           <!-- Dynamic Recipient Avatar (Fallback to default icon if not available) -->
           <div class="relative">
             <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-0.5 shadow-inner flex items-center justify-center overflow-hidden">
               @if (currentUserId() === booking.teacher_id) {
                 <img [src]="booking.student_picture || 'https://ui-avatars.com/api/?name=' + booking.student_name + '&background=fff&color=831b1b'" class="w-full h-full rounded-[0.85rem] object-cover" />
               } @else {
                 <img [src]="booking.teacher_picture || 'https://ui-avatars.com/api/?name=' + booking.teacher_name + '&background=fff&color=831b1b'" class="w-full h-full rounded-[0.85rem] object-cover" />
               }
             </div>
             <!-- Connection Status Dot -->
             <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center p-[2px] shadow-sm">
               <span class="absolute w-full h-full rounded-full animate-ping opacity-75" [class.bg-emerald-400]="connected()" [class.hidden]="!connected()"></span>
               <div class="w-full h-full rounded-full z-10 shadow-inner" [class.bg-emerald-500]="connected()" [class.bg-red-500]="!connected()"></div>
             </div>
           </div>

          <div>
            <p class="text-lg font-black tracking-tight drop-shadow-md leading-tight">
              {{ currentUserId() === booking.teacher_id ? booking.student_name : booking.teacher_name }}
            </p>
            <p class="text-[10px] uppercase font-black tracking-widest mt-0.5 flex items-center gap-1.5" [class.text-emerald-300]="connected()" [class.text-red-300]="!connected()">
              <svg *ngIf="connected()" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <svg *ngIf="!connected()" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ connected() ? 'Live Session Active' : 'Offline / Reconnecting...' }}
            </p>
          </div>
        </div>

        <!-- Video call button -->
        @if (connected() && !booking.chat_closed) {
          <button (click)="startVideoCall()" title="Start Video Call"
            class="relative z-10 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 hover:scale-105 active:scale-95 transition-all shadow-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
           class="h-full overflow-y-auto p-5 sm:p-6 space-y-4 bg-transparent relative z-0 scroll-smooth">
        
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
            <div class="flex justify-center my-6">
              <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-card/60 backdrop-blur-md border border-white dark:border-white/5 px-4 py-1.5 rounded-xl shadow-sm">
                {{ formatDayHeader(msg.created_at) }}
              </span>
            </div>
          }

          <!-- System message -->
          @if (msg.is_system && msg.message) {
            <div class="flex justify-center my-6">
              <div class="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-md border border-blue-200/50 dark:border-blue-900/50 px-6 py-4 rounded-[1.5rem] shadow-sm text-center flex flex-col gap-3 items-center max-w-sm w-full mx-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-1 text-blue-600 dark:text-blue-400 shadow-inner">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <span class="font-black text-[11px] uppercase tracking-widest text-blue-900 dark:text-blue-300 px-2 leading-relaxed">{{ msg.message }}</span>
              </div>
            </div>
          } @else {
            <!-- Regular message -->
            <div class="flex gap-3 group" [class.flex-row-reverse]="msg.sender_id === currentUserId()">
              <!-- Avatar -->
              <img
                [src]="msg.sender_picture || 'https://ui-avatars.com/api/?name=' + msg.sender_name + '&background=' + (msg.sender_id === currentUserId() ? '831b1b' : '4b5563') + '&color=fff'"
                class="w-8 h-8 rounded-xl object-cover flex-shrink-0 mt-auto mb-5 shadow-sm border-2 border-white dark:border-white/5 transition-transform group-hover:scale-105"
              />

              <div
                class="max-w-[80%] lg:max-w-[70%]"
                [class.items-end]="msg.sender_id === currentUserId()"
                style="display:flex;flex-direction:column"
              >
                <!-- Sender name (only for incoming) -->
                @if (msg.sender_id !== currentUserId() && (i === 0 || messages()[i-1].sender_id !== msg.sender_id)) {
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">{{ msg.sender_name }}</p>
                }

                <!-- Bubble Container -->
                <div class="relative inline-flex flex-col">
                  <!-- Bubble -->
                  <div
                    class="px-5 py-4 text-[14px] leading-relaxed relative z-10 transition-all shadow-md group-hover:shadow-lg"
                    [class.bg-gradient-to-br]="msg.sender_id === currentUserId()" [class.from-red-900]="msg.sender_id === currentUserId()" [class.via-red-800]="msg.sender_id === currentUserId()" [class.to-red-900]="msg.sender_id === currentUserId()"
                    [class.text-white]="msg.sender_id === currentUserId()"
                    [class.border]="msg.sender_id === currentUserId()"
                    [class.border-red-700/50]="msg.sender_id === currentUserId()"
                    [class.rounded-[1.75rem]]="true"
                    [class.rounded-br-sm]="msg.sender_id === currentUserId()"
                    [class.bg-white/95]="msg.sender_id !== currentUserId()" [class.dark:bg-[#313338]]="msg.sender_id !== currentUserId()"
                    [class.backdrop-blur-2xl]="msg.sender_id !== currentUserId()"
                    [class.text-gray-800]="msg.sender_id !== currentUserId()" [class.dark:text-gray-200]="msg.sender_id !== currentUserId()"
                    [class.border-l]="msg.sender_id !== currentUserId()" [class.border-t]="msg.sender_id !== currentUserId()" [class.border-b]="msg.sender_id !== currentUserId()" [class.border-r]="msg.sender_id !== currentUserId()"
                    [class.border-gray-100]="msg.sender_id !== currentUserId()" [class.dark:border-white/5]="msg.sender_id !== currentUserId()"
                    [class.rounded-bl-sm]="msg.sender_id !== currentUserId()"
                  >
                    @if (msg.message) {
                      <p class="whitespace-pre-wrap break-words drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]" [class.font-medium]="msg.sender_id === currentUserId()" [class.font-semibold]="msg.sender_id !== currentUserId()">{{ msg.message }}</p>
                    }

                    <!-- File/image attachment -->
                    @if (msg.file_url) {
                      @if (isImage(msg.file_type)) {
                        <img
                          [src]="fileBaseUrl + msg.file_url"
                          [alt]="msg.file_name"
                          class="max-w-xs w-full rounded-[1rem] mt-3 cursor-pointer hover:opacity-90 transition-opacity border border-black/5 dark:border-white/5 shadow-inner"
                          (click)="openImage(fileBaseUrl + msg.file_url)"
                        />
                      } @else {
                        <a
                          [href]="fileBaseUrl + msg.file_url"
                          target="_blank"
                          class="flex items-center gap-3 mt-3 px-4 py-3 rounded-[1rem] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5"
                        >
                          <div class="w-10 h-10 rounded-xl bg-white dark:bg-[#1e1f22] shadow-sm flex items-center justify-center shrink-0" [class.text-red-800]="msg.sender_id === currentUserId()" [class.text-gray-600]="msg.sender_id !== currentUserId()" [class.dark:text-gray-400]="msg.sender_id !== currentUserId()">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          </div>
                          <span class="text-xs font-black truncate flex-1 underline-offset-2">{{ msg.file_name }}</span>
                        </a>
                      }
                    }
                  </div>
                </div>

                <!-- Timestamp row -->
                <div class="flex items-center gap-1 mt-1.5 mx-2 opacity-0 group-hover:opacity-100 transition-opacity" [class.flex-row-reverse]="msg.sender_id === currentUserId()">
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{ formatTime(msg.created_at) }}</p>
                </div>
              </div>
            </div>
          }
        }

        <!-- Typing indicator -->
        @if (someoneTyping()) {
          <div class="flex gap-3 items-center mt-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div class="w-8 h-8 rounded-xl bg-white/60 dark:bg-card/60 backdrop-blur-md border border-white dark:border-white/5 shadow-sm flex-shrink-0 animate-pulse"></div>
            <div class="bg-white/80 dark:bg-[#313338] backdrop-blur-md shadow-sm px-5 py-3 rounded-[1.5rem] rounded-tl-sm border border-white dark:border-white/5 flex items-center h-10">
              <div class="flex gap-1.5">
                <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay:0ms"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay:150ms"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay:300ms"></div>
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
        <div class="px-6 py-4 bg-gray-900/5 dark:bg-white/5 backdrop-blur-md border-t border-white dark:border-white/5 text-gray-500 dark:text-gray-400 text-xs text-center flex-shrink-0 font-black uppercase tracking-widest shadow-inner relative z-10">
          <span class="mr-2 opacity-80">🔒</span> Chat Session Concluded
        </div>
      }

      <!-- Input area -->
      @if (!booking.chat_closed) {
        <div class="px-4 pb-4 pt-2 bg-gradient-to-t from-white/90 dark:from-card/90 to-white/40 dark:to-card/40 backdrop-blur-3xl border-t border-white/50 dark:border-white/5 flex-shrink-0 z-20 transition-all">
          
          <!-- File preview badge -->
          @if (selectedFile()) {
            <div class="flex items-center justify-between bg-red-50/90 dark:bg-red-900/20 backdrop-blur-md border border-red-100/80 dark:border-red-900/50 rounded-2xl px-5 py-3 mb-3 shadow-sm animate-in slide-in-from-bottom-2">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="p-2.5 bg-red-100/80 dark:bg-red-900/40 rounded-xl shrink-0 shadow-inner">
                  <svg class="w-5 h-5 text-red-700 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-red-900 dark:text-red-300 truncate tracking-wide">{{ selectedFile()!.name }}</p>
                  <p class="text-[10px] text-red-700/80 dark:text-red-400/80 font-bold mt-0.5">{{ (selectedFile()!.size / 1024 / 1024).toFixed(2) }} MB</p>
                </div>
              </div>
              <button (click)="selectedFile.set(null)" class="text-red-400 hover:text-red-900 dark:hover:text-white hover:bg-red-200/80 dark:hover:bg-red-800/80 p-2.5 rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-200 dark:hover:border-red-800">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          }

          <div class="flex items-end gap-2 bg-white/80 dark:bg-[#383a40] p-2 rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-[0_5px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.025)] focus-within:bg-white dark:focus-within:bg-[#383a40] focus-within:border-red-200 dark:focus-within:border-white/10 focus-within:ring-4 focus-within:ring-red-50/50 dark:focus-within:ring-white/5 transition-all duration-300">
            <!-- Attachment button -->
            <label class="flex-shrink-0 p-3.5 text-gray-400 dark:text-gray-500 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 hover:shadow-inner rounded-[1.25rem] transition-all cursor-pointer group active:scale-95">
              <svg class="w-6 h-6 transition-transform group-hover:scale-105" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              <input type="file" class="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" (change)="onFileSelected($event)" />
            </label>

            <!-- Text input -->
            <textarea
              #chatInput
              [(ngModel)]="text"
              (keydown.enter)="onEnter($any($event))"
              (input)="onTyping(); autoGrow(chatInput)"
              placeholder="Write a message..."
              rows="1"
              class="flex-1 bg-transparent px-3 py-4 text-[15px] font-semibold text-gray-900 dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none max-h-32 overflow-y-auto w-full leading-tight"
              style="min-height: 52px;"
            ></textarea>

            <!-- Send button -->
            <button
              (click)="send()"
              [disabled]="(!text.trim() && !selectedFile()) || !connected() || sending()"
              class="flex-shrink-0 p-4 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:from-gray-100 dark:disabled:from-white/5 disabled:to-gray-100 dark:disabled:to-white/5 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:border-gray-200 dark:disabled:border-white/10 disabled:cursor-not-allowed
                     text-white border border-transparent rounded-[1.25rem] transition-all shadow-[0_4px_10px_-2px_rgba(153,27,27,0.3)] active:scale-95 disabled:scale-100 disabled:shadow-none"
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
