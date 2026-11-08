# Krathmand car dealership website

This repository contains the current dealership site and supporting project copies. The active website is built around the `KurtKrathmand` app, with a matching static mirror in `KurtKrathmandStatic`.

`backup-root-pre-jjbiler` is kept as a historical archive of older prototype work and is not part of the live site.

## Project structure
- `KurtKrathmand/` — main Express-based website
- `KurtKrathmandStatic/` — static version of the same site
- `backup-root-pre-jjbiler/` — historical backup, kept for reference only

## Run the live app locally
From the `KurtKrathmand` folder:

```bash
npm install
npm start
```

Then open:
- http://localhost:3000

## Run the static version locally
From the project root or the static folder:

```bash
python -m http.server 8000
```

Then open:
- http://localhost:8000/KurtKrathmandStatic/public/index.html

## Notes
- The live branding is `Krathmand`.
- The archive folder contains older naming and layout experiments and should be treated as read-only.
- The admin interface is protected by the app’s own session-based authentication and should not be documented with public key-based URLs.
