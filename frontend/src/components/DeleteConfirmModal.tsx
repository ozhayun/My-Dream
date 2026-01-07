"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { clsx } from "clsx";
import { createPortal } from "react-dom";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmVariant?: "danger" | "primary";
}

export function DeleteConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  confirmVariant = "danger",
}: DeleteConfirmModalProps) {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-background/80 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md bg-secondary/20 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl overflow-hidden pointer-events-auto"
          >
            {/* Glass Grain Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div
                  className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    confirmVariant === "danger"
                      ? "bg-red-500/20 text-red-500"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  onClick={onCancel}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-foreground/70 hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed mb-8 text-pretty">
                {description}
              </p>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={clsx(
                    "flex-1 px-6 py-3 rounded-2xl font-semibold transition-all shadow-xl",
                    confirmVariant === "danger"
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
                      : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof window === "undefined") return null;

  return createPortal(modalContent, document.body);
}
