# DESIGN.md — Horarios Hub

Sistema de diseño y dirección visual para la aplicación de horarios universitarios(Universidad de Oviedo).

---

## 1. Personalidad visual

**La app es:** precisa, funcional, contenida, viva, intencional.

- **Precisa** — cada elemento tiene un propósito claro. No hay decoración gratuita. La información se encuentra en el sitio exacto donde el usuario la espera.
- **Funcional** — prioriza la legibilidad y la velocidad de escaneo visual. Un estudiante que abre la app entre clases debe encontrar su próxima aula en menos de 3 segundos.
- **Contenida** — usa el mínimo número de elementos para comunicar el máximo de información. Menos bordes, menos sombras, menos variaciones tipográficas.
- **Viva** — no es fría. El color de acento, las micro-transiciones y los bloques de asignatura inyectan energía. La cuadrícula de horario tiene ritmo visual, no es una tabla muerta.
- **Intencional** — cada decisión de espaciado, color y tipografía sigue una lógica explícita. No hay valores arbitrarios.

**La app NO es:**

- No es un dashboard corporativo de analytics (no hay métricas prominentes, no hay gráficos de barras, no hay KPIs).
- No es una app de productividad gamificada (no hay streaks, badges, puntos ni ilustraciones lúdicas).
- No es una interfaz de administración tipo CMS genérico (no está construida sobre un kit de componentes genérico sin personalidad).
- No es una SPA pesada con animaciones cinematográficas (no hay page transitions de 600ms, no hay parallax, no hay scroll hijacking).
- No es una réplica de Google Calendar (tiene su propia identidad visual, no imita el look de ningún calendario existente).

**Referencias de tono:** Linear (densidad controlada, tipografía nítida), Vercel Dashboard (jerarquía clara de superficies, dark mode como ciudadano de primera clase), Raycast (velocidad percibida, transiciones mínimas pero con presencia).

---

## 2. Sistema de color

### Filosofía

El color se usa como herramienta de jerarquía y estado, no como decoración. La paleta base es casi monocromática (escala de grises con temperatura), con un único color de acento fuerte y colores semánticos reservados exclusivamente para comunicar estado.

### Escala de neutros

Se definen **6 niveles funcionales** de neutro, no valores de gris equidistantes. Cada nivel tiene un nombre semántico que describe su uso, no su luminosidad:

| Token             | Uso                                                                           | Comportamiento light → dark                                               |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `surface-base`    | Fondo de la app (el canvas)                                                   | Blanco cálido → gris muy oscuro (casi negro, con un toque de temperatura) |
| `surface-raised`  | Tarjetas, paneles, modales — cualquier superficie que "flota" sobre el canvas | Gris muy claro → gris oscuro                                              |
| `surface-sunken`  | Fondos de input, áreas recesivas, zonas inactivas                             | Gris ligeramente más oscuro que base → negro puro o casi                  |
| `border-subtle`   | Separadores suaves, bordes de tarjeta                                         | Gris claro, baja opacidad → gris medio, baja opacidad                     |
| `border-strong`   | Bordes de input con foco, separadores con peso                                | Gris medio → gris claro                                                   |
| `surface-overlay` | Backdrop de modales y drawers                                                 | Negro al 40% opacidad → negro al 60% opacidad                             |

**Temperatura:** Los neutros no son grises puros. En light mode llevan una micro-dosis de calor (tono ligeramente hacia el amarillo/arena). En dark mode son fríos-neutros (ligeramente azulados). Esto evita que la interfaz se sienta clínica o plana.

### Texto

Tres niveles de contraste:

| Token            | Uso                                               |
| ---------------- | ------------------------------------------------- |
| `text-primary`   | Títulos, contenido principal, valores importantes |
| `text-secondary` | Labels, descripciones, metadatos                  |
| `text-tertiary`  | Placeholders, texto deshabilitado, hints          |

En dark mode, `text-primary` no es blanco puro (#fff) sino un blanco rebajado para evitar fatiga visual. En light mode, `text-primary` no es negro puro sino un gris muy oscuro.

### Color de acento

**Un solo color de acento primario.** No dos. Un color fuerte, saturado, que contraste bien tanto sobre fondos claros como oscuros.

- **Candidato natural:** un azul eléctrico o un índigo vivo — suficientemente distintivo para no confundirse con los colores semánticos (verde, rojo, amarillo), y suficientemente versátil para funcionar en botones, links, badges, y la línea de hora actual.
- **Variantes del acento:** se generan 3 variantes a partir del color base:
  - `accent` — el color principal, para botones primarios, links, elementos interactivos activos.
  - `accent-subtle` — versión de baja opacidad (~10-15%) para fondos de badges, hover states, selección de fila.
  - `accent-hover` — versión ligeramente más oscura/saturada para hover en botones primarios.

El acento se usa con moderación: botón primario, links de navegación activos, la línea de "hora actual" en la cuadrícula, y badges de estado. Si todo es azul, nada destaca.

### Colores de asignatura

La cuadrícula de horario usa **un mapa de colores propio** independiente de la paleta de la app. Cada asignatura tiene asignado un color que se aplica al borde izquierdo o al fondo del bloque.

Reglas para la paleta de asignaturas:

- Los colores deben ser distinguibles entre sí pero no competir con el color de acento de la interfaz.
- En light mode: colores de fondo pastel (baja saturación, alta luminosidad) con borde lateral en el color saturado.
- En dark mode: colores de fondo muy oscuros y desaturados con borde lateral en el color medio.
- Se agrupan visualmente: las asignaturas de Matemáticas usan una gama (fríos: azules, púrpuras, teales) y las de Informática otra (cálidos: naranjas, verdes, rosas). Esto refuerza la distinción por titulación sin requerir un label explícito.

### Colores semánticos (estados)

Cuatro colores semánticos, cada uno con dos variantes (fuerte para texto/icono, sutil para fondo):

| Estado                                                              | Uso principal en la app                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Error / destructivo** (rojo)                                      | Errores de formulario, acción de eliminar, propuesta rechazada                 |
| **Warning / atención** (ámbar/naranja)                              | Propuesta pendiente de revisión, operaciones lentas, sesión a punto de expirar |
| **Success / confirmación** (verde)                                  | Propuesta aprobada, guardado exitoso, verificación completada                  |
| **Info / neutro** (azul claro o el propio acento en variante sutil) | Tooltips informativos, mensajes de ayuda                                       |

Los colores semánticos **nunca se usan para decorar**. Solo aparecen cuando hay un estado que comunicar.

### Regla de inversión dark/light

El dark mode no es "invertir colores". Las decisiones clave:

- Las superficies se oscurecen, pero los colores de acento y semánticos mantienen su saturación (se ajusta la luminosidad, no la saturación).
- Los bordes se vuelven más sutiles en dark mode (menor opacidad), no más brillantes.
- Los colores de asignatura se oscurecen significativamente en dark mode para no crear bloques brillantes que compitan con el contenido.

---

## 3. Tipografía

### Familia tipográfica

**Una sola familia** con suficiente rango de pesos. No se mezclan dos familias.

La familia elegida debe cumplir:

- Excelente legibilidad en tamaños pequeños (los bloques de la cuadrícula muestran texto de 12-13px).
- Caracteres con proporciones modernas (no condensada, no extendida).
- Soporte completo de acentos y caracteres españoles (ñ, tildes, diéresis).
- Pesos disponibles: regular (400), medium (500), semibold (600). No se usa bold (700) ni thin (300).
- Buena diferenciación entre pesos: que regular y medium sean visualmente distintos.

**Candidatas a evaluar:** Geist (Vercel), Satoshi, General Sans, Switzer, Plus Jakarta Sans. La decisión final se toma al prototipar. Lo importante es que no sea Inter, Roboto, ni una system font genérica.

### Jerarquía de tamaños

Se define una escala de **6 tamaños funcionales**, no una rampa lineal. Cada tamaño tiene un uso concreto:

| Token             | Tamaño aprox. | Peso           | Uso                                                                          |
| ----------------- | ------------- | -------------- | ---------------------------------------------------------------------------- |
| `heading-page`    | 22-24px       | Semibold (600) | Título de la página actual ("Horario", "Mis Asignaturas", "Propuestas")      |
| `heading-section` | 17-18px       | Medium (500)   | Título de sección dentro de una página ("Propuestas pendientes", "Lunes 12") |
| `body`            | 14-15px       | Regular (400)  | Texto general, contenido de formularios, descripciones                       |
| `body-strong`     | 14-15px       | Medium (500)   | Labels de formulario, nombre de asignatura en listas, datos destacados       |
| `small`           | 12-13px       | Regular (400)  | Texto dentro de los bloques de la cuadrícula, metadatos, timestamps          |
| `small-strong`    | 12-13px       | Medium (500)   | Labels en los bloques (tipo de clase, aula), badges                          |

**Reglas de uso del peso:**

- `regular` es el default. La mayoría del texto es regular.
- `medium` se usa para enfatizar dentro de un contexto: el nombre de una asignatura en una lista, el label de un campo de formulario, el día de la semana en la cabecera de la cuadrícula.
- `semibold` se reserva exclusivamente para títulos de página. Nada más.
- No se usa cursiva ni subrayado (excepto links, que usan el color de acento sin subrayado, con subrayado solo en hover).

### Interlineado

- `body` y `body-strong`: interlineado de 1.5 (cómodo para lectura de párrafos cortos).
- `small` y `small-strong`: interlineado de 1.3 (los bloques de la cuadrícula necesitan compacidad).
- `heading-*`: interlineado de 1.2 (los títulos no necesitan separación generosa).

### Números

Los números en la cuadrícula (horas, números de aula) usan **tabular figures** (cifras de ancho fijo) para que se alineen verticalmente. La familia tipográfica elegida debe soportar `font-variant-numeric: tabular-nums`.

---

## 4. Espaciado y densidad

### Filosofía de densidad

**La app es moderadamente densa.** No es un dashboard financiero abarrotado, pero tampoco una landing page con secciones de pantalla completa. La densidad responde al caso de uso: un estudiante quiere ver su semana entera de un vistazo sin hacer scroll.

- **La cuadrícula de horario** es la zona más densa de la app. Prioriza mostrar la semana completa (lunes a viernes, 9:00-20:00) sin scroll vertical en pantallas de portátil (≥768px de alto). Los bloques son compactos.
- **Los formularios y paneles de admin** son más aireados. Hay más espacio entre campos, más padding en las tarjetas, más margen entre secciones. El ritmo es más lento porque las acciones son menos frecuentes y más deliberadas.
- **Las listas** (propuestas, usuarios) usan una densidad media: filas con suficiente padding para ser cliqueables cómodamente pero sin desperdiciar espacio vertical.

### Unidad base

**4px** como unidad atómica. Todo el espaciado es múltiplo de 4:

| Token      | Valor | Uso típico                                                   |
| ---------- | ----- | ------------------------------------------------------------ |
| `space-1`  | 4px   | Separación entre icono y texto, gap mínimo                   |
| `space-2`  | 8px   | Padding interno de badges, gap entre elementos inline        |
| `space-3`  | 12px  | Padding de bloques en la cuadrícula, gap en listas compactas |
| `space-4`  | 16px  | Padding de inputs, gap entre campos de formulario            |
| `space-5`  | 20px  | Margen entre secciones dentro de un panel                    |
| `space-6`  | 24px  | Padding de tarjetas y paneles                                |
| `space-8`  | 32px  | Separación entre secciones de página                         |
| `space-10` | 40px  | Margen superior de página, separaciones mayores              |
| `space-12` | 48px  | Padding lateral del layout principal en desktop              |

### Bordes y radios

- **Radio de borde:** se usa un radio pequeño y consistente. Dos valores: `radius-sm` (4px) para elementos pequeños (badges, chips, inputs) y `radius-md` (8px) para tarjetas, modales y paneles. No se usan radios grandes (16px+) ni esquinas completamente redondeadas (excepto avatares, si los hubiera).
- **Bordes:** finos (1px) y de baja opacidad. Los bordes separan superficies, no decoran. En dark mode, los bordes son aún más sutiles.

### Sombras

Uso mínimo de sombras. La jerarquía de superficies se comunica principalmente por color de fondo (surface-base vs surface-raised), no por sombra.

- **Sin sombra:** la mayoría de las tarjetas y paneles.
- **Sombra sutil:** solo para elementos que flotan genuinamente sobre el contenido: dropdowns, tooltips, modales.
- **En dark mode:** las sombras son casi invisibles. La separación se logra por diferencia de luminosidad entre superficies.

---

## 5. Componentes clave

### 5.1 Bloque de asignatura (cuadrícula semanal)

El bloque es el componente más importante de la app. Se ve decenas de veces por pantalla y contiene información densa.

**Estructura:**

- Borde izquierdo de 3-4px en el color de la asignatura (el color sólido, saturado).
- Fondo en la variante pastel/oscura del mismo color.
- Contenido: nombre corto de la asignatura (primera línea, `small-strong`), tipo y aula (segunda línea, `small`, `text-secondary`).
- Si el bloque es demasiado corto verticalmente (clases de 30 min), el contenido se recorta con ellipsis. Al hacer hover o tap, se muestra un tooltip con la información completa.

**Comportamiento visual:**

- En reposo: fondo sutil, borde de color.
- En hover: el fondo se intensifica ligeramente (aumento de opacidad).
- Si la clase está en curso ahora: el borde izquierdo se ensancha o se añade un indicador sutil (punto o pulso).
- Los bloques no tienen sombra ni borde externo. La separación entre bloques se da por el propio gap de la cuadrícula.

**Solapamientos:** Cuando dos bloques coinciden en la misma franja horaria, se muestran lado a lado dividiendo el ancho de la celda (50/50 para dos, 33/33/33 para tres). Se añade un indicador de conflicto (icono de warning small en la esquina) si se implementa la detección de conflictos.

### 5.2 Formularios (crear clase, proponer cambio)

Los formularios siguen un patrón uniforme:

- **Layout:** una columna en móvil, dos columnas en desktop si hay suficientes campos (más de 4). Los campos se agrupan por bloque lógico (datos temporales juntos: fecha, hora inicio, duración; datos de contenido juntos: asignatura, tipo, aula).
- **Labels:** encima del campo, nunca flotantes ni dentro del input. Peso `body-strong`.
- **Inputs:** fondo `surface-sunken`, borde `border-subtle`, borde `border-strong` + anillo de color acento en foco. Altura consistente (40px), padding horizontal `space-4`.
- **Selects y dropdowns:** mismo estilo visual que los inputs. El dropdown desplegado usa `surface-raised` con sombra sutil.
- **Botón primario:** fondo `accent`, texto blanco, sin borde. Hover: `accent-hover`. Esquinas `radius-sm`. Ubicación: parte inferior del formulario, alineado a la derecha.
- **Botón secundario** (cancelar, descartar): sin fondo, borde `border-subtle`, texto `text-secondary`. No compite visualmente con el primario.
- **Validación:** los errores aparecen debajo del campo en `small`, color error. El borde del campo cambia a color error. No se usa toast para errores de validación (el toast es para errores de servidor o acciones completadas).

### 5.3 Listas de propuestas pendientes (admin/profesor)

La lista de propuestas es una tabla simplificada o una lista de tarjetas (según el ancho de pantalla):

- **Desktop (≥1024px):** tabla con columnas: tipo de acción (badge: crear/editar/eliminar), asignatura afectada, autor, fecha, acciones (aprobar/rechazar). Las filas alternan ligeramente el fondo o usan un separador `border-subtle` entre ellas. Las acciones son botones inline pequeños, no links.
- **Mobile (<1024px):** lista de tarjetas apiladas. Cada tarjeta muestra la misma información pero reorganizada verticalmente. Las acciones (aprobar/rechazar) aparecen como botones al final de la tarjeta.
- **Diff visual:** al expandir una propuesta de edición, se muestra un bloque comparativo con el valor anterior (tachado o en color `text-tertiary`) y el nuevo valor (en `text-primary`). No hace falta un diff inline carácter a carácter; basta con mostrar campo por campo los valores que cambiaron.
- **Estados de la propuesta:** un badge con el color semántico correspondiente (warning/ámbar para pendiente, success/verde para aprobada, error/rojo para rechazada).

### 5.4 Navegación principal y navegación temporal

**Navegación principal** (ver sección 6 para el layout completo):

- Los items de navegación son texto plano con el item activo diferenciado por peso (`body-strong`) y color (`accent` o `text-primary` vs `text-secondary`).
- No se usa fondo coloreado ni pill para marcar el item activo, solo peso tipográfico y color.
- El icono acompaña al texto pero no lo reemplaza (excepto en móvil donde se puede usar solo icono + label corto).

**Navegación temporal (semanas y semestres):**

- Se ubica inmediatamente encima de la cuadrícula de horario, como parte del header del contenido, no en la navegación principal.
- **Selector de semestre:** dos botones (o tabs) para "1º Semestre" / "2º Semestre". El activo se marca con fondo `accent-subtle` y texto `accent`.
- **Navegador de semanas:** flechas izquierda/derecha con el rango de fechas de la semana actual centrado entre ellas (ej: "17 – 21 Mar 2025"). Flechas como botones icon-only. La semana actual se puede volver a seleccionar con un botón "Hoy" que aparece solo cuando el usuario no está viendo la semana actual.
- **Transición entre semanas:** no hay animación de slide. El contenido de la cuadrícula se reemplaza directamente. Si se desea, un fade de 100-150ms.

### 5.5 Estados vacíos y de carga

**Estado de carga (loading):**

- La cuadrícula de horario muestra un skeleton: bloques rectangulares grises que pulsan suavemente en las posiciones donde irían las asignaturas. No un spinner centrado.
- Las listas muestran filas skeleton (3-5 filas de barras grises con diferente ancho).
- Los formularios no tienen estado de carga propio; el botón de submit muestra un spinner inline pequeño y se deshabilita.

**Estado vacío (sin datos):**

- La cuadrícula vacía muestra la estructura horaria (filas de hora, columnas de día) pero sin bloques. En el centro, un mensaje corto: "No hay clases esta semana" o "Introduce tu UO para ver tu horario". Texto `text-secondary`, tamaño `body`.
- No se usan ilustraciones ni emojis en estados vacíos. Solo texto.
- Las listas vacías muestran un mensaje centrado con la misma lógica: "No hay propuestas pendientes".

**Estado de error:**

- Si falla una petición al backend, se muestra un banner inline (no un toast) en la zona del contenido afectado: fondo `error-subtle`, borde `error`, texto `error` con el mensaje de error. Un botón de "Reintentar" al final.
- Los errores de autenticación (sesión expirada) redirigen a la página de login con un mensaje informativo.

---

## 6. Navegación y layout

### Estructura general

**Topbar fija + contenido fluido.** No sidebar.

La topbar contiene:

- **Logo/nombre de la app** a la izquierda (ej: "Horarios Hub" en `body-strong`).
- **Selector de titulación** a continuación del logo (dropdown compacto o grupo de chips).
- **Navegación principal** centrada o a la derecha: links a las secciones disponibles según el rol del usuario.
- **Acciones de usuario** al extremo derecho: botón de tema (sol/luna), y si está autenticado, campana de notificaciones + menú de perfil (dropdown con email, rol, cerrar sesión).

La topbar tiene altura fija (56-64px), fondo `surface-base` con `border-subtle` inferior. En scroll, no cambia (no hay efecto de blur/glassmorphism; se queda opaca).

### Zona pública vs zona autenticada

No hay una separación visual drástica. La topbar es la misma. Lo que cambia es:

- **Visitante:** ve en la nav solo "Horario". El selector de titulación y la entrada de UO/curso están visibles. Aparece un botón de "Iniciar sesión" en la zona de acciones.
- **Autenticado:** ve en la nav "Horario" + "Mis Asignaturas" + "Propuestas". El botón de login se reemplaza por el menú de perfil.
- **Profesor/Admin:** ve adicionalmente "Gestión" (o un subnav dentro del dropdown de perfil) con acceso a creación de clases, revisión de propuestas y (solo admin) gestión de usuarios.

Las páginas de autenticación (login, registro, verificación, reset) son rutas independientes con un layout minimalista: solo el logo centrado y el formulario. Sin topbar completa.

### Input de UO y selector de curso

El input de UO y los botones de curso no viven en la topbar. Están en la propia página de horario, entre la topbar y la cuadrícula:

- El input de UO es un campo de texto con placeholder ("UO123456") y un botón de buscar.
- Los botones de curso (Primero, Segundo… Quinto) son un grupo de tabs o chips horizontales junto al input.
- En conjunto, forman una barra de "selección de horario" que es parte del contenido de la página, no de la navegación global.

---

## 7. Mobile

### Principio general

En mobile, la app se simplifica sin perder funcionalidad. La cuadrícula semanal es el componente que más cambia.

### Breakpoints

| Nombre    | Rango          | Comportamiento                                  |
| --------- | -------------- | ----------------------------------------------- |
| `mobile`  | < 640px        | Layout de una columna, vista diaria por defecto |
| `tablet`  | 640px – 1023px | Layout adaptado, cuadrícula semanal comprimida  |
| `desktop` | ≥ 1024px       | Layout completo                                 |

### Cuadrícula de horario en mobile

La vista semanal no funciona en pantallas <640px. El fallback es **vista diaria**:

- Se muestra un solo día con su columna de horas.
- La navegación entre días se hace con swipe horizontal o con tabs para cada día de la semana en la parte superior.
- El día actual se preselecciona automáticamente.
- El usuario puede cambiar a vista semanal explícitamente si quiere (aunque será apretada y requerirá scroll horizontal).

### Topbar en mobile

La topbar se convierte en:

- Logo a la izquierda.
- Botón de menú hamburguesa a la derecha que abre un drawer lateral o un menú full-screen con: navegación principal, selector de titulación, toggle de tema, perfil/login.
- La campana de notificaciones se mueve dentro del menú.

### Formularios en mobile

- Una sola columna siempre.
- Los selects usan los nativos del SO cuando es posible (para una mejor experiencia en móvil).
- Los botones de acción (guardar, cancelar) son full-width y sticky en la parte inferior de la pantalla si el formulario es largo.

### Listas en mobile

- Las tablas se convierten en tarjetas apiladas (ya descrito en 5.3).
- La paginación se mantiene (no se usa scroll infinito).

---

## 8. Lo que NO hacer

Decisiones explícitamente descartadas para este proyecto:

1. **No glassmorphism ni blur de fondo.** No se usan fondos translúcidos con blur (`backdrop-filter`). Las superficies son opacas. Esto simplifica el rendering y evita problemas de rendimiento en dispositivos modestos.

2. **No animaciones de entrada de página.** Las transiciones entre rutas son instantáneas. No hay page transitions con fade, slide o stagger. La velocidad percibida es más importante que la sofisticación visual.

3. **No ilustraciones ni imágenes decorativas.** Estados vacíos, páginas de error y pantallas de onboarding usan solo texto e iconos. No hay ilustraciones SVG customizadas ni imágenes de stock.

4. **No tooltips como mecanismo principal de información.** Si un dato es importante, se muestra directamente. Los tooltips solo se usan como complemento para contenido truncado (bloques de la cuadrícula) o para explicar iconos ambiguos.

5. **No tabs verticales ni sidebars colapsables.** La navegación es horizontal (topbar). No hay sidebar que se pueda abrir/cerrar.

6. **No scroll infinito.** Todas las listas paginadas usan paginación explícita con controles numéricos. El usuario sabe cuántas páginas hay y dónde está.

7. **No notificaciones toast para acciones del usuario.** Cuando el usuario guarda algo o envía un formulario, el feedback es inline (el botón cambia de estado, aparece un mensaje bajo el formulario). Los toasts se reservan para eventos asíncronos (notificaciones de propuestas aprobadas, errores de servidor inesperados).

8. **No dark mode con colores neón o alta saturación.** El dark mode es sobrio. Los colores de acento mantienen la misma saturación que en light mode, no se vuelven fluorescentes.

9. **No usar más de una familia tipográfica.** Una sola familia para todo: títulos, cuerpo, labels, código (si hubiera). La variación se logra con peso y tamaño, no con familias distintas.

10. **No drag & drop en la primera versión.** La edición de horario se hace mediante formularios. La interacción de arrastrar bloques queda para una iteración futura.

11. **No onboarding tutorial ni tour guiado.** La app debe ser lo suficientemente clara como para no necesitar un walkthrough. Si el usuario no entiende algo, es un problema de diseño, no de onboarding.

---

## 9. Decisiones pendientes

Cuestiones que necesitan input antes de comenzar a construir componentes:

### 9.1 Familia tipográfica final

Se han identificado candidatas (Geist, Satoshi, General Sans, Switzer, Plus Jakarta Sans) pero la decisión se toma mejor viendo prototipos con datos reales. ¿Hay preferencia por alguna, o preparamos una comparativa con 2-3 opciones renderizadas sobre la cuadrícula de horario? Respuseta: Geist inicialmente, pero se puede revisar si no encaja bien con el diseño final.

### 9.2 Color de acento exacto

La dirección es un azul eléctrico/índigo, pero el valor exacto afecta toda la app. ¿Se elige un azul frío (tipo Linear) o un índigo más cálido (tipo Vercel)? ¿O se prototipa con ambos? Respuesta: azul tipo índigo.

### 9.3 Nombre y branding de la app

El documento de arquitectura usa "Horarios Hub" como nombre de trabajo. ¿Es el nombre definitivo? ¿Hay un logo, o se usa solo texto? Esto afecta a la topbar y a las páginas de auth. Respuesta: el nombre será "PCEO Hub" aunque puede ser que vuelva a "Horarios PCEO" si el branding se complica. Por ahora no hay ningún logo, ya se incluirá en un futuro si se decide que es necesario.

### 9.4 Iconos: set y formato

¿Se usa un set de iconos existente (Lucide, Phosphor, Heroicons) o se diseñan custom? El set debe cubrir: navegación (flecha, menú, búsqueda), acciones (editar, eliminar, aprobar, rechazar), estados (check, warning, error, info), y asignaturas (los ~72 iconos de asignatura que ya existen — ¿se mantienen como están o se rehacen?). Responder: Se empleará lucide para iconos generales (navegación, acciones, estados) y se intentarán usar también para los iconos de asignatura, aunque es posible que se necesiten custom si los iconos actuales no encajan con el nuevo estilo visual.

### 9.5 Comportamiento de los 72 colores de asignatura

El mapa actual tiene ~72 entradas. ¿Se mantiene la asignación existente (cada asignatura tiene su color fijo) o se simplifica a un pool más pequeño de colores que se asignan cíclicamente? Un pool de 12-16 colores bien elegidos sería más mantenible y visualmente más coherente. Respuesta: se optará por el pool de colores para asignaturas, agrupados por titulación, para evitar tener que mantener un mapa de 72 colores únicos. Esto también ayudará a reforzar visualmente la distinción entre titulaciones sin depender de labels.

### 9.6 Máximo contenido visible en la cuadrícula

¿La cuadrícula siempre muestra lunes a viernes, o se adapta a los días con clases? Si un alumno solo tiene clases lunes, martes y miércoles, ¿se muestran las 5 columnas vacías o solo 3? Esto afecta la densidad y la sensación de la UI. Respuseta: Se mostrará siempre la semana completa (lunes a viernes) para mantener una estructura consistente. Las columnas de los días sin clases estarán vacías pero visibles. El horario además irá desde las 8:00 hasta las 21:00

### 9.7 Notificaciones: posición y persistencia

Se ha decidido usar notificaciones in-app con campana. ¿El dropdown de notificaciones se vacía automáticamente al leerlas, o se mantienen hasta que el usuario las descarte? ¿Hay un límite de notificaciones visibles (ej: últimas 20)? Respueta: Las notificaciones se mantienen en el dropdown hasta que el usuario las marque como leídas o las descarte. No se vacía automáticamente al abrir el dropdown, para que el usuario pueda revisar su historial de notificaciones recientes. Se implementará un límite de 50 notificaciones almacenadas, mostrando solo las 20 más recientes en el dropdown.

### 9.8 Idioma por defecto y switch de idioma

Se ha decidido soportar español e inglés. ¿El idioma por defecto lo determina el navegador, o siempre empieza en español? ¿El switch de idioma va en la topbar, en el menú de perfil, o en una página de ajustes? Respuesta: El idioma por defecto se determina por la configuración del navegador, pero si el usuario cambia el idioma manualmente, esa preferencia se guarda en localStorage para futuras visitas. El switch de idioma se ubicará en el menú de perfil, junto con otras opciones de usuario, para no saturar la topbar.
