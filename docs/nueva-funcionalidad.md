# Extensiones de API — Mis Asignaturas

Este fichero documenta los metadatos adicionales que el backend podría devolver en el endpoint `/api/subjects/catalog` para habilitar filtros y funcionalidades actualmente desactivadas en el frontend.

---

## Estado actual

El tipo `CatalogSubject` devuelve:

```ts
interface CatalogSubject {
  code: string;    // p.ej. "ALG", "PRG"
  name: string;    // nombre completo
  groups: SubjectGroup[];
}
```

Los filtros disponibles hoy (por estado de selección + búsqueda) funcionan con esta estructura.

---

## Extensiones propuestas

### 1. Curso académico (`year`)

```ts
year: 1 | 2 | 3 | 4 | 5;
```

**Para qué sirve:** filtrar por curso (1.º, 2.º…). Muy útil cuando hay 100+ asignaturas de distintos años mezcladas.

**Impacto en frontend:** añadir chips de filtro por año en el toolbar de `SubjectCatalog`. Los filtros de año se muestran automáticamente si algún `CatalogSubject` incluye el campo `year`.

---

### 2. Semestre (`semester`)

```ts
semester: 1 | 2;
```

**Para qué sirve:** mostrar solo las asignaturas del semestre activo (inferido del semestre seleccionado en el horario).

**Impacto en frontend:** filtro adicional en toolbar. Se puede sincronizar con el `selectedSemester` del horario en `localStorage` para preseleccionar el semestre correcto al entrar en la página.

---

### 3. Titulación / Facultad (`degree` o `faculty`)

```ts
degree?: string;  // p.ej. "mat", "inf", "fis"
faculty?: string; // p.ej. "Facultad de Ciencias"
```

**Para qué sirve:** agrupar o filtrar asignaturas por grado en usuarios matriculados en doble titulación (PCEO). Muy relevante dado que el PCEO combina 2–3 titulaciones.

**Impacto en frontend:** chip de titulación en cada `SubjectItem` / `SubjectCard`, filtro en toolbar. El color de asignatura ya usa la titulación implícitamente (paleta fría = Mat, cálida = Inf) — este campo lo haría explícito.

---

### 4. Créditos (`credits`)

```ts
credits?: number; // p.ej. 6
```

**Para qué sirve:** mostrar créditos en el card/item, ordenar por créditos.

**Impacto en frontend:** metadato informativo en `SubjectCard`. Opción de sort "Mayor carga (ECTS)".

---

### 5. Tipo de asignatura (`subjectType`)

```ts
subjectType?: 'obligatoria' | 'optativa' | 'troncal';
```

**Para qué sirve:** filtrar optativas vs obligatorias.

**Impacto en frontend:** badge en card/item. Filtro adicional en toolbar.

---

## Cómo habilitar los filtros en frontend

Los componentes están preparados para recibir campos opcionales. Cuando el backend los incluya:

1. Extender `CatalogSubject` en `lib/types/subjects.ts` con los campos opcionales (`year?`, `semester?`, `degree?`, etc.).
2. En `SubjectCatalog.tsx`, los filtros de año/semestre/titulación se pueden añadir al toolbar detectando si alguna asignatura devuelve esos campos:

```ts
const hasYears   = subjects.some(s => s.year   != null);
const hasDegrees = subjects.some(s => s.degree != null);
// → mostrar/ocultar los filtros correspondientes
```

3. Actualizar `SubjectItem` y `SubjectCard` para mostrar los metadatos si están presentes.

---

## Prioridad sugerida

| Campo    | Prioridad | Comentario |
|----------|:---------:|---|
| `year`   | Alta      | Imprescindible con 100+ asignaturas de distintos cursos |
| `degree` | Alta      | Clave para doble grado (PCEO) |
| `semester` | Media   | Útil pero se puede inferir del período lectivo |
| `credits`  | Baja    | Informativo, no cambia la lógica de selección |
| `subjectType` | Baja | Útil pero no urgente |
