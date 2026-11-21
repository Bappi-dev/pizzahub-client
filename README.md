# PizzaHub Client

PizzaHub is a role-based pizza ordering and delivery platform. Customers
discover approved local menu items, vendors manage their menu and orders,
and admins manage users, menu reviews, and transactions.

## Technology stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS
- Better Auth
- MongoDB
- Stripe Checkout
- ImgBB
- Framer Motion

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create `pizzahub-client/.env.local` with:

```env
DB_URI=mongodb_connection_string
BETTER_AUTH_SECRET=random_secure_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=google_o_auth_client_id
GOOGLE_CLIENT_SECRET=google_o_auth_client_secret
IMGBB_API_KEY=imgbb_api_key
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_PREMIUM_PRICE_ID=recurring_premium_price_id
STRIPE_WEBHOOK_SECRET=whsec_webhook_secret
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Do not commit `.env` or `.env.local`.

## Main features

- Better Auth email/password and Google authentication
- Customer, Vendor, and Admin role dashboards
- Role and blocked-account protection on protected routes
- Public Browse Menu search, category/location filters, and price sorting
- Approved/active public menu filtering
- Menu item details, customer order forms, cancellation, and status tracking
- Vendor menu CRUD, image upload, availability, and customer order actions
- Free plan limit of three active menu items
- Stripe Premium checkout and verified webhook plan updates
- JWT issuance and verification middleware
- Dark/light mode, toast notifications, responsive UI, and custom 404 page

## API query parameters

The public menu route supports:

- `search`: matches name, category, or location
- `category`: exact menu category
- `location`: exact menu location
- `sort=price-asc`: lowest price first
- `sort=price-desc`: highest price first

Example:

```text
/api/menu-items/public?search=pizza&category=Classic%20Pizzas&sort=price-asc
```

## JWT and authorization flow

1. Better Auth creates an authenticated session.
2. `/api/auth/token` validates that session and signs a five-minute JWT.
3. Protected Express routes receive `Authorization: Bearer <token>`.
4. Better Auth verifies signature, issuer, audience, and expiration through JWKS.
5. Resource ownership and role checks run after JWT/session validation.
6. Invalid or expired JWTs return `401`; forbidden users return `403`.

## Stripe webhook flow

Configure the webhook endpoint as `/api/stripe/webhook` and enable the relevant
Stripe subscription events. Premium is activated only when a signed webhook
event matches the vendor account. The success and cancel redirects lead to
role-protected payment state pages.

## Payment test card

Use Stripe test mode and the standard test card `4242 4242 4242 4242` with any
future expiry date and a valid CVC.

## Live and repository links

- Live site: `https://ADD_DEPLOYED_URL`
- Client repository: `https://github.com/Bappi-dev/pizzahub-client`
- Server repository: `https://github.com/Bappi-dev/pizzahub-server`

## Submission credentials

- Admin email: `ADD_ADMIN_EMAIL`
- Admin password: `ADD_ADMIN_PASSWORD`
