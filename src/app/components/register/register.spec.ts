import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { Register } from './register';
import { UserService } from '../../services/user';
import { FamilyService } from '../../services/family';
import { User } from '../../models/user.model';
import { Family } from '../../models/family.model';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let userService: jasmine.SpyObj<UserService>;
  let familyService: jasmine.SpyObj<FamilyService>;

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'familyHead',
    },
  ];

  const mockFamilies: Family[] = [
    {
      name: 'Doe Family',
      headId: '1',
      members: ['1'],
    },
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUsers',
      'addUser',
    ]);
    const familyServiceSpy = jasmine.createSpyObj('FamilyService', [
      'getFamilies',
      'addFamily',
    ]);

    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: FamilyService, useValue: familyServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    familyService = TestBed.inject(
      FamilyService
    ) as jasmine.SpyObj<FamilyService>;

    // Setup spies
    userService.getUsers.and.returnValue(mockUsers);
    familyService.getFamilies.and.returnValue(mockFamilies);
    dialog.open.and.returnValue({
      afterClosed: () => of(true),
    } as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('name')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('familyName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should have required validators', () => {
    const nameControl = component.registerForm.get('name');
    const lastNameControl = component.registerForm.get('lastName');
    const emailControl = component.registerForm.get('email');
    const passwordControl = component.registerForm.get('password');
    const confirmPasswordControl =
      component.registerForm.get('confirmPassword');

    expect(nameControl?.hasError('required')).toBeTruthy();
    expect(lastNameControl?.hasError('required')).toBeTruthy();
    expect(emailControl?.hasError('required')).toBeTruthy();
    expect(passwordControl?.hasError('required')).toBeTruthy();
    expect(confirmPasswordControl?.hasError('required')).toBeTruthy();
  });

  it('should have email validation', () => {
    const emailControl = component.registerForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should have password minimum length validation', () => {
    const passwordControl = component.registerForm.get('password');

    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.hide()).toBe(true);

    const mockEvent = new MouseEvent('click');
    spyOn(mockEvent, 'stopPropagation');

    component.hideEvent(mockEvent);

    expect(component.hide()).toBe(false);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
