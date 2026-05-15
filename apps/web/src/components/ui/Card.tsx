import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}

export function Card({
  title,
  description,
  actions,
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <section
      {...rest}
      className={[styles.card, className ?? ""].filter(Boolean).join(" ")}
    >
      {(title || actions) && (
        <header className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.desc}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={padded ? styles.bodyPadded : styles.body}>{children}</div>
    </section>
  );
}
