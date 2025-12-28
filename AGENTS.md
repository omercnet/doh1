# Agent Instructions for doh1

## Overview

This is a Playwright automation tool for submitting IDF daily attendance forms (דו"ח 1). It handles sensitive military authentication credentials.

## CRITICAL: Security Rules

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  NEVER COMMIT SECRETS - THIS IS NON-NEGOTIABLE  ⚠️      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FORBIDDEN in commits:                                      │
│  • IDF_ID (Israeli ID numbers - 9 digits)                   │
│  • IDF_PASSWORD (Azure AD passwords)                        │
│  • AGE_RECIPIENT private keys                               │
│  • SLACK_WEBHOOK_URL                                        │
│  • fnox.toml (contains encrypted secrets)                   │
│  • Any file in playwright/.auth/                            │
│  • Any .age files containing private keys                   │
│                                                             │
│  If you see credentials in code/output, STOP and warn user. │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Files That MUST Stay Gitignored

- `fnox.toml` - Local secret store
- `playwright/.auth/` - Cached auth sessions with tokens
- `test-results/` - May contain screenshots with PII

### Safe to Commit

- `fnox.toml.example` - Template only (no real values)
- `.github/workflows/` - References `${{ secrets.* }}` only
- Source code in `src/`

## Architecture

```
src/
├── config.ts              # Env vars (reads from process.env, never hardcoded)
├── auth/login.ts          # Azure AD + MFA flow
├── form/fill-attendance.ts # Form navigation and submission
└── utils/notify.ts        # Slack notifications

tests/
└── test-1.spec.ts         # Main test orchestrator
```

## Local Development

**Secrets are managed via fnox (age-encrypted):**

```bash
# Secrets live in fnox.toml (gitignored)
# Run commands with fnox to inject env vars:
mise exec -- fnox run -- pnpm test:headed
```

**NEVER use real credentials in test files or hardcode them anywhere.**

## CI/CD

GitHub Actions uses repository secrets directly:

- `IDF_ID`, `IDF_PASSWORD` - Required
- `AGE_RECIPIENT`, `SLACK_WEBHOOK_URL` - Optional

Auth state is cached between runs to minimize MFA prompts.

## Making Changes

### Safe Changes

- Selector updates in `src/form/fill-attendance.ts`
- Timeout adjustments in `src/config.ts`
- Workflow schedule changes
- Adding new notification channels

### Require Extra Caution

- Changes to `src/auth/login.ts` - Test thoroughly, MFA flow is sensitive
- Changes to auth caching logic - Can break session persistence
- Adding new env vars - Update both `fnox.toml.example` and README

## Testing

```bash
# Local with browser visible (for debugging)
mise exec -- fnox run -- pnpm test:headed

# Local headless
mise exec -- fnox run -- pnpm test

# CI runs automatically Sun-Thu 9AM Israel time
```

## If Something Goes Wrong

1. **Auth failures**: May need to force re-login (clear cache)
2. **Selector changes**: IDF site may have updated, check element selectors
3. **MFA timeout**: User needs to approve phone call within 3 minutes

## Template Repo Note

This is a template repository. Users fork it and add their own credentials via GitHub Secrets. Never assume credentials exist in the codebase - they're always injected at runtime.
