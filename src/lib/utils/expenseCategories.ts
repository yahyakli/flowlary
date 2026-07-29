import { ExpenseCategory } from "@/lib/db/types/Expense";

export const EXPENSE_CATEGORY_OPTIONS = Object.values(ExpenseCategory);

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Housing]: "Housing/Rent",
  [ExpenseCategory.Food]: "Food",
  [ExpenseCategory.Transport]: "Transport",
  [ExpenseCategory.Utilities]: "Utilities",
  [ExpenseCategory.Healthcare]: "Health/Gym",
  [ExpenseCategory.Education]: "Education",
  [ExpenseCategory.Entertainment]: "Entertainment",
  [ExpenseCategory.Subscriptions]: "Subscriptions",
  [ExpenseCategory.Clothing]: "Clothing",
  [ExpenseCategory.PersonalCare]: "Personal Care",
  [ExpenseCategory.PhoneInternet]: "Phone/Internet",
  [ExpenseCategory.Insurance]: "Insurance",
  [ExpenseCategory.Travel]: "Travel",
  [ExpenseCategory.GiftsDonations]: "Gifts/Donations",
  [ExpenseCategory.DebtPayment]: "Debt Payment",
  [ExpenseCategory.SavingsTransfer]: "Savings Transfer",
  [ExpenseCategory.MiscellaneousOther]: "Miscellaneous/Other",
};

export function getCategoryLabel(category: ExpenseCategory) {
  return CATEGORY_LABELS[category] ?? category;
}

export function buildCategorySuggestions(recentCategories: ExpenseCategory[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const recent = recentCategories.filter(Boolean);
  const others = EXPENSE_CATEGORY_OPTIONS.filter((category) => !recent.includes(category));

  const ranked = [...recent, ...others].filter((category) => {
    if (!normalizedQuery) return true;

    return getCategoryLabel(category).toLowerCase().includes(normalizedQuery);
  });

  return ranked;
}
