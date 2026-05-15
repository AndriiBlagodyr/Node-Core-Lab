import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { forwardRef } from "react";
import styles from "./Field.module.css";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}

export function FieldShell({
  label,
  hint,
  error,
  htmlFor,
  children,
}: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {error ? (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      ) : hint ? (
        <div className={styles.hint}>{hint}</div>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, ...rest },
  ref
) {
  const inputId = id ?? `in_${rest.name ?? Math.random().toString(36).slice(2)}`;
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      htmlFor={inputId}
    >
      <input
        ref={ref}
        id={inputId}
        className={[styles.input, error ? styles.invalid : "", className ?? ""]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </FieldShell>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, error, id, className, ...rest }, ref) {
    const tid =
      id ?? `ta_${rest.name ?? Math.random().toString(36).slice(2)}`;
    return (
      <FieldShell label={label} hint={hint} error={error} htmlFor={tid}>
        <textarea
          ref={ref}
          id={tid}
          className={[
            styles.textarea,
            error ? styles.invalid : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
      </FieldShell>
    );
  }
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, hint, error, id, className, children, ...rest },
    ref
  ) {
    const sid =
      id ?? `sel_${rest.name ?? Math.random().toString(36).slice(2)}`;
    return (
      <FieldShell label={label} hint={hint} error={error} htmlFor={sid}>
        <select
          ref={ref}
          id={sid}
          className={[styles.select, error ? styles.invalid : "", className ?? ""]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        >
          {children}
        </select>
      </FieldShell>
    );
  }
);
