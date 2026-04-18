import { Component, ElementRef, HostListener, ViewChild, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SearchService, OmniSearchResult } from '../../../core/services/search.service';

@Component({
  selector: 'app-header-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative flex-1 max-w-[12rem] sm:max-w-xs transition-all duration-300 ease-out z-[70]"
         [class.!max-w-[18rem]]="isFocused()"
         [class.sm:!max-w-[24rem]]="isFocused()">
      
      <!-- Input Field -->
      <div class="relative">
        <input 
          #searchInput
          type="text" 
          placeholder="Search..." 
          [value]="searchQuery()"
          (input)="updateQuery($event)"
          (focus)="isFocused.set(true)"
          (blur)="onBlur()"
          class="w-full pl-10 pr-12 py-2 bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-[1rem] text-sm text-gray-700 dark:text-foreground outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-red-900/20 dark:focus:ring-white/10 focus:border-red-900 dark:focus:border-white/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
        />
        
        <!-- Search Icon -->
        <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" [class.text-red-800]="isFocused()" [class.dark:text-white]="isFocused()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <!-- Shortcut Indicator / Clear Button -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          @if (searchQuery()) {
            <button (click)="clearSearch($event)" class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          } @else {
            <span class="hidden sm:flex items-center justify-center px-1.5 py-0.5 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-black/40 text-[10px] font-bold text-gray-400 dark:text-gray-500 shadow-sm gap-0.5">
              <span>{{ isMac ? '⌘' : 'Ctrl' }}</span>
              <span>K</span>
            </span>
          }
        </div>
      </div>

      <!-- Dropdown Results -->
      @if (isFocused() || searchQuery()) {
        <div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden transform opacity-100 scale-100 z-[70] transition-all origin-top max-h-[400px] overflow-y-auto">
          
          @if (searchQuery() && results().length === 0) {
            <!-- No Results State -->
            <div class="p-6 text-center">
              <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 mb-3">
                <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-foreground">No results for "{{ searchQuery() }}"</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Try a different term</p>
            </div>
          } @else {
            <div class="p-2">
              <p class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {{ searchQuery() ? 'Omni Search Results' : 'Explore' }}
              </p>
              
              @for (item of results(); track item.title + item.subtitle; let i = $index) {
                <button 
                  (click)="handleSelection(item)"
                  (mouseenter)="selectedIndex.set(i)"
                  [class.bg-gray-50]="selectedIndex() === i" [class.dark:bg-white/5]="selectedIndex() === i"
                  class="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group">
                  
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors" [innerHTML]="item.icon">
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">{{ item.title }}</p>
                        <span class="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                              [class.bg-blue-100]="item.type === 'PAGE'" [class.text-blue-700]="item.type === 'PAGE'" [class.dark:bg-blue-900/20]="item.type === 'PAGE'" [class.dark:text-blue-400]="item.type === 'PAGE'"
                              [class.bg-purple-100]="item.type === 'TEACHER'" [class.text-purple-700]="item.type === 'TEACHER'" [class.dark:bg-purple-900/20]="item.type === 'TEACHER'" [class.dark:text-purple-400]="item.type === 'TEACHER'"
                              [class.bg-green-100]="item.type === 'BOOKING'" [class.text-green-700]="item.type === 'BOOKING'" [class.dark:bg-green-900/20]="item.type === 'BOOKING'" [class.dark:text-green-400]="item.type === 'BOOKING'">
                          {{ item.type }}
                        </span>
                      </div>
                      <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{{ item.subtitle }}</p>
                    </div>
                  </div>
                  
                  @if (selectedIndex() === i) {
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  }
                </button>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Backdrop overly -->
    @if (isFocused()) {
      <div class="fixed inset-0 z-[60] bg-gray-900/10 backdrop-blur-[1px] transition-opacity" (click)="defocus()"></div>
    }
  `
})
export class HeaderSearchComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  searchService = inject(SearchService);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  isFocused = signal(false);
  searchQuery = signal('');
  selectedIndex = signal(0);
  isMac = navigator.userAgent.includes('Mac');

  results = computed(() => {
    const raw = this.searchService.omniResults();
    if (this.selectedIndex() >= raw.length && raw.length > 0) {
      this.selectedIndex.set(raw.length - 1);
    }
    return raw;
  });

  ngOnInit() {
    // Warm up the global search cache
    this.searchService.prefetch();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
    }
    if (event.key === 'Escape') {
      this.defocus();
    }

    if (!this.isFocused()) return;

    const items = this.results();
    if (items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex.update(i => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex.update(i => (i - 1 + items.length) % items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[this.selectedIndex()];
      if (item) {
        this.handleSelection(item);
      }
    }
  }

  updateQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.searchService.globalQuery.set(input.value);
    this.selectedIndex.set(0); // Reset selection when typing
  }

  clearSearch(event: Event) {
    event.stopPropagation();
    this.searchQuery.set('');
    this.searchService.globalQuery.set('');
    this.searchInput.nativeElement.focus();
  }

  onBlur() {
    // Slight delay to allow clicking on dropdown items before it disappears
    setTimeout(() => {
      this.isFocused.set(false);
    }, 150);
  }

  defocus() {
    this.isFocused.set(false);
    this.searchInput.nativeElement.blur();
  }

  handleSelection(item: OmniSearchResult) {
    if (item.type === 'PAGE' && item.url) {
      this.router.navigateByUrl(item.url);
    } else if (item.type === 'TEACHER') {
      this.router.navigate(['/student/book', item.actionPayload]);
    } else if (item.type === 'BOOKING') {
      const role = this.auth.currentUser()?.role;
      if (role === 'STUDENT') {
        this.router.navigateByUrl('/student/my-bookings');
      } else if (role === 'TEACHER') {
        this.router.navigateByUrl('/teacher/bookings');
      } else {
        this.router.navigateByUrl('/admin/bookings');
      }
    }
    
    this.defocus();
    this.clearSearch(new Event('click')); // clear visual query after navigating
  }
}
