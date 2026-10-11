# Canteen Central (React frontend)

## Setup
All dependencies and the `shadcn/ui` primitives (`button`, `input`, `sheet`, `skeleton`) are already
installed and committed. Just run:

```bash
npm install
npm run dev
```

To add another shadcn component later: `npx shadcn@latest add <name>`.

Set `VITE_API_URL` in `.env`; set `VITE_USE_MOCK=true` to see the menu without the backend.

## Layout
Everything lives under `src/`. The `@/*` import alias points at `src/*` (declared in both
`vite.config.ts` and `tsconfig.json`) — there is no second copy of the tree at the repo root.

`npm run build` runs `tsc --noEmit` first, so type errors fail the build.

## Backend contract assumed (adjust in `types.ts` files)
- POST /auth/login, /auth/signup -> `{ token, user: { id, username, email, role } }`
- GET /auth/me, GET /menu, DELETE /menu/:id, POST /orders
- Spring Boot needs CORS for http://localhost:5173 and `@PreAuthorize` on admin/owner endpoints.
