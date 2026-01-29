import { Component, inject, OnInit, signal } from "@angular/core";
import { LoginFormComponent } from "./components/login-form/login-form.component";
import { PostsService } from "../../services/posts/posts.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [LoginFormComponent, CommonModule]
})
export class LoginComponent implements OnInit {
  public email = signal<string>('example@email.com');
  public password = signal<string>('password123');

  private postsService = inject(PostsService);

  public posts = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    const results = await this.postsService.getPosts();
    this.posts.set(results as any);
  }

  public handleSubmitClicked() {
    alert("The button is clicked")
  }
}