import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme-preference">
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
