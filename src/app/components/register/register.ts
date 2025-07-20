import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../models/user.model';
import { MatIconModule } from '@angular/material/icon';
import { Family } from '../../models/family.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { FamilyService } from '../../services/family';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm: FormGroup;
  users: User[] = [];
  families: Family[] = [];
  submitted = false;

  hide = signal(true);
  hideEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  hideConfirm = signal(true);
  hideConfirmEvent(event: MouseEvent) {
    this.hideConfirm.set(!this.hideConfirm());
    event.stopPropagation();
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private familyService: FamilyService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      familyName: ['', [Validators.required, this.familyNameExistsValidator]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    this.users = this.userService.getUsers();
    this.families = this.familyService.getFamilies();
  }

  register(user: User & { familyName: string }): boolean {
    if (this.users.find((u) => u.email === user.email)) {
      this.openDialog({
        title: 'Oops!',
        message: 'El correo ingresado ya se encuentra registrado.',
        hideCancel: true,
      });
      return false;
    }
    if (user.password !== this.registerForm.value.confirmPassword) {
      this.openDialog({
        title: 'Oops!',
        message: 'Las contraseñas no coinciden.',
        hideCancel: true,
      });
      return false;
    }

    this.userService.addUser(user);
    this.users = this.userService.getUsers();

    localStorage.setItem('currentUser', JSON.stringify(user));

    const newFamily: Family = {
      name: this.registerForm.value.familyName!,
      headId: user.id,
      members: [user.id],
    };
    this.familyService.addFamily(newFamily);
    this.families = this.familyService.getFamilies();

    return true;
  }

  onSubmit() {
    console.log('submitting...');
    if (this.registerForm.valid) {
      console.log(
        'submitting valid form... with values: ',
        this.registerForm.value
      );
      const success = this.register({
        id: uuidv4(),
        role: 'familyHead',
        ...this.registerForm.value,
      } as any);
      if (success)
        this.openDialog({
          title: 'Excelente!',
          message:
            'Usuario registrado exitosamente. Serás redirigido al inicio.',
          hideCancel: true,
          onConfirm: () => this.router.navigate(['/home']),
        });
    }
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  familyNameExistsValidator = (control: AbstractControl) => {
    const exists = this.families.some(
      (f) => f.name.toLowerCase() === control.value?.toLowerCase()
    );
    return exists ? { familyNameExists: true } : null;
  };

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
