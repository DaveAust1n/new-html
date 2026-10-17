# MOBZENOX Lead Engine

An approval-first prospecting workspace for MOBZENOX ENTERPRISES. Built with Next.js for GitHub → Vercel deployment.

## Included
- Prospect discovery through Google Places Text Search API
- Lead review workspace (public listings are prospects, not confirmed demand)
- AI email draft generation using OpenAI
- Email send API protected by an explicit approval flag, using Resend
- Setup checklist and responsive dashboard
- No fabricated seed leads

## Environment variables (Vercel)
- `GOOGLE_PLACES_API_KEY`: enable Places API (New) and billing/restrictions in Google Cloud.
- `OPENAI_API_KEY`: generate personalized email drafts.
- `OPENAI_MODEL` (optional): defaults to `gpt-4o-mini`.
- `RESEND_API_KEY`: send approved email.
- `EMAIL_FROM`: verified sender identity on Resend.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: reserved for the next persistence/auth phase; do not expose service role keys to the browser.
- `HUNTER_API_KEY` (optional future integration): verify publicly sourced business email addresses.

## Run locally
```bash
npm install
npm run dev
```

## Important limitations
- Discovery is a business-directory search, not an oracle for who needs a service. Results must be qualified by a human.
- Google Places does not provide business email addresses. Verify recipient addresses from official public sources before outreach.
- This first MVP does not yet persist records to Supabase. The current lead list lives in browser memory and will reset on refresh. Add authenticated persistence and an audit log before multi-user or production use.
- The send endpoint checks the explicit approval flag, but production should add authenticated user sessions, rate limits, opt-out suppression, and a server-side audit trail before sending at scale.
- Respect applicable privacy/marketing laws, provider terms, and unsubscribe/opt-out requests. Do not use this system for unsolicited bulk mail.
