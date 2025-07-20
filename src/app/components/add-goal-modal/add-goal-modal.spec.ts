import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { AddGoalModal } from './add-goal-modal';

describe('AddGoalModal', () => {
  let component: AddGoalModal;
  let fixture: ComponentFixture<AddGoalModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGoalModal],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => ({ subscribe: () => {} }) }),
          },
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddGoalModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
