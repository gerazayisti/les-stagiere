
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { ThemeToggle } from "./ThemeToggle";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
