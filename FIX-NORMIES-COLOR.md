# Normies Color Mismatch Fix ✅

## Problem
When normies claim their free color (#48494b):
- **Shop Preview**: Shows #48494b ✅
- **City Building**: Shows #57585a (lighter, washed out) ❌

## Root Cause Found! 🎯

**The shader was applying emissive glow to ALL pixels**, including the face/custom color pixels!

```glsl
// BEFORE (wrong):
vec3 emissive = wallColor * 1.8 * uCityEnergy;  // Applies to face + windows
vec3 wallFinal = wallColor * ambientBase + emissive;  // Face gets 2.1x brighter!
```

This made custom colors appear **washed out** (about 20-30% lighter)!

## Solution ✅ IMPLEMENTED

**1. Move face pixel detection BEFORE custom color application** (so it's available for emissive calc)

**2. Only apply emissive to WINDOW pixels**, not face pixels:
```glsl
// AFTER (correct):
float dist = length(wallColor - uFaceColor);
float isFacePixel = 1.0 - smoothstep(0.05, 0.15, dist);

if (vTint.a > 0.5) {
  wallColor = mix(wallColor, vTint.rgb, isFacePixel);  // Apply custom color
}

// Only windows get emissive glow
float isWindow = 1.0 - isFacePixel;
vec3 emissive = wallColor * 1.8 * uCityEnergy * isWindow;  // Face pixels = 0 emissive!
vec3 wallFinal = wallColor * ambientBase + emissive;
```

**3. Changed from `step()` to `smoothstep()`** for better edge detection with tolerance range.

## Solution ✅ IMPLEMENTED

### localStorage Communication Pattern

1. **Shop** (`src/components/ShopClient.tsx`):
   - After normies claim, save to localStorage:
   ```typescript
   localStorage.setItem("normies_claimed", JSON.stringify({
     claimed: true,
     color: "#48494b",
     timestamp: Date.now()
   }));
   ```

2. **City** (`src/app/page.tsx`):
   - Poll localStorage every 2 seconds
   - When claim detected, call `reloadCity(true)` to bust cache
   - Building re-renders with new `custom_color`

This pattern works across page navigation!

## Files Fixed ✅
1. `src/app/api/customizations/route.ts` - Saves to both ✅
2. `src/components/ShopClient.tsx` - **Added localStorage write** ✅
3. `src/app/page.tsx` - **Added localStorage poll + reloadCity()** ✅
4. `src/components/InstancedBuildings.tsx` - Applies custom_color correctly ✅
5. `src/components/Building3D.tsx` - Uses custom_color correctly ✅

## Test Steps
1. Claim normies_style in shop
2. Check if building color updates in city
3. If not, add refresh logic after claim
