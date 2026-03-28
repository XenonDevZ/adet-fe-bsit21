import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PostsComponent } from './posts/posts.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'posts',
    children: [
      {
        path: '',
        component: PostsComponent
      },
      {
        path: 'create',
        loadComponent: () => import('./posts/post-create/post-create.component').then(m => m.PostCreateComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full'
  }
];

