import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Sidebar } from '../sidebar/sidebar';
import { DashboardAdminComponent } from '../dashboard-admin/dashboard-admin.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DashboardAdminComponent, MatCardModule, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  currentUser: User;

  constructor(private router: Router) {
    const savedUser = localStorage.getItem('currentUser');
    this.currentUser = savedUser ? JSON.parse(savedUser) : null;
  }

  ngOnInit(): void {
    if (!this.currentUser) {
      console.log('there is no user logged in');
      this.router.navigate(['/login']);
    }
  }
}
