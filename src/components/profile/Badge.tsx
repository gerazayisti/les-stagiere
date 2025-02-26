import { cn } from "@/lib/utils";
import { Trophy, Award, Star, Medal } from "lucide-react";

type BadgeType = "premium" | "verified" | "expert" | "top";

interface BadgeProps {
  type: BadgeType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const badgeConfig = {
  premium: {
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Premium",
  },
  verified: {
    icon: Award,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Vérifié",
  },
  expert: {
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Expert",
  },
  top: {
    icon: Medal,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Top Stagiaire",
  },
};

const sizeConfig = {
  sm: "h-6 text-xs",
  md: "h-8 text-sm",
  lg: "h-10 text-base",
};

export function Badge({ type, size = "md", className }: BadgeProps) {
  const { icon: Icon, color, bgColor, label } = badgeConfig[type];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 rounded-full font-medium",
        color,
        bgColor,
        sizeConfig[size],
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}
