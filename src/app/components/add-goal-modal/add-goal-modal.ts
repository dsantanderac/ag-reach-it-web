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
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-add-goal-modal',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatDatepickerModule,
  ],
  templateUrl: './add-goal-modal.html',
  styleUrl: './add-goal-modal.css',
})
export class AddGoalModal {
  form: FormGroup;
  readonly minDate = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddGoalModal>,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      targetAmount: ['', [Validators.required, Validators.min(1)]],
      dueDate: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const values = this.form.value;
      this.dialogRef.close(values);
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
