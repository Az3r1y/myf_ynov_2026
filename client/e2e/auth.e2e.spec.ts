import { expect, test } from "@playwright/test";

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}@example.com`;
}

test("shows Signup button and can click it", async ({ page }) => {
  await page.goto("/");
  const signupButton = page.getByTestId("signup-button");
  await expect(signupButton).toBeVisible();
  await signupButton.click();
  await expect(page.getByTestId("signup-submit-button")).toBeVisible();
});

test("submits signup form and shows success toast", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("signup-button").click();

  await page.getByTestId("signup-email-input").fill(uniqueEmail("signup"));
  await page.getByTestId("signup-password-input").fill("supersecret123");
  await page.getByTestId("signup-submit-button").click();

  await expect(page.getByTestId("auth-toast")).toContainText("Signup successful");
});

test("logs in and displays dashboard", async ({ page }) => {
  const email = uniqueEmail("login");
  const password = "supersecret123";

  await page.goto("/");
  await page.getByTestId("signup-button").click();
  await page.getByTestId("signup-email-input").fill(email);
  await page.getByTestId("signup-password-input").fill(password);
  await page.getByTestId("signup-submit-button").click();
  await expect(page.getByTestId("auth-toast")).toContainText("Signup successful");

  await page.getByTestId("switch-login-button").click();
  await page.getByTestId("login-email-input").fill(email);
  await page.getByTestId("login-password-input").fill(password);
  await page.getByTestId("login-submit-button").click();

  await expect(page.getByTestId("dashboard")).toBeVisible();
  await expect(page.getByText("Dashboard")).toBeVisible();
});
