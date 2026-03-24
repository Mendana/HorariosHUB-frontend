# ENDPOINTS.md — API propuesta para Horarios PCEO

Diseño de API RESTful para el backend refactorizado. Los endpoints están organizados por dominio funcional. Al final se incluye una tabla de migración desde los endpoints originales.

---

## Convenciones generales

| Aspecto | Decisión |
|---|---|
| Base URL | `/api` |
| Autenticación | JWT en cookie `httpOnly`. Los endpoints protegidos devuelven `401` si no hay token válido. |
| Autorización | Middleware por rol. Devuelve `403` si el rol del token no tiene permiso. |
| Formato | JSON (request y response) |
| Errores | `{ "error": "código", "message": "descripción legible" }` |
| Paginación (donde aplique) | Query params `?page=1&limit=10`. Response incluye `{ data: [], total: N, page: N, limit: N }` |
| Validación | Todos los inputs se validan en backend (no confiar solo en validaciones de frontend) |

---

## 1. Autenticación (`/api/auth`)

| Método | Endpoint | Autenticación | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registrar nuevo usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| POST | `/api/auth/logout` | Sí | Cerrar sesión (invalidar cookie) |
| GET | `/api/auth/verify` | No | Verificar email con token |
| POST | `/api/auth/recover` | No | Solicitar email de recuperación |
| POST | `/api/auth/reset-password` | No | Restablecer contraseña |
| GET | `/api/auth/me` | Sí | Obtener datos y rol del usuario actual |

### Detalle

**POST `/api/auth/register`**
```json
// Request
{ "email": "uo123456@uniovi.es", "password": "..." }
// Response 201
{ "message": "Email de verificación enviado" }
```
- El email debe terminar en `@uniovi.es`
- Validar robustez de contraseña (mínimo 8 caracteres, al menos una mayúscula y un número)

**POST `/api/auth/login`**
```json
// Request
{ "email": "uo123456@uniovi.es", "password": "..." }
// Response 200 (token en cookie httpOnly)
{ "user": { "email": "uo123456@uniovi.es", "role": "user" } }
```

**POST `/api/auth/logout`**
```
// Response 200 (cookie invalidada)
{ "message": "ok" }
```

**GET `/api/auth/verify?token=abc123`**
```
// Response 200
{ "message": "Email verificado correctamente" }
```

**POST `/api/auth/recover`**
```json
// Request
{ "email": "uo123456@uniovi.es" }
// Response 200 (siempre, aunque el email no exista, para no filtrar usuarios)
{ "message": "Si el email existe, se ha enviado un enlace de recuperación" }
```

**POST `/api/auth/reset-password`**
```json
// Request (token en body, NO en query param)
{ "token": "abc123", "password": "nuevaContraseña" }
// Response 200
{ "message": "Contraseña actualizada" }
```

**GET `/api/auth/me`**
```json
// Response 200
{ "email": "uo123456@uniovi.es", "role": "user" }
```
Sustituye al antiguo `GET /users/rol`. Se usa al cargar cualquier página protegida para obtener los datos del usuario autenticado.

---

## 2. Horarios (`/api/schedule`)

| Método | Endpoint | Autenticación | Descripción |
|---|---|---|---|
| GET | `/api/schedule/{identifier}` | No | Consultar horario por UO o por curso |
| POST | `/api/schedule/copy` | Sí | Copiar horario de otro usuario al propio |

### Detalle

**GET `/api/schedule/{identifier}`**
```
// identifier puede ser un UO (ej: "uo123456") o un código de curso (ej: "infmatprimero")
// Response 200
{
  "subjects": [
    {
      "id": "abc123",
      "name": "ALG",
      "type": "Teoría",
      "classroom": "Aula 1",
      "date": { "year": 2025, "month": 9, "day": 15 },
      "startTime": "09:00",
      "endTime": "10:30"
    }
  ]
}
```
- Endpoint público, no requiere autenticación
- Devuelve array plano de asignaturas; la agrupación en Year/Week/Day la hace el frontend
- Si el identificador no existe o no tiene datos: `200` con `{ "subjects": [] }`
- Si el identificador no es válido (< 6 caracteres): `400`

**POST `/api/schedule/copy`**
```json
// Request
{ "from": "uo654321", "to": "uo123456" }
// Response 200
{ "message": "Horario copiado", "copied_count": 42 }
```
- Requiere autenticación
- El campo `to` debe coincidir con el usuario autenticado (no se puede copiar al horario de otro)

---

## 3. Clases (`/api/classes`)

| Método | Endpoint | Autenticación | Rol mínimo | Descripción |
|---|---|---|---|---|
| POST | `/api/classes` | Sí | Profesor | Crear clase o examen |
| PATCH | `/api/classes/{id}` | Sí | Profesor | Editar clase |
| DELETE | `/api/classes/{id}` | Sí | Profesor | Eliminar clase |

### Detalle

**POST `/api/classes`**
```json
// Request
{
  "name": "ALG",
  "type": "Teoría",
  "classroom": "Aula 1",
  "date": { "year": 2025, "month": 9, "day": 15 },
  "startTime": "09:00",
  "durationMinutes": 90
}
// Response 201
{ "id": "abc123", "endTime": "10:30", ... }
```
- `durationMinutes` debe ser múltiplo de 30
- `endTime` calculado en backend (no confiar en el frontend)
- `classroom` es opcional
- `name`, `type`, `date`, `startTime` son obligatorios

**PATCH `/api/classes/{id}`**
```json
// Request (solo campos a modificar)
{ "classroom": "Aula 2", "startTime": "10:00", "durationMinutes": 60 }
// Response 200
{ "id": "abc123", ... }
```

**DELETE `/api/classes/{id}`**
```
// Response 200
{ "message": "Clase eliminada" }
```

---

## 4. Propuestas de cambio (`/api/proposals`)

| Método | Endpoint | Autenticación | Rol mínimo | Descripción |
|---|---|---|---|---|
| POST | `/api/proposals` | Sí | Usuario | Crear propuesta |
| GET | `/api/proposals` | Sí | Profesor | Listar propuestas pendientes |
| GET | `/api/proposals/mine` | Sí | Usuario | Listar mis propuestas |
| PATCH | `/api/proposals/{id}/approve` | Sí | Profesor | Aprobar propuesta |
| PATCH | `/api/proposals/{id}/reject` | Sí | Profesor | Rechazar propuesta |

### Detalle

**POST `/api/proposals`**
```json
// Request
{
  "action": "update",
  "class_id": "abc123",
  "changes": {
    "classroom": "Aula 3",
    "startTime": "11:00",
    "durationMinutes": 60
  }
}
// Response 201
{ "id": "prop456", "status": "pending", "created_at": "..." }
```
- `action` puede ser `"create"`, `"update"` o `"delete"`
- Para `"create"`: `changes` contiene todos los campos de la nueva clase (sin `class_id`)
- Para `"update"`: `class_id` obligatorio + `changes` con los campos a modificar
- Para `"delete"`: solo `class_id`

**GET `/api/proposals?status=pending&page=1&limit=10`**
```json
// Response 200
{
  "data": [
    {
      "id": "prop456",
      "action": "update",
      "class_id": "abc123",
      "old": { "classroom": "Aula 1", "startTime": "09:00" },
      "new": { "classroom": "Aula 3", "startTime": "11:00" },
      "status": "pending",
      "author": "uo123456@uniovi.es",
      "created_at": "2025-09-10T14:30:00Z"
    }
  ],
  "total": 23,
  "page": 1,
  "limit": 10
}
```
- Soporta filtro por `status`: `pending`, `approved`, `rejected`, `all`
- Paginación server-side
- El snapshot `old`/`new` lo genera el backend al crear la propuesta

**GET `/api/proposals/mine?page=1&limit=10`**
```json
// Response 200 (misma estructura, filtrado por el usuario autenticado)
```

**PATCH `/api/proposals/{id}/approve`**
```
// Response 200
{ "id": "prop456", "status": "approved" }
```
- Al aprobar, el backend aplica automáticamente el cambio al `Subject` correspondiente
- Devuelve `409` si la propuesta ya fue aprobada/rechazada

**PATCH `/api/proposals/{id}/reject`**
```json
// Request (opcional)
{ "reason": "No hay aula disponible a esa hora" }
// Response 200
{ "id": "prop456", "status": "rejected" }
```

---

## 5. Selección de grupos (`/api/subjects`)

| Método | Endpoint | Autenticación | Descripción |
|---|---|---|---|
| GET | `/api/subjects/catalog` | Sí | Catálogo de asignaturas y grupos + selección actual |
| POST | `/api/subjects/selection` | Sí | Guardar selección de grupos |
| POST | `/api/subjects/auto-select` | Sí | Iniciar autoselección |
| GET | `/api/subjects/auto-select/status` | Sí | Consultar estado de autoselección |

### Detalle

**GET `/api/subjects/catalog`**
```json
// Response 200
{
  "subjects": [
    {
      "code": "ALG",
      "name": "Álgebra Lineal",
      "groups": [
        { "id": "alg-g1", "name": "Grupo 1", "selected": true },
        { "id": "alg-g2", "name": "Grupo 2", "selected": false }
      ]
    }
  ]
}
```
- Devuelve el catálogo completo con la selección actual del usuario autenticado marcada

**POST `/api/subjects/selection`**
```json
// Request
{ "groups": ["alg-g1", "cdi-g2", "prog-g1"] }
// Response 200
{ "message": "Selección guardada", "count": 3 }
```
- Reemplaza la selección completa (no es incremental)

**POST `/api/subjects/auto-select`**
```json
// Response 202 (accepted, procesando en background)
{ "job_id": "job789", "status": "processing" }
```
- Operación asíncrona; el backend procesa en background

**GET `/api/subjects/auto-select/status`**
```json
// Response 200
{ "job_id": "job789", "status": "completed", "groups_selected": 12 }
// O si todavía está procesando:
{ "job_id": "job789", "status": "processing" }
// O si falló:
{ "job_id": "job789", "status": "failed", "error": "..." }
```
- El frontend hace polling sobre este endpoint (cada 5-10 segundos) hasta que `status` sea `completed` o `failed`

---

## 6. Gestión de usuarios (`/api/users`)

| Método | Endpoint | Autenticación | Rol mínimo | Descripción |
|---|---|---|---|---|
| GET | `/api/users` | Sí | Admin | Listar usuarios |
| PATCH | `/api/users/{email}/role` | Sí | Admin | Cambiar rol |
| DELETE | `/api/users/{email}` | Sí | Admin | Eliminar usuario |

### Detalle

**GET `/api/users?search=uo123&role=professor&page=1&limit=20`**
```json
// Response 200
{
  "data": [
    { "email": "uo123456@uniovi.es", "role": "professor" }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```
- Filtrado y paginación server-side
- `search` filtra por email (parcial)
- `role` filtra por rol exacto

**PATCH `/api/users/{email}/role`**
```json
// Request
{ "role": "professor" }
// Response 200
{ "email": "uo123456@uniovi.es", "role": "professor" }
```
- `role` debe ser `"user"`, `"professor"` o `"admin"`
- No se puede cambiar el propio rol → `403`
- No se puede degradar al último admin → `409`

**DELETE `/api/users/{email}`**
```
// Response 200
{ "message": "Usuario eliminado" }
```
- No se puede eliminar a uno mismo → `403`

---

## Tabla de migración desde endpoints originales

| Endpoint original | Método | Nuevo endpoint | Cambios |
|---|---|---|---|
| `/users/login` | POST | `/api/auth/login` | Email ahora con dominio `@uniovi.es`; JWT en cookie `httpOnly` |
| `/users/create/` | POST | `/api/auth/register` | Sin cambios funcionales |
| `/users/verify?token=` | GET | `/api/auth/verify?token=` | Sin cambios |
| `/users/recover` | POST | `/api/auth/recover` | Implementar completamente (era placeholder) |
| `/users/reset-password/verify?token=` | POST | `/api/auth/reset-password` | Token en body en lugar de query param |
| `/logout` | POST | `/api/auth/logout` | Ahora invalida cookie |
| `/users/rol` | GET | `/api/auth/me` | Devuelve email + rol completo |
| `/users` | GET | `/api/users` | Añade paginación y filtrado server-side |
| `/users/make-admin/{email}` | PATCH | `/api/users/{email}/role` | Unificado en un solo endpoint con rol en body |
| `/users/make-professor/{email}` | PATCH | `/api/users/{email}/role` | ↑ |
| `/users/make-normal/{email}` | PATCH | `/api/users/{email}/role` | ↑ |
| `/users/delete/{email}` | DELETE | `/api/users/{email}` | Validación de no autoelimación |
| `/schedule/userSchedule/{uoFilter}` | GET | `/api/schedule/{identifier}` | Unifica consulta por UO y por curso |
| `/schedule/createSubject` | POST | `/api/classes` | Validación de `endTime` en backend |
| `/schedule/patchSubject/{id}` | PATCH | `/api/classes/{id}` | Sin cambios mayores |
| `/schedule/delete/{id}` | DELETE | `/api/classes/{id}` | Ya no crea `PendingEdit` implícito |
| `/schedule/copiar?email1=&email2=` | POST | `/api/schedule/copy` | Params en body, no en query |
| `/schedule/pendingEdits` | GET | `/api/proposals` | Paginación server-side; filtro por status |
| `/schedule/approve/{id}` | PATCH | `/api/proposals/{id}/approve` | Aplica cambio automáticamente |
| `/schedule/reject/{id}` | PATCH | `/api/proposals/{id}/reject` | Permite motivo de rechazo |
| `/schedule/tipos` | GET | `/api/subjects/catalog` | Incluye selección actual del usuario |
| `/schedule/horario` | POST | `/api/subjects/selection` | Sin cambios funcionales |
| `/schedule/subjects?email=` | GET | `/api/subjects/auto-select` | Ahora es POST (inicia operación async) |
| *(nuevo)* | — | `/api/subjects/auto-select/status` | Sustituye el polling sobre localStorage |
| *(nuevo)* | — | `/api/proposals` (POST) | Nuevo: cualquier usuario autenticado puede proponer |
| *(nuevo)* | — | `/api/proposals/mine` | Nuevo: usuario ve sus propias propuestas |
