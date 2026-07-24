# PLATFORM-INSIGHTS — CyberKey Game Store/enterprise-platform
 
This document outlines the core technical decisions, data flow, and engineering rationales behind the CyberKey platform.
 
---
 
## 1. Project Overview & Data Layer
 
CyberKey is a digital storefront designed for video game license key distribution, featuring player onboarding, inventory ingestion, and an order processing pipeline.
 
* **Postgres via Prisma:** Data now lives in a real Postgres database hosted on Neon, accessed through Prisma 7 with the `@prisma/adapter-neon` driver adapter — Neon's serverless HTTP driver, so there's no persistent TCP pool to manage in a serverless-friendly deployment.
* **Schema:** `prisma/schema.prisma` defines `Player`, `GameProduct`, and `PurchaseOrder` with real foreign keys (`PurchaseOrder.gameId → GameProduct.id`, `PurchaseOrder.customerId → Player.id`) instead of loosely-typed string fields.
* **Prisma 7 Config Split:** Prisma 7 removed the `url` field from the `datasource` block in `schema.prisma` entirely — the connection string now lives in a separate `prisma.config.ts` at the project root, loaded via `dotenv/config`. The generator also no longer falls back to a bundled query engine binary by default; `PrismaClient` must always be constructed with an explicit `adapter` (see `lib/prisma.ts`), there's no connectionless fallback.
* **Idempotent Seeding:** `prisma/seed.ts` upserts the `admin`/`seller` player accounts by `playerEmail` on every run, independent of whether game/order data already exists. The original version short-circuited entirely if `gameProduct.count() > 0`, which meant a partially-seeded database (games present, accounts missing — e.g. from an interrupted first run) would silently skip re-creating the seed accounts. Upserting the accounts separately makes reruns safe.
* **Migration Note:** This replaces both the original in-memory prototype and an intermediate SQLite version. `lib/gameVault.ts` keeps the same function names it always had (`listGameProducts`, `createPurchaseOrder`, etc.) so the migration only touched the data layer and added `await` at call sites — no route or component logic changed.
---
 
## 2. Core Data Models (`lib/gameVault.ts`)
 
* **GameProduct** (Inventory Catalog): `id, title, retailPrice, availableKeys, genre, platform, ageRating, publisher`
* **PurchaseOrder** (Transaction Logs): `id, gameId, unitCount, deliveryState, customerId, grandTotal`
  * *State Pipeline:* Moves sequentially through `pending → processing → fulfilled → refunded`.
* **PlayerAccount** (Identity & Access): `id, playerEmail, hashedSecurityKey, accountTier`
  * *Privilege Tiers:* `admin` | `moderator` (manages Content Safety / Block Lists) | `player`
---
 
## 3. Authentication & Gatekeeping
 
* **Edge-Compatible JWT:** Session security uses the `jose` library because standard libraries like `jsonwebtoken` are incompatible with the Next.js Edge Runtime mühiti.
* **Cookie Isolation Matrix:** Tokens are stored under the custom key `gk_token` using `httpOnly: true`, `secure: true` (in production), and `sameSite: "strict"` to mitigate XSS and CSRF vectors.
* **Next.js 15 Async Headers:** Every authentication action explicitly triggers `await cookies()` upfront to prevent request context dropping during downstream async operations.
* **Centralized Middleware:** Stateless token verification is handled centrally in `middleware.ts` for `/api/vault/*`, `/api/orders/*`, `/api/allocation/*`, and `/dashboard/*`. Open endpoints like `/api/auth/*` are explicitly bypassed.
---
 
## 4. Decoupled Ingestion Layers (Actions vs. APIs)
 
* **Server Actions (`app/actions/`):** Processes `FormData` using native `"use server"` pipelines. This eliminates manual client-side fetch abstractions and leverages Progressive Enhancement.
* **API Routes (`app/api/`):** Exposes standard RESTful endpoints to provision clean integration points for external programmatic clients, automation scripts, and mobile platforms.
---
 
## 5. State Management & Synchronization
 
* **Client State:** Global state engines (e.g., Redux, Zustand) are omitted. Identity tracking is managed via a lightweight `PlayerSessionContext`.
* **Server State Synchronization:** Managed through `@tanstack/react-query`. The system uses short-polling (`refetchInterval: 8000`) inside the dashboard to keep data reactive without persistent socket overhead.
* **Cache Controls:** Configured with `staleTime: 30000` to prevent redundant network fetches when switching tabs or window focus.
* **Session Rehydration Bug (fixed):** `hydratePlayerSession()` originally returned `void`. The dashboard's mount effect called it, then checked `session.currentPlayer` inside the `.then()` callback to decide whether to redirect to `/login` — but `session` there was the value closed over from the render that scheduled the effect, not a live reference, so it always read the pre-hydration `null` even after `setCurrentPlayer` had already run. Every page refresh looked "logged out" even though the `gk_token` cookie and `/api/auth/me` were both valid. Fix: `hydratePlayerSession()` now returns a `boolean`, and the dashboard checks that return value directly instead of the stale closed-over context state.
---
 
## 6. Defensive Validation Strategy (`lib/validations/`)
 
All read/write boundaries are secured with strict Zod runtime schemas. When structural validation fails, the backend enforces a flattening mechanism:
 
```typescript
const fieldErrors = validatedFields.error.flatten().fieldErrors;
const allViolations = Object.values(fieldErrors).flat().filter(Boolean) as string[];
 
Engineering Rationale: Zod’s raw error stacks return deeply nested arrays. Flattening reduces anomalies into a predictable flat string[] array. This eliminates server-side crashes from missing properties and maps cleanly into the client-side error handler (outcome.violations?.[0]).
 
```
 
## 7. Next.js 15 & React 19 Paradigms
Async Context Mapping: Folder-level dynamic parameters ([id]/route.ts) are evaluated asynchronously (const { id } = await params;) per Next.js 15 structural standards.
 
Non-Blocking UI Transactions: Mutations on the frontend use React 19’s useTransition hook. Wrapping network submissions in startTransition maintains layout interactivity and keeps loading states fluid during backend latency.
 
## 8. Styling Framework Tokenization
The frontend implements Tailwind CSS v4 but extracts core theme configurations into CSS Custom Properties in globals.css (--gk-void, --gk-accent, --gk-panel).
 
Engineering Rationale: This keeps the layout easily themeable at the root CSS engine level without relying on bloated theme configuration files, making it simple to inject tokens directly via dynamic style variables (style={{ color: "var(--gk-accent)" }}).