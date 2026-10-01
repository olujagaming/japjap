"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "./icons";

/**
 * Basis für Modal und Drawer: natives <dialog> mit showModal().
 * Liefert Fokus-Falle, Esc-Schließen, Top-Layer und inert-Hintergrund ohne Zusatzbibliothek.
 */
function BaseDialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  panelClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Klick auf den Backdrop (= das dialog-Element selbst) schließt.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 text-fg",
        "backdrop:bg-[rgb(30_30_28/0.4)] backdrop:backdrop-blur-[2px]",
        className,
      )}
    >
      <div className={cn("flex flex-col border-line bg-surface shadow-soft", panelClassName)}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="-mr-2 rounded-md p-2 text-muted hover:bg-surface-2 hover:text-fg"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </dialog>
  );
}

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Modal(props: DialogProps) {
  return (
    <BaseDialog
      {...props}
      className="fixed inset-0 m-auto h-fit w-[min(32rem,calc(100vw-2rem))]"
      panelClassName="animate-in max-h-[85vh] rounded-lg border"
    />
  );
}

/** Seitliche Schublade (rechts), mobil von unten. */
export function Drawer({ side = "right", ...props }: DialogProps & { side?: "right" | "bottom" }) {
  return (
    <BaseDialog
      {...props}
      className={
        side === "right"
          ? "fixed inset-y-0 right-0 left-auto h-dvh w-[min(28rem,100vw)]"
          : "fixed inset-x-0 top-auto bottom-0 w-full"
      }
      panelClassName={
        side === "right"
          ? "animate-in h-full border-l"
          : "animate-in max-h-[85dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)]"
      }
    />
  );
}
