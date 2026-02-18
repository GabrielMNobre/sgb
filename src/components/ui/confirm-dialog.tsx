"use client";

import type { ReactNode } from "react";
import { Modal, ModalFooter } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
            variant === "danger" ? "bg-red-100" : "bg-yellow-100"
          }`}
        >
          <AlertTriangle
            className={`h-6 w-6 ${
              variant === "danger" ? "text-red-600" : "text-yellow-600"
            }`}
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-500">{message}</div>
      </div>

      <ModalFooter className="flex-col-reverse sm:flex-row">
        <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
          {cancelText}
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Aguarde..." : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
