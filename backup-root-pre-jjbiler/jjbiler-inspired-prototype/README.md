# JJBiler-inspired prototype

This folder is a separate mockup and is intentionally not replacing the original website in the parent folder.

## What this prototype includes
- dark/light mode switch in the top navigation
- hero banner with overlaid search panel
- sorting and filtering controls for common car attributes
- additional sections inspired by the dealer layout structure
- hidden admin page pattern for safer internal editing without a login system

## Public site and admin access
The public site is served as normal from this folder.
The admin page is intentionally hidden and not linked from the UI. It is only reachable by using the hidden slug in config.js.

Example:
- http://localhost:8000/jjbiler-inspired-prototype/admin.html?key=x8fD4r7nQ2

The actual key is stored in:
- config.js

Do not expose this in the public templates or navigation.

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
