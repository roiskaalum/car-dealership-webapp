# JJBiler-inspired prototype

This folder is a separate mockup and is intentionally not replacing the original website in the parent folder.

## What this prototype includes
- dark/light mode switch in the top navigation
- hero banner with overlaid search panel
- sorting and filtering controls for common car attributes
- additional sections inspired by the dealer layout structure


## Hero image placeholder
The hero uses a local SVG placeholder created for the layout:
- assets/hero-car.svg

This is meant to be replaced later with a real photo that fits the landing banner.
Recommended specs for the final hero photo:
- size: 2000 x 1000 px or larger
- crop: car fills roughly 70-80% of the frame, with a clean background
- composition: wide angle, front/side view, no text overlay
- style: clean, premium, dealership-quality image
- avoid: clutter, logo overlays, or heavy filters

## Run locally
From this folder, start a static server:

```bash
python -m http.server 8000
```

Then open:
- http://localhost:8000/index.html
- http://localhost:8000/admin.html?key=x8fD4r7nQ2

## Notes
This is a mockup only. Remove the comments and the hidden admin pattern when the site is ready to be published.

# Historical archive

This folder preserves an older prototype iteration of the dealership website for reference only.

It is not part of the live site and should be treated as read-only legacy material.

## Contents
- old static prototype layout
- earlier branding experiments
- historical config and mock content

## Notes
- The live site branding is now `Krathmand`.
- Older variants such as `krathmandDd` and `krathmandDdd` were part of the prior prototype work and remain here only for archival context.
- The admin pattern in this archive is historical and not used in the active production app.
