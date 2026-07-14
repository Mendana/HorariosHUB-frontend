# ARCHITECTURE.md — Horarios Hub (Unificado)

Aplicación web unificada de consulta y gestión de horarios universitarios para los grados del PCEO (doble grado) de la Universidad de Oviedo. Combina la consulta pública de horarios con un panel de administración protegido por autenticación.

---

## Stack tecnológico

| Capa          | Tecnología                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js (App Router, SSR)                                                                                                               |
| UI            | React 19 + Tailwind CSS (+ CSS puro donde convenga)                                                                                     |
| Estado        | React Server Components para datos estáticos; `useState`/`useReducer` + React Query (TanStack Query) para estado cliente y caché de API |
| Autenticación | JWT (httpOnly cookie — ver sección de autenticación)                                                                                    |
| Despliegue    | Docker → VM con backend y base de datos en la misma máquina                                                                             |

---

## Modelo de usuarios y roles

### Visitante (sin autenticación)

Cualquier persona que accede a la app. No necesita cuenta ni login.

### Usuario autenticado

Se identifica con email `@uniovi.es` y contraseña. Al autenticarse, desbloquea funcionalidades de personalización y propuesta de cambios.

### Profesor

Usuario con permisos elevados. Puede aprobar o rechazar propuestas de cambio de horario además de proponerlas.

### Admin

Control total. Gestiona usuarios (roles, eliminación) y tiene todas las capacidades de profesor.

### Tabla de permisos

| Capacidad                              | Visitante | Autenticado | Profesor | Admin |
| -------------------------------------- | :-------: | :---------: | :------: | :---: |
| Consultar horario por titulación/curso |     ✓     |      ✓      |    ✓     |   ✓   |
| Consultar horario personal (por UO)    |     ✓     |      ✓      |    ✓     |   ✓   |
| Navegar semanas/semestres              |     ✓     |      ✓      |    ✓     |   ✓   |
| Cambiar tema claro/oscuro              |     ✓     |      ✓      |    ✓     |   ✓   |
| Seleccionar grupos de asignaturas      |     ✗     |      ✓      |    ✓     |   ✓   |
| Autoselección de grupos                |     ✗     |      ✓      |    ✓     |   ✓   |
| Copiar horario de otro usuario         |     ✗     |      ✓      |    ✓     |   ✓   |
| Proponer cambios de horario            |     ✗     |      ✓      |    ✓     |   ✓   |
| Crear clases/exámenes                  |     ✗     |      ✗      |    ✓     |   ✓   |
| Aprobar/rechazar propuestas            |     ✗     |      ✗      |    ✓     |   ✓   |
| Gestionar usuarios (roles, eliminar)   |     ✗     |      ✗      |    ✗     |   ✓   |

> ⚠️ **Inconsistencia original:** En el admin panel, los profesores necesitaban aprobación de admin para sus cambios. En el nuevo modelo, los profesores _pueden_ aprobar cambios directamente (como un superusuario sin gestión de usuarios). Esto cambia el flujo de aprobaciones: ¿quién aprueba los cambios de un profesor? Ver **Preguntas abiertas #1**.

### Identificación de estudiantes UO

Los emails con patrón `uo[4-6 dígitos]@uniovi.es` se tratan como alumnos y reciben filtros de titulación/curso adaptados a su perfil.

---

## Módulos funcionales

---

### 1. Consulta de horario (público)

**Usuarios:** Todos (incluidos visitantes)

**Descripción:** Módulo central de la app. Permite consultar horarios sin autenticación de dos formas: por identificador UO (horario personal) o por curso predefinido (horario genérico de un año académico).

**Acciones:**

- Introducir UO manualmente para cargar horario personal (mínimo 6 caracteres)
- Seleccionar un curso predefinido (Primero, Segundo… Quinto) para ver el horario genérico
- Seleccionar titulación al abrir la app por primera vez (6 titulaciones disponibles)
- Cambiar de titulación desde cualquier pantalla

**Titulaciones disponibles:**

| Titulación                            | Identificador |
| ------------------------------------- | ------------- |
| Grado en Matemáticas                  | `matXXX`      |
| Grado en Ingeniería Informática       | `infXXX`      |
| Grado en Física                       | `fisXXX`      |
| Doble Grado Informática + Matemáticas | `infmatXXX`   |
| Doble Grado Física + Matemáticas      | `fismatXXX`   |
| Doble Grado Matemáticas + Física      | `matfisXXX`   |

**Entidades de datos:**

| Entidad   | Campos relevantes                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| `Subject` | `id`, `name`, `type` (Teoría/Práctica/Examen/Otros), `classroom`, `date`, `startTime`, `endTime`, `approved` |
| `Day`     | `dia`, `mes`, `year`, `weekDay`                                                                              |
| `Week`    | `weekNumber` (ISO), `year`, `days{}`                                                                         |
| `Year`    | `year` (académico), `weeks{}`                                                                                |

**Llamadas a API:**

| Método | Endpoint                       | Trigger                                               |
| ------ | ------------------------------ | ----------------------------------------------------- |
| GET    | `/api/schedule/{uo_or_course}` | Al pulsar Enter en input UO o al seleccionar un curso |

> ⚠️ **Inconsistencia original:** El backend trata los cursos predefinidos (p.ej. `infmatprimero`) como si fueran un UO más. No hay endpoint dedicado para "horario de grupo". Esto acopla el concepto de usuario al de grupo-curso.

> ⚠️ **Problema original (ambos repos):** Los identificadores de curso (`infmatprimero`, `matcuarto`, etc.) están hardcodeados en el frontend. Si cambian en el backend no hay contrato explícito. Por ahora se mantienen así, con la idea de moverlos al backend en el futuro.

**🔲 Funcionalidad incompleta:**

- No hay indicador de carga mientras se espera la respuesta del backend.
- Los errores HTTP no se distinguen al usuario: "UO sin horario" y "error de servidor" muestran el mismo estado vacío.
- El trigger `onBlur` del input UO lanzaba peticiones al backend aunque el UO no hubiera cambiado. El nuevo frontend debe comparar con el valor ya cargado antes de lanzar la petición.
- Si el usuario hace clic en el mismo botón de curso ya cargado, no debería relanzarse la petición.

---

### 2. Visualización del horario semanal

**Usuarios:** Todos

**Descripción:** Cuadrícula semanal tipo Google Calendar que muestra las asignaturas como bloques posicionados por hora. Incluye vistas semanal y diaria.

**Acciones:**

- Ver asignaturas distribuidas en cuadrícula horaria (09:00–20:00, intervalos de 30 min)
- Ver nombre, tipo (Teoría/Práctica), aula y duración de cada bloque
- Identificar visualmente cada asignatura por color e icono
- Ver línea indicadora de la hora actual en tiempo real
- 🔲 Cambiar entre vista semanal y vista diaria

**Lógica de posicionamiento:**

- `startRow = (startMinutes − 9*60) / 30 + 1`
- `durationSlots = (endMinutes − startMinutes) / 30`

**Datos de presentación hardcodeados (se mantienen en frontend):**

- Mapa de colores por asignatura (~72 entradas, código → clase CSS Tailwind)
- Mapa de iconos por asignatura (código → ruta de imagen)
- Lista de 24 códigos de asignaturas de Matemáticas (el resto se considera Informática)

**⚠️ Problemas detectados:**

- No hay manejo de solapamientos: si dos asignaturas ocurren a la misma hora, se superponen visualmente sin tratamiento.
- El icono por defecto es una imagen personal del desarrollador, no un placeholder genérico. Debe sustituirse.
- Añadir una asignatura nueva requiere modificar los mapas de colores/iconos en el código.

**🔲 Funcionalidad por decidir:**

- ¿Funcionalidad de arrastrar bloques para mover clases (drag & drop)? Ver **Preguntas abiertas #6**.
- ¿Vista mensual además de semanal y diaria?

---

### 3. Navegación temporal (semana / semestre)

**Usuarios:** Todos

**Acciones:**

- Seleccionar semestre académico (1º o 2º)
- Navegar entre semanas con botones de flecha
- La app selecciona automáticamente la semana más cercana a la fecha actual al cambiar de semestre

**Datos que maneja:**

- `selectedSemester`: año académico, persistido en `localStorage`
- `selectedWeek`: número ISO de semana, persistido en `localStorage`
- Lista de semanas disponibles extraída de los datos ya cargados (sin llamada extra)

**Llamadas a API:** Ninguna (datos ya cargados del módulo 1).

**⚠️ Problemas detectados:**

- El selector de semestre solo aparece si hay datos de 2+ años académicos. Si el usuario aún no ha consultado un horario, no es visible.
- No hay validación de que la semana guardada en `localStorage` pertenezca al semestre seleccionado, lo que puede causar inconsistencias silenciosas entre sesiones.

---

### 4. Autenticación y cuenta

**Usuarios:** Todos (no autenticados para login/registro; autenticados para el resto)

**Acciones:**

- Iniciar sesión con email y contraseña
- Registrarse con email `@uniovi.es`
- Verificar email mediante token recibido por correo
- Solicitar recuperación de contraseña
- Restablecer contraseña con token de email
- Cerrar sesión

**Llamadas a API:**

| Método | Endpoint                   | Trigger                                 |
| ------ | -------------------------- | --------------------------------------- |
| POST   | `/api/auth/login`          | Enviar formulario de login              |
| POST   | `/api/auth/register`       | Enviar formulario de registro           |
| GET    | `/api/auth/verify?token=`  | Cargar página de verificación           |
| POST   | `/api/auth/recover`        | Enviar email de recuperación            |
| POST   | `/api/auth/reset-password` | Enviar nueva contraseña (token en body) |
| POST   | `/api/auth/logout`         | Pulsar "Cerrar sesión"                  |

**Mejoras respecto al sistema original:**

- JWT almacenado en cookie `httpOnly` en lugar de `localStorage` (protección contra XSS).
- Token de reset de contraseña enviado en el body del POST, no como query param.
- Login y registro usan el mismo formato de email (con dominio `@uniovi.es`), eliminando la inconsistencia original.

**🔲 Funcionalidad incompleta:**

- La página de recuperación de contraseña estaba marcada como placeholder en el repo original. Debe implementarse completamente.
- No hay validación de robustez de contraseña (longitud mínima, caracteres especiales).

---

### 5. Selección de grupos de asignaturas

**Usuarios:** Autenticados (todos los roles)

**Descripción:** Permite al usuario elegir qué grupos concretos de cada asignatura quiere ver reflejados en su horario personal.

**Acciones:**

- Ver lista de asignaturas y grupos disponibles
- Buscar asignaturas por nombre o tipo
- Expandir/colapsar grupos de una asignatura
- Seleccionar/deseleccionar grupos individualmente
- Guardar selección (persiste en backend)
- Usar autoselección: el sistema deduce los grupos a partir del horario actual del usuario

**Entidades de datos:**

- `SubjectGroup` (antes `Cogido`): relación usuario → grupo de asignatura seleccionado
- `SubjectType`: catálogo de asignaturas y grupos disponibles

**Llamadas a API:**

| Método | Endpoint                           | Trigger                             |
| ------ | ---------------------------------- | ----------------------------------- |
| GET    | `/api/subjects/catalog`            | Al cargar la vista                  |
| POST   | `/api/subjects/selection`          | Al guardar la selección             |
| POST   | `/api/subjects/auto-select`        | Al iniciar autoselección            |
| GET    | `/api/subjects/auto-select/status` | Polling del estado de autoselección |

**Mejora respecto al original:** La autoselección ahora usa un endpoint de estado en el backend (`GET /api/subjects/auto-select/status`) en lugar del polling sobre `localStorage` con un interval de 30 segundos. El backend procesa la operación de forma asíncrona y el frontend consulta periódicamente hasta que termine.

**⚠️ Problemas detectados:**

- La autoselección es una operación lenta en el backend. Debe haber feedback claro al usuario (barra de progreso o spinner con mensaje indicando que puede tardar).

**🔲 Funcionalidad incompleta:**

- No hay indicación al usuario de cuántos grupos fueron seleccionados automáticamente tras completar la autoselección.

---

### 6. Propuesta de cambios de horario

**Usuarios:** Autenticados (todos los roles pueden proponer; profesores y admins pueden aprobar/rechazar)

**Descripción:** Cualquier usuario autenticado puede proponer un cambio de horario (mover una clase, cambiar aula, etc.). Los profesores y administradores revisan y aprueban o rechazan las propuestas.

**Acciones (proponer):**

- Proponer la creación de una nueva clase o examen
- Proponer la edición de una clase existente (aula, fecha, hora)
- Proponer la eliminación de una clase
- Ver el estado de las propias propuestas (pendiente / aprobada / rechazada)

**Acciones (revisar — profesor y admin):**

- Ver listado de propuestas pendientes
- Ver valores anteriores y nuevos de cada cambio (diff visual)
- Aprobar una propuesta
- Rechazar una propuesta

**Entidad de datos: `PendingEdit`**

| Campo             | Tipo     | Notas                                       |
| ----------------- | -------- | ------------------------------------------- |
| `id`              | string   | Identificador único                         |
| `action`          | enum     | `"create"` \| `"update"` \| `"delete"`      |
| `old_*` / `new_*` | varios   | Snapshot antes/después del cambio           |
| `status`          | enum     | `"pending"` \| `"approved"` \| `"rejected"` |
| `author`          | string   | Email del usuario que propone               |
| `created_at`      | datetime | Fecha de la propuesta                       |

**Llamadas a API:**

| Método | Endpoint                      | Trigger                                        |
| ------ | ----------------------------- | ---------------------------------------------- |
| POST   | `/api/proposals`              | Al enviar una propuesta                        |
| GET    | `/api/proposals`              | Al cargar la vista de propuestas               |
| GET    | `/api/proposals/mine`         | Al cargar mis propuestas (usuario autenticado) |
| PATCH  | `/api/proposals/{id}/approve` | Al aprobar                                     |
| PATCH  | `/api/proposals/{id}/reject`  | Al rechazar                                    |

> ⚠️ **Inconsistencia original:** El campo `clase_aproved` existía en la entidad `Subject` pero la lógica detallada (con `old_*/new_*`) vivía en `PendingEdit`. No estaba claro si una eliminación creaba siempre un `PendingEdit` o si la flag en `Subject` era suficiente. En el nuevo modelo, toda propuesta de cambio crea un `PendingEdit` con status triestado (`pending`/`approved`/`rejected`) y el campo `approved` en `Subject` se elimina.

> ⚠️ **Problema original:** No había feedback visual de que un cambio estaba "pendiente de aprobación". El usuario que proponía no sabía si su cambio fue aplicado.

**🔲 Funcionalidad incompleta:**

- No hay paginación en el listado de propuestas pendientes.
- No hay notificación en tiempo real cuando llegan nuevas propuestas; el revisor tiene que entrar manualmente a la pantalla.
- 🔲 ¿Debería haber notificación al usuario cuando su propuesta es aprobada/rechazada?

---

### 7. Gestión de clases (profesor / admin)

**Usuarios:** Profesor, Admin

**Descripción:** Creación y edición directa de clases y exámenes (sin flujo de propuestas). Solo disponible para profesores y administradores.

**Acciones:**

- Crear una nueva clase o examen (asignatura, tipo, fecha, hora inicio, duración)
- Editar una clase existente (aula, fecha, hora inicio/fin)
- Eliminar una clase

**Lógica de cálculo de hora de fin:** El usuario elige hora de inicio y duración (intervalos de 30 min, 8:00–21:30). El frontend calcula la hora de fin. Este cálculo debe validarse también en el backend.

**Validaciones de formulario:**

- Asignatura, tipo, fecha y hora de inicio son obligatorios
- Aula es opcional
- La hora de fin calculada no puede superar las 21:30

**Llamadas a API:**

| Método | Endpoint            | Trigger               |
| ------ | ------------------- | --------------------- |
| POST   | `/api/classes`      | Al crear una clase    |
| PATCH  | `/api/classes/{id}` | Al editar una clase   |
| DELETE | `/api/classes/{id}` | Al eliminar una clase |

---

### 8. Gestión de usuarios (admin)

**Usuarios:** Admin (exclusivo)

**Acciones:**

- Ver listado completo de usuarios con filtros por email y rol
- Cambiar el rol de un usuario (admin, profesor, usuario)
- Eliminar una cuenta de usuario

**Llamadas a API:**

| Método | Endpoint                  | Trigger                            |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/api/users`              | Al cargar la vista                 |
| PATCH  | `/api/users/{email}/role` | Al cambiar rol (nuevo rol en body) |
| DELETE | `/api/users/{email}`      | Al eliminar usuario                |

**Mejora respecto al original:** Un solo endpoint `PATCH /api/users/{email}/role` con el nuevo rol en el body, en lugar de tres endpoints separados (`make-admin`, `make-professor`, `make-normal`).

**⚠️ Problemas detectados:**

- Un admin no debería poder eliminarse a sí mismo ni cambiar su propio rol. Debe validarse tanto en frontend como en backend.
- El filtrado de usuarios se hacía en cliente sobre la lista completa. Si el número de usuarios crece, debe paginarse/filtrarse en servidor.

---

### 9. Copiar horario

**Usuarios:** Autenticados

**Descripción:** Permite copiar el horario completo de otro usuario al propio. Funcionalidad secundaria que se mantiene pero probablemente será poco usada si la autoselección de grupos funciona bien.

**Llamadas a API:**

| Método | Endpoint             | Trigger                              |
| ------ | -------------------- | ------------------------------------ |
| POST   | `/api/schedule/copy` | Al confirmar copia (from/to en body) |

---

### 10. Preferencias de usuario

**Usuarios:** Todos

**Acciones:**

- Cambiar entre modo claro y oscuro
- La preferencia del SO se respeta en la primera visita

**Datos:** `localStorage.theme` (`"light"` | `"dark"`).

**Llamadas a API:** Ninguna.

---

## Lógica de negocio en el frontend

### Datos hardcodeados (se mantienen en frontend)

- **Colores de asignaturas:** mapa de ~72 entradas (código → clase Tailwind). Solo afecta estilos.
- **Iconos de asignaturas:** mapa de código → ruta de imagen. Solo afecta estilos.
- **Lista de asignaturas de Matemáticas:** 24 códigos. El resto se considera Informática. Determina filtros de UI.

### Datos hardcodeados (en frontend por ahora, candidatos a migrar al backend)

- **Mapeo titulación → código UO:** 6 titulaciones × 4-5 cursos cada una.
- **Catálogo de titulaciones:** actualmente fijo, podría crecer si se mueve al backend.

### Cálculos del frontend

- **Hora de fin:** hora de inicio + duración (intervalos de 30 min).
- **Código corto de asignatura:** se extrae del nombre completo usando separador `-` o `.` (p.ej. `"MATES-TEÓRICA"` → `"MATES"`).
- **Paginación:** 10 ítems por página, calculada en cliente sobre datos ya cargados (no hay paginación server-side por ahora).

---

## Flujos de usuario principales

### Visitante

Acceder a la app → Seleccionar titulación → Ver horario genérico por curso **o** introducir UO para ver horario personal → Navegar semanas/semestres → (Opcionalmente) registrarse

### Usuario autenticado

Login → Ver horario personal → Seleccionar grupos en "Mis Asignaturas" (o autoselección) → Proponer cambios de horario → Ver estado de sus propuestas → Logout

### Profesor

Login → Ver horario → Crear/editar/eliminar clases directamente → Revisar y aprobar/rechazar propuestas de cambio → Logout

### Admin

Login → Todo lo del profesor + Gestionar roles de usuarios → Eliminar cuentas → Logout

---

## Persistencia de estado en cliente

| Dato                    | Almacenamiento    | Quién lo usa |
| ----------------------- | ----------------- | ------------ |
| Titulación seleccionada | `localStorage`    | Todos        |
| Semestre seleccionado   | `localStorage`    | Todos        |
| Semana seleccionada     | `localStorage`    | Todos        |
| Tema (claro/oscuro)     | `localStorage`    | Todos        |
| Token JWT               | cookie `httpOnly` | Autenticados |

---

## Problemas transversales resueltos respecto a los repos originales

| Problema                                                | Solución en el nuevo sistema                               |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| JWT en `localStorage` (vulnerable a XSS)                | Cookie `httpOnly`                                          |
| Token de reset en query param                           | Token en body del POST                                     |
| Tres endpoints para cambiar rol                         | Un solo `PATCH /api/users/{email}/role`                    |
| Polling de autoselección sobre `localStorage`           | Endpoint de estado en backend                              |
| Login sin dominio vs registro con dominio               | Ambos usan email completo con `@uniovi.es`                 |
| Lógica duplicada entre `MatematicasPage` y `FisicaPage` | Componente unificado de visualización                      |
| Firebase residual                                       | Eliminado; despliegue vía Docker                           |
| Sin indicador de carga                                  | Implementar estados de loading en todas las llamadas async |
| Sin distinción error/sin datos                          | Mensajes de error diferenciados                            |

---

## Ideas para funcionalidades nuevas

Estas ideas **no están en los repos originales** y se incluyen como sugerencias para valorar:

1. **Línea de hora actual:** indicador visual en la cuadrícula semanal que marca la hora del momento, como Google Calendar. Se mueve en tiempo real.

2. **Notificaciones in-app:** avisar al usuario cuando su propuesta de cambio es aprobada/rechazada. Avisar a profesores/admins cuando hay nuevas propuestas pendientes.

3. **Exportar horario a iCal (.ics):** permitir que el usuario descargue su horario para importarlo en Google Calendar, Apple Calendar, etc.

4. **Vista mensual:** además de semanal y diaria, una vista mensual con los eventos como puntos o bloques compactos.

5. **Drag & drop para mover clases:** en la vista de profesor/admin, arrastrar un bloque de clase a otro slot horario para editarlo visualmente (creando una propuesta o editando directamente según el rol).

6. **Conflictos de horario:** detectar y avisar visualmente cuando dos asignaturas solapan en la misma franja para el mismo usuario/grupo.

7. **PWA (Progressive Web App):** cachear el horario offline para que los estudiantes puedan consultarlo sin conexión en el móvil.

8. **Historial de cambios:** registro auditable de quién cambió qué y cuándo, accesible para admins.

---

## Preguntas abiertas

Decisiones que deben tomarse antes de empezar a construir:

1. **¿Quién aprueba los cambios de un profesor?** Si los profesores pueden aprobar propuestas pero también crean clases directamente, ¿sus propias creaciones/ediciones son inmediatas o pasan por aprobación de otro profesor/admin? ¿Un profesor puede aprobar sus propias propuestas?
   Respuesta: Sí, un profesor puede aprobar sus propias propuestas (al igual que los admins) por lo que un profesor cuando crea una propuesta de cambio, habría que hacer que se apruebe automáticamente sin necesidad de que otro profesor/admin lo revise. Esto simplifica el flujo y evita cuellos de botella en la aprobación (parte de esto será implementación de backend)

2. **¿El campo `approved` se elimina de `Subject`?** El nuevo modelo propone que toda la lógica de aprobación viva en `PendingEdit` con status triestado. ¿Confirmas que `Subject` ya no necesita un campo de aprobación propio?
   Respuesta: Si lo consideras innecesario, podemos eliminar el campo `approved` de `Subject` y confiar completamente en el flujo de `PendingEdit` para gestionar el estado de aprobación. Esto centraliza la lógica y evita redundancias.

3. **¿La paginación se mueve al servidor?** Actualmente todo se pagina en cliente. Para las listas de usuarios y propuestas, ¿queremos paginación server-side desde el principio o lo dejamos como mejora futura?
   Respuesta: Movemos la paginación al servidor desde el principio para evitar problemas de rendimiento a medida que crece el número de usuarios y propuestas. Esto quizá implica añadir parámetros de paginación (p.ej. `?page=1&limit=10`) a los endpoints relevantes.

4. **¿Qué ocurre cuando se aprueba una propuesta?** ¿El cambio se aplica automáticamente al `Subject` correspondiente, o requiere una acción adicional? ¿Queda registro del `PendingEdit` original? Respuesta: Al aprobar una propuesta, el cambio se aplica automáticamente al `Subject` correspondiente y el `PendingEdit` se actualiza a status `approved` con un timestamp. Esto mantiene un registro completo de las propuestas y su estado sin necesidad de eliminar o archivar los `PendingEdit`.

5. **¿La consulta pública por UO necesita algún rate-limiting?** Cualquier persona puede consultar el horario de cualquier UO sin autenticación. ¿Es aceptable o debería limitarse de alguna forma? Respuesta: Implementamos un rate-limiting básico (p.ej. 1000 requests por IP por hora) para evitar abusos sin afectar la experiencia de usuarios legítimos.

6. **¿Drag & drop para edición visual de clases?** Es una funcionalidad interesante pero añade complejidad significativa. ¿Se prioriza para la primera versión o se deja para una iteración futura? Respuesta: Dejamos el drag & drop para una iteración futura. Nos centraremos primero en un formulario de edición tradicional para garantizar la estabilidad y funcionalidad básica, y luego evaluaremos la implementación de una interfaz más visual.

7. **¿Notificaciones: in-app, email, o ambas?** Si se implementan notificaciones para propuestas aprobadas/rechazadas y nuevas propuestas pendientes, ¿qué canal? Respuesta: Comenzamos con notificaciones in-app para mantenerlo simple y evitar la complejidad de enviar emails. Si el feedback es positivo, podríamos considerar añadir notificaciones por email en el futuro. Quizá sería interesante que los usuarios tuvieran en la propia aplicación una campana de notificaciones y que al hacer clic en ella se muestre un dropdown con las notificaciones recientes (p.ej. "Tu propuesta de cambio X ha sido aprobada", "La clase Y ha sido modificada a XYZ" (donde el usuario está afectado), "Nueva propuesta de cambio pendiente: Z").

8. **¿La autoselección necesita feedback de progreso granular?** Si la operación tarda varios minutos en el backend, ¿basta con un spinner genérico o necesitamos un porcentaje/barra de progreso? Esto implica que el backend devuelva progreso parcial. Respuesta: Implementamos un spinner genérico con un mensaje que indique que la operación puede tardar varios minutos. Si el feedback es positivo y los usuarios expresan la necesidad de una barra de progreso más granular, podríamos considerar añadir endpoints adicionales para reportar el progreso detallado en el futuro.

9. **¿Cómo se gestiona el catálogo de asignaturas cuando se añade una nueva?** Actualmente hay que tocar código para mapas de colores, iconos, y la lista de Matemáticas. ¿Se implementa un panel de configuración de asignaturas para admins, o se mantiene manual? Respuesta: Para la primera versión, mantenemos el catálogo de asignaturas manual en el código para simplificar el desarrollo. Sin embargo, documentamos claramente cómo añadir nuevas asignaturas y sus correspondientes colores e iconos. En una iteración futura, podríamos considerar implementar un panel de administración para gestionar el catálogo de asignaturas de forma dinámica.

10. **¿Los exámenes tienen un flujo distinto al de las clases?** Ambos son `Subject` con tipo diferente, pero ¿los exámenes deberían tener campos adicionales (convocatoria, duración fija) o se tratan exactamente igual? Respuesta: Valorar tratar exámenes de forma diferente para poder trabajar también con ellos y añadir también opciones como entregas de trabajo, etc. Por ejemplo, podríamos añadir un campo `examType` para diferenciar entre teoría, práctica, entrega de trabajo, etc., y permitir que cada tipo tenga campos específicos (p.ej. duración fija para exámenes). Esto añade complejidad pero también flexibilidad para representar mejor la variedad de eventos en el horario.

11. **¿Internacionalización?** La app actual está completamente en español. ¿Se plantea soporte multiidioma (al menos español/inglés) o es innecesario para la audiencia objetivo? Respuesta: Se plantea tener soporte multiidioma (español e inglés) para ampliar la accesibilidad a estudiantes internacionales. Esto implicaría extraer todos los textos a archivos de traducción y permitir al usuario cambiar el idioma desde la interfaz.

12. **¿Qué pasa con la app cuando se está fuera del período lectivo?** ¿Se muestra un mensaje, el horario del semestre pasado, el del próximo? Respuesta: Fuera del período lectivo, la app muestra un mensaje indicando que no hay horarios disponibles actualmente. Se considerará fuera de horario lectivo cualquier fecha entre el 1 de julio y el 31 de agosto. Durante este período, el selector de semestre se deshabilita y se muestra un mensaje informativo. Esto evita confusiones y establece expectativas claras para los usuarios.
