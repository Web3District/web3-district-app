# 🏗️ Visual Landmark Placement System

**Implemented:** 2026-05-12  
**Status:** ✅ Ready for testing

---

## 🎯 What Was Built

A complete visual placement system for sponsored landmarks in Web4City. Admins can now:

1. **Click to place** landmarks on an interactive 3D grid
2. **See preview** before saving
3. **Customize** building type, color, and model
4. **Manage** landmarks via `/admin/landmarks`

---

## 📁 Files Created/Modified

### New Files:
- `supabase/migrations/20260512_add_landmark_grid_columns.sql` - Database schema
- `src/app/api/sponsors/route.ts` - API endpoint for fetching dynamic sponsors
- `src/app/api/admin/landmarks/route.ts` - Admin API for CRUD operations
- `src/components/admin/LandmarkPlacer.tsx` - Visual 3D placement component
- `src/lib/sponsors/buildings/DefaultLandmarkBuilding.tsx` - Default 3D building model
- `VISUAL-LANDMARK-PLACEMENT.md` - This documentation

### Modified Files:
- `src/app/admin/landmarks/page.tsx` - Added visual placer UI
- `src/lib/sponsors/registry.tsx` - Added dynamic sponsor loading
- `src/components/CityCanvas.tsx` - Render dynamic landmarks in city

---

## 🗄️ Database Changes

Run this migration in Supabase SQL Editor:

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

## 🎮 How to Use

### 1. Access Admin Panel
Navigate to: `https://web4city.xyz/admin/landmarks`

### 2. Create Landmark (Two Methods)

#### **Method A: Visual Placement** (Recommended)
1. Click **"🗺️ Select Position on Map"** button
2. 3D grid editor opens
3. **Click anywhere** on the grid to place landmark
4. See ghost preview of building
5. Click **"Confirm Position"**
6. Fill in landmark details (name, description, etc.)
7. Click **"Create Landmark"**

#### **Method B: Manual Grid Input**
1. Enter Grid X and Grid Z numbers manually
2. Fill in landmark details
3. Click **"Create Landmark"**

### 3. Customize Landmark
- **Building Type:** Default Tower, Corporate HQ, Tech Hub, Custom Model
- **Accent Color:** Pick any color
- **Model URL:** Optional GLB file for custom 3D model

### 4. Manage Landmarks
- **Toggle Active:** Enable/disable landmark visibility
- **Delete:** Remove landmark permanently

---

## 🏙️ Grid System

The city uses a grid coordinate system:

```
Grid (0, 0) = City center
Grid (-1, 1) = One block west, one block north
Grid (2, -3) = Two blocks east, three blocks south
```

**Each grid cell = 1 city block** (161m x 137m + 12m streets)

### Visual Reference:
```
     N
     ↑
W ← (0,0) → E
     ↓
     S

Example landmarks:
- AceleraDev: Grid(-1, 1) - Northwest
- AbacatePay: Grid(-1, -1) - Southwest  
- ViralDay: Grid(1, 1) - Northeast
- PortugalPride: Grid(0, 0) - Center
```

---

## 🎨 3D Model Format

For custom landmarks, use **GLB format**:

### Why GLB?
- ✅ Native Three.js support
- ✅ Small file size (binary)
- ✅ Supports textures, materials, animations
- ✅ Industry standard for web 3D

### How to Upload Custom Model:
1. Export your 3D model as `.glb` from Blender/Fusion 360/etc.
2. Upload to Supabase Storage or any CDN
3. Paste the URL in "Model URL (GLB)" field
4. Select "Custom Model" as building type

---

## 🔧 API Endpoints

### GET `/api/sponsors`
Returns all active landmarks for rendering in the city.

**Response:**
```json
{
  "sponsors": [
    {
      "id": 1,
      "slug": "landmark-1",
      "name": "Tower Bridge",
      "gridX": -2,
      "gridZ": 3,
      "buildingType": "default",
      "accent": "#ed0584",
      "hitboxRadius": 80,
      "hitboxHeight": 550
    }
  ]
}
```

### POST `/api/admin/landmarks`
Create or update a landmark.

**Body:**
```json
{
  "name": "Tower Bridge",
  "description": "Famous landmark",
  "grid_x": -2,
  "grid_z": 3,
  "building_type": "default",
  "accent_color": "#ed0584",
  "active": true
}
```

### DELETE `/api/admin/landmarks?id=<id>`
Delete a landmark.

---

## 🧪 Testing Checklist

- [ ] Run database migration in Supabase
- [ ] Navigate to `/admin/landmarks`
- [ ] Click "Select Position on Map"
- [ ] Click on grid to place landmark
- [ ] Confirm position
- [ ] Fill in details and save
- [ ] Check city view - landmark should appear
- [ ] Click landmark - should open info card
- [ ] Test toggle active/inactive
- [ ] Test delete

---

## 🚀 Next Steps (Future Enhancements)

### Phase 2: Custom 3D Models
- [ ] Add GLB file upload to Supabase Storage
- [ ] Support loading custom models in DefaultLandmarkBuilding
- [ ] Add model preview in admin panel

### Phase 3: Advanced Placement
- [ ] Snap-to-grid toggle
- [ ] Rotation control (0°, 90°, 180°, 270°)
- [ ] Collision detection (warn if overlapping)
- [ ] Undo/Redo during placement

### Phase 4: Self-Serve Sponsorships
- [ ] Public sponsorship purchase flow
- [ ] Stripe integration for landmark tier ($500-$2000/mo)
- [ ] Automated landmark creation after payment
- [ ] Sponsor dashboard for analytics

---

## 🐛 Troubleshooting

### Landmark not appearing in city:
1. Check `active` status is `true`
2. Verify grid coordinates are within city bounds (-10 to 10)
3. Check browser console for errors
4. Ensure `/api/sponsors` endpoint returns data

### Visual placer not loading:
1. Check for Three.js errors in console
2. Ensure WebGL is enabled in browser
3. Try different browser (Chrome/Firefox recommended)

### Can't save landmark:
1. Verify admin access (GitHub login must be in `NEXT_PUBLIC_ADMIN_GITHUB_LOGINS`)
2. Check Supabase connection
3. Verify all required fields are filled

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│  /admin/landmarks                       │
│  - LandmarkPlacer component (3D)        │
│  - Form with grid X/Z inputs            │
└──────────────┬──────────────────────────┘
               │
               ↓ POST /api/admin/landmarks
┌─────────────────────────────────────────┐
│  Supabase Database                      │
│  - landmarks table                      │
│  - grid_x, grid_z columns               │
└──────────────┬──────────────────────────┘
               │
               ↓ GET /api/sponsors
┌─────────────────────────────────────────┐
│  CityCanvas                             │
│  - Loads dynamic sponsors               │
│  - Renders SponsoredLandmark components │
└─────────────────────────────────────────┘
```

---

**Questions?** Check the code comments or ping Eddie! 🐥
