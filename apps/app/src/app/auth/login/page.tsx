import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../../../components/auth/login/LoginForm";
import { WelcomeSection } from "../../../components/auth/WelcomeSection";

export const metadata: Metadata = {
  title: "Login | Tenant Analysis Platform",
  description: "Login to access your tenant default analysis dashboard",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Login Form Section */}
      <div className="flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your tenant analysis dashboard
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Create Account
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Forgot your password?{" "}
            <Link
              href="/auth/forgotpassword"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Reset Password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
