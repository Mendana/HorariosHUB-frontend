'use client';

import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

// ─── Column types ──────────────────────────────────────────────────────────────

/**
 * Header-only column definition — no render function.
 * Used by TableHead and ProposalList (which renders its own rows via ProposalRow).
 */
export interface TableColumnDef {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  /**
   * Marks this column as an "actions" column.
   * Header is right-aligned. Data column renders via TableActions (opacity reveal).
   */
  isActions?: boolean;
}

/**
 * Full column definition with a render function.
 * Used by the all-in-one Table<T> component.
 */
export interface TableColumn<T = unknown> extends TableColumnDef {
  render?: (row: T, index: number) => React.ReactNode;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const ALIGN_CLS = {
  left:   'text-left',
  center: 'text-center',
  right:  'text-right',
} as const;

// Skeleton bar widths (%) — rotated by (colIdx * 2 + rowIdx) for natural variance
const SKELETON_W = [55, 70, 40, 65, 80, 45, 60, 75];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Scrollable wrapper + <table>. Handles horizontal overflow on mobile. */
export function TableRoot({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

/**
 * <thead> with styled column headers.
 *   - Background: surface-raised
 *   - Text: text-secondary, small-strong, uppercase, 0.05em letter-spacing
 *   - Separator to body: border-strong
 *   - Sortable columns: ChevronsUpDown at rest → ChevronUp/Down when active
 *     Active column label switches to text-primary.
 */
export function TableHead({
  columns,
  sortKey,
  sortDir,
  onSort,
}: {
  columns: TableColumnDef[];
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}) {
  return (
    <thead>
      <tr className="bg-surface-raised border-b border-strong">
        {columns.map((col) => {
          const isActive  = sortKey === col.key;
          const colAlign  = col.align ?? (col.isActions ? 'right' : 'left');
          return (
            <th
              key={col.key}
              className={`py-2.5 px-3 text-xs font-medium text-secondary uppercase tracking-[0.05em] whitespace-nowrap ${ALIGN_CLS[colAlign]}`}
              style={col.width ? { width: col.width } : undefined}
              aria-sort={
                col.sortable && isActive
                  ? sortDir === 'asc' ? 'ascending' : 'descending'
                  : undefined
              }
            >
              {col.sortable && onSort ? (
                <button
                  onClick={() => onSort(col.key)}
                  className={[
                    'inline-flex items-center gap-1',
                    'transition-colors transition-fast',
                    isActive ? 'text-primary' : 'hover:text-primary',
                  ].join(' ')}
                >
                  {col.label}
                  {isActive
                    ? sortDir === 'asc'
                      ? <ChevronUp  size={12} aria-hidden />
                      : <ChevronDown size={12} aria-hidden />
                    : <ChevronsUpDown size={12} className="text-tertiary" aria-hidden />
                  }
                </button>
              ) : (
                col.label
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

/** <tbody> wrapper. */
export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

/**
 * <tr> with:
 *   - border-b border-subtle between rows (last row has no bottom divider)
 *   - hover:bg-surface-raised with transition-base
 *   - group/row context so TableActions can reveal on hover
 *   - optional selected state (accent-subtle bg + left accent bar)
 */
export function TableRow({
  children,
  onClick,
  isSelected = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={[
        'border-b border-subtle last:border-b-0',
        'transition-colors transition-base',
        'group/row',
        isSelected
          ? 'bg-accent-subtle [border-left:3px_solid_var(--accent)]'
          : 'hover:bg-surface-raised',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      {children}
    </tr>
  );
}

/** Standard <td> with consistent vertical padding, px-3, and text alignment. */
export function TableCell({
  children,
  align = 'left',
  colSpan,
  className = '',
}: {
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  className?: string;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`py-3 px-3 text-sm ${ALIGN_CLS[align]} ${className}`}
    >
      {children}
    </td>
  );
}

/**
 * <td> for action buttons.
 * Content is opacity-0 at rest; reveals on row hover or when any child is focused.
 * Children are laid out in a right-aligned inline-flex row.
 */
export function TableActions({ children }: { children: React.ReactNode }) {
  return (
    <td className="py-3 px-3 text-right">
      <div
        className={[
          'inline-flex items-center gap-2',
          'opacity-0',
          'group-hover/row:opacity-100',
          'group-focus-within/row:opacity-100',
          'transition-opacity transition-fast',
        ].join(' ')}
      >
        {children}
      </div>
    </td>
  );
}

/**
 * Renders N skeleton rows (default 5).
 * Bar widths vary per cell using SKELETON_W rotation — looks like real data.
 */
export function TableSkeletonRows({
  colCount,
  rows = 5,
}: {
  colCount: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-subtle last:border-b-0">
          {Array.from({ length: colCount }, (_, colIdx) => (
            <td key={colIdx} className="py-3 px-3">
              <div
                className="h-4 rounded-sm bg-surface-raised animate-pulse"
                style={{ width: `${SKELETON_W[(colIdx * 2 + rowIdx) % SKELETON_W.length]}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── All-in-one Table<T> ──────────────────────────────────────────────────────
//
// Data-driven component. Renders header, skeleton, empty state, and rows from
// a columns definition array + data array.
//
// Columns with isActions:true are rendered via TableActions (opacity reveal).
// All others are rendered via TableCell.

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** Stable key for each row (avoids index-based reconciliation). */
  rowKey: (row: T) => string | number;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  /**
   * Called with (key, newDir) when a sortable header is clicked.
   * newDir is computed by Table: toggles if same col, resets to 'asc' for new col.
   */
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  isSelected?: (row: T) => boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  sortKey,
  sortDir = 'asc',
  onSort,
  onRowClick,
  isSelected,
  isLoading = false,
  emptyMessage = 'No hay datos.',
  className = 'mt-2',
}: TableProps<T>) {
  function handleSortClick(key: string) {
    if (!onSort) return;
    const newDir = key === sortKey
      ? (sortDir === 'asc' ? 'desc' : 'asc')
      : 'asc';
    onSort(key, newDir);
  }

  if (!isLoading && data.length === 0) {
    return <p className="py-10 text-center text-sm text-secondary">{emptyMessage}</p>;
  }

  return (
    <TableRoot className={className}>
      <TableHead
        columns={columns}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={onSort ? handleSortClick : undefined}
      />
      <TableBody>
        {isLoading
          ? <TableSkeletonRows colCount={columns.length} />
          : data.map((row, rowIdx) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                isSelected={isSelected ? isSelected(row) : false}
              >
                {columns.map((col) => {
                  const content = col.render
                    ? col.render(row, rowIdx)
                    : String((row as Record<string, unknown>)[col.key] ?? '');

                  return col.isActions
                    ? <TableActions key={col.key}>{content}</TableActions>
                    : <TableCell key={col.key} align={col.align}>{content}</TableCell>;
                })}
              </TableRow>
            ))
        }
      </TableBody>
    </TableRoot>
  );
}
