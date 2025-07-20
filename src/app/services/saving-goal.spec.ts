import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { SavingGoalService } from './saving-goal';
import { SavingGoal } from '../models/saving.model';

describe('SavingGoalService', () => {
  let service: SavingGoalService;
  let http: jasmine.SpyObj<HttpClient>;

  const mockSavingGoals: SavingGoal[] = [
    {
      id: '1',
      familyId: 'Doe Family',
      title: 'Vacation Fund',
      description: 'Saving for summer vacation',
      targetAmount: 5000,
      currentAmount: 2500,
      createdAt: '2024-01-01T00:00:00.000Z',
      dueDate: '2024-06-01T00:00:00.000Z',
      status: 'active',
      createdBy: '1',
      contributions: [],
    },
    {
      id: '2',
      familyId: 'Doe Family',
      title: 'New Car',
      description: 'Saving for a new family car',
      targetAmount: 15000,
      currentAmount: 15000,
      createdAt: '2024-01-01T00:00:00.000Z',
      dueDate: '2024-12-01T00:00:00.000Z',
      status: 'completed',
      createdBy: '1',
      contributions: [],
    },
  ];

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        SavingGoalService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });

    service = TestBed.inject(SavingGoalService);
    http = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initGoals', () => {
    it('should return existing goals from localStorage if available', async () => {
      localStorage.setItem('savingGoals', JSON.stringify(mockSavingGoals));

      await service.initGoals();

      expect(http.get).not.toHaveBeenCalled();
    });

    it('should fetch goals from API if localStorage is empty', async () => {
      http.get.and.returnValue(of(mockSavingGoals));
      spyOn(localStorage, 'setItem');

      await service.initGoals();

      expect(http.get).toHaveBeenCalledWith(
        'https://dsantanderac.github.io/reach-it-data/saving-goals.json'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'savingGoals',
        JSON.stringify(mockSavingGoals)
      );
    });

    it('should handle API error and set empty array', async () => {
      const error = new Error('Network error');
      http.get.and.returnValue(throwError(() => error));
      spyOn(localStorage, 'setItem');
      spyOn(console, 'error');

      await service.initGoals();

      expect(http.get).toHaveBeenCalledWith(
        'https://dsantanderac.github.io/reach-it-data/saving-goals.json'
      );
      expect(console.error).toHaveBeenCalledWith('error fetching goals', error);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'savingGoals',
        JSON.stringify([])
      );
    });
  });

  describe('getGoals', () => {
    it('should return goals from localStorage', () => {
      localStorage.setItem('savingGoals', JSON.stringify(mockSavingGoals));

      const result = service.getGoals();

      expect(result).toEqual(mockSavingGoals);
    });

    it('should return empty array if no goals in localStorage', () => {
      const result = service.getGoals();

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('savingGoals', 'invalid-json');

      expect(() => service.getGoals()).toThrow();
    });
  });

  describe('addGoal', () => {
    it('should add new goal to existing goals', () => {
      localStorage.setItem('savingGoals', JSON.stringify(mockSavingGoals));
      const newGoal: SavingGoal = {
        id: '3',
        familyId: 'Doe Family',
        title: 'Emergency Fund',
        description: 'Saving for emergencies',
        targetAmount: 10000,
        currentAmount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: '1',
        contributions: [],
      };

      service.addGoal(newGoal);

      const updatedGoals = JSON.parse(
        localStorage.getItem('savingGoals') || '[]'
      );
      expect(updatedGoals).toContain(newGoal);
      expect(updatedGoals.length).toBe(3);
    });

    it('should create new goals array if none exists', () => {
      const newGoal: SavingGoal = {
        id: '1',
        familyId: 'Doe Family',
        title: 'First Goal',
        description: 'First saving goal',
        targetAmount: 1000,
        currentAmount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: '1',
        contributions: [],
      };

      service.addGoal(newGoal);

      const goals = JSON.parse(localStorage.getItem('savingGoals') || '[]');
      expect(goals).toEqual([newGoal]);
    });

    it('should preserve existing goals when adding new one', () => {
      localStorage.setItem('savingGoals', JSON.stringify([mockSavingGoals[0]]));
      const newGoal = mockSavingGoals[1];

      service.addGoal(newGoal);

      const updatedGoals = JSON.parse(
        localStorage.getItem('savingGoals') || '[]'
      );
      expect(updatedGoals).toContain(mockSavingGoals[0]);
      expect(updatedGoals).toContain(newGoal);
      expect(updatedGoals.length).toBe(2);
    });

    it('should handle goal with contributions', () => {
      const goalWithContributions: SavingGoal = {
        id: '1',
        familyId: 'Doe Family',
        title: 'Goal with Contributions',
        description: 'Test goal',
        targetAmount: 1000,
        currentAmount: 500,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: '1',
        contributions: [
          {
            userId: '1',
            amount: 300,
            date: '2024-01-15T00:00:00.000Z',
          },
          {
            userId: '2',
            amount: 200,
            date: '2024-01-20T00:00:00.000Z',
          },
        ],
      };

      service.addGoal(goalWithContributions);

      const goals = JSON.parse(localStorage.getItem('savingGoals') || '[]');
      expect(goals[0].contributions.length).toBe(2);
      expect(goals[0].contributions[0].amount).toBe(300);
      expect(goals[0].contributions[1].amount).toBe(200);
    });
  });

  describe('integration tests', () => {
    it('should handle complete goal lifecycle', () => {
      // Initially no goals
      expect(service.getGoals()).toEqual([]);

      // Add first goal
      service.addGoal(mockSavingGoals[0]);
      expect(service.getGoals()).toEqual([mockSavingGoals[0]]);

      // Add second goal
      service.addGoal(mockSavingGoals[1]);
      expect(service.getGoals()).toEqual(mockSavingGoals);

      // Verify localStorage persistence
      const storedGoals = JSON.parse(
        localStorage.getItem('savingGoals') || '[]'
      );
      expect(storedGoals).toEqual(mockSavingGoals);
    });

    it('should handle multiple service instances', () => {
      // Add goal with first instance
      service.addGoal(mockSavingGoals[0]);

      // Create new service instance
      const newService = TestBed.inject(SavingGoalService);

      // Should see the same goals
      expect(newService.getGoals()).toEqual([mockSavingGoals[0]]);
    });

    it('should maintain goal structure integrity', () => {
      const testGoal: SavingGoal = {
        id: 'test-id',
        familyId: 'Test Family',
        title: 'Test Goal',
        description: 'Test Description',
        targetAmount: 1000,
        currentAmount: 500,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: 'test-user',
        contributions: [],
      };

      service.addGoal(testGoal);

      const retrievedGoal = service.getGoals()[0];
      expect(retrievedGoal.id).toBe(testGoal.id);
      expect(retrievedGoal.familyId).toBe(testGoal.familyId);
      expect(retrievedGoal.title).toBe(testGoal.title);
      expect(retrievedGoal.targetAmount).toBe(testGoal.targetAmount);
      expect(retrievedGoal.status).toBe(testGoal.status);
    });
  });

  describe('edge cases', () => {
    it('should handle goal with zero amounts', () => {
      const zeroAmountGoal: SavingGoal = {
        id: '1',
        familyId: 'Doe Family',
        title: 'Zero Amount Goal',
        description: 'Test goal',
        targetAmount: 0,
        currentAmount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: '1',
        contributions: [],
      };

      service.addGoal(zeroAmountGoal);

      const goals = service.getGoals();
      expect(goals[0].targetAmount).toBe(0);
      expect(goals[0].currentAmount).toBe(0);
    });

    it('should handle goal with large amounts', () => {
      const largeAmountGoal: SavingGoal = {
        id: '1',
        familyId: 'Doe Family',
        title: 'Large Amount Goal',
        description: 'Test goal',
        targetAmount: 1000000,
        currentAmount: 500000,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: '1',
        contributions: [],
      };

      service.addGoal(largeAmountGoal);

      const goals = service.getGoals();
      expect(goals[0].targetAmount).toBe(1000000);
      expect(goals[0].currentAmount).toBe(500000);
    });

    it('should handle goal with special characters in title', () => {
      const specialCharGoal: SavingGoal = {
        id: '1',
        familyId: 'Doe Family',
        title: 'Goal with Special Chars: @#$%^&*()',
        description: 'Test goal with special characters',
        targetAmount: 1000,
        currentAmount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: '1',
        contributions: [],
      };

      service.addGoal(specialCharGoal);

      const goals = service.getGoals();
      expect(goals[0].title).toBe('Goal with Special Chars: @#$%^&*()');
    });

    it('should handle goal with different statuses', () => {
      const activeGoal: SavingGoal = {
        id: '1',
        familyId: 'Doe Family',
        title: 'Active Goal',
        description: 'Test goal',
        targetAmount: 1000,
        currentAmount: 500,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'active',
        createdBy: '1',
        contributions: [],
      };

      const completedGoal: SavingGoal = {
        id: '2',
        familyId: 'Doe Family',
        title: 'Completed Goal',
        description: 'Test goal',
        targetAmount: 1000,
        currentAmount: 1000,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'completed',
        createdBy: '1',
        contributions: [],
      };

      const cancelledGoal: SavingGoal = {
        id: '3',
        familyId: 'Doe Family',
        title: 'Cancelled Goal',
        description: 'Test goal',
        targetAmount: 1000,
        currentAmount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        dueDate: '2024-12-31T00:00:00.000Z',
        status: 'cancelled',
        createdBy: '1',
        contributions: [],
      };

      service.addGoal(activeGoal);
      service.addGoal(completedGoal);
      service.addGoal(cancelledGoal);

      const goals = service.getGoals();
      expect(goals[0].status).toBe('active');
      expect(goals[1].status).toBe('completed');
      expect(goals[2].status).toBe('cancelled');
    });
  });
});
