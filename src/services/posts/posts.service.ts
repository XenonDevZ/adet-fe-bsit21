import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);

  private readonly POSTS_API = 'https://jsonplaceholder.typicode.com/posts';

  public getPosts() {
    return this.http.get(this.POSTS_API).toPromise();
  }

}