"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "destructive" | "outline" | "secondary" | "ghost" | "primary" | "muted" | "teritary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const BackButton = ({ 
  children, 
  className,
  variant = "secondary", // Changed from "default" to "secondary"
  size = "sm"
}: BackButtonProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleBack}
      className={className}
    >
      <ArrowLeft className="size-4 mr-2" />
      {children}
    </Button>
  );
};
