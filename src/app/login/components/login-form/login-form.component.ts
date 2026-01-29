import { Component, input, model, output } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [FormsModule, ReactiveFormsModule] 
})
export class LoginFormComponent {
  public disabled = input<boolean>(false);

  public email = model<string>('');
  public password = model<string>('');

  public onsubmit = output<void>();

  public onsubmitClicked() {
    this.onsubmit.emit();
  }
}