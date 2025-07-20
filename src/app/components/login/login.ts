import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class Login implements OnInit {
  loginForm: FormGroup;
  users: User[] = [];

  hide = signal(true);
  hideEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private userService: UserService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email]],
      password: [''],
    });
  }

  async ngOnInit() {
    this.users = this.userService.getUsers();
    console.log('init users', this.users);
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.openDialog({
        title: 'Datos incompletos',
        message: 'Debes ingresar correo y contraseña para poder entrar',
        hideCancel: true,
      });
    }

    console.log('users', this.users);

    const user = this.users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (user) {
      console.log(`user ${user.email} found!`);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.router.navigate(['/home']);
    } else {
      console.log(`email and/or password are incorrect`);
      this.openDialog({
        title: 'Credenciales inválidas',
        message: 'Correo y/o contraseña ingresados son incorrectos',
        hideCancel: true,
      });
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  openDialog({
    title,
    message,
    hideCancel,
    hideConfirm,
    onCancel,
    onConfirm,
  }: {
    title: string;
    message: string;
    hideCancel?: boolean;
    hideConfirm?: boolean;
    onCancel?: () => void;
    onConfirm?: () => void;
  }) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title,
        message,
        hideCancel,
        hideConfirm,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        onConfirm?.();
        console.log('Confirmed!');
      } else {
        onCancel?.();
        console.log('Cancelled.');
      }
    });
  }
}
