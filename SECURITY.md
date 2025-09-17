# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in this Planning Poker app, please report it by emailing the maintainer directly rather than opening a public issue.

**Contact**: kumarnarendiran2000@gmail.com

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Security Considerations

### Data Collection
- This app only collects minimal data: participant names and votes
- No personal information, emails, or passwords are stored
- All data is temporary and deleted when sessions end

### Firebase Security
- Uses Firebase Realtime Database for real-time features
- No authentication required - designed for simple team collaboration
- Room codes provide basic access control

### Local Development
- Never commit `.env` files with real Firebase credentials
- Use `.env.example` as a template for local setup
- Keep Firebase credentials secure in production

## Privacy
- No user tracking or analytics
- No persistent user data storage
- Sessions automatically clean up after 4 hours

For questions about security, contact the maintainer at the email above.