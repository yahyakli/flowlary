import { create } from "zustand";

interface SalaryState {
  salary: number;
  payDay: number;
  initialBalance: number;
  isLoading: boolean;
  error: string | null;
  fetchSalary: () => Promise<void>;
  updateSalary: (data: { amount: number; payDay?: number; initialBalance?: number }) => Promise<void>;
}

export const useSalaryStore = create<SalaryState>((set) => ({
  salary: 0,
  payDay: 1,
  initialBalance: 0,
  isLoading: false,
  error: null,

  fetchSalary: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/salary");
      const data = await res.json();
      if (res.ok && data.salary) {
        set({ 
          salary: data.salary.amount, 
          payDay: data.salary.payDay,
          initialBalance: data.salary.initialBalance || 0,
          error: null 
        });
      }
    } catch (err) {
      set({ error: "Failed to fetch salary" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSalary: async (data) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        set({ 
          salary: result.salary.amount,
          payDay: result.salary.payDay,
          initialBalance: result.salary.initialBalance,
          error: null 
        });
      } else {
        set({ error: result.error || "Failed to update salary" });
      }
    } catch (err) {
      set({ error: "Failed to update salary" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
