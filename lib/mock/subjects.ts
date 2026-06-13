import type { CatalogSubject } from '../types/subjects';

// Realistic catalog: 3 Math subjects (cold palette) + 3 CS subjects (warm palette).
// Selection state covers all UI variants:
//   ALG  1/3 → indeterminate header checkbox
//   CDI  1/2 → indeterminate header checkbox
//   GEO  0/2 → unchecked header checkbox
//   PRG  1/3 → indeterminate header checkbox
//   EDT  2/2 → checked header checkbox (all selected)
//   BDA  0/3 → unchecked header checkbox

export const MOCK_CATALOG: CatalogSubject[] = [
  {
    code: 'ALG',
    groups: [
      { id: 'alg-g1', name: 'Grupo 1 — L 9-11, X 10-12', selected: true  },
      { id: 'alg-g2', name: 'Grupo 2 — M 11-13, J 9-11',  selected: false },
      { id: 'alg-g3', name: 'Grupo 3 — L 15-17, V 11-13', selected: false },
    ],
  },
  {
    code: 'CDI',
    groups: [
      { id: 'cdi-g1', name: 'Grupo 1 — L 11-13, X 11-13', selected: true  },
      { id: 'cdi-g2', name: 'Grupo 2 — M 9-11, J 11-13',  selected: false },
    ],
  },
  {
    code: 'GEO',
    groups: [
      { id: 'geo-g1', name: 'Grupo 1 — M 9-11, V 9-11',   selected: false },
      { id: 'geo-g2', name: 'Grupo 2 — X 15-17, V 15-17', selected: false },
    ],
  },
  {
    code: 'PRG',
    groups: [
      { id: 'prg-g1', name: 'Grupo 1 — L 9-11, M 15-17',  selected: true  },
      { id: 'prg-g2', name: 'Grupo 2 — X 9-11, J 15-17',  selected: false },
      { id: 'prg-g3', name: 'Grupo 3 — M 11-13, V 11-13', selected: false },
    ],
  },
  {
    code: 'EDT',
    groups: [
      { id: 'edt-g1', name: 'Grupo 1 — L 11-13, J 9-11',  selected: true },
      { id: 'edt-g2', name: 'Grupo 2 — M 15-17, V 9-11',  selected: true },
    ],
  },
  {
    code: 'BDA',
    groups: [
      { id: 'bda-g1', name: 'Grupo 1 — L 15-17, X 15-17', selected: false },
      { id: 'bda-g2', name: 'Grupo 2 — M 9-11, J 11-13',  selected: false },
      { id: 'bda-g3', name: 'Grupo 3 — X 9-11, V 11-13',  selected: false },
    ],
  },
];

// All group IDs — returned by mock auto-select (backend selects everything).
export const MOCK_ALL_GROUP_IDS: string[] = MOCK_CATALOG.flatMap((s) =>
  s.groups.map((g) => g.id),
);
