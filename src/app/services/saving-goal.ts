import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SavingGoal } from '../models/saving.model';

@Injectable({ providedIn: 'root' })
export class SavingGoalService {
  constructor(private http: HttpClient) {}

  async initGoals(): Promise<void> {
    const localGoals = localStorage.getItem('savingGoals');
    if (localGoals) {
      return JSON.parse(localGoals);
    } else {
      this.http
        .get<SavingGoal[]>(
          'https://dsantanderac.github.io/reach-it-data/saving-goals.json'
        )
        .subscribe({
          next: (goalsFetched) => {
            localStorage.setItem('savingGoals', JSON.stringify(goalsFetched));
          },
          error: (e) => {
            console.error('error fetching goals', e);
            localStorage.setItem('savingGoals', JSON.stringify([]));
          },
        });
    }
  }

  getGoals(): SavingGoal[] {
    const localGoals = localStorage.getItem('savingGoals');
    return localGoals ? JSON.parse(localGoals) : [];
  }

  addGoal(goal: SavingGoal): void {
    const goals = this.getGoals();
    goals.push(goal);
    localStorage.setItem('savingGoals', JSON.stringify(goals));
  }
}
