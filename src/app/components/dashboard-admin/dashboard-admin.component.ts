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
import { SavingGoal } from '../../models/saving.model';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { SavingGoalService } from '../../services/saving-goal';
import { AddGoalModal } from '../add-goal-modal/add-goal-modal';
import { v4 as uuidv4 } from 'uuid';
import { FamilyService } from '../../services/family';
import { User } from '../../models/user.model';
import { Observable, of } from 'rxjs';

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

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private savingGoalService: SavingGoalService,
    private familyService: FamilyService
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .subscribe(({ matches }) => {
        this.gridCols = matches ? 1 : 2;
      });

    this.savingGoals$ = of(this.savingGoalService.getGoals());
  }

  openAddMemberDialog() {
    this.dialog.open(AddMemberModal, {
      width: '400px',
    });
  }

  openAddGoalDialog() {
    const dialogRef = this.dialog.open(AddGoalModal, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const currentUser: User = JSON.parse(
          localStorage.getItem('currentUser') || '{}'
        );

        const families = this.familyService.getFamilies();
        const family = families.filter((f) => f.headId === currentUser.id)[0];

        const newGoal: SavingGoal = {
          id: uuidv4(),
          familyId: family.name,
          title: result.title,
          description: result.description,
          targetAmount: Number(result.targetAmount),
          currentAmount: 0,
          createdAt: new Date().toISOString(),
          dueDate: result.dueDate,
          status: 'active',
          createdBy: currentUser.id,
          contributions: [],
        };
        this.savingGoalService.addGoal(newGoal);
        this.savingGoals$ = of(this.savingGoalService.getGoals());
      }
    });
  }
}
