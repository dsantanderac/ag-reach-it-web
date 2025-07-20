import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  async initUsers(): Promise<void> {
    console.log('users import');
    const localUsers = localStorage.getItem('users');
    if (localUsers) {
      return JSON.parse(localUsers);
    } else {
      this.http
        .get<User[]>('https://dsantanderac.github.io/reach-it-data/users.json')
        .subscribe({
          next: (usersFetched) => {
            console.log(usersFetched);
            localStorage.setItem('users', JSON.stringify(usersFetched));
          },
          error: (e) => {
            console.error('error fetching users', e);
            localStorage.setItem('users', JSON.stringify([]));
          },
        });
    }
  }

  getUsers(): User[] {
    const localUsers = localStorage.getItem('users');
    return localUsers ? JSON.parse(localUsers) : [];
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }
}
