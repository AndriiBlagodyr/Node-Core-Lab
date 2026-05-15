import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.desc}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
