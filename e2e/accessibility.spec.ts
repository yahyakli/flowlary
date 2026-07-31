import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated accessibility scans using axe-core via Playwright.
 *
 * These scans cover the main public pages from the feat/ui-ux-redesign work:
 *   - Landing page (/)
 *   - Login page (/login)
 *   - Register page (/register)
 *
 * Authenticated dashboard pages require a running MongoDB + session and are
 * covered by the finance-workflow.spec.ts e2e test; the axe scan focuses on
 * the public surfaces that are always reachable.
 *
 * Only critical and serious violations are treated as failures. Moderate/minor
 * issues are reported but do not fail the build.
 *
 * Prerequisites:
 *   - The app is running (npm run dev) on http://localhost:3000
 *   - @axe-core/playwright is installed
 */

const PAGES = [
  { name: "Landing page", url: "/" },
  { name: "Login page", url: "/login" },
  { name: "Register page", url: "/register" },
];

for (const { name, url } of PAGES) {
  test(`${name} (${url}) has no critical or serious accessibility violations`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalAndSerious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (criticalAndSerious.length > 0) {
      const summary = criticalAndSerious
        .map(
          (v) =>
            `  [${v.impact}] ${v.id}: ${v.description}\n` +
            `    Help: ${v.helpUrl}\n` +
            `    Nodes: ${v.nodes.length}\n` +
            v.nodes
              .slice(0, 3)
              .map((n) => `      - ${n.target.join(", ")}: ${n.failureSummary}`)
              .join("\n")
        )
        .join("\n");

      throw new Error(
        `Found ${criticalAndSerious.length} critical/serious accessibility violation(s) on ${url}:\n${summary}`
      );
    }

    // Also log moderate/minor violations for visibility (non-failing).
    const moderateAndMinor = results.violations.filter(
      (v) => v.impact === "moderate" || v.impact === "minor"
    );

    if (moderateAndMinor.length > 0) {
      console.log(
        `\n[axe] ${moderateAndMinor.length} moderate/minor violation(s) on ${url} (non-failing):`,
        moderateAndMinor.map((v) => `${v.id} (${v.impact})`)
      );
    }

    expect(criticalAndSerious).toHaveLength(0);
  });
}