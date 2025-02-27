
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Award, Star, Medal } from "lucide-react";

export interface BadgeProps {
  children?: ReactNode;
  variant?: "default" | "secondary" | "outline" | "premium" | "verified" | "expert" | "top";
  className?: string;
}

const badgeIconConfig = {
  premium: {
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  verified: {
    icon: Award,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  expert: {
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  top: {
    icon: Medal,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  // Si c'est un variant spécial avec icône
  if (variant === "premium" || variant === "verified" || variant === "expert" || variant === "top") {
    const { icon: Icon, color, bgColor } = badgeIconConfig[variant];
    const label = {
      premium: "Premium",
      verified: "Vérifié",
      expert: "Expert",
      top: "Top Stagiaire"
    }[variant];
    
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-sm",
          color,
          bgColor,
          className
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
    );
  }
  
  // Sinon, c'est un badge normal
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary-foreground",
    outline: "border border-input text-foreground",
  }[variant as "default" | "secondary" | "outline"];
  
  return (
    <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", variantClasses, className)}>
      {children}
    </div>
  );
}
