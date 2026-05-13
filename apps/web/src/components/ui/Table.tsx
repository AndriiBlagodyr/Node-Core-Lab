import type { ReactNode } from "react";
import styles from "./Table.module.css";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Optional sort key sent to the server when this column is clicked. */
  sortKey?: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: { field: string; direction: "asc" | "desc" };
  onSortChange?: (field: string) => void;
  empty?: ReactNode;
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
  empty,
}: TableProps<T>) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => {
              const sortable = !!c.sortKey && !!onSortChange;
              const isSorted = sort?.field === c.sortKey;
              return (
                <th
                  key={c.key}
                  style={{ width: c.width, textAlign: c.align ?? "left" }}
                  className={sortable ? styles.thSortable : ""}
                  onClick={() => {
                    if (sortable && c.sortKey) onSortChange?.(c.sortKey);
                  }}
                >
                  <span>{c.header}</span>
                  {sortable && (
                    <span className={styles.sortIcon} aria-hidden="true">
                      {isSorted
                        ? sort?.direction === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyCell}>
                {empty ?? "No data"}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={onRowClick ? styles.rowClickable : ""}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{ textAlign: c.align ?? "left" }}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
