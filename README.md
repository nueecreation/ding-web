# Ding! - Instant Payments for Nigeria

Scan to pay. 3 steps, not 9. Any bank, no switching.

Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and NextAuth.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - From console.cloud.google.com
- `MONO_PUBLIC_KEY` / `MONO_SECRET_KEY` - From withmono.com/dashboard
- `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY` - From dashboard.paystack.com
- `NEXT_PUBLIC_MONO_PUBLIC_KEY` - Same as MONO_PUBLIC_KEY (public)

### 3. Set up the database

```bash
npm run db:generate
npm run db:push
```

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page with waitlist |
| `/app/auth` | Sign in (Google OAuth or phone OTP) |
| `/app/onboarding` | BVN verification and bank linking |
| `/app/home` | Home screen with mode toggle |
| `/app/receive` | Receive Money - QR generation |
| `/app/send` | Send Money - QR scanner |
| `/app/history` | Transaction history |
| `/p/[id]` | No-app payment page (for camera QR scans) |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth endpoints |
| `/api/auth/send-otp` | POST | Send phone OTP |
| `/api/waitlist` | POST | Join waitlist |
| `/api/bvn/verify` | POST | Verify BVN via Paystack |
| `/api/mono/exchange` | POST | Exchange Mono code for account |
| `/api/payments/create` | POST | Create payment request |
| `/api/payments/status` | GET | Check payment request status |
| `/api/payments/initiate` | POST | Initiate Paystack payment |
| `/api/payments/verify` | GET | Verify Paystack transaction |
| `/api/transactions` | GET | Get transaction history |

## Key decisions

- Secret keys (Paystack, Mono) are server-side only. Never exposed to browser.
- `NEXT_PUBLIC_MONO_PUBLIC_KEY` is the only client-side key, used for the Connect widget.
- QR codes embed the payment URL `/p/[requestId]`, not any sensitive data.
- QR codes expire in 5 minutes and are server-side invalidated on use.
- Ding! holds no funds at any point. Payments flow directly between linked accounts.
- BVN verification via Paystack's `/bank/resolve_bvn/` endpoint. CBN-standard KYC.
- Bank linking via Mono Connect widget. CBN-licensed open banking.

## Deploy to Vercel

```bash
vercel --prod
```

Set all environment variables in the Vercel dashboard before deploying.

## Testing

```bash
npm test
```

## License

Private. Ding! Technologies Ltd. All rights reserved.
