'use client';

import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm animate-slide-up"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {toast.title && <p className="font-medium">{toast.title}</p>}
              {toast.description && (
                <p className="text-sm text-muted-foreground">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
