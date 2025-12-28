export const config = {
  preLoginId: process.env.IDF_ID || "",

  get azureEmail() {
    return `${this.preLoginId}@idf.il`;
  },
  azurePassword: process.env.IDF_PASSWORD || "",

  attendance: {
    location: "ביחידה",
  },

  authUrl: "https://www.miluim.idf.il/auth?redirect=/personalzone",
  baseUrl: "https://www.miluim.idf.il/personalzone",

  storageStatePath: "playwright/.auth/state.json",

  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "",
  emailRecipient: process.env.EMAIL_RECIPIENT || "",

  cacheKey: "form-auth-state-v1",

  mfaTimeoutMs: 180000,
};

export function validateConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!config.preLoginId) missing.push("IDF_ID");
  if (!config.azurePassword) missing.push("IDF_PASSWORD");

  return {
    valid: missing.length === 0,
    missing,
  };
}
