# CyberVault

CyberVault is a secure operational platform for cybersecurity teams. It brings together pentest engagements, vulnerability tracking, note management, payload libraries, reconnaissance workflows, and reporting tools in a single Next.js application.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-sky?style=flat-square&logo=tailwindcss)

## Overview

CyberVault is designed to help red teams, security operations teams, and penetration testers manage assessment workflows, collaborate on findings, and retain knowledge in a structured, searchable system.

### Core capabilities

- Engagement tracking with target scope, status, and checklists
- Vulnerability lifecycle management with CVSS, CWE, and OWASP alignment
- Secure note-taking with tagging, pinning, soft delete, and archive support
- Payload library with categorized commands and copy-to-clipboard actions
- Recon workspace for organized reconnaissance data and quick reference
- Report creation and export powered by Markdown editing
- Bookmark management, screenshot storage, and reusable templates
- Command palette for fast navigation and action execution

## Features

- Rich text notes with TipTap editor support
- Engagements with scope, objectives, and issue tracking
- Vulnerability records with severity, references, and remediation details
- Payloads and tools library for red team workflows
- CVE tracking and vulnerability monitoring support
- Checklists for operational progress and validation
- Archive and restore for soft-deleted items
- Full PostgreSQL data storage with Next.js API routes

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| UI | Radix UI + custom components |
| Rich Text | TipTap |
| Database | PostgreSQL 16 |
| Charts | Recharts |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- PostgreSQL 16 or newer
- npm, yarn, or pnpm
- Docker (optional)

### Local setup

1. Clone the repository

```bash
git clone https://github.com/Chunkpie/CyberVault.git
cd CyberVault
```

2. Install dependencies

```bash
npm install
```

3. Create `.env.local`

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/cybervault
```

4. Initialize the database

```bash
npm run db:init
```

5. Start development server

```bash
npm run dev
```

Open the app at **http://localhost:3333**.

### Docker setup

1. Start services

```bash
docker compose up -d
```

2. Initialize the database

```bash
docker compose exec app node scripts/init-db.js
```

## Project Structure

```
CyberVault/
├── public/                    # Static assets
├── scripts/                   # Setup and database utilities
│   ├── docker-init.js
│   ├── init-db.js
│   └── schema.sql
├── src/
│   ├── app/                   # Next.js pages and API routes
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Database and utility modules
│   └── types/                 # TypeScript type definitions
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
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint checks |
| `npm run db:init` | Initialize the PostgreSQL database |

## Environment Variables

Create a `.env.local` file with your PostgreSQL connection:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>
```

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request with a clear summary of changes

## Notes

- Ensure PostgreSQL is running before launching the app.
- Configure `.env.local` with valid database credentials.
