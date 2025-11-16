"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated");
      const authenticated = authStatus === "true";
      setIsAuthenticated(authenticated);
      setIsChecking(false);

      // Redirect to login if not authenticated and not on login page
      if (!authenticated && pathname !== "/login") {
        router.push("/login");
        return;
      }

      // Redirect to home if authenticated and on login page
      if (authenticated && pathname === "/login") {
        router.push("/");
        return;
      }
    };

    checkAuth();

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router, pathname]);

  // Show loading while checking authentication
  if (isChecking || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white" style={{ fontFamily: "var(--font-league-spartan)" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated (except login page)
  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}

