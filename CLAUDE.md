# CLAUDE.md — PCEO Hub

Documento de referencia para el desarrollo del frontend. Lee esto antes de generar cualquier componente, página o hook. No es negociable salvo que el usuario lo indique explícitamente.

---

## 1. Qué es esta app

Aplicación web de consulta y gestión de horarios universitarios para los grados del PCEO (Universidad de Oviedo). Combina una vista pública de horarios (sin login) con un panel de gestión protegido por roles.

**Nombre:** PCEO Hub  
**Stack:** Next.js (App Router + SSR) · React 19 · Tailwind CSS · TanStack Query · JWT en cookie `httpOnly`  
**i18n:** `next-intl`. Español por defecto si el navegador no indica otro idioma. Switch en menú de perfil. Todos los textos visibles deben ir en archivos de traducción desde el primer componente — nunca strings literales en JSX.  
**Iconos:** Lucide React para navegación, acciones y estados.  
**Tipografía:** Geist (`next/font/google`). Una sola familia. Pesos: 400, 500, 600 únicamente.  
**Despliegue:** Docker · VM con backend y base de datos en la misma máquina.

---

## 2. Roles y permisos

| Capacidad | Visitante | Autenticado | Profesor | Admin |
|---|:---:|:---:|:---:|:---:|
| Consultar horario por titulación/curso | ✓ | ✓ | ✓ | ✓ |
| Consultar horario personal (por UO) | ✓ | ✓ | ✓ | ✓ |
| Navegar semanas/semestres | ✓ | ✓ | ✓ | ✓ |
| Cambiar tema claro/oscuro | ✓ | ✓ | ✓ | ✓ |
| Seleccionar grupos de asignaturas | ✗ | ✓ | ✓ | ✓ |
| Autoselección de grupos | ✗ | ✓ | ✓ | ✓ |
| Copiar horario de otro usuario | ✗ | ✓ | ✓ | ✓ |
| Proponer cambios de horario | ✗ | ✓ | ✓ | ✓ |
| Crear/editar/eliminar clases directamente | ✗ | ✗ | ✓ | ✓ |
| Aprobar/rechazar propuestas | ✗ | ✗ | ✓ | ✓ |
| Gestionar usuarios (roles, eliminar) | ✗ | ✗ | ✗ | ✓ |

Los profesores pueden aprobar sus propias propuestas. Las propuestas de profesores se aprueban automáticamente en backend — el frontend no necesita tratarlo de forma especial, simplemente refleja el estado que devuelve la API.

---

## 3. Rutas y navegación

### Layout general
- **Topbar fija** (56–64px) en todas las páginas excepto auth.
- **Sin sidebar.** Navegación exclusivamente horizontal.
- Fondo `surface-base` con `border-subtle` inferior. Opaca en scroll, sin blur.

### Contenido de la topbar
- Izquierda: nombre "PCEO Hub" en `body-strong`. Sin logo por ahora.
- Centro-derecha: links de navegación según rol (ver abajo).
- Extremo derecho: toggle tema (Lucide `Sun`/`Moon`) · campana notificaciones (solo autenticados) · botón "Iniciar sesión" o menú de perfil (dropdown: email, rol, switch idioma, cerrar sesión).

### Links de navegación por rol
- **Visitante:** Horario
- **Autenticado:** Horario · Mis Asignaturas · Propuestas
- **Profesor/Admin:** Horario · Mis Asignaturas · Propuestas · Gestión

### Rutas
```
/                          → Horario (público)
/auth/login
/auth/register
/auth/verify
/auth/recover
/auth/reset-password
/schedule                  → alias o redirect a /
/my-subjects               → Selección de grupos (autenticado)
/proposals                 → Mis propuestas (autenticado) / Revisar propuestas (profesor/admin)
/manage/classes            → Crear/editar clases (profesor/admin)
/manage/users              → Gestión de usuarios (solo admin)
```

### Mobile
- Topbar: solo logo + hamburguesa. Abre drawer con navegación completa, selector titulación, toggle tema, perfil/login.
- Breakpoints: `mobile < 640px` · `tablet 640–1023px` · `desktop ≥ 1024px`

### Páginas de auth
- Layout minimalista: logo centrado + formulario. Sin topbar completa.

---

## 4. Módulos funcionales y API

### Base URL: `/api` · Auth: cookie `httpOnly` · Errores: `{ error, message }`

#### Autenticación
| Método | Endpoint | Trigger |
|---|---|---|
| POST | `/api/auth/login` | Submit formulario login |
| POST | `/api/auth/register` | Submit formulario registro |
| GET | `/api/auth/verify?token=` | Cargar página verify |
| POST | `/api/auth/recover` | Submit recuperación |
| POST | `/api/auth/reset-password` | Submit nueva contraseña (token en body, no query param) |
| POST | `/api/auth/logout` | Click cerrar sesión |
| GET | `/api/auth/me` | Al cargar cualquier página protegida |

#### Horario (público)
| Método | Endpoint | Trigger |
|---|---|---|
| GET | `/api/schedule/{identifier}` | Enter en input UO o click en botón de curso |

- `identifier` es un UO (`uo123456`) o código de curso (`infmatprimero`).
- Devuelve array plano de `subjects`. La agrupación Year/Week/Day la hace el frontend.
- No relanzar si el identificador ya está cargado (comparar antes de fetch).
- `200 { subjects: [] }` = sin datos (mostrar estado vacío, no error).
- `400` = identificador inválido.

#### Clases (profesor/admin)
| Método | Endpoint | Trigger |
|---|---|---|
| POST | `/api/classes` | Crear clase |
| PATCH | `/api/classes/{id}` | Editar clase |
| DELETE | `/api/classes/{id}` | Eliminar clase |

#### Propuestas
| Método | Endpoint | Trigger |
|---|---|---|
| POST | `/api/proposals` | Enviar propuesta |
| GET | `/api/proposals?status=pending&page=1&limit=10` | Vista de revisión (profesor/admin) |
| GET | `/api/proposals/mine?page=1&limit=10` | Vista mis propuestas |
| PATCH | `/api/proposals/{id}/approve` | Aprobar |
| PATCH | `/api/proposals/{id}/reject` | Rechazar (body opcional: `{ reason }`) |

#### Selección de grupos
| Método | Endpoint | Trigger |
|---|---|---|
| GET | `/api/subjects/catalog` | Cargar vista Mis Asignaturas |
| POST | `/api/subjects/selection` | Guardar selección |
| POST | `/api/subjects/auto-select` | Iniciar autoselección |
| GET | `/api/subjects/auto-select/status` | Polling cada 5s hasta completed/failed |

#### Usuarios (admin)
| Método | Endpoint | Trigger |
|---|---|---|
| GET | `/api/users?search=&role=&page=1&limit=20` | Cargar lista |
| PATCH | `/api/users/{email}/role` | Cambiar rol (body: `{ role }`) |
| DELETE | `/api/users/{email}` | Eliminar usuario |

#### Copiar horario
| Método | Endpoint | Trigger |
|---|---|---|
| POST | `/api/schedule/copy` | Confirmar copia (body: `{ from, to }`) |

---

## 5. Cuadrícula de horario

El componente más importante de la app.

- **Rango fijo:** 08:00–21:00, intervalos de 30 min. Siempre lunes a viernes (5 columnas, incluso si algún día está vacío).
- **Posicionamiento:**
  - `startRow = (startMinutes − 8*60) / 30 + 1`
  - `durationSlots = (endMinutes − startMinutes) / 30`
- **Solapamientos:** bloques en la misma franja se muestran lado a lado (50/50 para dos, 33/33/33 para tres).
- **Bloque de asignatura:**
  - Borde izquierdo 3–4px en color de la asignatura.
  - Fondo en variante pastel (light) / oscura (dark) del mismo color.
  - Primera línea: nombre corto (`small-strong`). Segunda: tipo + aula (`small`, `text-secondary`).
  - Si el bloque es muy corto: truncar con ellipsis + tooltip en hover.
  - En curso ahora: indicador visual sutil (borde más ancho o punto pulsante).
- **Línea de hora actual:** se actualiza en tiempo real, color `accent`.
- **Mobile (<640px):** vista diaria por defecto. Tabs para navegar entre días. Swipe opcional.
- **Skeleton de carga:** bloques rectangulares pulsantes en las posiciones esperadas. No spinner centrado.
- **Estado vacío:** cuadrícula con estructura visible pero sin bloques. Mensaje centrado en `text-secondary`.
- **Fuera de período lectivo (1 jul – 31 ago):** selector de semestre deshabilitado, mensaje informativo.

### Navegación temporal (encima de la cuadrícula, no en topbar)
- Selector de semestre: tabs "1º Semestre" / "2º Semestre". Activo: fondo `accent-subtle`, texto `accent`.
- Navegador de semanas: `‹` fecha-inicio – fecha-fin `›`. Botón "Hoy" solo si no estás en la semana actual.
- Persistencia en `localStorage`: `selectedSemester`, `selectedWeek`.
- Validar que la semana guardada pertenece al semestre activo al cargar.

### Selector de horario (entre topbar y cuadrícula)
- Input UO con placeholder "UO123456" + botón buscar.
- Chips/tabs horizontales: Primero · Segundo · Tercero · Cuarto · Quinto.
- Titulaciones hardcodeadas (candidatas a migrar al backend en el futuro):

| Titulación | Prefijo |
|---|---|
| Matemáticas | `mat` |
| Informática | `inf` |
| Física | `fis` |
| Informática + Matemáticas | `infmat` |
| Física + Matemáticas | `fismat` |
| Matemáticas + Física | `matfis` |

---

## 6. Colores de asignatura

Pool de 14–16 colores asignados cíclicamente, **no** un mapa de 72 entradas. Agrupados por titulación:
- **Matemáticas** (24 códigos conocidos): gama fría — azules, púrpuras, teales.
- **Informática** (resto): gama cálida — naranjas, verdes, rosas.

Cada color tiene dos variantes: fondo pastel (light) y fondo oscuro+desaturado (dark). El borde izquierdo siempre usa el color saturado.

---

## 7. Sistema de diseño

### Tokens de color
| Token | Light | Dark |
|---|---|---|
| `surface-base` | Blanco cálido | Gris muy oscuro (frío) |
| `surface-raised` | Gris muy claro | Gris oscuro |
| `surface-sunken` | Gris claro | Negro o casi negro |
| `border-subtle` | Gris claro baja opacidad | Gris medio baja opacidad |
| `border-strong` | Gris medio | Gris claro |
| `text-primary` | Gris muy oscuro (no negro puro) | Blanco rebajado (no #fff) |
| `text-secondary` | Gris medio | Gris claro |
| `text-tertiary` | Gris claro | Gris medio oscuro |
| `accent` | Índigo vivo | Índigo vivo (misma saturación) |
| `accent-subtle` | Índigo 10–15% opacidad | Índigo 10–15% opacidad |
| `accent-hover` | Índigo más oscuro | Índigo más oscuro |

**Temperatura:** neutros cálidos en light (micro-dosis amarillo/arena), neutros fríos en dark (micro-dosis azul). No grises puros.

### Colores semánticos (solo para comunicar estado, nunca decorativos)
| Token | Color | Usos |
|---|---|---|
| `error` / `error-subtle` | Rojo | Errores formulario, eliminar, propuesta rechazada |
| `warning` / `warning-subtle` | Ámbar | Propuesta pendiente, operación lenta |
| `success` / `success-subtle` | Verde | Propuesta aprobada, guardado OK |
| `info` / `info-subtle` | Azul claro | Mensajes informativos |

### Tipografía (Geist)
| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `heading-page` | 22–24px | 600 | Título de página |
| `heading-section` | 17–18px | 500 | Título de sección |
| `body` | 14–15px | 400 | Texto general |
| `body-strong` | 14–15px | 500 | Labels formulario, datos destacados |
| `small` | 12–13px | 400 | Texto en bloques cuadrícula, metadatos |
| `small-strong` | 12–13px | 500 | Labels en bloques, badges |

Semibold (600) solo para `heading-page`. Números en cuadrícula: `font-variant-numeric: tabular-nums`.

### Espaciado (base 4px)
`space-1` 4px · `space-2` 8px · `space-3` 12px · `space-4` 16px · `space-5` 20px · `space-6` 24px · `space-8` 32px · `space-10` 40px · `space-12` 48px

### Radios
- `radius-sm` 4px — badges, inputs, botones
- `radius-md` 8px — tarjetas, modales, paneles

### Sombras
Mínimas. Solo en elementos que flotan genuinamente (dropdowns, tooltips, modales). En dark mode casi invisibles — la jerarquía se comunica por diferencia de `surface-*`, no por sombra.

---

## 8. Patrones de componentes

### Formularios
- Labels siempre encima del campo. Peso `body-strong`. Nunca flotantes.
- Inputs: fondo `surface-sunken`, borde `border-subtle`, foco: `border-strong` + anillo `accent`. Altura 40px, padding `space-4`.
- Botón primario: fondo `accent`, texto blanco, `radius-sm`, alineado derecha.
- Botón secundario: sin fondo, borde `border-subtle`, texto `text-secondary`.
- Errores de validación: bajo el campo, `small`, color `error`. Borde del campo en `error`. No toast para validación.
- Submit en loading: botón deshabilitado con spinner inline. No estado de carga separado.

### Listas y tablas
- Desktop (≥1024px): tabla con separadores `border-subtle`.
- Mobile: tarjetas apiladas.
- Paginación explícita (no scroll infinito). Server-side para propuestas y usuarios.
- Filas skeleton de 3–5 líneas con anchos variados durante carga.
- Estado vacío: mensaje centrado en `text-secondary`. Sin ilustraciones.

### Errores de API
- Banner inline en la zona afectada: fondo `error-subtle`, borde `error`, botón "Reintentar".
- No toast para errores de fetch. Toast solo para eventos asíncronos (notificación aprobada/rechazada, error de servidor inesperado).
- Sesión expirada: redirect a `/auth/login` con mensaje informativo.

### Notificaciones in-app
- Campana en topbar (solo autenticados). Badge con contador de no leídas.
- Dropdown al hacer click: últimas 20 notificaciones. Máximo almacenado: 50.
- Las notificaciones **no** se marcan como leídas al abrir el dropdown. El usuario las descarta manualmente.
- Tipos: propuesta aprobada/rechazada (para el autor), nueva propuesta pendiente (para profesor/admin), clase modificada si el usuario está afectado.

---

## 9. Persistencia en cliente

| Dato | Storage |
|---|---|
| Titulación seleccionada | `localStorage` |
| Semestre seleccionado | `localStorage` |
| Semana seleccionada | `localStorage` |
| Tema (light/dark) | `localStorage` |
| Idioma preferido (si el usuario lo cambió) | `localStorage` |
| Token JWT | cookie `httpOnly` (gestionada por backend) |

---

## 10. Reglas absolutas

Estas restricciones nunca se saltan salvo instrucción explícita:

1. **No glassmorphism ni `backdrop-filter`.** Superficies opacas siempre.
2. **No animaciones de transición entre páginas.** Instantáneas. Fade máx. 100–150ms solo en cuadrícula.
3. **No ilustraciones ni imágenes decorativas.** Estados vacíos y errores: solo texto + icono Lucide.
4. **No scroll infinito.** Siempre paginación explícita.
5. **No sidebar ni tabs verticales.** Navegación solo horizontal (topbar).
6. **No toast para validación de formulario.** Errores inline bajo el campo.
7. **No dark mode con colores neón.** Acento mantiene la misma saturación en ambos temas.
8. **No bold (700) ni thin (300).** Solo pesos 400, 500, 600.
9. **No strings literales en JSX.** Todo texto visible pasa por `next-intl`.
10. **No drag & drop** en esta versión.
11. **No onboarding ni tour guiado.**
12. **No una segunda familia tipográfica.** Solo Geist.
13. **No tooltip como mecanismo principal.** Si el dato es importante, se muestra directamente.
14. **Admin no puede eliminarse a sí mismo ni cambiar su propio rol.** Validar en frontend Y backend.
15. **No relanzar fetch si el identificador/datos ya están cargados.** Comparar antes de llamar a la API.
