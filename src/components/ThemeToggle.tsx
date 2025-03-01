
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-5 w-5" />
            <span className="sr-only">Light mode</span>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="h-5 w-5" />
            <span className="sr-only">Dark mode</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
