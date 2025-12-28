import { config } from "../config";

interface NotificationResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export async function notifySlack(result: NotificationResult): Promise<void> {
  if (!config.slackWebhookUrl) {
    console.log("Slack webhook not configured, skipping notification");
    return;
  }

  const emoji = result.success ? "✅" : "❌";
  const payload = {
    text: `${emoji} *Form Submission ${result.success ? "Success" : "Failed"}*`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} *Form Submission ${result.success ? "Success" : "Failed"}*\n${result.message}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Timestamp: ${result.timestamp}`,
          },
        ],
      },
    ],
  };

  await fetch(config.slackWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function notifyEmail(result: NotificationResult): Promise<void> {
  if (!config.emailRecipient) {
    console.log("Email recipient not configured, skipping notification");
    return;
  }

  console.log(`Email notification would be sent to: ${config.emailRecipient}`);
  console.log(
    `Subject: Form Submission ${result.success ? "Success" : "Failed"}`,
  );
  console.log(`Body: ${result.message}`);
}

export async function notify(result: NotificationResult): Promise<void> {
  await Promise.all([notifySlack(result), notifyEmail(result)]);
}
