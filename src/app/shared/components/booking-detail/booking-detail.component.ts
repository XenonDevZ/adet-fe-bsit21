import { Component, OnInit, Input, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import type { BookingFile, Feedback, Booking } from '../../../core/models/index'
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mt-4 border-t border-gray-100 pt-4 space-y-5">

      <!-- ── Files section ── -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
            Attached Files
          </p>
          <span class="text-[10px] font-bold text-gray-400">{{ files().length }} file(s)</span>
        </div>

        <!-- File list -->
        @if (files().length > 0) {
          <div class="space-y-2 mb-3">
            @for (file of files(); track file.id) {
              <div class="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <div class="flex items-center gap-2 min-w-0">
                  <!-- File icon -->
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    [class.bg-red-100]="isPdf(file.file_type)"
                    [class.bg-blue-100]="isDoc(file.file_type)"
                    [class.bg-green-100]="isImage(file.file_type)">
                    @if (isPdf(file.file_type)) {
                      <span class="text-xs font-bold text-red-700">PDF</span>
                    } @else if (isDoc(file.file_type)) {
                      <span class="text-xs font-bold text-blue-700">DOC</span>
                    } @else {
                      <span class="text-xs font-bold text-green-700">IMG</span>
                    }
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-800 truncate">{{ file.file_name }}</p>
                    <p class="text-xs text-gray-400">
                      {{ formatSize(file.file_size) }} · by {{ file.uploader_name }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                  <a [href]="api.getFileDownloadUrl(booking.id, file.id)"
                    target="_blank"
                    class="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Download
                  </a>
                  @if (file.user_id === currentUserId()) {
                    <!-- Inline confirm for file deletion -->
                    @if (confirmingFileDelete() === file.id) {
                      <span class="flex items-center gap-1">
                        <button (click)="confirmDeleteFile(file.id)"
                          class="text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md transition-all active:scale-95">
                          Yes
                        </button>
                        <button (click)="confirmingFileDelete.set(null)"
                          class="text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition-all active:scale-95">
                          No
                        </button>
                      </span>
                    } @else {
                      <button (click)="promptDeleteFile(file.id)"
                        class="text-xs text-red-500 hover:text-red-700 transition-colors font-medium">
                        Remove
                      </button>
                    }
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Upload -->
        @if (canUpload()) {
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-red-300 transition-colors">
            @if (!uploading()) {
              <label class="cursor-pointer">
                <svg class="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="text-xs text-gray-500 mb-1">Click to upload a file</p>
                <p class="text-xs text-gray-400">PDF, DOCX, JPG, PNG · Max 10MB</p>
                <input type="file" class="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  (change)="onFileSelected($event)" />
              </label>
            } @else {
              <div class="flex items-center justify-center gap-2 text-sm text-red-700">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading...
              </div>
            }
          </div>
          @if (uploadError()) {
            <p class="text-xs text-red-600 mt-2">{{ uploadError() }}</p>
          }
        }
      </div>

      <!-- ── Feedback section ── -->
      @if (booking.status === 'COMPLETED') {
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Feedback
          </p>

          <!-- Existing feedback -->
          @for (fb of feedbacks(); track fb.id) {
            <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-3">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-semibold text-gray-700">{{ fb.reviewer_name }}</p>
                <div class="flex items-center gap-0.5">
                  @for (star of [1,2,3,4,5]; track star) {
                    <svg class="w-3.5 h-3.5"
                      [class.text-yellow-400]="star <= fb.rating"
                      [class.text-gray-300]="star > fb.rating"
                      fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  }
                </div>
              </div>
              @if (fb.comment) {
                <p class="text-xs text-gray-600 italic">"{{ fb.comment }}"</p>
              }
            </div>
          }

          <!-- Submit feedback form -->
          @if (!hasReviewed() && canReview()) {
            <div class="bg-white border border-gray-200 rounded-xl p-4">
              <p class="text-xs font-semibold text-gray-700 mb-3">Leave Feedback</p>

              <!-- Star rating -->
              <div class="flex items-center gap-1 mb-3">
                @for (star of [1,2,3,4,5]; track star) {
                  <button (click)="selectedRating.set(star)"
                    class="transition-transform hover:scale-110">
                    <svg class="w-6 h-6 transition-colors"
                      [class.text-yellow-400]="star <= selectedRating()"
                      [class.text-gray-300]="star > selectedRating()"
                      fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </button>
                }
                <span class="text-xs text-gray-400 ml-2">
                  {{ ratingLabel() }}
                </span>
              </div>

              <textarea [(ngModel)]="feedbackComment" rows="2"
                placeholder="Leave a comment (optional)..."
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs
                       focus:outline-none focus:border-red-400 resize-none transition-colors mb-3">
              </textarea>

              @if (feedbackError()) {
                <p class="text-xs text-red-600 mb-2">{{ feedbackError() }}</p>
              }

              <button (click)="submitFeedback()"
                [disabled]="selectedRating() === 0 || submittingFeedback()"
                class="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-200
                       disabled:cursor-not-allowed text-white text-xs font-semibold
                       py-2 rounded-xl transition-colors">
                {{ submittingFeedback() ? 'Submitting...' : 'Submit Feedback' }}
              </button>
            </div>
          }

          @if (hasReviewed()) {
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              <p class="text-xs text-emerald-700 font-medium">You have already submitted feedback.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BookingDetailComponent implements OnInit {
  @Input() booking!: Booking

  api  = inject(ApiService)
  auth = inject(AuthService)

  files              = signal<BookingFile[]>([])
  feedbacks          = signal<Feedback[]>([])
  uploading          = signal(false)
  uploadError        = signal<string | null>(null)
  submittingFeedback = signal(false)
  feedbackError      = signal<string | null>(null)
  selectedRating     = signal(0)
  feedbackComment    = ''
  hasReviewed        = signal(false)
  confirmingFileDelete = signal<number | null>(null)

  ngOnInit(): void {
    this.loadFiles()
    this.loadFeedback()
  }

  currentUserId(): number {
    return this.auth.currentUser()?.sub ?? 0
  }

  canUpload(): boolean {
    // Student can always upload, teacher can upload on completed bookings
    const role = this.auth.currentUser()?.role
    if (role === 'STUDENT') return ['PENDING', 'APPROVED'].includes(this.booking.status)
    if (role === 'TEACHER') return this.booking.status === 'COMPLETED'
    return false
  }

  canReview(): boolean {
    return this.booking.status === 'COMPLETED'
  }

  loadFiles(): void {
    this.api.getBookingFiles(this.booking.id).subscribe({
      next: res => this.files.set(res.data),
      error: () => {},
    })
  }

  loadFeedback(): void {
    this.api.getBookingFeedback(this.booking.id).subscribe({
      next: res => {
        this.feedbacks.set(res.data)
        const userId = this.currentUserId()
        this.hasReviewed.set(res.data.some(f => f.reviewer_id === userId))
      },
      error: () => {},
    })
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    const file  = input.files?.[0]
    if (!file) return

    this.uploading.set(true)
    this.uploadError.set(null)

    this.api.uploadBookingFile(this.booking.id, file).subscribe({
      next: res => {
        this.files.update(f => [res.data, ...f])
        this.uploading.set(false)
      },
      error: (err) => {
        this.uploading.set(false)
        this.uploadError.set(err.error?.error ?? 'Upload failed.')
      },
    })
  }

  promptDeleteFile(fileId: number): void {
    this.confirmingFileDelete.set(fileId)
  }

  confirmDeleteFile(fileId: number): void {
    this.api.deleteBookingFile(this.booking.id, fileId).subscribe({
      next: () => {
        this.files.update(f => f.filter(x => x.id !== fileId))
        this.confirmingFileDelete.set(null)
      },
    })
  }

  submitFeedback(): void {
    if (this.selectedRating() === 0) return
    this.submittingFeedback.set(true)
    this.feedbackError.set(null)

    this.api.submitFeedback(this.booking.id, {
      rating:  this.selectedRating(),
      comment: this.feedbackComment.trim() || undefined,
    }).subscribe({
      next: res => {
        this.feedbacks.update(f => [...f, res.data])
        this.hasReviewed.set(true)
        this.submittingFeedback.set(false)
        this.selectedRating.set(0)
        this.feedbackComment = ''
      },
      error: (err) => {
        this.submittingFeedback.set(false)
        this.feedbackError.set(err.error?.error ?? 'Failed to submit feedback.')
      },
    })
  }

  isPdf(type: string):   boolean { return type === 'application/pdf' }
  isDoc(type: string):   boolean { return type.includes('word') }
  isImage(type: string): boolean { return type.startsWith('image/') }

  formatSize(bytes: number): string {
    if (bytes < 1024)       return bytes + ' B'
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  ratingLabel(): string {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    return labels[this.selectedRating()] ?? ''
  }
}
