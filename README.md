This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## ImgBB menu image uploads

1. Create an ImgBB API key from your ImgBB account's API page.
2. Add the key to `.env.local` in the `pizzahub-client` directory:

   ```env
   IMGBB_API_KEY=your_imgbb_api_key
   ```

   Do not use the `NEXT_PUBLIC_` prefix; the key must stay on the server.
3. Restart the Next.js development server. Vendors can then select a JPEG,
   PNG, WebP, or GIF image (up to 32 MB) from **Dashboard > Add Menu Item**.

The upload route sends the file to ImgBB and saves the returned image URL with
the menu item. New submissions start with `pending` status. Free vendors can
have up to three pending, submitted, or active items; Premium vendors have no
item limit. Accounts default to Free. Premium status is read from the
server-controlled `user.plan` field; connect this field to a trusted billing or
admin workflow before offering paid upgrades.

Vendors can edit, delete, and manage availability from **Dashboard > My Menu
Items**. Rejected items remain visible to their vendor but are omitted from
customer menu and item-detail responses. Customer orders are saved in MongoDB;
their vendor can accept or reject an order only while its status is `pending`.

The Free-plan quota check uses a MongoDB transaction, so `DB_URI` must point to
a replica set (MongoDB Atlas supports transactions).

## Stripe Premium subscription

Create a recurring Premium price in Stripe, then set these server-only values
in `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Configure the Stripe webhook URL as
`https://your-domain/api/stripe/webhook` and subscribe to
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`customer.subscription.updated`, and `customer.subscription.deleted`. For local
development, forward events with
`stripe listen --forward-to localhost:3000/api/stripe/webhook` and use the
webhook secret printed by the CLI. Restart Next.js after changing environment
values. Premium is activated only after a signed Stripe event updates the
vendor account.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
