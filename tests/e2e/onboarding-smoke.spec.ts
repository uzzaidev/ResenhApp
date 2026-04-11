import { expect, test } from "@playwright/test";
import { cleanupInviteFixture, createInviteFixture } from "./helpers/db";

test.describe("Onboarding Smoke", () => {
  test("signup -> onboarding -> join group -> pick modality -> conclude", async ({ page }) => {
    test.setTimeout(120000);

    const fixture = await createInviteFixture("onboarding");
    const unique = Date.now();
    const email = `e2e-onboarding-${unique}@example.com`;
    const password = "password123";

    try {
      await page.goto("/auth/signup");
      await page.fill("#name", `E2E User ${unique}`);
      await page.fill("#email", email);
      await page.fill("#password", password);
      await page.fill("#confirmPassword", password);
      await page.getByRole("button", { name: "Criar conta gratis" }).click();
      try {
        await page.waitForURL(/\/auth\/signin/, { timeout: 45000 });
      } catch {
        const errorContainer = page.locator(".text-red-600").first();
        const signupErrorText = (await errorContainer.innerText().catch(() => "")).trim();
        throw new Error(
          `Signup nao redirecionou para /auth/signin. Mensagem: ${signupErrorText || "sem mensagem"}`
        );
      }

      await page.fill("#email", email);
      await page.fill("#password", password);
      await page.getByRole("button", { name: "Entrar" }).click();

      await page.waitForURL(/\/(dashboard|onboarding\/step\/1)/, { timeout: 45000 });
      if (!/\/onboarding\/step\/1/.test(page.url())) {
        await page.goto("/onboarding/step/1?returnTo=/dashboard");
      }

      await expect(page.getByText("Onboarding - Etapa 1/4")).toBeVisible();
      await page.getByRole("link", { name: "Comecar onboarding" }).click();

      await page.waitForURL(/\/onboarding\/step\/2/, { timeout: 10000 });
      await page.getByRole("button", { name: "Entrar com Convite" }).click();
      await page.fill("#invite-code", fixture.inviteCode);
      await page.getByRole("button", { name: "Entrar e Continuar" }).click();

      await page.waitForURL(/\/onboarding\/step\/3/, { timeout: 30000 });
      await page.getByRole("button", { name: "Futsal", exact: true }).click();
      await page.getByRole("button", { name: "Continuar" }).click();

      await page.waitForURL(/\/onboarding\/step\/4/, { timeout: 15000 });
      await page.getByRole("button", { name: "Concluir onboarding" }).click();

      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      await expect(page).toHaveURL(/\/dashboard/);

      const onboardingResponse = await page.request.get("/api/onboarding");
      expect(onboardingResponse.ok()).toBeTruthy();
      const onboardingData = await onboardingResponse.json();
      expect(onboardingData.onboardingCompleted).toBeTruthy();
      expect(Array.isArray(onboardingData.onboardingModalities)).toBeTruthy();
      expect(onboardingData.onboardingModalities).toContain("Futsal");
    } finally {
      await cleanupInviteFixture(fixture.groupId, email);
    }
  });
});
