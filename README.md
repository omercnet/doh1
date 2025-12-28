# 🪖 דו"ח 1 - IDF Daily Attendance Automation

Automated daily attendance form submission for IDF reservists using Playwright.

```
┌─────────────────────────────────────────────────────────────┐
│  🇮🇱                                                   🇮🇱  │
│   ╔═══╗ ╔═══╗ ╔═╗ ╔═╗   ╔═══╗                              │
│   ║   ║ ║   ║ ║ ║ ║ ║     ║                                │
│   ║   ║ ║   ║ ║ ╚═╝ ║     ║                                │
│   ║   ║ ║   ║ ║ ╔═╗ ║     ║                                │
│   ╚═══╝ ╚═══╝ ╚═╝ ╚═╝     ║                                │
│                                                             │
│   ⭐ Automate your מעקב נוכחות יומי ⭐                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What it does

- 🔐 Logs into miluim.idf.il with Azure AD authentication
- 📞 Handles MFA via phone call (you approve, it continues)
- 📝 Submits daily attendance form (דו"ח 1)
- 💾 Caches auth session to skip MFA on subsequent runs
- ⏰ Runs on schedule via GitHub Actions
- 📢 Notifies via Slack on success/failure

## 🛠️ Local Development

### Prerequisites

- [mise](https://mise.jdx.dev/) - Runtime version manager
- [fnox](https://github.com/jdx/fnox) - Secret management

### Setup

1. **Install dependencies:**

   ```bash
   mise install
   pnpm install
   npx playwright install chromium
   ```

2. **Configure secrets:**

   ```bash
   cp fnox.toml.example fnox.toml
   # Edit fnox.toml with your encrypted secrets
   # Or use fnox set to add them:
   fnox set IDF_ID
   fnox set IDF_PASSWORD
   ```

3. **Run locally (headed):**

   ```bash
   fnox run -- pnpm test:headed
   ```

   When MFA triggers, approve the phone call.

4. **Run headless:**
   ```bash
   fnox run -- pnpm test
   ```

## 🚀 GitHub Actions Setup

### Required Secrets

| Secret         | Description            |
| -------------- | ---------------------- |
| `IDF_ID`       | Your ID number (ת.ז.)  |
| `IDF_PASSWORD` | Your Azure AD password |

### Optional Secrets

| Secret              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `AGE_RECIPIENT`     | Age public key for encrypting failed test artifacts |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications                     |

### Schedule

Runs automatically Sunday-Thursday at 9:00 AM Israel time.

To run manually: Actions → Daily Attendance Form → Run workflow

### First Run

The first CI run (or after session expires) will require MFA:

1. Trigger the workflow
2. Wait for the phone call
3. Approve MFA
4. Session gets cached for future runs

## 🔧 Troubleshooting

### Decrypting Failed Test Artifacts

If a run fails, traces are encrypted and uploaded as artifacts.

```bash
# Download the artifact, then:
age -d -i ~/.config/fnox/age.txt test-results.tar.gz.age > test-results.tar.gz
tar -xzf test-results.tar.gz
npx playwright show-trace test-results/*/trace.zip
```

### Force Re-authentication

If the cached session is stale:

1. Go to Actions → Daily Attendance Form
2. Run workflow with "Force new login" checked

### Common Issues

| Issue             | Solution                                          |
| ----------------- | ------------------------------------------------- |
| MFA timeout       | Be ready to approve the call within 3 minutes     |
| Session expired   | Force re-login via workflow dispatch              |
| Selectors changed | Update selectors in `src/form/fill-attendance.ts` |

## 📁 Project Structure

```
src/
├── config.ts              # Environment config
├── auth/
│   └── login.ts           # Azure AD + MFA login flow
├── form/
│   └── fill-attendance.ts # Form submission logic
└── utils/
    └── notify.ts          # Slack/email notifications

tests/
└── test-1.spec.ts         # Main test orchestrator

.github/workflows/
└── playwright.yml         # CI workflow
```

## 📜 License

ISC

---

🎖️ _Made for מילואימניקים by מילואימניקים_ 🎖️
