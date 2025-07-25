import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { AddMemberModal } from './add-member-modal';

describe('AddMemberModal', () => {
  let component: AddMemberModal;
  let fixture: ComponentFixture<AddMemberModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberModal],
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

    fixture = TestBed.createComponent(AddMemberModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
