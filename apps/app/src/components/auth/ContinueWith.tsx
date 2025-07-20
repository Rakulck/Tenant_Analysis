"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContinueWith() {
  const pathname = usePathname();
  const isLoginPage = pathname?.includes("login");

  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        {isLoginPage ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link
          href={isLoginPage ? "/auth/signup" : "/auth/login"}
          className="text-primary hover:text-primary/90 font-medium"
        >
          {isLoginPage ? "Create Account" : "Sign In"}
        </Link>
      </p>
    </div>
  );
}
