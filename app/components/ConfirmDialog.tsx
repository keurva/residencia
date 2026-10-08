import { useEffect, useRef } from "react";

import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) {
          onCancel();
        }
      }}
      className="m-auto w-full max-w-sm rounded-xl border border-line bg-panel p-6 text-ink shadow-modal backdrop:bg-black/40"
    >
      <h2 id="confirm-dialog-title" className="text-base font-semibold tracking-tight">
        {title}
      </h2>
      <p id="confirm-dialog-description" className="mt-2 text-sm leading-relaxed text-ink-2">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? "Cerrando…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
