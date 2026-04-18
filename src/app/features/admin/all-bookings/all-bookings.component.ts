import { Component, OnInit, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../core/services/api.service'
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component'
import type { Booking, BookingStatus } from '../../../core/models/index'
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe'
import { DatePickerModule } from 'primeng/datepicker'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, TimeFormatPipe, DatePickerModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto pb-12 pt-4">

      <!-- Hero Header -->
      <div class="relative bg-gradient-to-r from-red-900 to-red-800 p-8 sm:p-10 mb-8 rounded-[2rem] overflow-hidden shadow-sm flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between group">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-[20px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <div class="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10">
          <span class="inline-block px-3.5 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest rounded-xl mb-3 shadow-inner">System Oversight</span>
          <h1 class="text-3xl lg:text-4xl font-black tracking-tight text-white mb-1.5">All Bookings</h1>
          <p class="text-sm font-medium text-red-100/90 tracking-wide">Monitor, approve, and manage every consultation in the system.</p>
        </div>
        <div class="relative z-10 flex flex-wrap gap-3 shrink-0">
          <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center shadow-inner hover:bg-white/15 transition-colors">
            <p class="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Total</p>
            <p class="text-3xl font-black text-white leading-none drop-shadow-md">{{ bookings().length }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center shadow-inner hover:bg-white/15 transition-colors">
            <p class="text-[10px] font-black text-amber-200/80 uppercase tracking-widest mb-1">Pending</p>
            <p class="text-3xl font-black text-amber-300 leading-none drop-shadow-md">{{ pendingCount() }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center shadow-inner hover:bg-white/15 transition-colors">
            <p class="text-[10px] font-black text-emerald-200/80 uppercase tracking-widest mb-1">Approved</p>
            <p class="text-3xl font-black text-emerald-300 leading-none drop-shadow-md">{{ approvedCount() }}</p>
          </div>
        </div>
      </div>

      <div class="px-4 pb-10 sm:px-6 lg:px-12">

        <!-- Controls -->
        <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm dark:shadow-none border border-white dark:border-white/5 p-4 sm:p-5 mb-8">
          <div class="flex flex-col gap-4">

            <!-- Top row: Search -->
            <div class="relative w-full">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 focus-within:text-red-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" [(ngModel)]="search" placeholder="Search student or teacher..."
                class="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/10 placeholder-gray-400 text-gray-900 dark:text-foreground text-sm font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-900/10 dark:focus:ring-red-900/20 focus:border-red-200 dark:focus:border-red-500/50 focus:bg-white dark:focus:bg-black/40 transition-all shadow-inner dark:shadow-none" />
            </div>

            <!-- Bottom row: Filters (scrollable on mobile) -->
            <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
              <!-- Pill filters -->
              <div class="flex items-center p-1.5 bg-gray-50/80 dark:bg-black/20 rounded-2xl border border-gray-100/80 dark:border-white/10 shrink-0">
                @for (s of statusFilters; track s.value) {
                  <button (click)="statusFilter = s.value" 
                    class="px-3 sm:px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all duration-300 whitespace-nowrap"
                    [class]="statusFilter === s.value ? 'bg-white dark:bg-white/10 text-red-800 dark:text-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-transparent'">
                    {{ s.label }}
                  </button>
                }
              </div>

              <!-- Date + Type + Clear + Export -->
              <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                
                <p-datepicker [(ngModel)]="dateFilter" 
                  [showIcon]="true"
                  [iconDisplay]="'input'"
                  dateFormat="yy-mm-dd"
                  placeholder="Date"
                  appendTo="body"
                  [inputStyleClass]="'h-[42px] sm:h-[46px] border border-gray-100 hover:border-gray-200 rounded-2xl pl-9 sm:pl-10 pr-3 text-xs font-bold bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-400 transition-all shadow-sm w-[110px] sm:w-[140px]'"
                ></p-datepicker>
                
                <select [(ngModel)]="typeFilter"
                  class="appearance-none h-[42px] sm:h-[46px] border border-gray-100/80 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 rounded-2xl pl-3 sm:pl-4 pr-8 text-xs font-bold bg-gray-50/80 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20 focus:border-red-400 dark:focus:border-red-500/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[right_4px_center]">
                  <option value="" class="font-bold dark:bg-card">All Types</option>
                  <option value="ONLINE" class="font-bold dark:bg-card">Online</option>
                  <option value="FACE_TO_FACE" class="font-bold dark:bg-card">Face-to-Face</option>
                </select>

                <!-- Clear -->
                @if (search || statusFilter || dateFilter || typeFilter) {
                  <button (click)="clearFilters()" type="button"
                    class="h-[42px] sm:h-[46px] w-[42px] sm:w-[46px] flex items-center justify-center text-red-800/70 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-2xl transition-all border border-red-100">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                }

                <!-- Export Buttons -->
                <button (click)="exportExcel()" type="button" title="Export as Excel"
                  class="h-[42px] sm:h-[46px] flex items-center gap-1.5 px-3 sm:px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 rounded-2xl transition-all border border-emerald-100 hover:border-emerald-200 shadow-sm active:scale-95">
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span class="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Excel</span>
                </button>

                <button (click)="exportPdf()" type="button" title="Export as PDF"
                  class="h-[42px] sm:h-[46px] flex items-center gap-1.5 px-3 sm:px-4 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 rounded-2xl transition-all border border-red-100 hover:border-red-200 shadow-sm active:scale-95">
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-[10px] font-black uppercase tracking-widest hidden sm:inline">PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading skeleton -->
        @if (loading()) {
          <div class="bg-white dark:bg-card rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden">
            <div class="divide-y divide-gray-50 dark:divide-white/5">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="px-6 py-5 flex items-center gap-4 animate-pulse">
                  <div class="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white/10 shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/4"></div>
                    <div class="h-2 bg-gray-100 dark:bg-white/5 rounded w-1/3"></div>
                  </div>
                  <div class="h-6 bg-gray-100 dark:bg-white/5 rounded-full w-20"></div>
                  <div class="h-7 bg-gray-100 dark:bg-white/5 rounded-xl w-16"></div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Table -->
        @if (!loading()) {
          <div class="bg-white/80 dark:bg-card backdrop-blur-xl rounded-[2rem] shadow-sm dark:shadow-none border border-white dark:border-white/5 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="table-fixed w-full text-sm min-w-[1100px]">
                <thead>
                  <tr class="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    <th class="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[8%]"># ID</th>
                    <th class="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%]">Student</th>
                    <th class="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%]">Teacher</th>
                    <th class="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%]">Date & Time</th>
                    <th class="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[16%]">Type</th>
                    <th class="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[16%]">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-white/5">
                  @for (b of filtered(); track b.id) {
                    <tr class="hover:bg-white dark:hover:bg-white/5 transition-colors group relative">
                      <td class="px-6 py-5 text-gray-400 text-xs font-mono font-bold">#{{ b.id }}</td>

                      <td class="px-6 py-5">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-[1rem] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 flex items-center justify-center text-xs font-black text-red-800 dark:text-red-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            {{ b.student_name.charAt(0).toUpperCase() }}
                          </div>
                          <div class="truncate max-w-[150px]">
                            <p class="font-black tracking-tight text-gray-900 dark:text-foreground text-sm truncate">{{ b.student_name }}</p>
                            <p class="text-[11px] text-gray-400 font-bold tracking-wide truncate">{{ b.student_email }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-6 py-5">
                        <div class="flex items-center gap-3">
                          @if (b.teacher_picture) {
                            <img [src]="b.teacher_picture" class="w-8 h-8 rounded-[1rem] object-cover border border-white dark:border-white/10 shadow-sm shrink-0"
                              (error)="$any($event.target).src='https://ui-avatars.com/api/?name=' + b.teacher_name.split(' ').join('+') + '&background=1e3a8a&color=fff'" />
                          } @else {
                            <div class="w-8 h-8 rounded-[1rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[10px] font-black text-blue-800 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900/50">
                              {{ b.teacher_name.charAt(0).toUpperCase() }}
                            </div>
                          }
                          <span class="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-tight truncate max-w-[150px]">{{ b.teacher_name }}</span>
                        </div>
                      </td>

                      <td class="px-6 py-5 whitespace-nowrap truncate overflow-hidden">
                        <p class="font-black text-gray-900 dark:text-foreground text-sm tracking-tight truncate">{{ b.scheduled_date | date:'EEE, MMM d, yyyy' }}</p>
                        <p class="text-[11px] text-gray-500 font-bold tracking-wider mt-0.5 truncate">{{ b.start_time | timeFormat }} – {{ b.end_time | timeFormat }}</p>
                      </td>

                      <td class="px-6 py-5">
                        @if (b.consultation_type === 'ONLINE') {
                          <span class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50/80 backdrop-blur-md border border-blue-100/50 px-3 py-1.5 rounded-lg shadow-sm">
                            <span class="relative flex h-2 w-2">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Online
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50/80 backdrop-blur-md border border-amber-100/50 px-3 py-1.5 rounded-lg shadow-sm">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            </svg>
                            F2F
                          </span>
                        }
                      </td>

                      <td class="px-6 py-5">
                        <app-status-badge [status]="b.status" />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (filtered().length === 0) {
              <div class="py-24 text-center">
                <div class="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 mx-auto border border-dashed border-gray-200 dark:border-white/10">
                  <svg class="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <p class="font-black text-gray-900 dark:text-foreground text-lg mb-1">No bookings found</p>
                <p class="text-sm text-gray-400 font-medium">Try adjusting your search or filters.</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AllBookingsComponent implements OnInit {
  private api = inject(ApiService)

  bookings       = signal<Booking[]>([])
  loading        = signal(true)
  showExportMenu = signal(false)

  search       = ''
  statusFilter = ''
  dateFilter   = ''
  typeFilter   = ''

  statusFilters = [
    { label: 'All',       value: '' },
    { label: 'Pending',   value: 'PENDING' },
    { label: 'Approved',  value: 'APPROVED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ]

  pendingCount  = computed(() => this.bookings().filter(b => b.status === 'PENDING').length)
  approvedCount = computed(() => this.bookings().filter(b => b.status === 'APPROVED').length)

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.api.getBookings().subscribe({
      next: res => {
        this.bookings.set(res.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false),
    })
  }

  filtered(): Booking[] {
    return this.bookings().filter(b => {
      const q = this.search.toLowerCase()
      const matchSearch = !q || b.student_name.toLowerCase().includes(q) || b.teacher_name.toLowerCase().includes(q)
      const matchStatus = !this.statusFilter || b.status === this.statusFilter
      
      let matchDate = true;
      if (this.dateFilter) {
        // PrimeNG DatePicker returns a JS Date object. b.scheduled_date is string "YYYY-MM-DD"
        const d = new Date(this.dateFilter);
        const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        matchDate = (b.scheduled_date === dateStr);
      }

      const matchType   = !this.typeFilter   || b.consultation_type === this.typeFilter
      return matchSearch && matchStatus && matchDate && matchType
    })
  }

  clearFilters(): void {
    this.search  = ''
    this.statusFilter = ''
    this.dateFilter   = ''
    this.typeFilter   = ''
  }

  private exportRows() {
    return this.filtered().map(b => ({
      ID: b.id,
      Student: b.student_name,
      'Student Email': b.student_email,
      Teacher: b.teacher_name,
      Date: b.scheduled_date,
      'Start Time': b.start_time,
      'End Time': b.end_time,
      Type: b.consultation_type === 'ONLINE' ? 'Online' : 'Face-to-Face',
      Status: b.status,
    }))
  }

  exportExcel(): void {
    const data = this.exportRows()
    if (data.length === 0) return

    const ws = XLSX.utils.json_to_sheet(data)

    // Auto-size columns
    const colWidths = Object.keys(data[0]).map(key => {
      const maxLen = Math.max(key.length, ...data.map(r => String((r as any)[key]).length))
      return { wch: maxLen + 2 }
    })
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings')
    XLSX.writeFile(wb, `bookings_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  exportPdf(): void {
    const data = this.exportRows()
    if (data.length === 0) return

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('ACBS — All Bookings Report', 14, 18)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}  •  ${data.length} record${data.length === 1 ? '' : 's'}`, 14, 25)

    const headers = ['ID', 'Student', 'Email', 'Teacher', 'Date', 'Start', 'End', 'Type', 'Status']
    const body = data.map(r => [
      r.ID, r.Student, r['Student Email'], r.Teacher,
      r.Date, r['Start Time'], r['End Time'], r.Type, r.Status
    ])

    autoTable(doc, {
      startY: 32,
      head: [headers],
      body,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [127, 29, 29], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 12 },
        4: { cellWidth: 24 },
        5: { cellWidth: 18 },
        6: { cellWidth: 18 },
      },
    })

    doc.save(`bookings_report_${new Date().toISOString().slice(0, 10)}.pdf`)
  }
}
