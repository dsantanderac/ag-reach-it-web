import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { User } from '../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-member-modal',
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './add-member-modal.html',
  styleUrl: './add-member-modal.css',
})
export class AddMemberModal {
  form: FormGroup;

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
    public dialogRef: MatDialogRef<AddMemberModal>,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      // get current user to get the family
      const currentUserRaw = localStorage.getItem('currentUser');
      const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

      if (!currentUser) {
        alert('Sesión expirada. Inicia sesión nuevamente.');
        this.dialogRef.close();
        return;
      }

      // save new user
      const newUser: User = {
        id: crypto.randomUUID(),
        ...this.form.value,
        role: 'familyMember',
      };

      if (newUser.password !== this.form.value.confirmPassword) {
        console.log("passwords doesn't match");
        this.openDialog({
          title: 'Oops!',
          message: 'Las contraseñas no coinciden.',
          hideCancel: true,
        });

        return;
      }

      const usersRaw = localStorage.getItem('users');
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

      if (users.find((u) => u.email === newUser.email)) {
        console.log(`user ${newUser.email} already exists`);
        this.openDialog({
          title: 'Oops!',
          message: 'El correo ingresado ya se encuentra registrado.',
          hideCancel: true,
        });
        return;
      }

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // save the user into the family
      const familiesRaw = localStorage.getItem('families');
      const families = familiesRaw ? JSON.parse(familiesRaw) : [];

      const currentFamily = families.find(
        (f: any) => f.headId === currentUser.id
      );

      if (currentFamily) {
        currentFamily.members.push(newUser.id);
        localStorage.setItem('families', JSON.stringify(families));
      }

      this.dialogRef.close(newUser);
    }
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
