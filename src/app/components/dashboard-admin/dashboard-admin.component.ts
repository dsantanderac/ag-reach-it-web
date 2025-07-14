import { Component, inject, Input } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AddMemberModal } from '../add-member-modal/add-member-modal';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SavingGoal } from '../../models/saving.model';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    CommonModule,
  ],
})
export class DashboardAdminComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  @Input() role: string = '';

  savingGoals$: Observable<SavingGoal[]> = of([]);
  gridCols = 2;

  constructor(private dialog: MatDialog, private http: HttpClient) {}

  ngOnInit() {
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .subscribe(({ matches }) => {
        this.gridCols = matches ? 1 : 2;
      });

    this.savingGoals$ = this.http.get<SavingGoal[]>(
      'https://dsantanderac.github.io/reach-it-data/saving-goals.json'
    );
  }

  openAddMemberDialog() {
    this.dialog.open(AddMemberModal, {
      width: '400px',
    });
  }
}
