# Rent PS App

A Next.js + Prisma + MySQL app for managing PlayStation rental operations (devices, sessions, snacks, employees, payments, and transactions).

## Requirements

- Node.js 20+
- `pnpm` (recommended) or `npm`
- MySQL 8.0 (Docker Compose file included)

## Setup (Local Development)

1. Install dependencies:

```bash
pnpm install
```

2. Start MySQL with Docker (optional but recommended):

```bash
docker compose up -d
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` to match your MySQL instance.

4. Apply database migrations:

```bash
pnpm exec prisma migrate deploy
```

5. Seed the database:

```bash
pnpm exec prisma db seed
```

Note: the seed script clears existing data in the seeded tables.

## Run the App

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

## Seeded Login

Use any seeded employee username with the default password:

- Default password: `password123`
- Example username: `@rizkymahendra`
