# 🚀 Deploying Hasinur Web

This application is built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**. It is designed to be hosted on any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

## 🛠 Prerequisites

1.  **Supabase Project**: Create a new project at [supabase.com](https://supabase.com).
2.  **Environment Variables**: You need your Supabase Project URL and Anon Key.
3.  **Database Setup**: You MUST run the `SETUP.sql` script in your Supabase SQL Editor to create the required tables.

## 📦 Deployment Steps

### 1. Setup Database
Copy the contents of `SETUP.sql` from this repository and run them in your **Supabase SQL Editor**. This will create all necessary tables (Experiences, Portfolio, etc.).

### 2. Configure Environment Variables
Create a `.env` file in your root directory (or add these to your hosting provider's dashboard):

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Build & Deploy
Run the following commands:

```bash
npm install
npm run build
```

Then upload the contents of the `dist/` directory to your hosting provider.

### 🌐 Vercel Note
If you are deploying to **Vercel**, a `vercel.json` file is included in the project root to handle Single Page Application (SPA) routing. This ensures that refreshing the page on any route (like `/admin`) doesn't result in a 404 error.

## 🖼 Storage Setup
To support image uploads in the Admin Panel:
1.  Go to the **Storage** tab in Supabase.
2.  Create a new public bucket named `portfolio_assets`.
3.  Add RLS policies to allow authenticated uploads to this bucket.

## 🔐 Admin Access
Access the admin panel at `/admin` to modify your content securely.
