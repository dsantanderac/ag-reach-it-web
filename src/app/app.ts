import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user';
import { SavingGoalService } from './services/saving-goal';
import { FamilyService } from './services/family';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'ag-reach-it-web';

  constructor(
    private userService: UserService,
    private savingGoalService: SavingGoalService,
    private familyService: FamilyService
  ) {}

  async ngOnInit() {
    await this.userService.initUsers();
    await this.savingGoalService.initGoals();
    await this.familyService.initFamilies();
  }
}
