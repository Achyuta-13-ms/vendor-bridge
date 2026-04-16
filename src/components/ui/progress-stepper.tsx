import React from 'react';
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressStepper({ steps, currentStep, className }: ProgressStepperProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between w-full relative", className)}>
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted -translate-y-1/2 hidden md:block" />
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={step} className="flex md:flex-col items-center gap-2 mb-4 md:mb-0 relative z-10">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                isActive ? "border-primary text-primary bg-background" : 
                "border-muted text-muted-foreground bg-background"
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
