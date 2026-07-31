# Accessibility Audit Report

**Date:** July 31, 2026  
**Branch:** `chore/testing-qa`  
**Tool:** axe-core via `@axe-core/playwright`  
**Scope:** Main public pages from `feat/ui-ux-redesign` — Landing (`/`), Login (`/login`), Register (`/register`)

---

## Scan Configuration

- **WCAG tags:** `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
- **Failure threshold:** `critical` and `serious` violations fail the test; `moderate` and `minor` are logged but non-failing.
- **Test file:** `e2e/accessibility.spec.ts`
- **Run command:** `npm run test:e2e` (requires `npm run dev` on `http://localhost:3000`)

---

## Results Summary

| Page | Critical | Serious | Moderate | Minor | Status |
|------|----------|---------|----------|-------|--------|
| Landing (`/`) | 0 | 0 | 0 | 0 | ✅ Pass |
| Login (`/login`) | 0 | 0 | 0 | 0 | ✅ Pass (after fix) |
| Register (`/register`) | 0 | 0 | 0 | 0 | ✅ Pass (after fix) |

---

## Violations Found and Fixed

### 1. Color Contrast — Login page (`/login`)

- **Rule:** `color-contrast` (serious)
- **Element:** The "Or use email" divider text
- **Issue:** `text-slate-400` (`#94a3b8`) on `bg-[#f1f5f9]` (`#f1f5f9`) produced a contrast ratio of **2.34:1**, below the WCAG 2 AA minimum of **4.5:1** for normal-size text.
- **Fix:** Changed the text color from `text-slate-400` to `text-slate-600` (`#475569`), which yields a contrast ratio of **~7.1:1**. Added `dark:text-slate-400` to preserve the dark-mode appearance (dark mode already had sufficient contrast).
- **File:** `src/app/(auth)/login/LoginForm.tsx`

### 2. Color Contrast — Register page (`/register`)

- **Rule:** `color-contrast` (serious)
- **Element:** The "Or create with email" divider text
- **Issue:** Same as above — `text-slate-400` on `bg-[#f1f5f9]` = 2.34:1 contrast.
- **Fix:** Same fix — changed to `text-slate-600` with `dark:text-slate-400` for dark mode.
- **File:** `src/app/(auth)/register/RegisterForm.tsx`

---

## Violations Intentionally Left Unfixed

**None.** All critical and serious violations reported by axe-core were fixed. No violations were deferred.

---

## Notes

- **Authenticated pages** (dashboard, expenses, debts, goals, history, settings) were not scanned with axe-core because they require an authenticated session against a running MongoDB instance. The e2e test in `e2e/finance-workflow.spec.ts` covers these pages functionally. A future improvement would be to add axe scans behind authentication.
- **Moderate/minor violations:** The scan reported zero moderate or minor violations on all three scanned pages.
- **Pre-existing lint warnings** in `LoginForm.tsx` and `RegisterForm.tsx` (unused imports `CardDescription`, `CardHeader`, `CardTitle`) are unrelated to accessibility and were not introduced by this audit.