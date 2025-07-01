import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    // Create spies
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // Configure localStorage mock
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string): string => {
      return store[key] || '';
    });
    spyOn(localStorage, 'setItem').and.callFake(
      (key: string, value: string): void => {
        store[key] = value;
      }
    );
    spyOn(localStorage, 'clear').and.callFake((): void => {
      store = {};
    });

    await TestBed.configureTestingModule({
      imports: [Register, BrowserAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean localStorage after each test
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register a new user and create a family', () => {
    // Configure form values
    component.registerForm.setValue({
      name: 'Alex',
      lastName: 'Johnson',
      familyName: 'JohnsonFam',
      email: 'alex@example.com',
      password: 'securePass1',
      confirmPassword: 'securePass1',
    });

    // Simulate dialog
    dialogSpy.open.and.returnValue({
      afterClosed: () => ({
        subscribe: (callback: (result: boolean) => void) => callback(true),
      }),
    } as any);

    // Call onSubmit
    component.onSubmit();

    // Check localStorage saved
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const families = JSON.parse(localStorage.getItem('families') || '[]');

    expect(users.length).toBe(1);
    expect(users[0].email).toBe('alex@example.com');
    expect(families.length).toBe(1);
    expect(families[0].name).toBe('JohnsonFam');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should not register if email already exists', () => {
    component.registerForm.setValue({
      name: 'Alex',
      lastName: 'Johnson',
      familyName: 'JohnsonFam',
      email: 'alex@example.com',
      password: 'securePass1',
      confirmPassword: 'securePass1',
    });
    component.onSubmit();

    // Try to register an used email
    component.registerForm.setValue({
      name: 'Alex2',
      lastName: 'Johnson2',
      familyName: 'JohnsonFam2',
      email: 'alex@example.com',
      password: 'securePass2',
      confirmPassword: 'securePass2',
    });
    component.onSubmit();

    // Just one user should be saved
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    expect(users.length).toBe(1);
  });
});
