import { create } from 'zustand';
import { IGoal } from '@/lib/db/types';
import { GoalSchema } from '@/lib/validations/goal.schema';
import { toast } from 'sonner';

function getGoalId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) {
    const id = (value as { _id: unknown })._id;
    if (typeof id === 'string') return id;
    if (id && typeof id.toString === 'function') return id.toString();
  }
  return '';
}

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load goals';
      set({ error: message, isLoading: false });
      toast.error(message);
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
      get().fetchGoals();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add goal';
      set({ error: message, isLoading: false });
      toast.error(message);
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
          getGoalId(g) === id ? updatedGoal : g
        ).sort((a, b) => 
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        ),
        isLoading: false,
      }));
      toast.success('Goal updated successfully');
      get().fetchGoals();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update goal';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  deleteGoal: async (id) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete goal');

      set((state) => ({
        goals: state.goals.filter((g) => getGoalId(g) !== id),
      }));
      toast.success('Goal deleted');
      get().fetchGoals();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete goal';
      toast.error(message);
    }
  },
}));
