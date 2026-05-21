# DevStatus

Terminal-styled status page builder for developers. Create a public status page for your projects and services, track service health, log incidents with minor, major, and critical severity levels, and post timestamped resolution updates. Backed by Supabase with GitHub auth. Part of the **DevEco** ecosystem — twelve connected developer tools, one unified Supabase backend.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (GitHub OAuth + Postgres) |
| Icons | React Icons (Remix set) |
| Font | JetBrains Mono |

---

## Features

- **Public status pages** — each user gets a shareable status page at `/@username`
- **Service monitoring** — add services with name, URL, and current health status
- **Status levels** — `operational`, `degraded`, `partial outage`, `major outage`, `maintenance`
- **Incident logging** — log incidents with title, severity (`minor`, `major`, `critical`), and lifecycle status
- **Incident lifecycle** — four stages: `investigating → identified → monitoring → resolved`
- **Timestamped updates** — post multiple update entries on each incident as it progresses
- **Public read** — status pages and incidents are publicly readable without login
- **Single-login SSO** — shared auth with the DevFolio ecosystem, no re-login required

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3007](http://localhost:3007).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEVFOLIO_URL=https://your-devfolio-url.vercel.app
```

### Supabase setup

1. Run the shared `schema.sql` from the DevFolio repo in the Supabase SQL Editor
2. Enable GitHub provider in **Authentication → Providers**
3. Add `http://localhost:3007/api/auth/callback` to **Authentication → URL Configuration → Redirect URLs**

---

## Routes

| Route | Description |
|---|---|
| `/` | Public index — all status pages |
| `/[username]` | Public status page — services + active incidents |
| `/dashboard` | Auth-gated editor — manage services and incidents |
| `/api/auth/callback` | OAuth callback — redeems SSO ticket or exchanges code |

---

## Project Structure

```
DevStatus/
├── app/
│   ├── layout.tsx               # root layout — fonts, navbar
│   ├── page.tsx                 # public index of all status pages
│   ├── globals.css              # design tokens
│   ├── [username]/page.tsx      # individual public status page
│   ├── dashboard/page.tsx       # auth-gated service + incident editor
│   └── api/auth/
│       └── callback/route.ts    # SSO ticket redemption + OAuth callback
├── components/
│   ├── layout/                  # Navbar
│   └── auth/                    # AuthButton
├── lib/
│   ├── supabase.ts              # browser Supabase client
│   ├── supabase-server.ts       # server Supabase client (cookie-based)
│   ├── db.ts                    # status page + incident CRUD
│   └── status.ts                # StatusLevel, Service, Incident types
├── middleware.ts                 # session refresh on every request
```

---

## Data Schema

```
status_pages
├── id           UUID
├── user_id      UUID → profiles
├── username     TEXT  (unique — used in URL)
├── display_name TEXT
├── services     JSONB ([{ name, url, status }])
├── created_at   TIMESTAMPTZ
└── updated_at   TIMESTAMPTZ

incidents
├── id             UUID
├── status_page_id UUID → status_pages
├── title          TEXT
├── status         TEXT  ('investigating' | 'identified' | 'monitoring' | 'resolved')
├── severity       TEXT  ('minor' | 'major' | 'critical')
├── updates        JSONB ([{ message, timestamp }])
├── created_at     TIMESTAMPTZ
└── resolved_at    TIMESTAMPTZ
```

---

## DevEco Ecosystem

DevStatus is part of a twelve-app ecosystem sharing one Supabase project and one GitHub login.

| App | Description |
|---|---|
| **DevFolio** | Developer portfolio hub — central auth provider |
| **DevBlog** | Write & publish dev posts |
| **DevResume** | Generate PDF resume |
| **DevRoadmap** | Skill learning tracks |
| **DevCalendar** | Schedule & goals |
| **DevTimer** | Pomodoro focus timer |
| **DevNotes** | Markdown notes |
| **DevStatus** | Project status pages — this repo |
| **DevEnv** | Environment vault |
| **DevWidgets** | Embeddable widgets |
| **DevShare** | Share & showcase code snippets |
| **DevPulse** | Dev activity & pulse tracker |

---

## Design System

Terminal / Linux / GitHub-inspired aesthetic.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#05070F` | scaffold background |
| `surface` | `#0B1020` | nav, cards |
| `neon-cyan` | `#00E5FF` | primary accents, operational status |
| `neon-green` | `#00FFA3` | fully operational |
| `neon-blue` | `#4D8CFF` | maintenance status |
| `neon-purple` | `#8A5BFF` | degraded status |
| `neon-red` | `#FF3D71` | outage, critical severity |
| `neon-amber` | `#FFB547` | partial outage, major severity |

---

## Roadmap

- [x] Public status page per user
- [x] Service health management
- [x] Incident logging with severity levels
- [x] Incident lifecycle stages
- [x] Timestamped update entries per incident
- [x] Supabase backend with public-read RLS
- [x] SSO with DevFolio ecosystem
- [ ] Uptime percentage calculation
- [ ] Email / webhook notifications on incident creation
- [ ] Embeddable status badge for other projects

---

## License

MIT