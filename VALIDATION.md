# Validation

- TypeScript check passed.
- Production build passed.
- Geometry check: 1,440 angle/aspect-ratio cases preserve total area, remain within image bounds, and produce substantial fragments.
- Physical camera capture and mobile browser rendering require testing on a camera-equipped device; no camera access was granted by the agent.
- Optional WebMCP state/reset tools are feature-detected. No supported live Site WebMCP context was available (preview handoff queued); runtime contracts remain unverified.

# Product choices for v0.2

- Single random center-region cut after each capture; no stand or sample image.
- Client-only photo processing; no photo storage or upload.
- Manual return to camera after the animation; reset can interrupt it.
- No audio in this MVP.

# Result preview and optional save

- After the fall animation, show the actual 3D split captured shortly after impact as a 1200 × 1200 PNG.
- Reuse that same PNG for preview and saving; no second random split.
- Explicit save uses file sharing when supported and a PNG download otherwise. Cancellation leaves the result intact.
- Reset clears the in-memory preview. No automatic photo persistence or upload.
- TypeScript and production build passed. Device-specific native share/download behavior has not been tested on a physical phone.

# Solid banana projectile

- Removed shot count and replaced it with the banana blade icon.
- Projectile now uses bevelled extruded geometry, a stem, standard light-reactive materials and directional lighting. Its local X tilt changes in flight while the parent retains the random cutting angle.
- TypeScript and production build passed. Geometry check passed for nonzero depth, finite vertices and light-reactive materials. Physical-device visual check remains pending.

# Pixel-art blade orientation and minimal controls

- Uses the exact existing banana-blade.png for both faces; side-wall geometry follows its alpha silhouette to preserve the pixel-art identity.
- Approximately 53–60 degree local Y rotation gives visible left/right foreshortening throughout flight. Animation waits for texture/silhouette readiness.
- Removed lower left reset and lower right icon; centered shutter retained.
- Upper right reads ONE BB, ONE CUT. Result chooses one requested phrase once per capture and remains stable during saving.
- Removed the in-flight Japanese tagline. TypeScript and production build validation; no physical camera/browser visual verification.

# Branded result and one-to-three blade bursts

- Shutter-right count control cycles 1 → 2 → 3 → 1 and locks during capture/animation.
- Each projectile slices the largest remaining polygon at a new random angle; the quick burst completes before fragments fall. One/two/three blades produce two/three/four pieces.
- Captured result PNG is 1200 × 1440 with SLICED BY BANANA BLADE. above, the same per-shot RESULT phrase below, and the original blade icon in its lower-right photo area.
- TypeScript and production build passed. 1,200 deterministic multi-cut cases preserve area and keep fragments above 0.5% of original area. Compositor contract check confirms caption ordering, selected phrase, dimensions and icon inclusion.
- Phone camera, visual animation and native saving remain unverified on physical devices.

# Supplied normal and rare blades

- User image 1 is normal; image 2 is rare. Built-in imagegen removed only gray backgrounds, preserving upright pixel-art designs. Outputs: public/blade-normal.png and public/blade-rare.png; inspected alpha cutouts.
- Edit prompt for each source: Remove ONLY the gray background, replacing it with genuine alpha transparency. Keep the complete sword unchanged: upright orientation, silhouette, colors/highlights, handle/blade details, proportions and composition. No redesign, rotation, shadow, glow, checkerboard or cropping.
- Each capture has a 10% rare probability; all 1–3 projectiles in that capture share the chosen design.
- Blades lie along the horizontal axis, pitched 1.15 radians, with shallow random cut angle limited to ±15 degrees. Original aspect and alpha silhouette determine mesh dimensions.
- Rare impacts emit gold particles and an expanding ring, reduced in reduced-motion mode, and include the effect/rare icon in the saved result.
- TypeScript and production build passed. Tests passed for rare probability boundary, horizontal angle bounds, finite particle coordinates and effect cleanup. Mobile visual verification pending.
