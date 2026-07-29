type DebtLike = {
  _id?: unknown;
  currentBalance: number;
  remainingAmount?: number;
  isCompleted?: boolean;
};

type GoalLike = {
  _id?: unknown;
  currentSaved: number;
  savedAmount?: number;
  targetAmount: number;
  isCompleted?: boolean;
};

export function applyOptimisticDebtPayment<T extends DebtLike>(debts: T[], debtId: string, amount: number) {
  return debts.map((debt) => {
    if ((debt._id as any)?.toString?.() !== debtId) {
      return debt;
    }

    const nextBalance = Math.max(0, debt.currentBalance - amount);

    return {
      ...debt,
      currentBalance: nextBalance,
      remainingAmount: typeof debt.remainingAmount === "number" ? nextBalance : debt.remainingAmount,
      isCompleted: nextBalance <= 0,
    } as T;
  });
}

export function applyOptimisticGoalContribution<T extends GoalLike>(goals: T[], goalId: string, amount: number) {
  return goals.map((goal) => {
    if ((goal._id as any)?.toString?.() !== goalId) {
      return goal;
    }

    const nextSaved = Math.min(goal.targetAmount, goal.currentSaved + amount);

    return {
      ...goal,
      currentSaved: nextSaved,
      savedAmount: typeof goal.savedAmount === "number" ? nextSaved : goal.savedAmount,
      isCompleted: nextSaved >= goal.targetAmount,
    } as T;
  });
}
