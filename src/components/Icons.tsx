
import { 
  Code, 
  Briefcase, 
  Building, 
  Cpu, 
  Globe, 
  BookOpen, 
  ChefHat, 
  Landmark, 
  HeartPulse, 
  Palette, 
  Music, 
  ShoppingBag, 
  LucideIcon 
} from 'lucide-react';

// Define the Icons object with LucideIcon type
export const Icons: Record<string, LucideIcon> = {
  code: Code,
  briefcase: Briefcase,
  building: Building,
  cpu: Cpu,
  globe: Globe,
  book: BookOpen,
  chef: ChefHat,
  finance: Landmark,
  health: HeartPulse,
  art: Palette,
  music: Music,
  retail: ShoppingBag,
  // Provide a default fallback
  default: Briefcase
};
