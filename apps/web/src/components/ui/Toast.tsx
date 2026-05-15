"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import styles from "./Toast.module.css";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastApi {
  push: (t: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastCtx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { ...t, id }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (title, description) =>
        push({ title, description, tone: "success" }),
      error: (title, description) =>
        push({ title, description, tone: "error" }),
      info: (title, description) => push({ title, description, tone: "info" }),
    }),
    [push]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className={styles.region} role="region" aria-label="Notifications">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`${styles.toast} ${styles[`t_${t.tone}`]}`}
          >
            <div className={styles.title}>{t.title}</div>
            {t.description && (
              <div className={styles.desc}>{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
