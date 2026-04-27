import { create } from 'zustand';
import { IGoal } from '@/lib/db/types';
import { GoalSchema } from '@/lib/validations/goal.schema';
import { toast } from 'sonner';

interface GoalState {
  goals: IGoal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: GoalSchema) => Promise<void>;
  updateGoal: (id: string, goal: Partial<GoalSchema>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: true,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/goals');
      if (!response.ok) throw new Error('Failed to fetch goals');
      
      const data = await response.json();
      set({ goals: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Could not load goals');
    }
  },

  addGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add goal');
      }

      const newGoal = await response.json();
      set((state) => ({
        goals: [...state.goals, newGoal].sort((a, b) => 
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        ),
        isLoading: false,
      }));
      toast.success('Goal added successfully');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  updateGoal: async (id, goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update goal');
      }

      const updatedGoal = await response.json();
      set((state) => ({
        goals: state.goals.map((g) => 
          (g._id as any).toString() === id ? updatedGoal : g
        ).sort((a, b) => 
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        ),
        isLoading: false,
      }));
      toast.success('Goal updated successfully');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message);
    }
  },

  deleteGoal: async (id) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete goal');

      set((state) => ({
        goals: state.goals.filter((g) => (g._id as any).toString() !== id),
      }));
      toast.success('Goal deleted');
    } catch (error: any) {
      toast.error('Could not delete goal');
    }
  },
}));
