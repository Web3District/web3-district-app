<h1 align="center">Web3 District</h1>

<p align="center">
  <strong>Web3 District – your GitHub profile as a 3D building in an interactive city.</strong>
</p>

## See it in your browser

1. **URL (after the server is running):** **[http://localhost:3001](http://localhost:3001)**
2. **One command** (starts dev + opens the browser on macOS): `npm run dev:open`
3. **Double-click** (macOS): `Open Web3 District.command` in this folder (Finder → double-click; first time: right-click → Open if macOS blocks it).
4. **Finder bookmark** (macOS): double-click `Web3 District (localhost).webloc` to open that URL in your default browser (start the dev server first).

Fill in **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** in `.env.local`, or the home page will show a client error (Supabase is required to boot the app).

<p align="center">
  <a href="http://localhost:3001">Open http://localhost:3001</a> (with <code>npm run dev</code> running)
</p>

<p align="center">
  <img src="public/og-image.png" alt="Web3 District — Where Code Builds Cities" width="800" />
</p>

---

## What is Web3 District?

Web3 District transforms every GitHub profile into a unique pixel art building. The more you contribute, the taller your building grows. Explore an interactive 3D city, fly between buildings, and discover developers from around the world.

This project is a local test clone based on [Git City](https://github.com/srizzon/git-city) (no on-chain features in this phase).

## Features

- **3D Pixel Art Buildings** — Each GitHub user becomes a building with height based on contributions, width based on repos, and lit windows representing activity
- **Free Flight Mode** — Fly through the city with smooth camera controls, visit any building, and explore the skyline
- **Profile Pages** — Dedicated pages for each developer with stats, achievements, and top repositories
- **Achievement System** — Unlock achievements based on contributions, stars, repos, referrals, and more
- **Building Customization** — Claim your building and customize it with items from the shop (crowns, auras, roof effects, face decorations)
- **Social Features** — Send kudos, gift items to other developers, refer friends, and see a live activity feed
- **Compare Mode** — Put two developers side by side and compare their buildings and stats
- **Share Cards** — Download shareable image cards of your profile in landscape or stories format

<!-- TODO: Add screenshots -->
<!-- ![City Overview](assets/screenshot-city.png) -->
<!-- ![Profile Page](assets/screenshot-profile.png) -->
<!-- ![Compare Mode](assets/screenshot-compare.png) -->

## How Buildings Work

| Metric         | Affects           | Example                                |
|----------------|-------------------|----------------------------------------|
| Contributions  | Building height   | 1,000 commits → taller building        |
| Public repos   | Building width    | More repos → wider base                |
| Stars          | Window brightness | More stars → more lit windows           |
| Activity       | Window pattern    | Recent activity → distinct glow pattern |

Buildings are rendered with instanced meshes and a LOD (Level of Detail) system for performance. Close buildings show full detail with animated windows; distant buildings use simplified geometry.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- **3D Engine:** [Three.js](https://threejs.org) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) + [drei](https://github.com/pmndrs/drei)
- **Database & Auth:** [Supabase](https://supabase.com) (PostgreSQL, GitHub OAuth, Row Level Security)
- **Payments:** [Stripe](https://stripe.com) (optional for local testing)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4 with pixel font (Silkscreen)
- **Hosting:** [Vercel](https://vercel.com)

## Getting Started

```bash
# Clone upstream (or use this repo)
git clone https://github.com/srizzon/git-city.git web3-district-app
cd web3-district-app

# Install dependencies
npm install

# Set up environment variables

# Linux / macOS
cp .env.example .env.local

# Windows (Command Prompt)
copy .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local

# Fill in your environment variables

# Run the dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to see the city.

## Environment Setup

After copying `.env.example` to `.env.local`, fill in these values:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`
- `ADMIN_GITHUB_LOGINS` if you want access to `/admin/ads`

### Where to find the Supabase values

Open your Supabase project dashboard, then go to `Project Settings -> API`.

- `NEXT_PUBLIC_SUPABASE_URL`: your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: the service role key for server-side admin access

Apply SQL migrations from `supabase/migrations` to your Supabase project.

For local GitHub login to work, you also need to configure the GitHub OAuth provider in Supabase and add your local callback URL if required by your setup.

### Where to find the GitHub token

Open GitHub and go to `Settings -> Developer settings -> Personal access tokens`.

- Fine-grained tokens are recommended if you only want to grant the minimum repository/profile access this app needs.
- Classic tokens also work if that fits your setup better.

Create a token, copy it once, and place it in `GITHUB_TOKEN` inside `.env.local`.

### Optional: mock GitHub API

Set `MOCK_GITHUB=1` in `.env.local` to use dummy GitHub stats for testing without hitting the API.

### Production build

`npm run build` expects valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and other server keys where routes need them). Empty placeholders can fail during static generation. Configure Supabase first, apply `supabase/migrations`, then build.

## License

[AGPL-3.0](LICENSE) — Upstream Git City is AGPL; any public deployment must share the source code.

---

<p align="center">
  Upstream by <a href="https://x.com/samuelrizzondev">@samuelrizzondev</a>
</p>
