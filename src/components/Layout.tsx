import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { SessionTimeoutProvider } from "@/contexts/SessionTimeoutContext";
import SessionTimeoutWarning from "./SessionTimeoutWarning";

export default function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated ? (
        <SessionTimeoutProvider>
          <Navigation />
          <main className="flex-grow pt-16">
            <Outlet />
          </main>
          <Footer />
          <SessionTimeoutWarning />
        </SessionTimeoutProvider>
      ) : (
        <>
          <Navigation />
          <main className="flex-grow pt-16">
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
