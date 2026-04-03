import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from '../../shared/components/navbar/navbar.component'

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-outlet />
    </main>
  `,
})
export class StudentLayoutComponent {}