# Vedic Neev (vedicneev.com) - Project Constitution

## Mission
Vedic Neev is a premier K-8 competitive school entrance exam SaaS (JNVST, AISSEE, RMS, and premier private K-12 admissions like DPS).
It is a child app of Vedic Mind AI and integrates Vedic speed-math and aptitude engines.

## Core Tech Stack
- Frontend: Next.js 14+ (App Router), Tailwind CSS, Lucide React, Radix UI, Zustand.
- Monorepo: pnpm workspace / Turborepo structure (apps/web, packages/db, packages/engine, packages/ui).
- Backend/Database: Supabase (PostgreSQL) using Prisma ORM.
- Deployment Target: Vercel.

## Ground Rules for Claude Code
1. Work exclusively inside /d/Projects/vedicneev (D:\Projects\vedicneev).
2. Use clean TypeScript with strict typing.
3. Architecture must be modular: database models in packages/db, scoring/diagnostic algorithms in packages/engine.
4. Question model MUST support bilingual JSONB (en, hi) and vector/SVG figure metadata for non-verbal reasoning.
5. Always write clean .env.example templates for Supabase and Vercel.
