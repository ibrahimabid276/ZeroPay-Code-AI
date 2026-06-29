"use client";

import { useState, useEffect } from "react";
import { isDemoBannerDismissed, dismissDemoBanner } from "@/lib/demo-project";
import { X, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only show banner if not dismissed
    if (!isDemoBannerDismissed()) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    dismissDemoBanner();
    setVisible(false);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted || !visible) {
    return null;
  }

  return (
    <div className="relative z-50 animate-slide-in">
      <div className="gradient-primary border-b border-white/20">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  🎉 This is a demo project to help you explore ZeroPay Code AI
                </p>
                <p className="text-xs text-white/80 mt-0.5">
                  Try the files, run the code, and chat with AI! Create your own project when you're ready.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20 shrink-0"
              onClick={handleDismiss}
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
