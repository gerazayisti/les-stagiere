
// Si ce fichier n'existe pas, je le crée

import { LucideIcon } from 'lucide-react';
import { Code, Briefcase, Building, Cpu, Globe, BookOpen, ChefHat, Landmark, HeartPulse, Palette, Music, ShoppingBag, default as DefaultIcon } from 'lucide-react';

type IconsType = {
  [key: string]: LucideIcon;
  default: LucideIcon;
};

export const Icons: IconsType = {
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
  default: DefaultIcon
};
