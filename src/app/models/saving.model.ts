export interface SavingGoal {
  id: string;
  familyName: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string; // ISO date string
  dueDate: string; // ISO date string
  status: 'active' | 'completed' | 'cancelled';
  createdBy: string; // userId
  contributions: {
    userId: string;
    amount: number;
    date: string; // ISO date string
  }[];
}
