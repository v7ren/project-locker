# Project management (Next.js)

A self-hosted **[Next.js](https://nextjs.org)** app aimed at **project managers** and **small product or engineering teams** who need a lightweight place to keep **project materials together**: **Markdown** specs and notes, **PDFs** (contracts, one-pagers, architecture PDFs), and **other files** you drop under each project’s `docs/` folder (images, HTML, and more are handled by the document viewer). Each initiative gets stable URLs, an upload-friendly **dashboard**, optional **custom landing pages** (HTML or TSX for team-specific hubs), and **opt-in public links** when you need to share a doc or home page without a login.

Sign-in is optional: when auth env vars are set, the app gates the UI and APIs behind **email OTP** ([Resend](https://resend.com)); when they are not set, everything runs open for local use.

> **Deployment / security suggestion:** Prefer running this app on a **private LAN or other trusted network**, and **avoid** leaving it broadly exposed on the **public internet** for long periods. That reduces risk from misconfigured auth, public shares, or custom pages, and shrinks the attack surface from scanning, abuse, and malicious attempts.

**Traditional Chinese overview:** [README.md](./README.md)

---

## Who it’s for

- **Project managers** coordinating requirements, meeting notes, and PDF deliverables per initiative.
- **Small teams of developers** (or design + dev pods) sharing Markdown design docs, runbooks, and binary assets in one filesystem-backed workspace—without standing up a wiki or drive maze.

---

## What it does

- **Project list** at `/` — create projects (name → URL-safe slug), open home or dashboard.
- **Per-project home** at `/{slug}` — default landing, or `home/custom.html` (sandboxed iframe), or `home/custom.tsx` (live React preview via `react-live` / Sucrase).
- **Dashboard** at `/{slug}/dashboard` — tabs for custom home / TSX and docs file tree; upload, rename, delete under `docs/`.
- **Docs hub** at `/docs` — browse all projects’ `docs/` files; optional `?project={slug}` filter.
- **Markdown & document routes** — e.g. `/{slug}/md/...` for Markdown; `/{slug}/doc/...` for **PDF**, images, HTML, and other served files (plus parallel **`/public/...`** routes for published shares).
- **Internationalization** — UI strings in **English** and **Traditional Chinese** (`zh-TW`), driven by cookie / `Accept-Language` (see `src/lib/i18n/`).
- **Theme** — light / dark via client provider.

Metadata in `src/app/layout.tsx` describes the product as *per-project home pages and docs with stable URL paths*.

---

## Architecture (high level)

| Layer | Role |
|--------|------|
| **Next.js App Router** | Server components for data reads; client components for editors, dialogs, and previews. |
| **Filesystem** | Source of truth under `data/projects/{slug}/` (override with `PROJECT_DATA_ROOT`). |
| **`src/middleware.ts`** | Optional auth redirect, public viewer bypass, `/api/*` CORS helper when `DOMAIN` is set. |
| **`src/lib/projects.ts`** | CRUD for `project.json`, `docs/`, `home/`; safe path resolution (NFC / whitespace-tolerant doc paths). |
| **`src/lib/public-share.ts`** | `public-share.json` manifest: which `home` / `md/…` / `doc/…` keys are world-readable under `/{slug}/public/...`. |

There is **no bundled database**; backups are “copy the data directory.”

---

## On-disk layout

Default root: **`data/projects/`** (or `PROJECT_DATA_ROOT`).

```text
data/projects/
  {slug}/
    project.json          # { name, slug, createdAt }
    public-share.json     # optional: { "paths": ["home", "md/README.md", ...] }
    docs/                 # Markdown and other files served by doc/md routes
    home/
      custom.html         # optional: full-page iframe home
      custom.tsx          # optional: React snippet for live home preview
```

Slugs are normalized to lowercase `[a-z0-9-]+` when created by the app.

---

## URL map

| Path | Purpose |
|------|---------|
| `/` | Project list, create project |
| `/docs` | Cross-project docs browser (`?project=` filter) |
| `/login` | OTP email sign-in when auth is configured |
| `/{slug}` | Project home |
| `/{slug}/dashboard` | Manage `home/*` and `docs/*` |
| `/{slug}/md/[[...path]]` | Markdown viewer (authenticated when auth on) |
| `/{slug}/doc/[[...path]]` | Document viewer (e.g. **PDF**, images, HTML) |
| `/{slug}/public`, `/{slug}/public/md/...`, etc. | **Public** viewers — only if listed in `public-share.json` |

**API** (representative):

- `GET/POST /api/projects` — list / create
- `DELETE /api/projects/{slug}` — remove project tree
- `GET/PATCH …/api/projects/{slug}/docs`, `home`, `public-share`, etc. — see `src/app/api/projects/`
- `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/logout` — session flow

---

## Authentication

Configured only when **`getAuthEnvConfig()`** succeeds (`src/lib/auth/config.ts`): `AUTH_SECRET` (≥16 chars), non-empty **`AUTH_ALLOWED_EMAILS`**, **`RESEND_API_KEY`**, and **`RESEND_FROM`** (or `AUTH_RESEND_FROM`).

When configured:

- Unauthenticated users are redirected to **`/login`** (with `next=` return path), except:
  - **`/{slug}/public/...`** public viewer paths (slug must not be reserved: `api`, `login`, `docs`),
  - **`/api/auth/send-otp`** and **`/api/auth/verify-otp`**.
- Other **`/api/*`** calls return **401** without a valid session cookie.

When **not** configured, the app does not enforce login (useful for local sandboxes).

---

## Public sharing

Editors can maintain **`public-share.json`** (via the in-app share UI) so specific resources are reachable without login:

- Keys like **`home`**, **`md/{docs-relative-path}`**, **`doc/{docs-relative-path}`** (see `src/lib/public-share.ts`).

Only manifest-listed keys are served on the **`/public/...`** routes.

---

## Getting started

```bash
npm install
cp .env.example .env.local
# Edit .env.local — see Environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
```

---

## Environment variables

Copy **`.env.example`** → **`.env.local`**. Never commit `.env.local`.

| Variable | Required for auth | Description |
|----------|-------------------|-------------|
| `AUTH_SECRET` | Yes | Session signing secret, **minimum 16 characters**. |
| `AUTH_ALLOWED_EMAILS` | Yes | Allowlisted sign-in addresses (comma, `;`, or newline). |
| `RESEND_API_KEY` | Yes | Resend API key for OTP email. |
| `RESEND_FROM` or `AUTH_RESEND_FROM` | Yes | From address (must match a verified domain in Resend, or use Resend’s onboarding constraints for testing). |
| `DOMAIN` | No | If set, must equal the browser **`Origin`** exactly (scheme + host, no trailing slash) for **`/api/*` CORS** (`src/lib/cors.ts`). Also feeds `allowedDevOrigins` in `next.config.ts`. |
| `PROJECT_DATA_ROOT` | No | Projects directory; default `./data/projects`. |
| `AUTH_ALLOWLIST_MAX` | No | Cap how many parsed allowlist emails are trusted. |
| `NEXT_ALLOWED_DEV_ORIGINS` | No | Extra dev origins (comma-separated) for Next.js dev cross-origin behavior. |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

---

## Next.js in this repo

This workspace pins a **Next.js 16** stack that may differ from older tutorials. Before changing framework behavior, read the in-repo guide under `node_modules/next/dist/docs/` and any deprecation notes (see **`AGENTS.md`** at the repo root).

---

## Deployment notes

- Set the same auth and Resend variables as in production.
- Align **`DOMAIN`** with your real site origin for API clients that rely on cookies + CORS.
- Mount a persistent volume or set **`PROJECT_DATA_ROOT`** so project data survives restarts.
- Official platform notes: [Next.js deploying](https://nextjs.org/docs/app/building-your-application/deploying).

---

## License

`private: true` in `package.json` — treat as a personal / internal project unless you add a license file.
