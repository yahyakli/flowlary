import { describe, expect, it } from "vitest";
import { ExpenseCategory } from "@/lib/db/types/Expense";
import { buildCategorySuggestions, getCategoryLabel } from "@/lib/utils/expenseCategories";

describe("buildCategorySuggestions", () => {
  it("prioritizes recent categories before other matches", () => {
    const recent = [ExpenseCategory.Food, ExpenseCategory.Transport];

    const suggestions = buildCategorySuggestions(recent, "");

    expect(suggestions.slice(0, 2)).toEqual([ExpenseCategory.Food, ExpenseCategory.Transport]);
  });

  it("filters matching categories by the search query", () => {
    const suggestions = buildCategorySuggestions([], "food");

    expect(suggestions).toEqual([ExpenseCategory.Food]);
  });

  it("returns a readable label for each category", () => {
    expect(getCategoryLabel(ExpenseCategory.Housing)).toBe("Housing/Rent");
  });
});
