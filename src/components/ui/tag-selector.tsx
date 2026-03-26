import { useState, useRef, ReactNode } from "react";
import { X, Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TagSelectorProps {
  label: ReactNode;
  placeholder?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
  maxItems?: number;
  colorScheme?: "primary" | "secondary" | "purple" | "emerald" | "amber";
}

const colorMap = {
  primary: {
    badge: "bg-primary/10 text-primary border-primary/20",
    check: "border-primary bg-primary text-white",
    option: "hover:bg-primary/5",
    selected: "bg-primary/5",
    input: "focus-within:ring-primary/20",
  },
  secondary: {
    badge: "bg-secondary/10 text-secondary border-secondary/20",
    check: "border-secondary bg-secondary text-white",
    option: "hover:bg-secondary/5",
    selected: "bg-secondary/5",
    input: "focus-within:ring-secondary/20",
  },
  purple: {
    badge: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
    check: "border-purple-500 bg-purple-500 text-white",
    option: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
    selected: "bg-purple-50 dark:bg-purple-900/20",
    input: "focus-within:ring-purple-300",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    check: "border-emerald-500 bg-emerald-500 text-white",
    option: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    selected: "bg-emerald-50 dark:bg-emerald-900/20",
    input: "focus-within:ring-emerald-300",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    check: "border-amber-500 bg-amber-500 text-white",
    option: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
    selected: "bg-amber-50 dark:bg-amber-900/20",
    input: "focus-within:ring-amber-300",
  },
};

export function TagSelector({
  label,
  placeholder = "Rechercher ou ajouter...",
  options,
  selected,
  onChange,
  allowCustom = true,
  maxItems,
  colorScheme = "primary",
}: TagSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const colors = colorMap[colorScheme];

  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(opt)
  );

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      if (maxItems && selected.length >= maxItems) return;
      onChange([...selected, item]);
      setSearch("");
    }
  };

  const addCustom = () => {
    const trimmed = search.trim();
    if (trimmed && !selected.includes(trimmed) && allowCustom) {
      if (maxItems && selected.length >= maxItems) return;
      onChange([...selected, trimmed]);
      setSearch("");
    }
  };

  const showCustomOption =
    allowCustom &&
    search.trim() &&
    !options.includes(search.trim()) &&
    !selected.includes(search.trim());

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium leading-none">{label}</div>
        {maxItems && (
          <span className="text-xs text-muted-foreground">
            {selected.length}/{maxItems}
          </span>
        )}
      </div>

      {/* Selected tags display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-h-[32px]">
          {selected.map((item) => (
            <span
              key={item}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${colors.badge} group transition-all`}
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="rounded-full hover:bg-black/10 p-0.5 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input with dropdown */}
      <div className="relative">
        <div
          className={`flex items-center border rounded-lg px-3 gap-2 bg-background ring-2 ring-transparent ${colors.input} transition-all`}
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addCustom(); }
              if (e.key === "Escape") setIsOpen(false);
            }}
            placeholder={placeholder}
            className="flex-1 py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (filtered.length > 0 || showCustomOption) && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            {showCustomOption && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={addCustom}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${colors.option} transition-colors`}
              >
                <span className="text-muted-foreground">Ajouter :</span>
                <span className="font-medium">"{search.trim()}"</span>
              </button>
            )}
            {filtered.slice(0, 20).map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(item)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 ${colors.option} transition-colors`}
              >
                <span>{item}</span>
                {selected.includes(item) && (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
