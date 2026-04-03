# Conectar módulos al backend

Cada módulo tiene un flag en `lib/config/mocks.ts`. Cuando el flag es `true` el hook devuelve datos mock locales. Cuando es `false` usa la implementación real con TanStack Query.

## Orden recomendado

1. **auth** — necesario para que los guards de ruta funcionen
2. **schedule** — el módulo más usado, no requiere autenticación
3. **subjects** — depende de auth
4. **proposals** — depende de auth y schedule
5. **classes** — depende de auth (profesor/admin)
6. **users** — depende de auth (solo admin)
7. **events** — depende de auth
8. **notifications** — depende de auth

## Pasos para activar un módulo

1. Asegúrate de que el endpoint está implementado en el backend
2. Verifica que la forma de los datos coincide con los tipos en `lib/types/`
3. Cambia el flag en `lib/config/mocks.ts` a `false`
4. Descomenta el bloque de implementación real en el hook correspondiente
5. Prueba en desarrollo con `NEXT_PUBLIC_API_URL` apuntando al backend
6. Si algo falla, vuelve el flag a `true` para no bloquear el desarrollo

## Variables de entorno necesarias

```
NEXT_PUBLIC_API_URL=http://localhost:8000   # desarrollo
NEXT_PUBLIC_API_URL=https://api.pceo-hub.com  # producción
```

## Notas por módulo

### auth (`hooks/useAuth.ts`)
- **Endpoint:** `GET /api/auth/me`
- **Respuesta esperada:** `{ email: string; role: 'visitor' | 'user' | 'professor' | 'admin' }`
- **Errores conocidos:** `401` → redirigir a `/auth/login`. Implementar en `useEffect` tras recibir `null`.
- **Nota:** Este hook vive en `hooks/` (no en `lib/hooks/`) porque lo importan componentes de layout que no deben depender de `lib/`.

### schedule (`lib/hooks/useSchedule.ts`)
- **Endpoint:** `GET /api/schedule/{identifier}`
- **Respuesta esperada:** `{ subjects: Subject[] }` (ver `lib/types/schedule.ts`)
- **Errores conocidos:** `400` = identificador inválido (mostrar error inline). `200` con array vacío = sin datos (mostrar estado vacío, no error).
- **Nota:** `refreshSchedule` debe llamar a `queryClient.invalidateQueries({ queryKey: ['schedule'] })` en la implementación real.

### subjects (`lib/hooks/useSubjects.ts`)
- **Endpoints:** `GET /api/subjects/catalog`, `POST /api/subjects/selection`, `POST /api/subjects/auto-select`, `GET /api/subjects/auto-select/status`
- **Respuesta esperada catálogo:** `{ subjects: CatalogSubject[] }` (ver `lib/types/subjects.ts`)
- **Errores conocidos:** El polling de auto-select debe hacerse cada 5 s hasta `status === 'completed'` o `status === 'failed'`.

### proposals (`lib/hooks/useProposals.ts`)
- **Endpoints:** `GET /api/proposals/mine?page=&limit=`, `GET /api/proposals?status=&page=&limit=`, `PATCH /api/proposals/{id}/approve`, `PATCH /api/proposals/{id}/reject`
- **Respuesta esperada:** `{ data: Proposal[]; total: number }` (ver `lib/types/proposals.ts`)
- **Errores conocidos:** `reject` acepta `body: { reason }` opcional. Los profesores pueden aprobar sus propias propuestas; el backend lo gestiona, el frontend no necesita lógica especial.

### classes (`lib/hooks/useClasses.ts`)
- **Endpoints:** `GET /api/classes` (si existe), `POST /api/classes`, `PATCH /api/classes/{id}`, `DELETE /api/classes/{id}`
- **Respuesta esperada:** `Class[]` (ver `lib/types/classes.ts`)
- **Errores conocidos:** `endTime` lo calcula el backend; no enviar en el body de create/update.

### users (`lib/hooks/useUsers.ts`)
- **Endpoints:** `GET /api/users?search=&role=&page=&limit=`, `PATCH /api/users/{email}/role`, `DELETE /api/users/{email}`
- **Respuesta esperada:** `User[]` (ver `lib/types/users.ts`)
- **Errores conocidos:** El frontend valida `SELF_ROLE` y `SELF_DELETE` antes de llamar a la API. El backend también lo debe validar. `email` va URL-encoded en los endpoints.

### events (`lib/hooks/useEvents.ts`)
- **Endpoints:** `GET /api/events`, `POST /api/events`, `PATCH /api/events/{id}`, `DELETE /api/events/{id}`
- **Respuesta esperada:** `UserEvent[]` (ver `lib/types/events.ts`)
- **Nota:** La preferencia `eventsVisible` se guarda en `localStorage` y no va al backend.

### notifications (`lib/hooks/useNotifications.ts`)
- **Endpoint:** `GET /api/notifications?limit=50`, `PATCH /api/notifications/{id}/read`, `DELETE /api/notifications/{id}`
- **Respuesta esperada:** `Notification[]` (ver `lib/types/notifications.ts`)
- **Nota:** El frontend hace polling cada 30 s. Las notificaciones no se marcan como leídas al abrir el dropdown; el usuario las descarta manualmente.
