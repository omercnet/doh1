import { test } from "@playwright/test";
import { config, validateConfig } from "../src/config";
import { doPreLogin, saveAuthState, hasStoredAuthState } from "../src/auth/login";
import { submitAttendance } from "../src/form/fill-attendance";
import { notify } from "../src/utils/notify";

test.describe("Daily Attendance Form", () => {
  test.beforeAll(() => {
    const validation = validateConfig();
    if (!validation.valid) {
      throw new Error(`Missing required env vars: ${validation.missing.join(", ")}`);
    }
  });

  test("submits daily attendance", async ({ browser }) => {
    const contextOptions = hasStoredAuthState() ? { storageState: config.storageStatePath } : {};

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    const timestamp = new Date().toISOString();

    try {
      await doPreLogin(page);
      await saveAuthState(context);
      await submitAttendance(page);

      await notify({
        success: true,
        message: "Daily attendance submitted successfully",
        timestamp,
      });
    } catch (error) {
      await notify({
        success: false,
        message: `Failed to submit attendance: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp,
      });
      throw error;
    } finally {
      await context.close();
    }
  });
});
