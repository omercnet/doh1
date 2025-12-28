import { Page, BrowserContext } from "@playwright/test";
import { config } from "../config";
import * as fs from "fs";

export async function doPreLogin(page: Page): Promise<boolean> {
  console.log("Pre-login: Navigating to auth page...");
  await page.goto(config.authUrl);

  console.log("Pre-login: Filling ID number...");
  await page
    .getByRole("spinbutton", { name: 'מספר ת"ז' })
    .fill(config.preLoginId);

  console.log("Pre-login: Clicking login button...");
  const popupPromise = page
    .waitForEvent("popup", { timeout: 5000 })
    .catch(() => null);
  await page.getByRole("button", { name: "כניסה עם סיסמה קבועה" }).click();

  const popup = await popupPromise;

  if (!popup) {
    console.log(
      "Pre-login: No popup - session is valid, waiting for redirect...",
    );
    await page.waitForURL((url) => url.pathname === "/personalzone", {
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle");
    return true;
  }

  console.log("Pre-login: Popup opened - checking if SSO auto-completes...");

  const emailField = popup.getByRole("textbox", {
    name: "תעודת הזהות שלכם בסיומת @idf.",
  });
  const needsFullLogin = await emailField
    .waitFor({ state: "visible", timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!needsFullLogin) {
    console.log("Pre-login: SSO auto-completed, waiting for redirect...");
    await page.waitForURL((url) => url.pathname === "/personalzone", {
      timeout: 30000,
    });
    await page.waitForLoadState("networkidle");
    return true;
  }

  console.log("Pre-login: Need full login");
  await doFullLogin(popup, page);
  return true;
}

async function doFullLogin(popup: Page, mainPage: Page): Promise<void> {
  const emailField = popup.getByRole("textbox", {
    name: "תעודת הזהות שלכם בסיומת @idf.",
  });

  console.log("Login: Filling Azure email...");
  await emailField.fill(config.azureEmail);
  await popup.getByRole("button", { name: "Next" }).click();

  console.log("Login: Filling password...");
  await popup
    .getByRole("textbox", { name: "Enter the password for" })
    .fill(config.azurePassword);
  await popup.getByRole("button", { name: "Sign in" }).click();

  console.log("Login: Waiting for MFA or Stay Signed In page...");

  const mfaText = popup.getByText("Verify your identity");
  const staySignedInButton = popup.getByRole("button", { name: "Yes" });

  const isMfaPage = await mfaText
    .waitFor({ state: "visible", timeout: 30000 })
    .then(() => true)
    .catch(() => false);

  if (isMfaPage) {
    console.log("MFA: Clicking phone call option...");
    const callOption = popup.getByText(/Call \+/);
    await callOption.click({ timeout: 10000 });

    console.log(
      `MFA: Phone call initiated. Waiting up to ${config.mfaTimeoutMs / 1000}s for you to approve...`,
    );
    console.log("MFA: >>> APPROVE THE PHONE CALL NOW <<<");

    await staySignedInButton.waitFor({
      state: "visible",
      timeout: config.mfaTimeoutMs,
    });
    console.log("MFA: Approved! Continuing...");
  }

  console.log("Login: Clicking Stay Signed In...");
  await staySignedInButton.click({ timeout: 10000 });

  console.log("Login: Waiting for redirect to personal zone...");
  await mainPage.waitForURL((url) => url.pathname === "/personalzone", {
    timeout: 30000,
  });

  await mainPage.waitForLoadState("networkidle");
  console.log("Login: Complete!");
}

export async function saveAuthState(context: BrowserContext): Promise<void> {
  const dir = config.storageStatePath.split("/").slice(0, -1).join("/");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await context.storageState({ path: config.storageStatePath });
}

export function hasStoredAuthState(): boolean {
  return fs.existsSync(config.storageStatePath);
}
