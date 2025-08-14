# Syra Website

Deployed on Vercel: syra-website.vercel.app

## About

Syrian Robotic Academy website built with Next.js, Prisma, and PostgreSQL.

## Environment Variables

Create a `.env.local` (not committed):

```env
DATABASE_URL=postgresql://neondb_owner:npg_cxR4qKmbtN5J@ep-plain-smoke-ad18owru.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_GENAI_API_KEY=AIzaSyDf7IMg5-uyJbKSz0W9hp0LNl21RvEc_zQ
```

Set the same variables in Vercel for Production and Preview.

## Features

- JWT-based authentication
- PostgreSQL database with Prisma ORM
- AI coaching assistant
- User management system
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: Google Gemini via Genkit
