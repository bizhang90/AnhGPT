# AnhGPT Images

A polished Next.js image-generation UI for Vercel, branded for Bee Creative Hub and built around a BYOK (Bring Your Own Key) model.

## What it does

- Users paste their own OpenAI API key directly in the UI
- No fixed API key is required in Vercel
- Supports text-to-image generation and reference-image / image-edit flow
- Supports `gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`, and `gpt-image-2`

## Deploy

```bash
npm install
npm run dev
```

Import this repository into Vercel and deploy. No OpenAI environment variable is required for the BYOK flow.

## Security

User API keys are supplied in the UI and forwarded only for the active request. Do not log request bodies or secrets in production.
