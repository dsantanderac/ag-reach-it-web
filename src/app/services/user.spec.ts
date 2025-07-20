import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserService } from './user';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
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

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [UserService, { provide: HttpClient, useValue: httpSpy }],
    });

    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initUsers', () => {
    it('should return existing users from localStorage if available', async () => {
      localStorage.setItem('users', JSON.stringify(mockUsers));

      await service.initUsers();

      expect(http.get).not.toHaveBeenCalled();
    });

    it('should fetch users from API if localStorage is empty', async () => {
      http.get.and.returnValue(of(mockUsers));
      spyOn(localStorage, 'setItem');

      await service.initUsers();

      expect(http.get).toHaveBeenCalledWith(
        'https://dsantanderac.github.io/reach-it-data/users.json'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'users',
        JSON.stringify(mockUsers)
      );
    });

    it('should handle API error and set empty array', async () => {
      const error = new Error('Network error');
      http.get.and.returnValue(throwError(() => error));
      spyOn(localStorage, 'setItem');
      spyOn(console, 'error');

      await service.initUsers();

      expect(http.get).toHaveBeenCalledWith(
        'https://dsantanderac.github.io/reach-it-data/users.json'
      );
      expect(console.error).toHaveBeenCalledWith('error fetching users', error);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'users',
        JSON.stringify([])
      );
    });
  });

  describe('getUsers', () => {
    it('should return users from localStorage', () => {
      localStorage.setItem('users', JSON.stringify(mockUsers));

      const result = service.getUsers();

      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no users in localStorage', () => {
      const result = service.getUsers();

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('users', 'invalid-json');

      expect(() => service.getUsers()).toThrow();
    });
  });

  describe('addUser', () => {
    it('should add new user to existing users', () => {
      localStorage.setItem('users', JSON.stringify(mockUsers));
      const newUser: User = {
        id: '3',
        name: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        password: 'password789',
        role: 'familyMember',
      };

      service.addUser(newUser);

      const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      expect(updatedUsers).toContain(newUser);
      expect(updatedUsers.length).toBe(3);
    });

    it('should create new users array if none exists', () => {
      const newUser: User = {
        id: '1',
        name: 'Alice',
        lastName: 'Brown',
        email: 'alice@example.com',
        password: 'password123',
        role: 'familyHead',
      };

      service.addUser(newUser);

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      expect(users).toEqual([newUser]);
    });

    it('should preserve existing users when adding new one', () => {
      localStorage.setItem('users', JSON.stringify([mockUsers[0]]));
      const newUser = mockUsers[1];

      service.addUser(newUser);

      const updatedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      expect(updatedUsers).toContain(mockUsers[0]);
      expect(updatedUsers).toContain(newUser);
      expect(updatedUsers.length).toBe(2);
    });
  });

  describe('integration tests', () => {
    it('should handle complete user lifecycle', () => {
      // Initially no users
      expect(service.getUsers()).toEqual([]);

      // Add first user
      service.addUser(mockUsers[0]);
      expect(service.getUsers()).toEqual([mockUsers[0]]);

      // Add second user
      service.addUser(mockUsers[1]);
      expect(service.getUsers()).toEqual(mockUsers);

      // Verify localStorage persistence
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      expect(storedUsers).toEqual(mockUsers);
    });

    it('should handle multiple service instances', () => {
      // Add user with first instance
      service.addUser(mockUsers[0]);

      // Create new service instance
      const newService = TestBed.inject(UserService);

      // Should see the same users
      expect(newService.getUsers()).toEqual([mockUsers[0]]);
    });
  });
});
