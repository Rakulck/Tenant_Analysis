import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: number;
  className?: string;
}

export function Loading({ size = 24, className }: LoadingProps) {
  return (
    <Loader2 
      size={size} 
      className={cn("animate-spin", className)} 
    />
  );
} 