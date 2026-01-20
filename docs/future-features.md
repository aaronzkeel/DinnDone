# Future Features

Ideas and features to revisit later.

---

## Email Authentication

**Status**: Deferred
**Priority**: Medium
**Current**: Google OAuth only

### Recommendation: Magic Link (Passwordless)

User enters email → receives login link → clicks to authenticate. No passwords to remember or reset.

### Implementation Steps

1. **Resend account** - Sign up at resend.com (free tier: 3,000 emails/month)
2. **Domain verification** - Add DNS records for your sending domain
3. **Environment variable** - Add `AUTH_RESEND_KEY` to Convex
4. **Update auth config** - Add Resend provider to `convex/auth.ts`
5. **UI updates** - Add email input field to login screen
6. **Verification flow** - Handle the magic link callback

### Files to Modify

- `convex/auth.ts` - Add Resend provider
- `src/components/SignInButton.tsx` - Add email input option

### Reference

- Convex Auth docs: https://labs.convex.dev/auth/config/passwords
- Resend: https://resend.com

---

*Add more future features below as needed*
