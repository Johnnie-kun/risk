"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, children, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div ref={ref} className={cn("fixed inset-0 z-50 flex items-center justify-center", className)} {...props}>
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
        <div className="bg-white rounded-lg p-4 z-10">
          <button onClick={onClose} className="absolute top-2 right-2">Close</button>
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = "Modal";

export { Modal }; 