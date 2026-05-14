import styles from "./Progress.module.css";

export function Progress({
  value,
  label,
  tone = "info",
}: {
  value: number;
  label?: string;
  tone?: "info" | "success" | "danger" | "warning";
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.wrap}>
      {label !== undefined && (
        <div className={styles.label}>
          <span>{label}</span>
          <span className={styles.value}>{v.toFixed(0)}%</span>
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${styles.bar} ${styles[`t_${tone}`]}`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
