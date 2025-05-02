# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Travel-Rizz, please report it responsibly by emailing terrancehah@gmail.com.
We will respond as quickly as possible and work with you to address the issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| older   | :x:                |

## Security Policy

- All sensitive keys and secrets are managed via environment variables and never committed to the repository.
- API keys must be restricted to production and development domains only.
- User data is never logged or exposed in error messages.

## Best Practices for Users

- Always keep your dependencies up-to-date.
- Never share your API keys or secrets.
- Review your `.env` and `.env.local` files to ensure no secrets are committed.

Thank you for helping keep Travel-Rizz and its users safe!
