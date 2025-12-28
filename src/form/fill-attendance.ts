import { Page } from "@playwright/test";
import { config } from "../config";

const REPORT_URL = "https://www.miluim.idf.il/personalzone/milforms/Report1";

export async function navigateToAttendanceForm(page: Page): Promise<void> {
  console.log("Form: Navigating to Report1...");
  await page.goto(REPORT_URL);
  await page.waitForLoadState("networkidle");
}

export async function isAlreadySubmitted(page: Page): Promise<boolean> {
  const existsText = page.getByText("קיים דיווח");
  return existsText.isVisible({ timeout: 3000 }).catch(() => false);
}

export async function fillAttendanceForm(page: Page): Promise<void> {
  console.log("Form: Filling attendance form...");
  await page.getByRole("button", { name: 'בשמ"פ', exact: true }).click();
  await page.getByRole("radio", { name: config.attendance.location }).check();
  await page.getByRole("button", { name: "שליחת הבקשה" }).click();
}

export async function submitAttendance(page: Page): Promise<boolean> {
  await navigateToAttendanceForm(page);

  if (await isAlreadySubmitted(page)) {
    console.log("Form: Already submitted today ✓");
    return false;
  }

  await fillAttendanceForm(page);
  console.log("Form: Submitted successfully ✓");
  return true;
}
