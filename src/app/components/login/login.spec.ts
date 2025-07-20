import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { Login } from './login';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let userService: jasmine.SpyObj<UserService>;
  let http: jasmine.SpyObj<HttpClient>;

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'familyHead',
    },
    {
      id: '2',
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'password456',
      role: 'familyMember',
    },
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUsers',
      'addUser',
    ]);
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: HttpClient, useValue: httpSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    http = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    userService.getUsers.and.returnValue(mockUsers);
    dialog.open.and.returnValue({
      afterClosed: () => of(true),
    } as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should have email validation', () => {
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.hide()).toBe(true);

    const mockEvent = new MouseEvent('click');
    spyOn(mockEvent, 'stopPropagation');

    component.hideEvent(mockEvent);

    expect(component.hide()).toBe(false);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should load users on init', () => {
    component.ngOnInit();
    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.users).toEqual(mockUsers);
  });

  it('should show error dialog when form is empty', () => {
    component.loginForm.setValue({ email: '', password: '' });

    component.onSubmit();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Datos incompletos',
        message: 'Debes ingresar correo y contraseña para poder entrar',
        hideCancel: true,
        hideConfirm: false,
      },
    });
  });

  it('should show error dialog when only email is provided', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: '' });

    component.onSubmit();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Datos incompletos',
        message: 'Debes ingresar correo y contraseña para poder entrar',
        hideCancel: true,
        hideConfirm: false,
      },
    });
  });

  it('should show error dialog when only password is provided', () => {
    component.loginForm.setValue({ email: '', password: 'password123' });

    component.onSubmit();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Datos incompletos',
        message: 'Debes ingresar correo y contraseña para poder entrar',
        hideCancel: true,
        hideConfirm: false,
      },
    });
  });

  it('should authenticate valid user and navigate to home', () => {
    spyOn(localStorage, 'setItem');
    component.loginForm.setValue({
      email: 'john@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'currentUser',
      JSON.stringify(mockUsers[0])
    );
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should show error dialog for invalid credentials', () => {
    component.loginForm.setValue({
      email: 'invalid@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Credenciales inválidas',
        message: 'Correo y/o contraseña ingresados son incorrectos',
        hideCancel: true,
        hideConfirm: false,
      },
    });
  });

  it('should navigate to register page', () => {
    component.goToRegister();

    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should open dialog with correct parameters', () => {
    const dialogData = {
      title: 'Test Title',
      message: 'Test Message',
      hideCancel: false,
      hideConfirm: true,
      onCancel: jasmine.createSpy('onCancel'),
      onConfirm: jasmine.createSpy('onConfirm'),
    };

    component.openDialog(dialogData);

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: dialogData.title,
        message: dialogData.message,
        hideCancel: dialogData.hideCancel,
        hideConfirm: dialogData.hideConfirm,
      },
    });
  });

  it('should call onConfirm when dialog is confirmed', () => {
    const onConfirmSpy = jasmine.createSpy('onConfirm');
    const onCancelSpy = jasmine.createSpy('onCancel');

    dialog.open.and.returnValue({
      afterClosed: () => of(true),
    } as any);

    component.openDialog({
      title: 'Test',
      message: 'Test',
      onConfirm: onConfirmSpy,
      onCancel: onCancelSpy,
    });

    expect(onConfirmSpy).toHaveBeenCalled();
    expect(onCancelSpy).not.toHaveBeenCalled();
  });

  it('should call onCancel when dialog is cancelled', () => {
    const onConfirmSpy = jasmine.createSpy('onConfirm');
    const onCancelSpy = jasmine.createSpy('onCancel');

    dialog.open.and.returnValue({
      afterClosed: () => of(false),
    } as any);

    component.openDialog({
      title: 'Test',
      message: 'Test',
      onConfirm: onConfirmSpy,
      onCancel: onCancelSpy,
    });

    expect(onCancelSpy).toHaveBeenCalled();
    expect(onConfirmSpy).not.toHaveBeenCalled();
  });
});
