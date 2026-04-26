# 🗄️ Supabase Database Setup - Run All Migrations

_Your database is empty! Let's create all tables from the 54 migration files._

---

## 📊 CURRENT STATUS

- ✅ **54 migration files** found in `supabase/migrations/`
- ❌ **No tables** in your Supabase database
- ❌ **Admin dashboard** won't work without tables

---

## 🎯 SOLUTION: Run All Migrations

### **Option A: Using Supabase CLI (Recommended - 5 min)**

#### **1. Install Supabase CLI**
```bash
brew install supabase/tap/supabase
```

#### **2. Login to Supabase**
```bash
supabase login
```
This opens a browser → Login with GitHub

#### **3. Link Your Project**
```bash
cd /Users/eduardomarques/web3-district-app
supabase link --project-ref rhppbqsuktyunxfwnddp
```

#### **4. Run All Migrations**
```bash
supabase db push
```

**This will:**
- Create all 54 migrations
- Build all tables
- Set up RLS policies
- Create functions/triggers

#### **5. Verify Tables**
Go to: https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/editor

You should see **20+ tables** including:
- `developers`
- `sky_ads`
- `advertiser_accounts`
- `achievements`
- `arcade_rooms`
- etc.

---

### **Option B: Manual SQL Import (10 min)**

If CLI doesn't work, do this:

#### **1. Combine All Migrations**
```bash
cd /Users/eduardomarques/web3-district-app/supabase/migrations
cat *.sql > /tmp/all-migrations.sql
```

#### **2. Open Supabase SQL Editor**
Go to: https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/sql/new

#### **3. Copy & Paste**
```bash
cat /tmp/all-migrations.sql | pbcopy
```
This copies all SQL to your clipboard

#### **4. Run in Supabase**
- Paste into SQL editor
- Click **Run** (or Cmd+Enter)
- Wait for completion

#### **5. Verify**
Check the **Tables** section in the editor

---

### **Option C: One-by-One (Last Resort - 30 min)**

If above fail, run migrations in order:

1. Go to: https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/sql/new
2. Open each file: `001_initial_schema.sql`, `002_add_claimed_columns.sql`, etc.
3. Copy → Paste → Run
4. Repeat for all 54 files

**Start with these critical ones first:**
- `001_initial_schema.sql` (creates core tables)
- `003_monetization.sql` (ads tables)
- `0091_sky_ads.sql` (sky ads)
- `041_advertiser_accounts.sql` (advertiser accounts)
- `042_creator_drops.sql` (creator drops)
- `049_arcade_rooms.sql` (arcade rooms)

---

## 🧪 AFTER MIGRATIONS

### **Test Admin Login:**

1. **Go to:** http://localhost:3002/admin/login
2. **Click:** "Sign in with GitHub"
3. **Authorize**
4. **Should see:** Admin dashboard with ads table ✅

### **Verify Tables Exist:**

Run this query in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**You should see:**
```
achievements
activity_feed
ad_events
advertiser_accounts
arcade_rooms
customizations
creator_drops
dailies
developers
interactions
loadouts
notifications
preferences
raid_loadouts
referrals
sky_ads
...and more
```

---

## 🐛 TROUBLESHOOTING

### **"Migration failed - table already exists"**
→ Some tables exist already → Continue, skip errors

### **"Permission denied"**
→ Make sure you're using **service_role key** in SQL Editor
→ Or use Supabase CLI (handles auth automatically)

### **"Function does not exist"**
→ Run migrations in order (001, 002, 003...)
→ Some migrations depend on previous ones

### **CLI not found**
```bash
brew install supabase/tap/supabase
```

---

## ✅ DONE WHEN...

- [ ] All migrations ran successfully
- [ ] You see 20+ tables in Supabase dashboard
- [ ] Admin login works
- [ ] Can access `/admin/ads`
- [ ] Can see ads table (even if empty)

---

## 🚀 RECOMMENDED: Use Supabase CLI

**Fastest and most reliable:**

```bash
# Install
brew install supabase/tap/supabase

# Login
supabase login

# Link project
cd /Users/eduardomarques/web3-district-app
supabase link --project-ref rhppbqsuktyunxfwnddp

# Push all migrations
supabase db push
```

**This takes 5 minutes and does everything automatically!** ✨

---

**Start with Option A (CLI), boss! It's the easiest!** 🚀🐥
