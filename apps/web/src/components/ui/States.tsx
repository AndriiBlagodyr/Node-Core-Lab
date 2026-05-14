import type { ReactNode } from "react";
import styles from "./States.module.css";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <div className={styles.icon} aria-hidden="true">
        ◌
      </div>
      <div className={styles.title}>{title}</div>
      {description && <div className={styles.desc}>{description}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  retry,
}: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <div className={`${styles.icon} ${styles.iconErr}`} aria-hidden="true">
        !
      </div>
      <div className={styles.title}>{title}</div>
      {description && <div className={styles.desc}>{description}</div>}
      {retry && (
        <button type="button" onClick={retry} className={styles.retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({
  width,
  height = 14,
  radius = 6,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
}) {
  return (
    <span
      className={styles.skeleton}
      style={{
        width: width ?? "100%",
        height,
        borderRadius: radius,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonRows({
  rows = 5,
  height = 14,
}: {
  rows?: number;
  height?: number;
}) {
  return (
    <div className={styles.skeletonRows}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} />
      ))}
    </div>
  );
}
