# 🚀 SUPABASE CONNECTION SETUP

## Get Your Connection String from Supabase

1. Go to: https://app.supabase.com
2. Select your project: `biocifrxhatjmwxjcjqi`
3. Click **Settings** (bottom left)
4. Click **Database**
5. Under "Connection string", select **URI**
6. Copy the full connection string (looks like):
   ```
   postgresql://postgres:YOUR_PASSWORD@db.biocifrxhatjmwxjcjqi.supabase.co:5432/postgres
   ```

## Then Update .env

Replace this line in `.env`:
```
DATABASE_URL="file:./prisma/dev.db"
```

With your Supabase connection:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.biocifrxhatjmwxjcjqi.supabase.co:5432/postgres"
```

## That's it!

Then run:
```bash
npx prisma db push
npx prisma generate
npm run dev
```

---

Your Supabase project URL: https://biocifrxhatjmwxjcjqi.supabase.co
