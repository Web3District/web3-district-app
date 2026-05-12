# 📦 Supabase Storage Setup for Landmark Models

## Step 1: Create Storage Bucket

### Via Supabase Dashboard:
1. Go to: https://rhppbqsuktyunxfwnddp.supabase.co
2. Click **Storage** in left sidebar
3. Click **New Bucket**
4. Enter bucket name: `landmarks-models`
5. ✅ Check **Public bucket**
6. Click **Create bucket**

### Via Supabase CLI (alternative):
```bash
npx supabase storage bucket create landmarks-models --public
```

---

## Step 2: Set Upload Permissions

In Supabase Dashboard → Storage → `landmarks-models` → **Policies**:

### Add Policy for Authenticated Users:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'landmarks-models');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'landmarks-models');

-- Allow users to delete their own uploads
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'landmarks-models');
```

---

## Step 3: Verify Setup

Test the upload endpoint:

```bash
# Create a test GLB file (or use any .glb file)
echo "test" > test.glb

# Upload via curl
curl -X POST http://localhost:3000/api/admin/landmarks/upload \
  -F "file=@test.glb" \
  -H "Cookie: your-auth-cookie"
```

Expected response:
```json
{
  "success": true,
  "url": "https://rhppbqsuktyunxfwnddp.supabase.co/storage/v1/object/public/landmarks-models/landmark-1234567890-test.glb",
  "filename": "landmark-1234567890-test.glb",
  "size": 1024
}
```

---

## Step 4: Run Database Migration

Go to: https://rhppbqsuktyunxfwnddp.supabase.co → SQL Editor

Paste and run the contents of: `RUN-THIS-IN-SUPABASE.sql`

```sql
-- Add grid positioning and custom model support to landmarks table
ALTER TABLE landmarks 
  ADD COLUMN IF NOT EXISTS grid_x INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grid_z INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS building_type TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ed0584',
  ADD COLUMN IF NOT EXISTS model_url TEXT,
  ADD COLUMN IF NOT EXISTS hitbox_radius INTEGER DEFAULT 80,
  ADD COLUMN IF NOT EXISTS hitbox_height INTEGER DEFAULT 550;

-- Create index for fast spatial queries
CREATE INDEX IF NOT EXISTS landmarks_grid_position_idx ON landmarks(grid_x, grid_z) WHERE active = true;
```

---

## ✅ Verification Checklist

- [ ] Storage bucket `landmarks-models` created
- [ ] Bucket is set to **Public**
- [ ] Upload policies configured
- [ ] Database migration executed
- [ ] New columns visible in `landmarks` table

---

## 🎯 Usage

Once setup is complete:

1. Go to `/admin/landmarks`
2. Click **"🗺️ Select Position on Map"**
3. Place landmark on grid
4. Fill in details
5. Click **"Choose File"** under "Custom Model (GLB)"
6. Select `.glb` file (max 10MB)
7. Wait for upload to complete
8. Click **"Create Landmark"**

The landmark will appear in the 3D city with your custom model!

---

## 🐛 Troubleshooting

### Error: "Bucket not found"
- Create the `landmarks-models` bucket in Supabase dashboard
- Make sure it's set to **Public**

### Error: "Unauthorized"
- Ensure you're logged in as admin
- Check `NEXT_PUBLIC_ADMIN_GITHUB_LOGINS` env variable

### Error: "File too large"
- Maximum file size is 10MB
- Optimize your GLB model in Blender (File → Export → GLB → reduce quality)

### Upload hangs forever
- Check browser console for errors
- Verify Supabase Storage is accessible
- Try smaller file first

---

## 📊 Storage Limits

**Supabase Free Tier:**
- 1 GB total storage
- 2 GB bandwidth/month
- Unlimited file uploads

**Pro Tier ($25/mo):**
- 100 GB storage
- 250 GB bandwidth/month

**Estimated GLB file sizes:**
- Simple building: 100-500 KB
- Detailed building: 1-3 MB
- Complex building with textures: 5-10 MB

You can store ~200-500 landmark models on free tier!

---

**Questions?** Check the docs or ping Eddie! 🐥
