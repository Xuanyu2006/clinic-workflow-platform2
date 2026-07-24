# Architecture

This project is a Next.js 15 App Router foundation for a future healthcare workflow platform.

## Principles

- Keep route handlers, UI components, service modules, and data access boundaries separate.
- Treat Supabase access as infrastructure behind typed clients.
- Keep business workflows out of shared UI components.
- Document security-sensitive design decisions before implementing clinical workflows.

## Folder Map

- `app`: App Router routes, layouts, and route handlers.
- `components`: Reusable layout and UI primitives.
- `hooks`: Shared client-side React hooks.
- `lib`: Framework, environment, and infrastructure helpers.
- `services`: Future domain service modules.
- `database`: Supabase schema, migrations, policies, and generated types.
- `types`: Shared TypeScript types.
- `public`: Static assets.
- `docs`: Architecture and operational documentation.
