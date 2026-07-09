# CyberVault

A secure knowledge management platform for cybersecurity professionals. Built with Next.js 15, TypeScript, and Tailwind CSS.

![CyberVault](https://img.shields.io/badge/Version-1.0.0-black?style=flat-square) ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript) ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

- **Notes** - Rich text editor with TipTap, tags, pinning, and auto-save
- **Engagements** - Manage pentest engagements with targets, scope, and checklists
- **Vulnerability Tracking** - Full vuln lifecycle with CVSS scoring, CWE/OWASP mapping
- **Payload Library** - Organized payload database with categories and copy-to-clipboard
- **Tool Reference** - Command reference with one-click copy
- **Checklists** - Interactive checklists with progress tracking
- **Reports** - Markdown-based report editor with export
- **CVE Tracking** - Track and monitor CVEs with NVD integration
- **Bookmarks** - Save and organize security resources
- **Screenshots** - Screenshot management with fullscreen viewer
- **Templates** - Reusable templates for notes, checklists, and reports
- **Recon Workspace** - Organize reconnaissance data by type and engagement
- **Archive** - Soft-delete and restore functionality
- **Command Palette** - Quick navigation with `Ctrl+K`

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| UI Components | Radix UI + Custom shadcn/ui |
| Rich Text | TipTap |
| Database | PostgreSQL 16 |
| Icons | Lucide React |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- PostgreSQL 16+ (or use Docker)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/cybervault.git
cd cybervault
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://cybervault:cybervault_secret_2024@localhost:5432/cybervault
```

4. **Initialize the database**

```bash
npm run db:init
```

5. **Start the development server**

```bash
npm run dev
```

The app will be available at **http://localhost:3333**

### Docker Setup

1. **Start with Docker Compose**

```bash
docker compose up -d
```

This will start both PostgreSQL and the CyberVault app.

2. **Initialize the database**

```bash
docker compose exec app node scripts/init-db.js
```

## Project Structure

```
CyberVault/
├── public/                    # Static assets
├── scripts/
│   ├── docker-init.js         # Docker initialization
│   ├── init-db.js             # Database initialization
│   └── schema.sql             # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── bookmarks/
│   │   │   ├── checklists/
│   │   │   ├── cves/
│   │   │   ├── engagements/
│   │   │   ├── notes/
│   │   │   ├── payloads/
│   │   │   ├── recon/
│   │   │   ├── reports/
│   │   │   ├── screenshots/
│   │   │   ├── stats/
│   │   │   ├── templates/
│   │   │   ├── tools/
│   │   │   └── vulnerabilities/
│   │   ├── archive/
│   │   ├── bookmarks/
│   │   ├── checklists/
│   │   ├── cves/
│   │   ├── engagements/
│   │   ├── notes/
│   │   ├── payloads/
│   │   ├── recon/
│   │   ├── reports/
│   │   ├── screenshots/
│   │   ├── settings/
│   │   ├── templates/
│   │   ├── tools/
│   │   ├── vulnerabilities/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── editor/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── db.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3333 |
| `npm run build` | Build for production |
| `npm start` | Start production server on port 3333 |
| `npm run lint` | Run ESLint |
| `npm run db:init` | Initialize PostgreSQL database |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+N` | Create new note |
| `Ctrl+E` | Create new engagement |

## Configuration

### Port

The app runs on port **3333** by default. To change it:

1. Update `package.json` scripts:
   ```json
   "dev": "next dev --port YOUR_PORT",
   "start": "next start --port YOUR_PORT"
   ```

2. Update `Dockerfile`:
   ```dockerfile
   EXPOSE YOUR_PORT
   ENV PORT=YOUR_PORT
   ```

3. Update `docker-compose.yml`:
   ```yaml
   ports:
     - "YOUR_PORT:YOUR_PORT"
   ```

### Database

Default PostgreSQL credentials:

| Field | Value |
|-------|-------|
| Host | localhost |
| Port | 5432 |
| Database | cybervault |
| User | cybervault |
| Password | cybervault_secret_2024 |

> **Note:** Change these credentials before deploying to production.

## Deployment

### Vercel

1. Push to GitHub
2. Import repository on Vercel
3. Add PostgreSQL database (e.g., Neon, Supabase)
4. Set `DATABASE_URL` environment variable
5. Deploy

### Docker

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All data is stored locally in PostgreSQL
- No external analytics or tracking
- No telemetry data collection
- Designed for offline-first usage

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TipTap](https://tiptap.dev/)
- [Lucide Icons](https://lucide.dev/)
