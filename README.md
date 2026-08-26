# HorariosHUB Frontend

Frontend en Next.js de **HorariosHub**, el sistema de gestión de horarios del
programa PCEO (doble grado Informática + Matemáticas, Universidad de
Oviedo). Combina una vista pública de consulta de horarios (sin login) con
un panel de gestión protegido por roles (usuario, profesor, admin).

## Stack

- Next.js 16 (App Router, SSR) · React 19
- Tailwind CSS
- TanStack Query
- next-intl (i18n, español por defecto)
- Autenticación por JWT en cookie `httpOnly`
- Docker

## Desarrollo local

Requiere Node 22 y pnpm 9.

```bash
corepack enable
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

Por defecto los módulos usan datos mock (ver `lib/config/mocks.ts`) para
poder desarrollar la UI sin depender del backend. Para conectar un módulo a
la API real, ver [docs/CONNECTING_BACKEND.md](docs/CONNECTING_BACKEND.md).

### Variables de entorno

```
NEXT_PUBLIC_API_URL=http://localhost:8000   # desarrollo
```

### Otros comandos

```bash
pnpm lint            # ESLint
pnpm exec tsc --noEmit   # type-check
pnpm build            # build de producción
```

## Docker

```bash
docker compose up --build
```

Sirve la app en el puerto `3000`. La imagen de producción (`Dockerfile`) usa
build multi-stage con salida `standalone` de Next.js.

## Estructura del código

- `app/[locale]/` — rutas (App Router), agrupadas por i18n
- `components/` — componentes de UI, organizados por dominio (schedule,
  proposals, classes, users, ...)
- `hooks/` · `lib/hooks/` — hooks de datos y estado
- `lib/api/` — clientes de la API
- `lib/config/` — flags de configuración (mocks, etc.)
- `lib/types/` — tipos compartidos
- `i18n/` · `messages/` — configuración e idiomas de next-intl
- `docs/` — arquitectura, sistema de diseño y guía de conexión al backend

## Documentación

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura, roles y permisos
- [docs/DESIGN.md](docs/DESIGN.md) — sistema de diseño
- [docs/ENDPOINTS.md](docs/ENDPOINTS.md) — endpoints de la API consumidos
- [docs/CONNECTING_BACKEND.md](docs/CONNECTING_BACKEND.md) — cómo desactivar mocks módulo a módulo

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md).
