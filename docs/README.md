# next-query-sync docs

This app is the documentation site for [`next-query-sync`](https://github.com/mhfed/next-query-sync).

## Local development

```bash
npm install
npm run dev
```

The docs app consumes the local library package from `../packages`.

## Deploy on Vercel

Create a Vercel project that points to this repository, then set the **Root Directory** to `docs`.

Recommended project settings:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

Optional environment variables:

- `NEXT_PUBLIC_SITE_URL=https://your-docs-domain.vercel.app`

That variable is used for metadata and social sharing URLs.
