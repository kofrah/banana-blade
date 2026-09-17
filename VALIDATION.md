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
