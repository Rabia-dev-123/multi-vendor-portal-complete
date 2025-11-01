import React, { ReactNode, useEffect } from "react";
import { CloseLineIcon } from "@/icons";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

// Dialog Root Component
export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog Content */}
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};

// Dialog Content
export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`relative bg-white dark:bg-white/3 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
};

// Dialog Header
export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-1 px-6 py-4 ${className}`}
    >
      {children}
    </div>
  );
};

// Dialog Title
export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className = "",
}) => {
  return (
    <h3
      className={`text-lg font-semibold text-gray-800 dark:text-white/90 ${className}`}
    >
      {children}
    </h3>
  );
};

// Dialog Description
export const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className = "",
}) => {
  return (
    <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
};

// Dialog Footer
export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`flex sticky bottom-0 bg-white dark:bg-gray-800 items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
};

// Dialog Close Button
export const DialogClose: React.FC<{
  onClose: () => void;
  className?: string;
}> = ({ onClose, className = "" }) => {
  return (
    <button
      onClick={onClose}
      className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ${className}`}
      aria-label="Close dialog"
    >
      <CloseLineIcon className="w-5 h-5" />
    </button>
  );
};

// Dialog Body
export const DialogBody: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return <div className={`p-6 space-y-4 ${className}`}>{children}</div>;
};
